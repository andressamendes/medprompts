import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt';
import { logger, logAudit, logAuthAttempt } from '../utils/logger';

/**
 * Registra novo usuário no sistema
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, university, graduationYear } = req.body;
    const ip = req.ip || req.socket.remoteAddress;

    // Verifica se email já existe
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      logger.warn('Tentativa de registro com email existente', { email, ip });
      
      res.status(409).json({
        success: false,
        error: 'Email já cadastrado'
      });
      return;
    }

    // Hasheia senha manualmente (workaround para hook não funcionando)
    logger.info('🔐 Hasheando senha manualmente no controller');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    logger.info('✅ Senha hasheada com sucesso');

    // Cria novo usuário com senha já hasheada
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      university,
      graduationYear,
      xp: 0,
      level: 1,
      badges: [],
      emailVerified: false,
      isActive: true,
      tokenVersion: 0
    });

    // Gera tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

    // Log de auditoria
    logAudit('Novo usuário registrado', user.id, { email, ip });

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: user.toPublicJSON(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '7d'
        }
      }
    });
  } catch (error: any) {
    logger.error('Erro ao registrar usuário:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar usuário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Autentica usuário existente
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;

    // Busca usuário por email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      logAuthAttempt(email, false, ip);
      
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
      return;
    }
    
    // Verifica se conta está ativa
    if (!user.isActive) {
      logger.warn('Tentativa de login em conta desativada', { email, userId: user.id, ip });
      
      res.status(403).json({
        success: false,
        error: 'Conta desativada. Entre em contato com o suporte.'
      });
      return;
    }

    // Verifica senha
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logAuthAttempt(email, false, ip);
      
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
      return;
    }

    // Atualiza último login
    await user.updateLastLogin();

    // Gera tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

    // Log de auditoria
    logAuthAttempt(email, true, ip);
    logAudit('Login realizado', user.id, { ip });

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: user.toPublicJSON(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '7d'
        }
      }
    });
  } catch (error: any) {
    logger.error('Erro ao fazer login:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Renova access token usando refresh token
 * POST /api/v1/auth/refresh
 */
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token não fornecido'
      });
      return;
    }

    // Verifica refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Refresh token inválido ou expirado'
      });
      return;
    }

    // Busca usuário
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Verifica se token version corresponde (não foi invalidado)
    if (decoded.tokenVersion !== user.tokenVersion) {
      logger.warn('Tentativa de uso de refresh token invalidado', {
        userId: user.id,
        tokenVersion: decoded.tokenVersion,
        currentVersion: user.tokenVersion
      });
      
      res.status(401).json({
        success: false,
        error: 'Token invalidado. Faça login novamente.'
      });
      return;
    }

    // Gera novo access token
    const newAccessToken = generateAccessToken(user.id, user.email);

    logger.info('Access token renovado', { userId: user.id });

    res.status(200).json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        accessToken: newAccessToken,
        expiresIn: '7d'
      }
    });
  } catch (error: any) {
    logger.error('Erro ao renovar token:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao renovar token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Faz logout do usuário (invalida todos tokens)
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
      return;
    }

    // Busca usuário
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Invalida todos os tokens do usuário
    await user.invalidateTokens();

    // Log de auditoria
    logAudit('Logout realizado', user.id);

    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error: any) {
    logger.error('Erro ao fazer logout:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar logout',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verifica se token é válido
 * GET /api/v1/auth/verify
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
      return;
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error: any) {
    logger.error('Erro ao verificar token:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyToken
};
