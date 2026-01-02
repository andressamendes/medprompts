/**
 * Sistema de validação e sanitização de inputs
 * Proteção contra XSS, SQL Injection e outras vulnerabilidades
 */

/**
 * Remove tags HTML e scripts de uma string
 * Proteção básica contra XSS
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embeds
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers (onclick, onerror, etc)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, ''); // Remove data URLs
}

/**
 * Escapa caracteres HTML especiais
 * Previne XSS em conteúdo que será renderizado
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Valida e sanitiza email
 */
export function validateEmail(email: string): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = email.trim().toLowerCase();
  
  // Regex robusto para email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!sanitized) {
    return { valid: false, sanitized, error: 'Email é obrigatório' };
  }
  
  if (sanitized.length > 254) {
    return { valid: false, sanitized, error: 'Email muito longo' };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Email inválido' };
  }
  
  return { valid: true, sanitized };
}

/**
 * Valida e sanitiza nome de usuário
 */
export function validateUsername(username: string): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = username.trim();
  
  if (!sanitized) {
    return { valid: false, sanitized, error: 'Nome de usuário é obrigatório' };
  }
  
  if (sanitized.length < 3) {
    return { valid: false, sanitized, error: 'Nome deve ter no mínimo 3 caracteres' };
  }
  
  if (sanitized.length > 50) {
    return { valid: false, sanitized, error: 'Nome deve ter no máximo 50 caracteres' };
  }
  
  // Permite apenas letras, números, espaços e alguns caracteres especiais seguros
  const usernameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/;
  
  if (!usernameRegex.test(sanitized)) {
    return { valid: false, sanitized, error: 'Nome contém caracteres inválidos' };
  }
  
  // Remove HTML e scripts
  const cleaned = sanitizeHtml(sanitized);
  
  return { valid: true, sanitized: cleaned };
}

/**
 * Valida número (XP, nível, etc)
 */
export function validateNumber(
  value: unknown,
  options: { min?: number; max?: number; integer?: boolean } = {}
): { valid: boolean; value: number; error?: string } {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  
  if (isNaN(num)) {
    return { valid: false, value: 0, error: 'Valor inválido' };
  }
  
  if (!isFinite(num)) {
    return { valid: false, value: 0, error: 'Número infinito não permitido' };
  }
  
  if (options.integer && !Number.isInteger(num)) {
    return { valid: false, value: Math.floor(num), error: 'Deve ser um número inteiro' };
  }
  
  if (options.min !== undefined && num < options.min) {
    return { valid: false, value: options.min, error: `Valor mínimo: ${options.min}` };
  }
  
  if (options.max !== undefined && num > options.max) {
    return { valid: false, value: options.max, error: `Valor máximo: ${options.max}` };
  }
  
  return { valid: true, value: num };
}

/**
 * Valida data
 */
export function validateDate(date: unknown): { valid: boolean; date: Date | null; error?: string } {
  let dateObj: Date | null = null;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  }
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return { valid: false, date: null, error: 'Data inválida' };
  }
  
  // Valida range razoável (ano 1900 - 2100)
  const year = dateObj.getFullYear();
  if (year < 1900 || year > 2100) {
    return { valid: false, date: null, error: 'Data fora do intervalo válido' };
  }
  
  return { valid: true, date: dateObj };
}

/**
 * Sanitiza objeto recursivamente
 * Remove propriedades perigosas e sanitiza strings
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeHtml(obj) as T;
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Remove propriedades potencialmente perigosas
      if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      sanitized[key] = sanitizeObject(value);
    }
    
    return sanitized as T;
  }
  
  return obj;
}

/**
 * Valida URL
 */
export function validateUrl(url: string): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = url.trim();
  
  if (!sanitized) {
    return { valid: false, sanitized, error: 'URL é obrigatória' };
  }
  
  // Bloqueia protocolos perigosos
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = sanitized.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { valid: false, sanitized: '', error: 'Protocolo não permitido' };
    }
  }
  
  try {
    const urlObj = new URL(sanitized);
    
    // Permite apenas HTTP e HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, sanitized: '', error: 'Apenas URLs HTTP/HTTPS são permitidas' };
    }
    
    return { valid: true, sanitized: urlObj.href };
  } catch {
    return { valid: false, sanitized, error: 'URL inválida' };
  }
}

/**
 * Rate limiting simples (proteção contra spam)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove tentativas antigas
    const recentAttempts = attempts.filter((time) => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
