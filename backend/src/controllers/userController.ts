import { Request, Response } from 'express';
import User from '../models/User';
import { logger } from '../utils/logger';

/**
 * Obtém perfil do usuário autenticado
 */
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

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
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao obter perfil', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao obter perfil',
    });
  }
};

/**
 * Atualiza perfil do usuário
 */
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const { name, university, graduationYear } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Atualizar campos
    if (name) user.name = name;
    if (university !== undefined) user.university = university;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;

    await user.save();

    logger.info('✅ Perfil atualizado', {
      userId: user.id,
      email: user.email,
    });

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
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao atualizar perfil', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar perfil',
    });
  }
};

/**
 * Obtém estatísticas do usuário
 */
export const getStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    // TODO: Implementar lógica real quando tiver tabela de sessões
    const stats = {
      totalSessions: 0,
      totalMinutes: 0,
      totalXP: 0,
      averageDuration: 0,
      currentStreak: 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao obter estatísticas', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas',
    });
  }
};

/**
 * Adiciona XP ao usuário
 */
export const addXP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade de XP inválida',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Adicionar XP
    user.xp += amount;

    // Calcular novo nível (100 XP por nível)
    const newLevel = Math.floor(user.xp / 100) + 1;
    const leveledUp = newLevel > user.level;
    user.level = newLevel;

    await user.save();

    logger.info('✅ XP adicionado', {
      userId: user.id,
      amount,
      newXP: user.xp,
      newLevel: user.level,
      leveledUp,
    });

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
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: leveledUp ? `Parabéns! Você subiu para o nível ${user.level}!` : 'XP adicionado',
      data: {
        user: sanitizedUser,
        leveledUp,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao adicionar XP', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Erro ao adicionar XP',
    });
  }
};
