import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { logger } from '../utils/logger';

// Estende Request para incluir userId
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/**
 * Middleware de autenticação
 * Verifica se há um token JWT válido no header Authorization
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrair token do header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
      return;
    }

    // Verificar token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      logger.warn('Token inválido ou expirado', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
      });
      return;
    }

    // Adicionar userId ao request
    req.userId = decoded.userId;

    next();
  } catch (error: any) {
    logger.error('Erro no middleware de autenticação', {
      error: error.message,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: 'Erro na autenticação',
    });
  }
};
