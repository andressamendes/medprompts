/**
 * 🛡️ Rate Limiter - Proteção contra Brute Force e Spam
 *
 * Implementa rate limiting para prevenir ataques (OWASP A07:2021 - Auth Failures)
 *
 * Features:
 * - Rate limiting por operação e usuário
 * - Sliding window algorithm
 * - Auto-reset após cooldown
 * - Persistência em sessionStorage
 *
 * @see https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks
 */

/**
 * Configuração de rate limit por operação
 */
interface RateLimitConfig {
  maxAttempts: number;      // Número máximo de tentativas
  windowMs: number;          // Janela de tempo em milisegundos
  blockDurationMs: number;   // Duração do bloqueio após exceder limite
}

/**
 * Registro de tentativas
 */
interface RateLimitRecord {
  attempts: number[];        // Timestamps das tentativas
  blockedUntil?: number;     // Timestamp até quando está bloqueado
}

/**
 * Configurações padrão por tipo de operação
 */
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  // Login: 5 tentativas a cada 15 minutos
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,       // 15 minutos
    blockDurationMs: 30 * 60 * 1000  // 30 minutos de bloqueio
  },

  // Troca de senha: 3 tentativas a cada 10 minutos
  passwordChange: {
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000,        // 10 minutos
    blockDurationMs: 30 * 60 * 1000  // 30 minutos de bloqueio
  },

  // Atualização de perfil: 10 tentativas a cada 5 minutos
  profileUpdate: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000,         // 5 minutos
    blockDurationMs: 10 * 60 * 1000  // 10 minutos de bloqueio
  },

  // Upload de avatar: 5 tentativas a cada 5 minutos
  avatarUpload: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000,         // 5 minutos
    blockDurationMs: 15 * 60 * 1000  // 15 minutos de bloqueio
  },

  // Operações sensíveis genéricas: 3 tentativas a cada 5 minutos
  sensitive: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000,         // 5 minutos
    blockDurationMs: 15 * 60 * 1000  // 15 minutos de bloqueio
  }
};

/**
 * Classe para gerenciar rate limiting
 */
class RateLimiterManager {
  private storageKey = 'medprompts_rate_limits';

  /**
   * Carrega registros do sessionStorage
   */
  private loadRecords(): Record<string, RateLimitRecord> {
    try {
      const data = sessionStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erro ao carregar rate limit records:', error);
      return {};
    }
  }

  /**
   * Salva registros no sessionStorage
   */
  private saveRecords(records: Record<string, RateLimitRecord>): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Erro ao salvar rate limit records:', error);
    }
  }

  /**
   * Gera chave única para operação + identificador
   */
  private getKey(operation: string, identifier: string = 'default'): string {
    return `${operation}:${identifier}`;
  }

  /**
   * Remove tentativas antigas da janela de tempo
   */
  private cleanOldAttempts(attempts: number[], windowMs: number): number[] {
    const now = Date.now();
    const cutoff = now - windowMs;
    return attempts.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Verifica se a operação está permitida
   * @param operation - Tipo de operação (login, passwordChange, etc.)
   * @param identifier - Identificador único (email, userId, etc.)
   * @returns Objeto com status e informações
   */
  checkLimit(
    operation: string,
    identifier: string = 'default'
  ): {
    allowed: boolean;
    remaining: number;
    resetIn: number;
    blockedUntil?: number;
  } {
    const config = DEFAULT_CONFIGS[operation] || DEFAULT_CONFIGS.sensitive;
    const key = this.getKey(operation, identifier);
    const records = this.loadRecords();
    const record = records[key] || { attempts: [] };

    const now = Date.now();

    // Verifica se está bloqueado
    if (record.blockedUntil && record.blockedUntil > now) {
      const blockedFor = Math.ceil((record.blockedUntil - now) / 1000);

      console.warn('Rate limit: Operação bloqueada', {
        operation,
        identifier,
        blockedForSeconds: blockedFor
      });

      return {
        allowed: false,
        remaining: 0,
        resetIn: blockedFor,
        blockedUntil: record.blockedUntil
      };
    }

    // Remove bloqueio se expirou
    if (record.blockedUntil && record.blockedUntil <= now) {
      delete record.blockedUntil;
      record.attempts = [];
    }

    // Limpa tentativas antigas
    const cleanAttempts = this.cleanOldAttempts(record.attempts, config.windowMs);
    const remaining = config.maxAttempts - cleanAttempts.length;

    // Calcula quando o rate limit reseta
    const oldestAttempt = cleanAttempts[0];
    const resetIn = oldestAttempt
      ? Math.ceil((oldestAttempt + config.windowMs - now) / 1000)
      : 0;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      resetIn: Math.max(0, resetIn)
    };
  }

  /**
   * Registra uma tentativa de operação
   * @param operation - Tipo de operação
   * @param identifier - Identificador único
   * @returns true se permitido, false se bloqueado
   */
  recordAttempt(operation: string, identifier: string = 'default'): boolean {
    const config = DEFAULT_CONFIGS[operation] || DEFAULT_CONFIGS.sensitive;
    const key = this.getKey(operation, identifier);
    const records = this.loadRecords();
    const record = records[key] || { attempts: [] };

    const now = Date.now();

    // Verifica se está bloqueado
    if (record.blockedUntil && record.blockedUntil > now) {
      return false;
    }

    // Limpa tentativas antigas
    const cleanAttempts = this.cleanOldAttempts(record.attempts, config.windowMs);

    // Adiciona tentativa atual
    cleanAttempts.push(now);

    // Verifica se excedeu limite
    if (cleanAttempts.length >= config.maxAttempts) {
      record.blockedUntil = now + config.blockDurationMs;

      console.warn('Rate limit: Limite excedido, operação bloqueada', {
        operation,
        identifier,
        attempts: cleanAttempts.length,
        blockedForSeconds: Math.ceil(config.blockDurationMs / 1000)
      });
    }

    // Atualiza registro
    record.attempts = cleanAttempts;
    records[key] = record;
    this.saveRecords(records);

    return cleanAttempts.length < config.maxAttempts;
  }

  /**
   * Reseta rate limit para uma operação específica
   * @param operation - Tipo de operação
   * @param identifier - Identificador único
   */
  reset(operation: string, identifier: string = 'default'): void {
    const key = this.getKey(operation, identifier);
    const records = this.loadRecords();
    delete records[key];
    this.saveRecords(records);

    console.info('Rate limit resetado', { operation, identifier });
  }

  /**
   * Limpa todos os rate limits
   * Útil para logout ou limpeza de dados
   */
  clearAll(): void {
    sessionStorage.removeItem(this.storageKey);
    console.info('Todos os rate limits foram limpos');
  }

  /**
   * Obtém informações de rate limit sem registrar tentativa
   * @param operation - Tipo de operação
   * @param identifier - Identificador único
   */
  getInfo(operation: string, identifier: string = 'default'): {
    maxAttempts: number;
    windowMs: number;
    blockDurationMs: number;
    currentAttempts: number;
    isBlocked: boolean;
    blockedUntil?: number;
  } {
    const config = DEFAULT_CONFIGS[operation] || DEFAULT_CONFIGS.sensitive;
    const key = this.getKey(operation, identifier);
    const records = this.loadRecords();
    const record = records[key] || { attempts: [] };

    const now = Date.now();
    const cleanAttempts = this.cleanOldAttempts(record.attempts, config.windowMs);
    const isBlocked = !!(record.blockedUntil && record.blockedUntil > now);

    return {
      maxAttempts: config.maxAttempts,
      windowMs: config.windowMs,
      blockDurationMs: config.blockDurationMs,
      currentAttempts: cleanAttempts.length,
      isBlocked,
      blockedUntil: isBlocked ? record.blockedUntil : undefined
    };
  }

  /**
   * Formata mensagem de erro para o usuário
   * @param operation - Tipo de operação
   * @param resetIn - Segundos até reset
   */
  formatErrorMessage(operation: string, resetIn: number): string {
    const minutes = Math.ceil(resetIn / 60);

    const messages: Record<string, string> = {
      login: `Muitas tentativas de login. Tente novamente em ${minutes} minuto(s).`,
      passwordChange: `Muitas tentativas de troca de senha. Tente novamente em ${minutes} minuto(s).`,
      profileUpdate: `Muitas atualizações de perfil. Tente novamente em ${minutes} minuto(s).`,
      avatarUpload: `Muitos uploads de avatar. Tente novamente em ${minutes} minuto(s).`,
      sensitive: `Muitas tentativas. Aguarde ${minutes} minuto(s) para tentar novamente.`
    };

    return messages[operation] || messages.sensitive;
  }
}

/**
 * Instância global do rate limiter
 */
export const rateLimiter = new RateLimiterManager();

/**
 * Hook para verificar e registrar rate limit
 * @param operation - Tipo de operação
 * @param identifier - Identificador único
 * @returns Resultado da verificação
 */
export const useRateLimit = (operation: string, identifier: string = 'default') => {
  const check = () => rateLimiter.checkLimit(operation, identifier);
  const record = () => rateLimiter.recordAttempt(operation, identifier);
  const reset = () => rateLimiter.reset(operation, identifier);
  const info = () => rateLimiter.getInfo(operation, identifier);

  return { check, record, reset, info };
};
