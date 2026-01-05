import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

/**
 * Middleware de autenticação via JWT
 * Verifica se o token é válido e adiciona userId ao request
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Token de autenticação não fornecido'
      });
      return;
    }

    // Verifica e decodifica o token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Adiciona o userId ao request para uso nas rotas
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        error: 'Token inválido ou expirado'
      });
      return;
    }

    res.status(500).json({
      error: 'Erro ao processar autenticação'
    });
  }
};
