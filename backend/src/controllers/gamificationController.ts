import { Request, Response } from 'express';
import { Op } from 'sequelize';
import UserProgress from '../models/UserProgress';
import Badge, { UserBadge } from '../models/Badge';
import DailyMission, { UserMission } from '../models/DailyMission';
import User from '../models/User';
import { logger } from '../utils/logger';

/**
 * Obter todos os dados de gamificação do usuário
 */
export const getGamificationData = async (req:   Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    // Buscar progresso do usuário
    let progress = await UserProgress.findOne({ where: { userId } });

    // Se não existir, criar
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        currentXP: 0,
        level:  1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate:  new Date(),
        xpHistory: [],
      });
    }

    // Buscar badges do usuário
    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [
        {
          model: Badge,
          as: 'badge',
        },
      ],
    });

    // Buscar todos os badges disponíveis
    const allBadges = await Badge.findAll();

    // Mapear badges com status de desbloqueio
    const badges = allBadges.map((badge) => {
      const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        requirement: badge.requirement,
        isUnlocked: !!userBadge,
        unlockedAt: userBadge?. unlockedAt || null,
        progress: userBadge?.progress || 0,
      };
    });

    // Buscar missões ativas do usuário
    const userMissions = await UserMission. findAll({
      where: {
        userId,
        expiresAt: { [Op. gte]: new Date() },
      },
      include: [
        {
          model: DailyMission,
          as: 'mission',
        },
      ],
    });

    const dailyMissions = userMissions. map((um) => ({
      id: um.id,
      title: um.mission?. title || '',
      description: um.mission?. description || '',
      xpReward: um.mission?. xpReward || 0,
      progress: um.progress,
      target: um.mission?.requirement. target || 0,
      isCompleted: um.isCompleted,
      completedAt: um.completedAt,
      expiresAt: um.expiresAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        xp: {
          currentXP: progress. currentXP,
          level: progress.level,
          xpToNextLevel: progress.getXPToNextLevel(),
          totalXPEarned: progress.totalXPEarned,
        },
        streak: {
          currentStreak:  progress.currentStreak,
          longestStreak: progress.longestStreak,
          lastActivityDate: progress.lastActivityDate,
        },
        badges,
        dailyMissions,
      },
    });
  } catch (error: any) {
    logger.error('Erro ao buscar dados de gamificação', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados de gamificação',
    });
  }
};

/**
 * Obter dados de XP do usuário
 */
export const getXPData = async (req:  Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    let progress = await UserProgress.findOne({ where: { userId } });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak:  0,
        lastActivityDate: new Date(),
        xpHistory: [],
      });
    }

    res.status(200).json({
      success: true,
      data: {
        currentXP:  progress.currentXP,
        level: progress.level,
        xpToNextLevel: progress. getXPToNextLevel(),
        totalXPEarned:  progress.totalXPEarned,
      },
    });
  } catch (error: any) {
    logger.error('Erro ao buscar XP', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar XP',
    });
  }
};

/**
 * Adicionar XP ao usuário
 */
export const addXP = async (req: Request, res:  Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { amount, source } = req.body;

    logger.info('📥 addXP chamado', { userId, amount, source });

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Quantidade de XP inválida',
      });
      return;
    }

    let progress = await UserProgress.findOne({ where: { userId } });

    if (!progress) {
      logger.info('📝 Criando novo UserProgress');
      progress = await UserProgress.create({
        userId,
        currentXP: 0,
        level:  1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate:  new Date(),
        xpHistory: [],
      });
    }

    logger.info('✅ UserProgress encontrado/criado', {
      progressId: progress.id,
      currentXP: progress.currentXP,
      level: progress.level,
    });

    const leveledUp = progress.addXP(amount, source || 'manual');

    logger.info('📊 addXP executado', {
      leveledUp,
      newXP: progress.currentXP,
      newLevel: progress. level,
      xpHistoryLength: progress.xpHistory. length,
    });

    await progress.save();

    logger.info('💾 UserProgress salvo com sucesso');

    res.status(200).json({
      success: true,
      message: leveledUp
        ? `Parabéns!  Você subiu para o nível ${progress.level}! `
        : 'XP adicionado com sucesso',
      data: {
        currentXP: progress.currentXP,
        level: progress.level,
        xpToNextLevel:  progress.getXPToNextLevel(),
        totalXPEarned: progress.totalXPEarned,
        leveledUp,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao adicionar XP', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar XP',
      details: error.message, // DEBUG: remover em produção
    });
  }
};

/**
 * Obter histórico de XP
 */
export const getXPHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { days = 30 } = req. query;

    const progress = await UserProgress.findOne({ where: { userId } });

    if (!progress) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    // Filtrar histórico pelos últimos N dias
    const daysLimit = parseInt(days as string, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysLimit);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const filteredHistory = progress.xpHistory.filter((entry) => entry.date >= cutoffStr);

    res.status(200).json({
      success: true,
      data: filteredHistory,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar histórico de XP', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar histórico de XP',
    });
  }
};

/**
 * Obter dados de streak do usuário
 */
export const getStreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    let progress = await UserProgress.findOne({ where: { userId } });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        xpHistory: [],
      });
    }

    res.status(200).json({
      success: true,
      data: {
        currentStreak:  progress.currentStreak,
        longestStreak: progress.longestStreak,
        lastActivityDate: progress.lastActivityDate,
      },
    });
  } catch (error: any) {
    logger.error('Erro ao buscar streak', { error:  error.message });
    res.status(500).json({
      success: false,
      error:  'Erro ao buscar streak',
    });
  }
};

/**
 * Atualizar streak do usuário
 */
export const updateStreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    logger.info('📥 updateStreak chamado', { userId });

    let progress = await UserProgress. findOne({ where: { userId } });

    if (!progress) {
      logger.info('📝 Criando novo UserProgress para streak');
      progress = await UserProgress.create({
        userId,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 1,
        longestStreak:  1,
        lastActivityDate: new Date(),
        xpHistory: [],
      });
    } else {
      logger.info('✅ UserProgress encontrado, atualizando streak', {
        currentStreak: progress. currentStreak,
        lastActivityDate: progress.lastActivityDate,
      });

      progress.updateStreak();

      logger.info('📊 Streak atualizado', {
        newCurrentStreak: progress. currentStreak,
        newLongestStreak: progress.longestStreak,
      });

      await progress.save();

      logger.info('💾 Streak salvo com sucesso');
    }

    res.status(200).json({
      success: true,
      data: {
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        lastActivityDate: progress.lastActivityDate,
      },
    });
  } catch (error: any) {
    logger.error('❌ Erro ao atualizar streak', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar streak',
      details:  error.message, // DEBUG: remover em produção
    });
  }
};

/**
 * Obter todos os badges
 */
export const getBadges = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const userBadges = await UserBadge.findAll({
      where: { userId },
      include:  [{ model: Badge, as: 'badge' }],
    });

    const allBadges = await Badge. findAll();

    const badges = allBadges.map((badge) => {
      const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);
      return {
        id: badge. id,
        name: badge. name,
        description: badge. description,
        icon: badge. icon,
        category: badge. category,
        requirement: badge. requirement,
        isUnlocked: !!userBadge,
        unlockedAt: userBadge?.unlockedAt || null,
        progress: userBadge?.progress || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar badges', { error: error. message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar badges',
    });
  }
};

/**
 * Desbloquear badge
 */
export const unlockBadge = async (req: Request, res:  Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { badgeId } = req.params;

    // Verificar se badge existe
    const badge = await Badge.findByPk(badgeId);
    if (!badge) {
      res.status(404).json({
        success: false,
        error: 'Badge não encontrado',
      });
      return;
    }

    // Verificar se já foi desbloqueado
    const existing = await UserBadge.findOne({
      where: { userId, badgeId },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        error: 'Badge já desbloqueado',
      });
      return;
    }

    // Desbloquear badge
    const userBadge = await UserBadge.create({
      userId,
      badgeId,
      unlockedAt: new Date(),
      progress: badge.requirement.target,
    });

    logger.info('Badge desbloqueado', { userId, badgeId, badgeName: badge.name });

    res.status(200).json({
      success: true,
      message: `Parabéns!  Você desbloqueou o badge "${badge.name}"! `,
      data: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        unlockedAt: userBadge.unlockedAt,
      },
    });
  } catch (error: any) {
    logger.error('Erro ao desbloquear badge', { error:  error.message });
    res.status(500).json({
      success: false,
      error:  'Erro ao desbloquear badge',
    });
  }
};

/**
 * Obter missões diárias do usuário
 */
export const getDailyMissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const userMissions = await UserMission.findAll({
      where: {
        userId,
        expiresAt: { [Op. gte]: new Date() },
      },
      include: [{ model: DailyMission, as: 'mission' }],
    });

    const missions = userMissions.map((um) => ({
      id: um.id,
      title: um.mission?.title || '',
      description: um.mission?.description || '',
      xpReward:  um.mission?.xpReward || 0,
      progress:  um.progress,
      target: um.mission?.requirement.target || 0,
      isCompleted: um.isCompleted,
      completedAt: um.completedAt,
      expiresAt: um.expiresAt,
    }));

    res.status(200).json({
      success: true,
      data: missions,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar missões diárias', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar missões diárias',
    });
  }
};

/**
 * Completar missão e resgatar recompensa
 */
export const completeMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { missionId } = req.params;

    const userMission = await UserMission.findOne({
      where: { id: missionId, userId },
      include: [{ model: DailyMission, as: 'mission' }],
    });

    if (!userMission) {
      res.status(404).json({
        success: false,
        error: 'Missão não encontrada',
      });
      return;
    }

    if (userMission.isCompleted) {
      res.status(400).json({
        success: false,
        error: 'Missão já foi completada',
      });
      return;
    }

    if (! userMission.mission) {
      res.status(500).json({
        success: false,
        error: 'Dados da missão não encontrados',
      });
      return;
    }

    // Verificar se progresso atingiu o target
    if (userMission.progress < userMission.mission.requirement.target) {
      res.status(400).json({
        success: false,
        error:  'Missão ainda não foi completada',
      });
      return;
    }

    // Marcar como completada
    userMission.isCompleted = true;
    userMission.completedAt = new Date();
    await userMission.save();

    // Adicionar XP
    let progress = await UserProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak:  0,
        lastActivityDate: new Date(),
        xpHistory: [],
      });
    }

    const leveledUp = progress.addXP(userMission.mission.xpReward, 'mission_complete');
    await progress.save();

    logger.info('Missão completada', {
      userId,
      missionId,
      xpReward: userMission. mission.xpReward,
      leveledUp,
    });

    res.status(200).json({
      success: true,
      message: `Missão completada!  +${userMission.mission.xpReward} XP`,
      data: {
        mission: {
          id: userMission. id,
          title: userMission.mission.title,
          isCompleted: true,
          completedAt: userMission.completedAt,
        },
        xpData: {
          currentXP:  progress.currentXP,
          level: progress.level,
          xpToNextLevel: progress.getXPToNextLevel(),
          totalXPEarned: progress.totalXPEarned,
          leveledUp,
        },
      },
    });
  } catch (error: any) {
    logger.error('Erro ao completar missão', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao completar missão',
    });
  }
};

/**
 * Obter leaderboard (ranking de usuários)
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await UserProgress.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [
        ['level', 'DESC'],
        ['totalXPEarned', 'DESC'],
      ],
      limit: parseInt(limit as string, 10),
    });

    const leaderboard = topUsers.map((progress, index) => ({
      rank: index + 1,
      userId: progress.userId,
      name: (progress as any).user?.name || 'Usuário',
      level: progress.level,
      xp: progress.totalXPEarned,
    }));

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar leaderboard', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar leaderboard',
    });
  }
};