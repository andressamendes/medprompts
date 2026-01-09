/**
 * 🛡️ Secure Fetch Hook
 *
 * FASE 8: Hook para fetch seguro com validação CORS e security headers
 *
 * Uso:
 * ```tsx
 * const { secureFetch, isLoading, error } = useSecureFetch();
 *
 * const data = await secureFetch('https://api.example.com/data');
 * ```
 */

import { useState, useCallback } from 'react';
import { securityHeadersService } from '../services/security-headers.service';

export interface UseSecureFetchOptions extends RequestInit {
  skipCORSValidation?: boolean;
}

export interface UseSecureFetchReturn {
  /**
   * Fetch seguro com validação CORS
   */
  secureFetch: <T = any>(
    url: string,
    options?: UseSecureFetchOptions
  ) => Promise<T>;

  /**
   * Estado de loading
   */
  isLoading: boolean;

  /**
   * Erro se houver
   */
  error: Error | null;

  /**
   * Limpa erro
   */
  clearError: () => void;
}

/**
 * Hook useSecureFetch
 */
export function useSecureFetch(): UseSecureFetchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const secureFetch = useCallback(
    async <T = any>(
      url: string,
      options?: UseSecureFetchOptions
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        // Valida CORS (opcional)
        if (!options?.skipCORSValidation) {
          securityHeadersService.validateFetchRequest(url, options);
        }

        // Executa fetch
        const response = await securityHeadersService.secureFetch(url, options);

        // Verifica resposta
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        // Parse JSON
        const data = await response.json();
        return data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    secureFetch,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook para validar se origin é permitido
 */
export function useCORSValidation() {
  const isOriginAllowed = useCallback((origin: string): boolean => {
    return securityHeadersService.isOriginAllowed(origin);
  }, []);

  const getCORSConfig = useCallback(() => {
    return securityHeadersService.generateCORSConfig();
  }, []);

  return {
    isOriginAllowed,
    getCORSConfig,
  };
}

/**
 * Hook para obter security headers
 */
export function useSecurityHeaders() {
  const getHeaders = useCallback(() => {
    return securityHeadersService.generateSecurityHeaders();
  }, []);

  const logHeaders = useCallback(() => {
    securityHeadersService.logSecurityHeaders();
  }, []);

  const validate = useCallback(() => {
    return securityHeadersService.validateSecurityConfig();
  }, []);

  return {
    getHeaders,
    logHeaders,
    validate,
  };
}

export default useSecureFetch;
