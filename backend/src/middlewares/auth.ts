import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Interface para o payload do JWT
interface JwtPayload {
  userId: string;
  email: string;
  iat?:  number;
  exp?: number;
}

// Extend Express Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?:  string;
      userEmail?: string;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * Verifica token no header Authorization
 * Adiciona userId e userEmail ao request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
      return;
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
      });
      return;
    }

    const token = parts[1];

    // Verificar token
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT_SECRET não configurado');
      res.status(500).json({
        success: false,
        error: 'Erro de configuração do servidor',
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Adicionar dados do usuário ao request
      req.userId = decoded.userId;
      req.userEmail = decoded. email;

      // Log de autenticação bem-sucedida (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Autenticação bem-sucedida', {
          userId: decoded.userId,
          email: decoded.email,
          path: req.path,
        });
      }

      next();
    } catch (jwtError:  any) {
      // Token inválido ou expirado
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error: 'Token expirado',
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          error: 'Token inválido',
        });
      } else {
        logger.error('Erro ao verificar token', { error: jwtError.message });
        res.status(401).json({
          success: false,
          error: 'Erro ao verificar token',
        });
      }
      return;
    }
  } catch (error: any) {
    logger.error('Erro no middleware de autenticação', { error:  error.message });
    res.status(500).json({
      success: false,
      error:  'Erro interno no servidor',
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Se o token existir, valida e adiciona userId ao request
 * Se não existir, continua sem autenticação
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next();
      return;
    }

    const token = parts[1];
    const secret = process.env. JWT_SECRET;

    if (! secret) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    } catch {
      // Token inválido, mas continua sem autenticação
    }

    next();
  } catch (error) {
    next();
  }
};