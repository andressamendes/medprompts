import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const {
  RATE_LIMIT_WINDOW_MS = '900000',    // 15 minutos
  RATE_LIMIT_MAX_REQUESTS = '100',    // 100 requisições
  NODE_ENV = 'development'
} = process.env;

// Handler customizado para quando limite é excedido
const rateLimitHandler = (req: Request, res: Response): void => {
  const ip = req.ip || req.socket.remoteAddress;
  const userId = (req as any).user?.userId || 'anonymous';
  
  logger.warn('Rate limit excedido', {
    ip,
    userId,
    path: req.path,
    method: req.method
  });

  res.status(429).json({
    success: false,
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    retryAfter: Math.ceil(parseInt(RATE_LIMIT_WINDOW_MS) / 1000)
  });
};

// Função para gerar chave única baseada em IP e user (se autenticado)
const keyGenerator = (req: Request): string => {
  const userId = (req as any).user?.userId;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Se usuário autenticado, combina userId + IP
  // Se não autenticado, usa apenas IP
  return userId ? `${userId}-${ip}` : ip;
};

/**
 * Rate limiter geral para toda a API
 * 100 requisições por 15 minutos por IP/usuário
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  max: parseInt(RATE_LIMIT_MAX_REQUESTS),
  message: 'Muitas requisições deste IP ou conta, tente novamente mais tarde',
  standardHeaders: true,  // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false,   // Desabilita headers `X-RateLimit-*`
  keyGenerator,
  handler: rateLimitHandler,
  skip: (req) => NODE_ENV === 'development' && req.path.includes('/health') // Skip health check em dev
});

/**
 * Rate limiter estrito para autenticação
 * 5 tentativas por 15 minutos por IP
 * Previne ataques de força bruta
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  handler: (req, res) => {
    const ip = req.ip || req.socket.remoteAddress;
    
    logger.warn('Rate limit de autenticação excedido', {
      ip,
      path: req.path,
      body: { email: req.body.email } // Log apenas email, não senha
    });

    res.status(429).json({
      success: false,
      error: 'Muitas tentativas de login. Sua conta foi temporariamente bloqueada por segurança.',
      retryAfter: Math.ceil(parseInt(RATE_LIMIT_WINDOW_MS) / 1000)
    });
  }
});

/**
 * Rate limiter moderado para criação de recursos
 * 20 requisições por 15 minutos
 * Previne spam de criação de dados
 */
export const createResourceLimiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  max: 20,
  message: 'Muitas criações de recursos. Aguarde alguns minutos',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler
});

/**
 * Rate limiter permissivo para leitura de dados
 * 500 requisições por 15 minutos
 * Permite navegação normal mas previne scraping massivo
 */
export const readResourceLimiter = rateLimit({
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  max: 500,
  message: 'Muitas requisições de leitura. Aguarde alguns minutos',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler
});

/**
 * Rate limiter muito estrito para operações sensíveis
 * 3 requisições por hora
 * Usado para: alteração de email, senha, exclusão de conta
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: 'Muitas tentativas de operação sensível. Tente novamente em 1 hora',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    const userId = (req as any).user?.userId || 'anonymous';
    const ip = req.ip || req.socket.remoteAddress;
    
    logger.error('Rate limit de operação sensível excedido', {
      userId,
      ip,
      path: req.path,
      method: req.method
    });

    res.status(429).json({
      success: false,
      error: 'Muitas tentativas de operação sensível. Por segurança, aguarde 1 hora antes de tentar novamente.',
      retryAfter: 3600 // 1 hora em segundos
    });
  }
});

/**
 * Rate limiter para recuperação de senha
 * 3 tentativas por 1 hora por email
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip || 'unknown',
  handler: rateLimitHandler
});

// Log de inicialização
logger.info('🛡️ Rate limiters inicializados', {
  windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
  maxRequests: parseInt(RATE_LIMIT_MAX_REQUESTS),
  environment: NODE_ENV
});

export default {
  generalLimiter,
  authLimiter,
  createResourceLimiter,
  readResourceLimiter,
  sensitiveLimiter,
  passwordResetLimiter
};
