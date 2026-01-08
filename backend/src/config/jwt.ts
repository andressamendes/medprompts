import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const {
  JWT_SECRET = 'default_secret_change_in_production',
  JWT_EXPIRE = '7d',
  JWT_REFRESH_SECRET = 'default_refresh_secret_change_in_production',
  JWT_REFRESH_EXPIRE = '30d'
} = process.env;

// Interface para payload do JWT
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;  // issued at
  exp?: number;  // expiration
}

// Interface para payload do refresh token
export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

/**
 * Gera access token JWT para autenticação
 * @param userId - ID do usuário
 * @param email - Email do usuário
 * @returns Token JWT assinado
 */
export const generateAccessToken = (userId: string, email: string): string => {
  try {
    const payload: JWTPayload = {
      userId,
      email
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
      issuer: 'medprompts-api',
      audience: 'medprompts-frontend'
    } as any);

    logger.info(`Access token gerado para usuário: ${userId}`);
    return token;
  } catch (error) {
    logger.error('Erro ao gerar access token:', error);
    throw new Error('Falha ao gerar token de autenticação');
  }
};

/**
 * Gera refresh token para renovação de acesso
 * @param userId - ID do usuário
 * @param tokenVersion - Versão do token (para invalidação)
 * @returns Refresh token assinado
 */
export const generateRefreshToken = (userId: string, tokenVersion: number = 0): string => {
  try {
    const payload: RefreshTokenPayload = {
      userId,
      tokenVersion
    };

    const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRE,
      issuer: 'medprompts-api',
      audience: 'medprompts-frontend'
    } as any);

    logger.info(`Refresh token gerado para usuário: ${userId}`);
    return token;
  } catch (error) {
    logger.error('Erro ao gerar refresh token:', error);
    throw new Error('Falha ao gerar token de renovação');
  }
};

/**
 * Verifica e decodifica access token
 * @param token - Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'medprompts-api',
      audience: 'medprompts-frontend'
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Access token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Access token inválido');
    } else {
      logger.error('Erro ao verificar access token:', error);
    }
    return null;
  }
};

/**
 * Verifica e decodifica refresh token
 * @param token - Refresh token a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'medprompts-api',
      audience: 'medprompts-frontend'
    }) as RefreshTokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Refresh token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Refresh token inválido');
    } else {
      logger.error('Erro ao verificar refresh token:', error);
    }
    return null;
  }
};

/**
 * Decodifica token sem verificar assinatura (para debug)
 * @param token - Token JWT
 * @returns Payload decodificado ou null
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    logger.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Verifica se token está próximo de expirar
 * @param token - Token JWT
 * @param thresholdMinutes - Minutos antes da expiração para considerar "próximo"
 * @returns true se faltar menos que threshold minutos
 */
export const isTokenExpiringSoon = (token: string, thresholdMinutes: number = 30): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const expirationTime = decoded.exp * 1000; // Converter para ms
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return timeUntilExpiration < thresholdMs && timeUntilExpiration > 0;
  } catch (error) {
    logger.error('Erro ao verificar expiração do token:', error);
    return false;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpiringSoon
};
