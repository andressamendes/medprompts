/**
 * 🧹 useSanitization Hook - React XSS Protection Helper
 *
 * FASE 5: Hooks para sanitização de inputs em formulários React
 *
 * Uso:
 * ```tsx
 * const { sanitizeInput, validateEmail } = useSanitization();
 *
 * const handleSubmit = (e) => {
 *   const clean = sanitizeInput(userInput);
 *   // ...
 * };
 * ```
 */

import { useCallback } from 'react';
import { sanitizationService } from '../services/sanitization.service';

export interface SanitizationHook {
  // Sanitização
  sanitizeText: (input: string) => string;
  sanitizeHtml: (input: string) => string;
  sanitizeMarkdown: (input: string) => string;
  sanitizeUrl: (input: string) => string | null;

  // Validação
  validateEmail: (email: string) => { isValid: boolean; sanitized: string; error?: string };
  validateName: (name: string) => { isValid: boolean; sanitized: string; error?: string };
  validateUsername: (username: string) => { isValid: boolean; sanitized: string; error?: string };
  validatePassword: (password: string) => { isValid: boolean; strength: number; error?: string };
  validateUrl: (url: string) => { isValid: boolean; sanitized: string | null; error?: string };

  // Escape
  escapeHtml: (text: string) => string;

  // Detecção de ataques
  detectXss: (input: string) => boolean;
  detectSqlInjection: (input: string) => boolean;
}

/**
 * Hook principal para sanitização
 */
export function useSanitization(): SanitizationHook {
  const sanitizeText = useCallback((input: string) => {
    return sanitizationService.sanitizeText(input);
  }, []);

  const sanitizeHtml = useCallback((input: string) => {
    return sanitizationService.sanitizeBasicHtml(input);
  }, []);

  const sanitizeMarkdown = useCallback((input: string) => {
    return sanitizationService.sanitizeMarkdown(input);
  }, []);

  const sanitizeUrl = useCallback((input: string) => {
    return sanitizationService.sanitizeUrl(input);
  }, []);

  const validateEmail = useCallback((email: string) => {
    return sanitizationService.validateEmail(email);
  }, []);

  const validateName = useCallback((name: string) => {
    return sanitizationService.validateName(name);
  }, []);

  const validateUsername = useCallback((username: string) => {
    return sanitizationService.validateUsername(username);
  }, []);

  const validatePassword = useCallback((password: string) => {
    return sanitizationService.validatePassword(password);
  }, []);

  const validateUrl = useCallback((url: string) => {
    return sanitizationService.validateUrl(url);
  }, []);

  const escapeHtml = useCallback((text: string) => {
    return sanitizationService.escapeHtml(text);
  }, []);

  const detectXss = useCallback((input: string) => {
    return sanitizationService.detectXssAttempt(input);
  }, []);

  const detectSqlInjection = useCallback((input: string) => {
    return sanitizationService.detectSqlInjection(input);
  }, []);

  return {
    sanitizeText,
    sanitizeHtml,
    sanitizeMarkdown,
    sanitizeUrl,
    validateEmail,
    validateName,
    validateUsername,
    validatePassword,
    validateUrl,
    escapeHtml,
    detectXss,
    detectSqlInjection,
  };
}

/**
 * Hook para validação de formulário com estado
 */
export function useFormValidation() {
  const { validateEmail, validateName, validatePassword } = useSanitization();

  const validateForm = useCallback((formData: {
    name?: string;
    email?: string;
    password?: string;
  }) => {
    const errors: Record<string, string> = {};

    if (formData.name) {
      const nameValidation = validateName(formData.name);
      if (!nameValidation.isValid && nameValidation.error) {
        errors.name = nameValidation.error;
      }
    }

    if (formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid && emailValidation.error) {
        errors.email = emailValidation.error;
      }
    }

    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid && passwordValidation.error) {
        errors.password = passwordValidation.error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [validateEmail, validateName, validatePassword]);

  return { validateForm };
}

export default useSanitization;
