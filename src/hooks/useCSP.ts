/**
 * 🛡️ CSP (Content Security Policy) Hook
 *
 * FASE 6: Hook para validação de URLs contra CSP
 *
 * Uso:
 * ```tsx
 * const { isUrlAllowed, validateUrl } = useCSP();
 *
 * if (isUrlAllowed(externalUrl, 'media')) {
 *   // URL permitida pela CSP
 * }
 * ```
 */

import { useCallback, useEffect } from 'react';
import { cspService } from '../services/csp.service';

export interface UseCSPReturn {
  /**
   * Verifica se URL é permitida pela CSP
   */
  isUrlAllowed: (
    url: string,
    type: 'script' | 'style' | 'img' | 'media' | 'connect'
  ) => boolean;

  /**
   * Valida URL e retorna resultado detalhado
   */
  validateUrl: (
    url: string,
    type: 'script' | 'style' | 'img' | 'media' | 'connect'
  ) => {
    isValid: boolean;
    error?: string;
  };

  /**
   * Obtém CSP atual como string
   */
  getCurrentCSP: () => string;
}

/**
 * Hook useCSP
 */
export function useCSP(): UseCSPReturn {
  // Inicializa CSP reporting ao montar
  useEffect(() => {
    cspService.setupCSPReporting();
  }, []);

  /**
   * Verifica se URL é permitida
   */
  const isUrlAllowed = useCallback(
    (url: string, type: 'script' | 'style' | 'img' | 'media' | 'connect'): boolean => {
      try {
        return cspService.isUrlAllowedByCSP(url, type);
      } catch {
        return false;
      }
    },
    []
  );

  /**
   * Valida URL com detalhes
   */
  const validateUrl = useCallback(
    (
      url: string,
      type: 'script' | 'style' | 'img' | 'media' | 'connect'
    ): { isValid: boolean; error?: string } => {
      if (!url) {
        return {
          isValid: false,
          error: 'URL não pode estar vazia',
        };
      }

      try {
        new URL(url); // Valida formato da URL
      } catch {
        return {
          isValid: false,
          error: 'URL inválida',
        };
      }

      const allowed = cspService.isUrlAllowedByCSP(url, type);

      if (!allowed) {
        return {
          isValid: false,
          error: `URL bloqueada pela Content Security Policy. Tipo: ${type}`,
        };
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Obtém CSP atual
   */
  const getCurrentCSP = useCallback((): string => {
    return cspService.generateCSP();
  }, []);

  return {
    isUrlAllowed,
    validateUrl,
    getCurrentCSP,
  };
}

export default useCSP;
