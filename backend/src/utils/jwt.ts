import jwt from 'jsonwebtoken';
import { logger } from './logger';

// Interfaces
interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
}

interface DecodedToken {
  userId: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// Secrets (vêm do .env)
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-secreto-aqui';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'seu-refresh-secret-super-secreto-aqui';

// Duração dos tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias

/**
 * Gera access token e refresh token
 */
export const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
  // Access Token (curta duração)
  const accessToken = jwt.sign(
    {
      userId,
      type: 'access',
    } as TokenPayload,
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Refresh Token (longa duração)
  const refreshToken = jwt.sign(
    {
      userId,
      type: 'refresh',
    } as TokenPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  logger.info(`Access token gerado para usuário: ${userId}`);
  logger.info(`Refresh token gerado para usuário: ${userId}`);

  return { accessToken, refreshToken };
};

/**
 * Verifica e decodifica access token
 */
export const verifyAccessToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (decoded.type !== 'access') {
      logger.warn('Token não é do tipo access');
      return null;
    }

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Access token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Access token inválido');
    } else {
      logger.error('Erro ao verificar access token', { error: error.message });
    }
    return null;
  }
};

/**
 * Verifica e decodifica refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;

    if (decoded.type !== 'refresh') {
      logger.warn('Token não é do tipo refresh');
      return null;
    }

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Refresh token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Refresh token inválido');
    } else {
      logger.error('Erro ao verificar refresh token', { error: error.message });
    }
    return null;
  }
};

/**
 * Extrai token do header Authorization
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
