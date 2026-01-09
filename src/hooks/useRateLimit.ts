/**
 * 🛡️ Rate Limit Hook
 *
 * FASE 7: Hook para controle de rate limiting em componentes React
 *
 * Uso:
 * ```tsx
 * const { checkLimit, isBlocked, getRemainingAttempts } = useRateLimit();
 *
 * const handleSearch = async () => {
 *   const result = checkLimit('search');
 *   if (!result.allowed) {
 *     alert(result.error);
 *     return;
 *   }
 *   // Executa busca
 * };
 * ```
 */

import { useCallback, useState, useEffect } from 'react';
import {
  rateLimitService,
  getRateLimitIdentifier,
  formatRateLimitError,
} from '../services/rate-limit.service';

export type RateLimitAction =
  | 'login'
  | 'register'
  | 'api'
  | 'passwordReset'
  | 'search'
  | 'export';

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  error?: string;
  retryAfter?: number;
}

export interface UseRateLimitReturn {
  /**
   * Verifica e registra tentativa de ação
   */
  checkLimit: (action: RateLimitAction) => RateLimitCheckResult;

  /**
   * Verifica se está bloqueado (sem registrar tentativa)
   */
  isBlocked: (action: RateLimitAction) => boolean;

  /**
   * Obtém tentativas restantes
   */
  getRemainingAttempts: (action: RateLimitAction) => number | null;

  /**
   * Reset manual do rate limit
   */
  reset: (action: RateLimitAction) => void;

  /**
   * Obtém informações detalhadas
   */
  getInfo: (action: RateLimitAction) => {
    attempts: number;
    remaining: number;
    blocked: boolean;
    blockedUntil?: Date;
  } | null;
}

/**
 * Hook useRateLimit
 */
export function useRateLimit(userId?: string): UseRateLimitReturn {
  const [identifier] = useState(() => getRateLimitIdentifier(userId));

  /**
   * Verifica e registra tentativa
   */
  const checkLimit = useCallback(
    (action: RateLimitAction): RateLimitCheckResult => {
      const result = rateLimitService.checkLimit(identifier, action);

      if (!result.allowed) {
        return {
          ...result,
          error: formatRateLimitError(result),
        };
      }

      return result;
    },
    [identifier]
  );

  /**
   * Verifica se está bloqueado
   */
  const isBlocked = useCallback(
    (action: RateLimitAction): boolean => {
      return rateLimitService.isBlocked(identifier, action);
    },
    [identifier]
  );

  /**
   * Obtém tentativas restantes
   */
  const getRemainingAttempts = useCallback(
    (action: RateLimitAction): number | null => {
      const info = rateLimitService.getInfo(identifier, action);
      return info?.remaining ?? null;
    },
    [identifier]
  );

  /**
   * Reset manual
   */
  const reset = useCallback(
    (action: RateLimitAction): void => {
      rateLimitService.reset(identifier, action);
    },
    [identifier]
  );

  /**
   * Obtém informações detalhadas
   */
  const getInfo = useCallback(
    (action: RateLimitAction) => {
      return rateLimitService.getInfo(identifier, action);
    },
    [identifier]
  );

  return {
    checkLimit,
    isBlocked,
    getRemainingAttempts,
    reset,
    getInfo,
  };
}

/**
 * Hook para exibir feedback de rate limit em tempo real
 */
export function useRateLimitFeedback(
  action: RateLimitAction,
  userId?: string
) {
  const { getInfo, isBlocked } = useRateLimit(userId);
  const [feedback, setFeedback] = useState<{
    blocked: boolean;
    remaining: number;
    blockedUntil?: Date;
    message?: string;
  }>({
    blocked: false,
    remaining: Infinity,
  });

  useEffect(() => {
    const checkStatus = () => {
      const info = getInfo(action);
      const blocked = isBlocked(action);

      if (blocked && info?.blockedUntil) {
        const minutesRemaining = Math.ceil(
          (info.blockedUntil.getTime() - Date.now()) / 1000 / 60
        );
        setFeedback({
          blocked: true,
          remaining: 0,
          blockedUntil: info.blockedUntil,
          message: `Bloqueado. Tente novamente em ${minutesRemaining} minuto${minutesRemaining > 1 ? 's' : ''}.`,
        });
      } else if (info) {
        setFeedback({
          blocked: false,
          remaining: info.remaining,
          message:
            info.remaining <= 2
              ? `⚠️ ${info.remaining} tentativa${info.remaining > 1 ? 's' : ''} restante${info.remaining > 1 ? 's' : ''}`
              : undefined,
        });
      } else {
        setFeedback({
          blocked: false,
          remaining: Infinity,
        });
      }
    };

    checkStatus();

    // Atualiza a cada segundo se bloqueado
    const interval = feedback.blocked ? setInterval(checkStatus, 1000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [action, getInfo, isBlocked, feedback.blocked]);

  return feedback;
}

export default useRateLimit;
