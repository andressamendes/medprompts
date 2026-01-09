/**
 * 🛡️ Content Security Policy (CSP) Service
 *
 * FASE 6: Implementação de CSP para prevenir XSS e outros ataques
 * Implementa OWASP A05:2021 (Security Misconfiguration)
 *
 * CSP Headers previnem:
 * - XSS (Cross-Site Scripting)
 * - Data Injection Attacks
 * - Clickjacking
 * - Code Injection
 */

import { securityConfig } from '../config/security.config';

// ==========================================
// CSP DIRECTIVES
// ==========================================

interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'media-src': string[];
  'object-src': string[];
  'frame-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
}

// ==========================================
// CSP SERVICE
// ==========================================

class CSPService {
  /**
   * Gera política CSP para produção (restritiva)
   */
  getProductionCSP(): CSPDirectives {
    const allowedDomains = securityConfig.csp.allowedDomains;

    return {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Necessário para Vite em dev (remover em prod se possível)
        // Adicionar hashes de scripts inline se necessário
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Necessário para Tailwind/styled components
        'https://fonts.googleapis.com',
      ],
      'img-src': [
        "'self'",
        'data:', // Para imagens base64
        'https:', // Imagens externas
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
      ],
      'connect-src': [
        "'self'",
        ...allowedDomains, // Streams de música, APIs externas
      ],
      'media-src': [
        "'self'",
        ...allowedDomains, // Streams de áudio
      ],
      'object-src': ["'none'"], // Bloqueia <object>, <embed>, <applet>
      'frame-src': ["'none'"], // Bloqueia iframes
      'base-uri': ["'self'"], // Previne base tag hijacking
      'form-action': ["'self'"], // Formulários só podem enviar para próprio domínio
      'frame-ancestors': ["'none'"], // Previne clickjacking
      'upgrade-insecure-requests': true, // Força HTTPS
      'block-all-mixed-content': true, // Bloqueia mixed content
    };
  }

  /**
   * Gera política CSP para desenvolvimento (mais permissiva)
   */
  getDevelopmentCSP(): CSPDirectives {
    return {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Necessário para HMR do Vite
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'http:', // Permite HTTP em dev
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
      ],
      'connect-src': [
        "'self'",
        'ws:', // WebSocket para HMR
        'wss:',
        ...securityConfig.csp.allowedDomains,
      ],
      'media-src': [
        "'self'",
        ...securityConfig.csp.allowedDomains,
      ],
      'object-src': ["'none'"],
      'frame-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
    };
  }

  /**
   * Converte diretivas CSP para string de header
   */
  directivesToString(directives: CSPDirectives): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(directives)) {
      if (value === true) {
        // Diretivas booleanas (sem valor)
        parts.push(key);
      } else if (Array.isArray(value) && value.length > 0) {
        // Diretivas com lista de valores
        parts.push(`${key} ${value.join(' ')}`);
      }
    }

    return parts.join('; ');
  }

  /**
   * Gera CSP baseado no ambiente
   */
  generateCSP(): string {
    const isProduction = securityConfig.environment.nodeEnv === 'production';
    const directives = isProduction
      ? this.getProductionCSP()
      : this.getDevelopmentCSP();

    return this.directivesToString(directives);
  }

  /**
   * Gera meta tag CSP para HTML
   */
  generateMetaTag(): string {
    const csp = this.generateCSP();
    return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
  }

  /**
   * Verifica se URL é permitida pela CSP
   */
  isUrlAllowedByCSP(url: string, type: 'script' | 'style' | 'img' | 'media' | 'connect'): boolean {
    try {
      const urlObj = new URL(url);
      const directives = this.getProductionCSP();

      let allowedSources: string[] = [];

      switch (type) {
        case 'script':
          allowedSources = directives['script-src'];
          break;
        case 'style':
          allowedSources = directives['style-src'];
          break;
        case 'img':
          allowedSources = directives['img-src'];
          break;
        case 'media':
          allowedSources = directives['media-src'];
          break;
        case 'connect':
          allowedSources = directives['connect-src'];
          break;
      }

      // Verifica se URL corresponde a alguma fonte permitida
      return allowedSources.some(source => {
        if (source === "'self'") {
          return urlObj.origin === window.location.origin;
        }
        if (source === 'https:') {
          return urlObj.protocol === 'https:';
        }
        if (source === 'data:') {
          return url.startsWith('data:');
        }
        if (source.startsWith('http')) {
          return url.startsWith(source);
        }
        return false;
      });
    } catch {
      return false;
    }
  }

  /**
   * Reporta violação de CSP
   */
  reportCSPViolation(violation: {
    blockedUri: string;
    violatedDirective: string;
    sourceFile?: string;
  }): void {
    console.warn('🚨 CSP VIOLATION:', violation);

    // Em produção, enviar para sistema de logging
    if (securityConfig.environment.nodeEnv === 'production') {
      // TODO: Enviar para backend/serviço de logging
      // fetch('/api/security/csp-report', {
      //   method: 'POST',
      //   body: JSON.stringify(violation)
      // });
    }
  }

  /**
   * Configura listener para violações de CSP
   */
  setupCSPReporting(): void {
    // SecurityPolicyViolationEvent
    document.addEventListener('securitypolicyviolation', (e) => {
      this.reportCSPViolation({
        blockedUri: e.blockedURI,
        violatedDirective: e.violatedDirective,
        sourceFile: e.sourceFile || undefined,
      });
    });
  }
}

export const cspService = new CSPService();
export default cspService;
