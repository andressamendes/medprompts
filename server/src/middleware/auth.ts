import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return null;
  }
}

export function extractTokenFromAuth(auth: string): string | null {
  if (!auth) return null;

  // Handle "Bearer TOKEN" format
  if (auth.startsWith('Bearer ')) {
    return auth.substring(7);
  }

  // Handle direct token
  return auth;
}
