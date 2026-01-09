/**
 * 🧹 Sanitization Service - XSS Protection
 *
 * FASE 5: Proteção contra XSS (Cross-Site Scripting)
 * Implementa OWASP A03:2021 (Injection)
 *
 * Funcionalidades:
 * - Sanitização de HTML com DOMPurify
 * - Validação de emails, URLs, nomes
 * - Escape de caracteres especiais
 * - Limpeza de inputs de formulários
 */

import DOMPurify from 'dompurify';

// ==========================================
// CONFIGURAÇÕES
// ==========================================

/**
 * Configuração estrita do DOMPurify
 * Remove todos os elementos perigosos
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: [] as string[], // Nenhuma tag HTML permitida
  ALLOWED_ATTR: [] as string[], // Nenhum atributo permitido
  KEEP_CONTENT: true, // Mantém texto, remove apenas tags
};

/**
 * Configuração básica para rich text
 * Permite apenas formatação básica segura
 */
const BASIC_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span'],
  ALLOWED_ATTR: ['class'],
  KEEP_CONTENT: true,
};

/**
 * Configuração para markdown/prompts
 * Permite mais formatação mas ainda seguro
 */
const MARKDOWN_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'span', 'div'
  ],
  ALLOWED_ATTR: ['href', 'class', 'id'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  KEEP_CONTENT: true,
};

// ==========================================
// REGEX PATTERNS
// ==========================================

const PATTERNS = {
  // Email válido
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Nome válido (apenas letras, espaços, hífens e apóstrofos)
  NAME: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,

  // Username (alfanumérico, underscores, hífens)
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,

  // URL válida (http/https)
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,

  // Telefone brasileiro
  PHONE_BR: /^(\+55\s?)?(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}$/,

  // CEP brasileiro
  CEP_BR: /^\d{5}-?\d{3}$/,

  // Apenas números
  NUMBERS_ONLY: /^\d+$/,

  // Alfanumérico
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
};

// ==========================================
// SANITIZATION SERVICE
// ==========================================

class SanitizationService {
  // ==========================================
  // SANITIZAÇÃO DE HTML
  // ==========================================

  /**
   * Sanitiza HTML removendo TODAS as tags
   * Retorna apenas texto puro
   */
  sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, STRICT_CONFIG).trim();
  }

  /**
   * Sanitiza HTML permitindo apenas formatação básica
   * Uso: Mensagens de usuário, comentários
   */
  sanitizeBasicHtml(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, BASIC_HTML_CONFIG).trim();
  }

  /**
   * Sanitiza HTML permitindo markdown/formatação rica
   * Uso: Prompts, artigos, documentação
   */
  sanitizeMarkdown(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, MARKDOWN_CONFIG).trim();
  }

  /**
   * Sanitiza URL - apenas http/https
   */
  sanitizeUrl(input: string): string | null {
    if (typeof input !== 'string') return null;

    const trimmed = input.trim();

    // Remove javascript:, data:, vbscript:, etc
    if (/^(javascript|data|vbscript|file|about):/i.test(trimmed)) {
      return null;
    }

    // Valida se é URL válida
    try {
      const url = new URL(trimmed);

      // Apenas http ou https
      if (!['http:', 'https:'].includes(url.protocol)) {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  }

  // ==========================================
  // VALIDAÇÃO DE INPUTS
  // ==========================================

  /**
   * Valida e sanitiza email
   */
  validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
    const sanitized = this.sanitizeText(email).toLowerCase();

    if (!sanitized) {
      return { isValid: false, sanitized: '', error: 'Email não pode ser vazio' };
    }

    if (!PATTERNS.EMAIL.test(sanitized)) {
      return { isValid: false, sanitized, error: 'Email inválido' };
    }

    // Verificação adicional de comprimento
    if (sanitized.length > 254) {
      return { isValid: false, sanitized, error: 'Email muito longo' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Valida e sanitiza nome
   */
  validateName(name: string): { isValid: boolean; sanitized: string; error?: string } {
    const sanitized = this.sanitizeText(name).trim();

    if (!sanitized) {
      return { isValid: false, sanitized: '', error: 'Nome não pode ser vazio' };
    }

    if (sanitized.length < 2) {
      return { isValid: false, sanitized, error: 'Nome deve ter pelo menos 2 caracteres' };
    }

    if (sanitized.length > 50) {
      return { isValid: false, sanitized, error: 'Nome muito longo (máx: 50 caracteres)' };
    }

    if (!PATTERNS.NAME.test(sanitized)) {
      return { isValid: false, sanitized, error: 'Nome contém caracteres inválidos' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Valida e sanitiza username
   */
  validateUsername(username: string): { isValid: boolean; sanitized: string; error?: string } {
    const sanitized = this.sanitizeText(username).toLowerCase();

    if (!sanitized) {
      return { isValid: false, sanitized: '', error: 'Username não pode ser vazio' };
    }

    if (sanitized.length < 3) {
      return { isValid: false, sanitized, error: 'Username deve ter pelo menos 3 caracteres' };
    }

    if (sanitized.length > 20) {
      return { isValid: false, sanitized, error: 'Username muito longo (máx: 20 caracteres)' };
    }

    if (!PATTERNS.USERNAME.test(sanitized)) {
      return {
        isValid: false,
        sanitized,
        error: 'Username pode conter apenas letras, números, _ e -'
      };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Valida senha (não sanitiza, apenas valida força)
   */
  validatePassword(password: string): { isValid: boolean; strength: number; error?: string } {
    if (!password) {
      return { isValid: false, strength: 0, error: 'Senha não pode ser vazia' };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        strength: 0,
        error: 'Senha deve ter pelo menos 8 caracteres'
      };
    }

    if (password.length > 128) {
      return { isValid: false, strength: 0, error: 'Senha muito longa (máx: 128)' };
    }

    // Calcula força da senha
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    return { isValid: true, strength };
  }

  /**
   * Valida URL
   */
  validateUrl(url: string): { isValid: boolean; sanitized: string | null; error?: string } {
    const sanitized = this.sanitizeUrl(url);

    if (!sanitized) {
      return { isValid: false, sanitized: null, error: 'URL inválida ou não segura' };
    }

    return { isValid: true, sanitized };
  }

  // ==========================================
  // ESCAPE DE CARACTERES
  // ==========================================

  /**
   * Escape de HTML (converte < > & " ')
   */
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Escape de JavaScript (para uso em strings JS)
   */
  escapeJavaScript(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\//g, '\\/');
  }

  /**
   * Escape de SQL (básico - backend deve usar prepared statements)
   */
  escapeSql(text: string): string {
    return text.replace(/'/g, "''");
  }

  // ==========================================
  // SANITIZAÇÃO DE OBJETOS COMPLETOS
  // ==========================================

  /**
   * Sanitiza objeto de registro de usuário
   */
  sanitizeUserRegistration(data: {
    name: string;
    email: string;
    password: string;
    university?: string;
    graduationYear?: number;
  }): {
    isValid: boolean;
    sanitized?: {
      name: string;
      email: string;
      password: string;
      university?: string;
      graduationYear?: number;
    };
    errors: string[];
  } {
    const errors: string[] = [];

    // Valida nome
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.isValid) {
      errors.push(`Nome: ${nameValidation.error}`);
    }

    // Valida email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(`Email: ${emailValidation.error}`);
    }

    // Valida senha
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(`Senha: ${passwordValidation.error}`);
    }

    // Valida universidade (opcional)
    let university: string | undefined;
    if (data.university) {
      university = this.sanitizeText(data.university);
      if (university.length > 100) {
        errors.push('Universidade: Nome muito longo (máx: 100 caracteres)');
      }
    }

    // Valida ano de graduação (opcional)
    let graduationYear: number | undefined;
    if (data.graduationYear) {
      graduationYear = parseInt(String(data.graduationYear), 10);
      const currentYear = new Date().getFullYear();

      if (isNaN(graduationYear)) {
        errors.push('Ano de graduação: Deve ser um número');
      } else if (graduationYear < 1900 || graduationYear > currentYear + 10) {
        errors.push(`Ano de graduação: Deve estar entre 1900 e ${currentYear + 10}`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      sanitized: {
        name: nameValidation.sanitized,
        email: emailValidation.sanitized,
        password: data.password, // Senha não é sanitizada, vai direto pro bcrypt
        university,
        graduationYear,
      },
      errors: [],
    };
  }

  /**
   * Sanitiza input de prompt/conteúdo
   */
  sanitizePromptContent(data: {
    title: string;
    content: string;
    tags?: string[];
  }): {
    isValid: boolean;
    sanitized?: {
      title: string;
      content: string;
      tags: string[];
    };
    errors: string[];
  } {
    const errors: string[] = [];

    // Título
    const title = this.sanitizeText(data.title);
    if (!title) {
      errors.push('Título não pode ser vazio');
    } else if (title.length < 3) {
      errors.push('Título muito curto (mín: 3 caracteres)');
    } else if (title.length > 200) {
      errors.push('Título muito longo (máx: 200 caracteres)');
    }

    // Conteúdo (permite markdown)
    const content = this.sanitizeMarkdown(data.content);
    if (!content) {
      errors.push('Conteúdo não pode ser vazio');
    } else if (content.length > 50000) {
      errors.push('Conteúdo muito longo (máx: 50.000 caracteres)');
    }

    // Tags (opcional)
    const tags: string[] = [];
    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags.slice(0, 10)) { // Máx 10 tags
        const sanitizedTag = this.sanitizeText(tag).toLowerCase();
        if (sanitizedTag && sanitizedTag.length <= 20) {
          tags.push(sanitizedTag);
        }
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      sanitized: { title, content, tags },
      errors: [],
    };
  }

  // ==========================================
  // DETECÇÃO DE ATAQUES
  // ==========================================

  /**
   * Detecta tentativa de XSS óbvia
   */
  detectXssAttempt(input: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick=, onload=, etc
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /vbscript:/i,
      /data:text\/html/i,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detecta tentativa de SQL Injection
   */
  detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bor\b|\band\b)\s+[\w\d]+=[\w\d]+/i,
      /union\s+select/i,
      /drop\s+table/i,
      /;\s*drop/i,
      /--/,
      /\/\*/,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detecta tentativa de Path Traversal
   */
  detectPathTraversal(input: string): boolean {
    return /\.\.[\/\\]/.test(input);
  }

  /**
   * Log de tentativa de ataque (desenvolvimento)
   */
  logSecurityIncident(type: string, input: string, userId?: string): void {
    console.warn('🚨 SECURITY INCIDENT DETECTED:', {
      type,
      timestamp: new Date().toISOString(),
      userId,
      inputSample: input.substring(0, 100),
    });

    // Em produção, enviar para sistema de logging/monitoramento
  }
}

export const sanitizationService = new SanitizationService();
export default sanitizationService;
