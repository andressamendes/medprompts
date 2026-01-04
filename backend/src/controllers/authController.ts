import { Request, Response } from 'express';
import User from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

/**
 * Registra um novo usuário
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, university, graduationYear } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado',
      });
    }

    // Criar usuário (senha será hasheada automaticamente pelo hook beforeCreate)
    const user = await User.create({
      name,
      email,
      password, // ✅ NÃO hashear aqui - o hook faz isso
      university,
      graduationYear,
    });

    logger.info('✅ Novo usuário criado', {
      userId: user.id,
      email: user.email,
    });

    // Gerar tokens JWT
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remover senha da resposta
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      university: user.university,
      graduationYear: user.graduationYear,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: sanitizedUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao registrar usuário', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar conta',
    });
  }
};

/**
 * Faz login do usuário
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
    }

    logger.info('✅ Login bem-sucedido', {
      userId: user.id,
      email: user.email,
    });

    // Gerar tokens JWT
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remover senha da resposta
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      university: user.university,
      graduationYear: user.graduationYear,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: sanitizedUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao fazer login', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao fazer login',
    });
  }
};

/**
 * Faz logout do usuário
 */
export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    // TODO: Implementar blacklist de tokens se necessário
    
    return res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error: any) {
    logger.error('❌ Erro ao fazer logout', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao fazer logout',
    });
  }
};

/**
 * Renova o access token usando refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token não fornecido',
      });
    }

    // Verificar refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido ou expirado',
      });
    }

    // Verificar se usuário existe
    const user = await User.findByPk(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Gerar novos tokens
    const tokens = generateTokens(user.id);

    return res.status(200).json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao renovar token', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao renovar token',
    });
  }
};
