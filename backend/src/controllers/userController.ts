import { Request, Response } from 'express';
import User from '../models/User';
import { logger, logAudit } from '../utils/logger';

/**
 * Obtém perfil do usuário autenticado
 * GET /api/v1/users/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error: any) {
    logger.error('Erro ao obter perfil:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao obter perfil',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Atualiza perfil do usuário
 * PUT /api/v1/users/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, university, graduationYear, bio, studyGoalHours, preferredAI, studyDays, avatarUrl } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Atualiza apenas campos fornecidos
    if (name !== undefined) user.name = name;
    if (university !== undefined) user.university = university;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (bio !== undefined) user.bio = bio;
    if (studyGoalHours !== undefined) user.studyGoalHours = studyGoalHours;
    if (preferredAI !== undefined) user.preferredAI = preferredAI;
    if (studyDays !== undefined) user.studyDays = studyDays;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    // Log de auditoria
    logAudit('Perfil atualizado', user.id, { 
      updatedFields: Object.keys(req.body)
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error: any) {
    logger.error('Erro ao atualizar perfil:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar perfil',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Altera senha do usuário
 * PUT /api/v1/users/password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;
    const ip = req.ip || req.socket.remoteAddress;

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Verifica senha atual
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      logger.warn('Tentativa de alteração de senha com senha atual incorreta', {
        userId: user.id,
        ip
      });
      
      res.status(401).json({
        success: false,
        error: 'Senha atual incorreta'
      });
      return;
    }

    // Atualiza senha (será hasheada automaticamente pelo hook)
    user.password = newPassword;
    await user.save();

    // Invalida todos os tokens (força re-login)
    await user.invalidateTokens();

    // Log de auditoria
    logAudit('Senha alterada', user.id, { ip });

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso. Por segurança, faça login novamente em todos os dispositivos.'
    });
  } catch (error: any) {
    logger.error('Erro ao alterar senha:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao alterar senha',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Adiciona XP ao usuário
 * POST /api/v1/users/xp
 */
export const addXP = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { xpAmount, reason } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    const previousXP = user.xp;
    const previousLevel = user.level;

    // Adiciona XP (método do modelo calcula level automaticamente)
    await user.addXP(xpAmount);

    const leveledUp = user.level > previousLevel;

    // Log de auditoria
    logAudit('XP adicionado', user.id, { 
      xpAmount,
      reason,
      previousXP,
      newXP: user.xp,
      leveledUp
    });

    res.status(200).json({
      success: true,
      message: leveledUp ? `Parabéns! Você subiu para o nível ${user.level}!` : 'XP adicionado com sucesso',
      data: {
        previousXP,
        currentXP: user.xp,
        xpGained: xpAmount,
        previousLevel,
        currentLevel: user.level,
        leveledUp
      }
    });
  } catch (error: any) {
    logger.error('Erro ao adicionar XP:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar XP',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Adiciona badge ao usuário
 * POST /api/v1/users/badges
 */
export const addBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { badgeId } = req.body;

    if (!badgeId) {
      res.status(400).json({
        success: false,
        error: 'ID da badge é obrigatório'
      });
      return;
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Verifica se badge já existe
    if (user.badges.includes(badgeId)) {
      res.status(409).json({
        success: false,
        error: 'Badge já conquistada'
      });
      return;
    }

    // Adiciona badge
    await user.addBadge(badgeId);

    // Log de auditoria
    logAudit('Badge adicionada', user.id, { badgeId });

    res.status(200).json({
      success: true,
      message: 'Badge conquistada!',
      data: {
        badgeId,
        totalBadges: user.badges.length,
        badges: user.badges
      }
    });
  } catch (error: any) {
    logger.error('Erro ao adicionar badge:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar badge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtém estatísticas do usuário
 * GET /api/v1/users/stats
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Calcula XP necessário para próximo nível
    const nextLevel = user.level + 1;
    const xpForNextLevel = Math.pow(nextLevel, 2) * 100;
    const xpNeeded = xpForNextLevel - user.xp;

    res.status(200).json({
      success: true,
      data: {
        xp: user.xp,
        level: user.level,
        badges: user.badges.length,
        xpForNextLevel,
        xpNeeded,
        accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        lastLogin: user.lastLoginAt
      }
    });
  } catch (error: any) {
    logger.error('Erro ao obter estatísticas:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Desativa conta do usuário
 * DELETE /api/v1/users/account
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;

    if (!password) {
      res.status(400).json({
        success: false,
        error: 'Senha é obrigatória para deletar conta'
      });
      return;
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Verifica senha
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn('Tentativa de deletar conta com senha incorreta', {
        userId: user.id,
        ip
      });
      
      res.status(401).json({
        success: false,
        error: 'Senha incorreta'
      });
      return;
    }

    // Desativa conta (soft delete - não remove do banco)
    user.isActive = false;
    await user.save();

    // Invalida todos os tokens
    await user.invalidateTokens();

    // Log de auditoria
    logAudit('Conta desativada', user.id, { ip });

    res.status(200).json({
      success: true,
      message: 'Conta desativada com sucesso. Entre em contato com o suporte para reativação.'
    });
  } catch (error: any) {
    logger.error('Erro ao deletar conta:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar conta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  addXP,
  addBadge,
  getUserStats,
  deleteAccount
};
