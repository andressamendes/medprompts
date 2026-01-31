/* eslint-disable no-console */
/**
 * Security Headers Service
 *
 * Configuração de headers de segurança HTTP
 * Implementa OWASP A05:2021 (Security Misconfiguration)
 *
 * @note Console statements são usados para reportar configurações de segurança
 */

import { securityConfig } from '../config/security.config';
import { cspService } from './csp.service';

// ==========================================
// TYPES
// ==========================================

export interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security'?: string;
  'Content-Security-Policy': string;
}

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

// ==========================================
// SECURITY HEADERS SERVICE
// ==========================================

class SecurityHeadersService {
  /**
   * Gera todos os security headers
   */
  generateSecurityHeaders(): SecurityHeaders {
    const headers: SecurityHeaders = {
      // Previne MIME sniffing
      'X-Content-Type-Options': 'nosniff',

      // Previne clickjacking (redundante com CSP frame-ancestors, mas boa prática)
      'X-Frame-Options': 'DENY',

      // XSS protection (legacy, mas ainda usado por navegadores antigos)
      'X-XSS-Protection': '1; mode=block',

      // Controla quanto de informação de referrer é enviado
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Controla quais features podem ser usadas
      'Permissions-Policy': this.generatePermissionsPolicy(),

      // CSP (Content Security Policy)
      'Content-Security-Policy': cspService.generateCSP(),
    };

    // HSTS apenas em produção com HTTPS
    if (securityConfig.environment.nodeEnv === 'production') {
      headers['Strict-Transport-Security'] =
        'max-age=31536000; includeSubDomains; preload';
    }

    return headers;
  }

  /**
   * Gera Permissions-Policy (Feature-Policy)
   */
  private generatePermissionsPolicy(): string {
    // Bloqueia features não utilizadas
    const policies = [
      'camera=()',           // Sem acesso à câmera
      'microphone=()',       // Sem acesso ao microfone
      'geolocation=()',      // Sem acesso à localização
      'payment=()',          // Sem API de pagamento
      'usb=()',              // Sem acesso USB
      'magnetometer=()',     // Sem magnetômetro
      'gyroscope=()',        // Sem giroscópio
      'accelerometer=()',    // Sem acelerômetro
      'ambient-light-sensor=()', // Sem sensor de luz
      'autoplay=(self)',     // Autoplay apenas no mesmo domínio
      'fullscreen=(self)',   // Fullscreen apenas no mesmo domínio
    ];

    return policies.join(', ');
  }

  /**
   * Gera configuração CORS segura
   */
  generateCORSConfig(): CORSConfig {
    const isProduction = securityConfig.environment.nodeEnv === 'production';

    return {
      allowedOrigins: isProduction
        ? [
            'https://andressamendes.github.io',
            // Adicione outros domínios autorizados aqui
          ]
        : [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
          ],

      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
      ],

      credentials: true, // Permite cookies

      maxAge: 86400, // 24 horas
    };
  }

  /**
   * Verifica se origin é permitido pelo CORS
   */
  isOriginAllowed(origin: string): boolean {
    const config = this.generateCORSConfig();
    return config.allowedOrigins.includes(origin) || origin === window.location.origin;
  }

  /**
   * Aplica headers de segurança à meta tags (para SPA)
   */
  applyMetaHeaders(): void {
    const headers = this.generateSecurityHeaders();

    // X-Content-Type-Options
    this.addMetaTag('http-equiv', 'X-Content-Type-Options', headers['X-Content-Type-Options']);

    // X-Frame-Options
    this.addMetaTag('http-equiv', 'X-Frame-Options', headers['X-Frame-Options']);

    // X-XSS-Protection
    this.addMetaTag('http-equiv', 'X-XSS-Protection', headers['X-XSS-Protection']);

    // Referrer-Policy
    this.addMetaTag('name', 'referrer', headers['Referrer-Policy']);

    // Permissions-Policy
    this.addMetaTag('http-equiv', 'Permissions-Policy', headers['Permissions-Policy']);

    // CSP já é adicionado pelo cspService
  }

  /**
   * Adiciona meta tag ao head
   */
  private addMetaTag(
    type: 'http-equiv' | 'name',
    key: string,
    value: string
  ): void {
    // Remove tag existente se houver
    const existing = document.querySelector(`meta[${type}="${key}"]`);
    if (existing) {
      existing.remove();
    }

    // Cria nova tag
    const meta = document.createElement('meta');
    meta.setAttribute(type, key);
    meta.setAttribute('content', value);
    document.head.appendChild(meta);
  }

  /**
   * Valida se fetch request segue políticas CORS
   */
  validateFetchRequest(url: string, options?: RequestInit): void {
    try {
      const urlObj = new URL(url);
      const isSameOrigin = urlObj.origin === window.location.origin;

      if (!isSameOrigin) {
        // Cross-origin request
        const config = this.generateCORSConfig();

        if (!config.allowedOrigins.includes(urlObj.origin)) {
          console.warn(
            `⚠️ CORS WARNING: Request para ${urlObj.origin} não está na whitelist`,
            'Adicione ao CORS config se necessário'
          );
        }

        // Verifica método
        const method = options?.method?.toUpperCase() || 'GET';
        if (!config.allowedMethods.includes(method)) {
          throw new Error(
            `Método ${method} não permitido pelo CORS. Permitidos: ${config.allowedMethods.join(', ')}`
          );
        }

        // Força credentials: 'include' se configurado
        if (config.credentials && !options?.credentials) {
          console.warn(
            '⚠️ CORS: credentials configurado mas não enviado no request. Use credentials: "include"'
          );
        }
      }
    } catch (error) {
      console.error('Erro ao validar CORS:', error);
    }
  }

  /**
   * Wrapper seguro para fetch com CORS validation
   */
  async secureFetch(url: string, options?: RequestInit): Promise<Response> {
    this.validateFetchRequest(url, options);

    try {
      const response = await fetch(url, {
        ...options,
        credentials: this.generateCORSConfig().credentials ? 'include' : 'same-origin',
      });

      return response;
    } catch (error) {
      console.error('Erro no fetch seguro:', error);
      throw error;
    }
  }

  /**
   * Log de headers atuais
   */
  logSecurityHeaders(): void {
    const headers = this.generateSecurityHeaders();
    console.group('🛡️ Security Headers');
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();
  }

  /**
   * Valida configuração de segurança
   */
  validateSecurityConfig(): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Verifica HTTPS em produção
    if (
      securityConfig.environment.nodeEnv === 'production' &&
      window.location.protocol !== 'https:'
    ) {
      errors.push('HTTPS não está ativo em produção! CRÍTICO.');
    }

    // Verifica CSP
    const csp = cspService.generateCSP();
    if (csp.includes("'unsafe-eval'") && securityConfig.environment.nodeEnv === 'production') {
      warnings.push("CSP contém 'unsafe-eval' em produção. Considere remover.");
    }

    if (csp.includes("'unsafe-inline'")) {
      warnings.push("CSP contém 'unsafe-inline'. Use hashes ou nonces se possível.");
    }

    // Verifica CORS
    const cors = this.generateCORSConfig();
    if (cors.allowedOrigins.includes('*')) {
      errors.push('CORS permite qualquer origin (*). INSEGURO!');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }
}

// ==========================================
// SINGLETON
// ==========================================

export const securityHeadersService = new SecurityHeadersService();
export default securityHeadersService;
