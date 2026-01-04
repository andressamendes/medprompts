import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

/**
 * Rate limiter geral para rotas de autenticação
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit atingido', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: 'Muitas requisições. Tente novamente mais tarde.',
    });
  },
});

/**
 * Rate limiter mais restrito para login (proteção contra brute force)
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas de login por IP
  message: {
    success: false,
    error: 'Muitas tentativas de login. Sua conta foi temporariamente bloqueada por segurança.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  handler: (req, res) => {
    logger.warn('Rate limit de login atingido (possível brute force)', {
      ip: req.ip,
      email: req.body.email,
    });

    res.status(429).json({
      success: false,
      error: 'Muitas tentativas de login. Sua conta foi temporariamente bloqueada por segurança.',
    });
  },
});

/**
 * Rate limiter para rotas da API em geral
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo de 1000 requisições por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

logger.info('🛡️ Rate limiters inicializados', {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});
