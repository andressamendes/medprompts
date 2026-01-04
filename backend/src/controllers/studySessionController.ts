import { Request, Response } from 'express';
import { Op } from 'sequelize';
import StudySession from '../models/StudySession';
import { logger } from '../utils/logger';

/**
 * Listar sessões de estudo do usuário com filtros
 */
export const listStudySessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { search, status, startDate, endDate, sortBy, limit } = req.query;

    // Construir filtros dinâmicos
    const where: any = { userId };

    // Filtro de busca (tópico ou notas)
    if (search) {
      where[Op.or] = [
        { topic: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtro de status
    if (status) {
      where.status = status;
    }

    // Filtro de data (sessões criadas no intervalo)
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    // Ordenação
    let order: any = [['createdAt', 'DESC']];
    if (sortBy === 'duration') {
      order = [['durationMinutes', 'DESC']];
    } else if (sortBy === 'nextReview') {
      order = [['nextReviewDate', 'ASC']];
    } else if (sortBy === 'topic') {
      order = [['topic', 'ASC']];
    }

    // Limite de resultados
    const limitValue = limit ? parseInt(limit as string, 10) : undefined;

    // Buscar sessões
    const sessions = await StudySession.findAll({
      where,
      order,
      limit: limitValue,
    });

    logger.info('Sessões de estudo listadas com sucesso', {
      userId,
      count: sessions.length,
      filters: { search, status, startDate, endDate, sortBy },
    });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error: any) {
    logger.error('Erro ao listar sessões de estudo', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao listar sessões de estudo',
    });
  }
};

/**
 * Buscar sessão de estudo por ID
 */
export const getStudySessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { sessionId } = req.params;

    const session = await StudySession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Sessão de estudo não encontrada',
      });
      return;
    }

    logger.info('Sessão de estudo buscada com sucesso', { userId, sessionId });

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar sessão de estudo', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar sessão de estudo',
    });
  }
};

/**
 * Criar nova sessão de estudo
 */
export const createStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { topic, durationMinutes, notes, promptsUsed } = req.body;

    // Validações básicas
    if (!topic || !durationMinutes) {
      res.status(400).json({
        success: false,
        error: 'Tópico e duração são obrigatórios',
      });
      return;
    }

    if (durationMinutes < 1 || durationMinutes > 480) {
      res.status(400).json({
        success: false,
        error: 'Duração deve ser entre 1 e 480 minutos (8 horas)',
      });
      return;
    }

    // Calcular próxima revisão (1 dia depois)
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 1);

    // Criar sessão
    const session = await StudySession.create({
      userId,
      topic: topic.trim(),
      durationMinutes,
      notes: notes ? notes.trim() : '',
      promptsUsed: promptsUsed || [],
      status: 'pending',
      reviewCount: 0,
      nextReviewDate,
    });

    logger.info('Sessão de estudo criada com sucesso', {
      userId,
      sessionId: session.id,
      topic,
      durationMinutes,
    });

    res.status(201).json({
      success: true,
      session,
      message: 'Sessão de estudo criada com sucesso',
    });
  } catch (error: any) {
    logger.error('Erro ao criar sessão de estudo', { error: error.message });

    // Tratamento de erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({
        success: false,
        error: error.errors.map((e: any) => e.message).join(', '),
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao criar sessão de estudo',
    });
  }
};

/**
 * Atualizar sessão de estudo
 */
export const updateStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { sessionId } = req.params;
    const { topic, durationMinutes, notes, promptsUsed, status } = req.body;

    // Buscar sessão
    const session = await StudySession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Sessão de estudo não encontrada',
      });
      return;
    }

    // Atualizar campos fornecidos
    if (topic !== undefined) session.topic = topic.trim();
    if (durationMinutes !== undefined) {
      if (durationMinutes < 1 || durationMinutes > 480) {
        res.status(400).json({
          success: false,
          error: 'Duração deve ser entre 1 e 480 minutos',
        });
        return;
      }
      session.durationMinutes = durationMinutes;
    }
    if (notes !== undefined) session.notes = notes.trim();
    if (promptsUsed !== undefined) session.promptsUsed = promptsUsed;
    if (status !== undefined) session.status = status;

    await session.save();

    logger.info('Sessão de estudo atualizada com sucesso', { userId, sessionId });

    res.status(200).json({
      success: true,
      session,
      message: 'Sessão de estudo atualizada com sucesso',
    });
  } catch (error: any) {
    logger.error('Erro ao atualizar sessão de estudo', { error: error.message });

    // Tratamento de erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({
        success: false,
        error: error.errors.map((e: any) => e.message).join(', '),
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar sessão de estudo',
    });
  }
};

/**
 * Deletar sessão de estudo
 */
export const deleteStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { sessionId } = req.params;

    // Buscar sessão
    const session = await StudySession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Sessão de estudo não encontrada',
      });
      return;
    }

    await session.destroy();

    logger.info('Sessão de estudo deletada com sucesso', { userId, sessionId });

    res.status(200).json({
      success: true,
      message: 'Sessão de estudo deletada com sucesso',
    });
  } catch (error: any) {
    logger.error('Erro ao deletar sessão de estudo', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar sessão de estudo',
    });
  }
};

/**
 * Marcar sessão como concluída e calcular próxima revisão
 */
export const completeStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { sessionId } = req.params;
    const { quality } = req.body; // 1-5 (qualidade da revisão)

    // Buscar sessão
    const session = await StudySession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        error: 'Sessão de estudo não encontrada',
      });
      return;
    }

    // Validar qualidade
    if (quality !== undefined && (quality < 1 || quality > 5)) {
      res.status(400).json({
        success: false,
        error: 'Qualidade deve ser entre 1 e 5',
      });
      return;
    }

    // Marcar como concluída
    session.status = 'completed';
    session.reviewCount += 1;

    // Calcular próxima revisão usando espaçamento progressivo
    // Baseado no algoritmo SM-2 (SuperMemo 2)
    const intervals = [1, 3, 7, 14, 30, 60, 120]; // dias
    const nextInterval = intervals[Math.min(session.reviewCount, intervals.length - 1)];
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
    session.nextReviewDate = nextReviewDate;

    await session.save();

    logger.info('Sessão de estudo concluída', {
      userId,
      sessionId,
      reviewCount: session.reviewCount,
      nextReviewDate,
    });

    res.status(200).json({
      success: true,
      session,
      message: `Sessão concluída! Próxima revisão em ${nextInterval} dias`,
    });
  } catch (error: any) {
    logger.error('Erro ao concluir sessão de estudo', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao concluir sessão de estudo',
    });
  }
};

/**
 * Obter estatísticas de estudo do usuário
 */
export const getStudyStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { period } = req.query; // 'week', 'month', 'year'

    // Calcular data inicial baseada no período
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // Padrão: último mês
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Buscar todas as sessões do período
    const sessions = await StudySession.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: startDate },
      },
    });

    // Calcular estatísticas
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum: number, s) => sum + s.durationMinutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    
    const completedSessions = sessions.filter((s) => s.status === 'completed').length;
    const pendingSessions = sessions.filter((s) => s.status === 'pending').length;
    
    const averageMinutesPerSession = totalSessions > 0 
      ? Math.round(totalMinutes / totalSessions) 
      : 0;

    // Tópicos mais estudados
    const topicCounts: { [key: string]: number } = {};
    sessions.forEach((s) => {
      topicCounts[s.topic] = (topicCounts[s.topic] || 0) + 1;
    });
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Sessões por dia (últimos 7 dias)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter((s) => {
        const sessionDate = new Date(s.createdAt).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });
      
      last7Days.push({
        date: dateStr,
        sessions: daySessions.length,
        minutes: daySessions.reduce((sum: number, s) => sum + s.durationMinutes, 0),
      });
    }

    logger.info('Estatísticas de estudo calculadas', {
      userId,
      period,
      totalSessions,
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalSessions,
        totalMinutes,
        totalHours,
        completedSessions,
        pendingSessions,
        averageMinutesPerSession,
        topTopics,
        last7Days,
      },
    });
  } catch (error: any) {
    logger.error('Erro ao calcular estatísticas', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao calcular estatísticas',
    });
  }
};

/**
 * Obter sessões que precisam de revisão
 */
export const getSessionsForReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const today = new Date();

    // Buscar sessões com revisão atrasada ou para hoje
    const sessions = await StudySession.findAll({
      where: {
        userId,
        status: 'completed',
        nextReviewDate: { [Op.lte]: today },
      },
      order: [['nextReviewDate', 'ASC']],
    });

    logger.info('Sessões para revisão obtidas', {
      userId,
      count: sessions.length,
    });

    res.status(200).json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    logger.error('Erro ao buscar sessões para revisão', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar sessões para revisão',
    });
  }
};
