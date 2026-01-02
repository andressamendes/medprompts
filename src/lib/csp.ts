/**
 * Content Security Policy (CSP) Configuration
 * Define políticas de segurança do navegador
 */

/**
 * Gera nonce aleatório para inline scripts seguros
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...Array.from(array)));
}

/**
 * Configuração CSP completa
 * Bloqueia scripts e recursos não autorizados
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para Vite dev mode
    "'unsafe-eval'", // Necessário para Vite dev mode
    'https://vercel.live', // Vercel Analytics (se usar)
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para styled-components/CSS-in-JS
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:', // Para fontes inline
  ],
  'img-src': [
    "'self'",
    'data:', // Para imagens base64
    'blob:', // Para imagens geradas dinamicamente
    'https:', // Para imagens externas (CDNs)
  ],
  'connect-src': [
    "'self'",
    'https://api.github.com', // Se usar GitHub API
    'https://vercel.live', // Vercel Analytics
    'wss://vercel.live', // Vercel Analytics WebSocket
  ],
  'frame-src': ["'none'"], // Bloqueia todos os iframes
  'object-src': ["'none'"], // Bloqueia <object>, <embed>, <applet>
  'base-uri': ["'self'"], // Previne alteração do base href
  'form-action': ["'self'"], // Previne submissão para domínios externos
  'frame-ancestors': ["'none'"], // Previne clickjacking
  'upgrade-insecure-requests': [], // Força HTTPS em produção
};

/**
 * Converte objeto CSP para string de meta tag
 */
export function generateCSPString(): string {
  const policies = Object.entries(CSP_CONFIG)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
  
  return policies;
}

/**
 * Aplica CSP dinamicamente via meta tag
 * Útil para SPAs que não podem configurar headers HTTP
 */
export function applyCSP(): void {
  // Verifica se já existe uma meta tag CSP
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  
  if (existingCSP) {
    console.warn('CSP já configurado via meta tag');
    return;
  }

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSPString();
  
  document.head.appendChild(meta);
  
  console.info('✅ Content Security Policy aplicado');
}

/**
 * CSP Report-Only para desenvolvimento
 * Apenas reporta violações sem bloquear
 */
export function applyCSPReportOnly(): void {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy-Report-Only';
  meta.content = generateCSPString();
  
  document.head.appendChild(meta);
  
  console.info('ℹ️ CSP Report-Only mode ativo (apenas logging)');
}

/**
 * Listener para violações de CSP
 * Registra violações no console
 */
export function setupCSPReporting(): void {
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('🚨 Violação de CSP detectada:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber,
    });
    
    // Em produção, você pode enviar isso para um serviço de analytics
    // Example: Sentry.captureException(new Error('CSP Violation'), { extra: { ... } });
  });
}

/**
 * Verifica se navegador suporta CSP
 */
export function isCSPSupported(): boolean {
  return 'securitypolicyviolation' in document || 'SecurityPolicyViolationEvent' in window;
}
