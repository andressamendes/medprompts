/**
 * 🛡️ Rate Limiting Service
 *
 * FASE 7: Proteção contra brute force e abuse
 * Implementa OWASP A07:2021 (Identification and Authentication Failures)
 *
 * Previne:
 * - Brute force attacks (tentativas de login)
 * - API abuse (muitas requisições)
 * - DoS (Denial of Service)
 * - Credential stuffing
 */

import { securityConfig } from '../config/security.config';

// ==========================================
// TYPES
// ==========================================

interface RateLimitConfig {
  maxAttempts: number;  // Máximo de tentativas
  windowMs: number;     // Janela de tempo (ms)
  blockDurationMs: number; // Duração do bloqueio
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // segundos até poder tentar novamente
}

// ==========================================
// RATE LIMIT PRESETS
// ==========================================

const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  // Login: 5 tentativas em 15 minutos
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 30 * 60 * 1000, // 30 minutos de bloqueio
  },

  // Register: 3 contas por hora
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas de bloqueio
  },

  // API calls: 100 requisições por minuto
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000, // 5 minutos de bloqueio
  },

  // Password reset: 3 tentativas em 1 hora
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 horas de bloqueio
  },

  // Search: 30 buscas por minuto
  search: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 60 * 1000, // 1 minuto de bloqueio
  },

  // Export: 5 exports por hora
  export: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 60 * 60 * 1000, // 1 hora de bloqueio
  },
};

// ==========================================
// RATE LIMIT SERVICE
// ==========================================

class RateLimitService {
  private storage: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup de entradas antigas a cada 5 minutos
    this.startCleanup();
  }

  /**
   * Verifica se ação é permitida (rate limiting)
   */
  checkLimit(
    identifier: string, // email, IP, userId, etc
    action: keyof typeof RATE_LIMIT_PRESETS,
    customConfig?: Partial<RateLimitConfig>
  ): RateLimitResult {
    const config = customConfig
      ? { ...RATE_LIMIT_PRESETS[action], ...customConfig }
      : RATE_LIMIT_PRESETS[action];

    if (!config) {
      console.error(`Rate limit config not found: ${action}`);
      return {
        allowed: true,
        remaining: Infinity,
        resetAt: new Date(Date.now() + 60000),
      };
    }

    const key = `${action}:${identifier}`;
    const now = Date.now();
    const entry = this.storage.get(key);

    // Verifica se está bloqueado
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.blockedUntil),
        retryAfter,
      };
    }

    // Primeira tentativa ou janela expirou
    if (!entry || now - entry.firstAttempt > config.windowMs) {
      this.storage.set(key, {
        attempts: 1,
        firstAttempt: now,
      });

      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetAt: new Date(now + config.windowMs),
      };
    }

    // Incrementa tentativas
    entry.attempts++;

    // Excedeu o limite
    if (entry.attempts > config.maxAttempts) {
      entry.blockedUntil = now + config.blockDurationMs;
      this.storage.set(key, entry);

      // Log de segurança
      this.logRateLimitExceeded(identifier, action, entry.attempts);

      const retryAfter = Math.ceil(config.blockDurationMs / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.blockedUntil),
        retryAfter,
      };
    }

    // Ainda dentro do limite
    this.storage.set(key, entry);
    return {
      allowed: true,
      remaining: config.maxAttempts - entry.attempts,
      resetAt: new Date(entry.firstAttempt + config.windowMs),
    };
  }

  /**
   * Registra tentativa (não bloqueia, apenas conta)
   */
  recordAttempt(
    identifier: string,
    action: keyof typeof RATE_LIMIT_PRESETS
  ): void {
    this.checkLimit(identifier, action);
  }

  /**
   * Reset manual de rate limit (ex: após login bem-sucedido)
   */
  reset(identifier: string, action: keyof typeof RATE_LIMIT_PRESETS): void {
    const key = `${action}:${identifier}`;
    this.storage.delete(key);
  }

  /**
   * Verifica se identifier está bloqueado
   */
  isBlocked(
    identifier: string,
    action: keyof typeof RATE_LIMIT_PRESETS
  ): boolean {
    const key = `${action}:${identifier}`;
    const entry = this.storage.get(key);
    const now = Date.now();

    return !!(entry?.blockedUntil && entry.blockedUntil > now);
  }

  /**
   * Obtém informações de rate limit
   */
  getInfo(
    identifier: string,
    action: keyof typeof RATE_LIMIT_PRESETS
  ): {
    attempts: number;
    remaining: number;
    blocked: boolean;
    blockedUntil?: Date;
  } | null {
    const key = `${action}:${identifier}`;
    const entry = this.storage.get(key);
    const config = RATE_LIMIT_PRESETS[action];

    if (!entry || !config) {
      return null;
    }

    const now = Date.now();
    const blocked = !!(entry.blockedUntil && entry.blockedUntil > now);

    return {
      attempts: entry.attempts,
      remaining: Math.max(0, config.maxAttempts - entry.attempts),
      blocked,
      blockedUntil: entry.blockedUntil ? new Date(entry.blockedUntil) : undefined,
    };
  }

  /**
   * Cleanup de entradas antigas
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      for (const [key, entry] of this.storage.entries()) {
        // Remove se:
        // 1. Não está bloqueado E primeira tentativa foi há mais de 24h
        // 2. Estava bloqueado mas o bloqueio expirou há mais de 1h
        const shouldRemove =
          (!entry.blockedUntil && now - entry.firstAttempt > maxAge) ||
          (entry.blockedUntil &&
            entry.blockedUntil < now &&
            now - entry.blockedUntil > 60 * 60 * 1000);

        if (shouldRemove) {
          this.storage.delete(key);
        }
      }
    }, 5 * 60 * 1000); // A cada 5 minutos
  }

  /**
   * Para cleanup (útil para testes)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Limpa todo o storage (útil para testes)
   */
  clearAll(): void {
    this.storage.clear();
  }

  /**
   * Log de rate limit excedido
   */
  private logRateLimitExceeded(
    identifier: string,
    action: string,
    attempts: number
  ): void {
    console.warn('🚨 RATE LIMIT EXCEEDED:', {
      identifier,
      action,
      attempts,
      timestamp: new Date().toISOString(),
    });

    // Em produção, enviar para sistema de logging/alertas
    if (securityConfig.environment.nodeEnv === 'production') {
      // TODO: Enviar para backend/serviço de logging
      // fetch('/api/security/rate-limit-exceeded', {
      //   method: 'POST',
      //   body: JSON.stringify({ identifier, action, attempts })
      // });
    }
  }

  /**
   * Obtém estatísticas gerais
   */
  getStats(): {
    totalEntries: number;
    blockedEntries: number;
    byAction: Record<string, number>;
  } {
    const now = Date.now();
    let blockedCount = 0;
    const byAction: Record<string, number> = {};

    for (const [key, entry] of this.storage.entries()) {
      const action = key.split(':')[0];
      byAction[action] = (byAction[action] || 0) + 1;

      if (entry.blockedUntil && entry.blockedUntil > now) {
        blockedCount++;
      }
    }

    return {
      totalEntries: this.storage.size,
      blockedEntries: blockedCount,
      byAction,
    };
  }
}

// ==========================================
// SINGLETON
// ==========================================

export const rateLimitService = new RateLimitService();
export default rateLimitService;

// ==========================================
// HELPERS
// ==========================================

/**
 * Gera identificador único para rate limiting
 * Prioridade: IP > userId > fallback
 */
export function getRateLimitIdentifier(userId?: string): string {
  // TODO: Em produção, usar IP real do backend
  // Por enquanto, usa userId ou sessionId
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback: gera ID de sessão persistente
  let sessionId = localStorage.getItem('rate-limit-session-id');
  if (!sessionId) {
    sessionId = `session:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('rate-limit-session-id', sessionId);
  }

  return sessionId;
}

/**
 * Formata mensagem de erro de rate limit
 */
export function formatRateLimitError(result: RateLimitResult): string {
  if (!result.retryAfter) {
    return 'Muitas tentativas. Tente novamente mais tarde.';
  }

  const minutes = Math.ceil(result.retryAfter / 60);

  if (minutes < 1) {
    return `Muitas tentativas. Tente novamente em ${result.retryAfter} segundos.`;
  }

  if (minutes < 60) {
    return `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes > 1 ? 's' : ''}.`;
  }

  const hours = Math.ceil(minutes / 60);
  return `Muitas tentativas. Tente novamente em ${hours} hora${hours > 1 ? 's' : ''}.`;
}
