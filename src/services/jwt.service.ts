/**
 * 🔐 JWT Service - MedPrompts
 *
 * Serviço de geração e verificação de tokens JWT usando Web Crypto API
 * Extraído de auth.service.ts para melhor modularização e lazy loading
 */

import { securityConfig } from '../config/security.config';
import type { User, UserRole } from './auth.service';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

class JWTService {
  /**
   * Cria assinatura HMAC-SHA256 para token
   * SUBSTITUIÇÃO: jsonwebtoken → Web Crypto API HMAC
   */
  private async signToken(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const secretBuffer = encoder.encode(secret);
    const payloadBuffer = encoder.encode(payload);

    // Importa secret como chave HMAC
    const key = await window.crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Gera assinatura
    const signatureBuffer = await window.crypto.subtle.sign(
      'HMAC',
      key,
      payloadBuffer
    );

    // Converte para Base64URL
    const signatureArray = new Uint8Array(signatureBuffer);
    const signatureArrayValues = Array.from(signatureArray);
    let binaryString = '';
    for (let i = 0; i < signatureArrayValues.length; i++) {
      binaryString += String.fromCharCode(signatureArrayValues[i]);
    }
    return btoa(binaryString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Verifica assinatura HMAC-SHA256 do token
   */
  private async verifyTokenSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const expectedSignature = await this.signToken(payload, secret);

      // Comparação em tempo constante
      if (signature.length !== expectedSignature.length) {
        return false;
      }

      let mismatch = 0;
      for (let i = 0; i < signature.length; i++) {
        mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
      }

      return mismatch === 0;
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return false;
    }
  }

  /**
   * Gera token JWT-like de acesso (15 minutos)
   */
  async generateAccessToken(user: User): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 15 * 60; // 15 minutos

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
      iat: now,
      exp: exp,
    };

    const header = { alg: 'HS256', typ: 'JWT' };

    // Codifica header e payload em Base64URL
    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.signToken(message, securityConfig.jwt.secret);

    return `${message}.${signature}`;
  }

  /**
   * Gera refresh token JWT-like (7 dias)
   */
  async generateRefreshToken(user: User): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 7 * 24 * 60 * 60; // 7 dias

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
      iat: now,
      exp: exp,
    };

    const header = { alg: 'HS256', typ: 'JWT' };

    const encodedHeader = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.signToken(
      message,
      securityConfig.jwt.refreshSecret
    );

    return `${message}.${signature}`;
  }

  /**
   * Verifica e decodifica token JWT-like de acesso
   */
  async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token format invalid');
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      const message = `${encodedHeader}.${encodedPayload}`;

      // Verifica assinatura
      const isValid = await this.verifyTokenSignature(
        message,
        signature,
        securityConfig.jwt.secret
      );

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Decodifica payload
      const payloadJson = atob(
        encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
      );
      const payload = JSON.parse(payloadJson) as JWTPayload;

      // Verifica tipo
      if (payload.type !== 'access') {
        throw new Error('Token type mismatch');
      }

      // Verifica expiração
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      console.error('Token inválido:', error);
      return null;
    }
  }

  /**
   * Verifica e decodifica refresh token JWT-like
   */
  async verifyRefreshToken(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token format invalid');
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      const message = `${encodedHeader}.${encodedPayload}`;

      // Verifica assinatura
      const isValid = await this.verifyTokenSignature(
        message,
        signature,
        securityConfig.jwt.refreshSecret
      );

      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Decodifica payload
      const payloadJson = atob(
        encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
      );
      const payload = JSON.parse(payloadJson) as JWTPayload;

      // Verifica tipo
      if (payload.type !== 'refresh') {
        throw new Error('Token type mismatch');
      }

      // Verifica expiração
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      console.error('Refresh token inválido:', error);
      return null;
    }
  }
}

// Singleton instance
export const jwtService = new JWTService();
