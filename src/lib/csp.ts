/**
 * Content Security Policy (CSP) Configuration
 * Define políticas de segurança do navegador
 * 
 * ⚠️ IMPORTANTE: CSP é diferente para DEV e PRODUÇÃO
 */

/**
 * Gera nonce aleatório para inline scripts seguros
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const arrayValues = Array.from(array);
  let binaryString = '';
  for (let i = 0; i < arrayValues.length; i++) {
    binaryString += String.fromCharCode(arrayValues[i]);
  }
  return btoa(binaryString);
}

/**
 * Detecta se está em modo de desenvolvimento
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Configuração CSP para DESENVOLVIMENTO
 * Permite unsafe-inline e unsafe-eval para Vite HMR
 */
const CSP_CONFIG_DEV = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // ⚠️ DEV ONLY:  Necessário para Vite HMR
    "'unsafe-eval'",   // ⚠️ DEV ONLY: Necessário para Vite HMR
    'https://vercel.live',
  ],
  'style-src':  [
    "'self'",
    "'unsafe-inline'", // Necessário para Tailwind JIT
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data: ',
    'blob:',
    'https:',
  ],
  'connect-src': [
    "'self'",
    'https://api.github.com',
    'https://vercel.live',
    'wss://vercel.live',
    'ws://localhost:*', // ⚠️ DEV ONLY: Vite WebSocket
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
};

/**
 * Configuração CSP para PRODUÇÃO
 * ✅ SEM unsafe-inline ou unsafe-eval
 */
const CSP_CONFIG_PROD = {
  'default-src':  ["'self'"],
  'script-src': [
    "'self'",
    'https://vercel.live',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Mantido apenas para Tailwind classes geradas
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
  ],
  'connect-src': [
    "'self'",
    'https://api.github.com',
    'https://vercel.live',
    'wss://vercel.live',
  ],
  'frame-src':  ["'none'"],
  'object-src': ["'none'"],
  'base-uri':  ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors':  ["'none'"],
  'upgrade-insecure-requests': [], // ✅ Força HTTPS em produção
};

/**
 * Seleciona configuração baseada no ambiente
 */
export const CSP_CONFIG = isDevelopment ? CSP_CONFIG_DEV : CSP_CONFIG_PROD;

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
    if (isDevelopment) {
      console.warn('⚠️ CSP já configurado via meta tag');
    }
    return;
  }

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSPString();
  
  document.head.appendChild(meta);
  
  if (isDevelopment) {
    console.info(`✅ Content Security Policy aplicado (MODO:  ${isDevelopment ? 'DEV' : 'PROD'})`);
  }
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
  
  if (isDevelopment) {
    console.info('📊 CSP Report-Only ativado (apenas logs, sem bloqueio)');
  }
}