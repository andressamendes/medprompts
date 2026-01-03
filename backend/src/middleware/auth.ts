import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../config/jwt';
import { logger } from '../utils/logger';

// Estende interface Request para incluir dados do usuário
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * Verifica token no header Authorization e injeta dados do usuário em req.user
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrai token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('Tentativa de acesso sem token', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido'
      });
      return;
    }

    // Verifica formato "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn('Formato de token inválido', {
        path: req.path,
        authHeader: authHeader.substring(0, 20) + '...'
      });
      
      res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Use: Bearer <token>'
      });
      return;
    }

    const token = parts[1];

    // Verifica e decodifica token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      logger.warn('Token inválido ou expirado', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado. Faça login novamente.'
      });
      return;
    }

    // Injeta dados do usuário na requisição
    req.user = decoded;
    
    logger.debug('Usuário autenticado', {
      userId: decoded.userId,
      email: decoded.email,
      path: req.path
    });

    next();
  } catch (error) {
    logger.error('Erro no middleware de autenticação:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar autenticação'
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Injeta dados do usuário se token existir, mas não bloqueia se não existir
 * Útil para rotas que funcionam diferente para usuários logados/não logados
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Se não tem token, continua sem autenticação
    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const decoded = verifyAccessToken(token);
      
      if (decoded) {
        req.user = decoded;
        logger.debug('Usuário autenticado opcionalmente', {
          userId: decoded.userId,
          path: req.path
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Erro no middleware de autenticação opcional:', error);
    next(); // Continua mesmo com erro
  }
};

/**
 * Middleware para verificar se usuário tem permissão para acessar recurso
 * Verifica se userId do token corresponde ao userId do recurso
 */
export const authorizeResourceOwner = (resourceUserIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authenticatedUserId = req.user?.userId;
      const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];

      if (!authenticatedUserId) {
        res.status(401).json({
          success: false,
          error: 'Autenticação necessária'
        });
        return;
      }

      if (authenticatedUserId !== resourceUserId) {
        logger.warn('Tentativa de acesso não autorizado', {
          authenticatedUserId,
          resourceUserId,
          path: req.path,
          method: req.method
        });

        res.status(403).json({
          success: false,
          error: 'Você não tem permissão para acessar este recurso'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Erro ao verificar autorização:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
};

/**
 * Middleware para verificar se email já foi verificado
 * (Preparação para sistema de verificação de email futuro)
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implementar verificação de email quando sistema estiver pronto
  // Por enquanto, apenas passa adiante
  next();
};

/**
 * Middleware para extrair userId de token sem bloquear requisição
 * Útil para logging e analytics
 */
export const extractUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const decoded = verifyAccessToken(parts[1]);
        if (decoded) {
          req.user = decoded;
        }
      }
    }
  } catch (error) {
    // Silenciosamente falha, não bloqueia requisição
    logger.debug('Não foi possível extrair userId', { path: req.path });
  }
  
  next();
};

// Log de inicialização
logger.info('🔐 Middlewares de autenticação inicializados');

export default {
  authenticate,
  optionalAuthenticate,
  authorizeResourceOwner,
  requireEmailVerification,
  extractUserId
};
