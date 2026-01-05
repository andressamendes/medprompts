import api from '../api';

/**
 * Interface para dados de XP do usuário
 */
export interface UserXPData {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
  totalXPEarned: number;
}

/**
 * Interface para Badge/Conquista
 */
export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: {
    type: string;
    target: number;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?:  number;
}

/**
 * Interface para Streak (sequência de dias)
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

/**
 * Interface para Missão Diária
 */
export interface DailyMissionData {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  completedAt?: string;
  expiresAt:  string;
}

/**
 * Interface para dados completos de gamificação
 */
export interface GamificationData {
  xp: UserXPData;
  streak: StreakData;
  badges: BadgeData[];
  dailyMissions: DailyMissionData[];
}

/**
 * Serviço de API para Sistema de Gamificação
 * Usa instância de axios configurada (já tem baseURL e interceptors)
 */
class GamificationService {
  /**
   * Buscar todos os dados de gamificação do usuário
   */
  async getAll(): Promise<GamificationData> {
    try {
      const response = await api.get('/gamification');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar dados de gamificação:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar gamificação');
    }
  }

  /**
   * Buscar dados de XP e nível
   */
  async getXP(): Promise<UserXPData> {
    try {
      const response = await api.get('/gamification/xp');
      return response.data.data || response.data;
    } catch (error:  any) {
      console.error('❌ Erro ao buscar XP:', error);
      throw new Error(error.response?. data?.error || 'Erro ao buscar XP');
    }
  }

  /**
   * Adicionar XP ao usuário
   */
  async addXP(amount: number, source: string): Promise<UserXPData> {
    try {
      const response = await api.post('/gamification/xp', { amount, source });
      return response.data.data || response.data;
    } catch (error:  any) {
      console.error('❌ Erro ao adicionar XP:', error);
      throw new Error(error.response?. data?.error || 'Erro ao adicionar XP');
    }
  }

  /**
   * Buscar histórico de XP
   */
  async getXPHistory(days: number = 30): Promise<Array<{ date: string; xp: number }>> {
    try {
      const response = await api.get('/gamification/xp/history', {
        params: { days },
      });
      return response.data.data || response.data || [];
    } catch (error:  any) {
      console.error('❌ Erro ao buscar histórico de XP:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar histórico');
    }
  }

  /**
   * Buscar dados de streak
   */
  async getStreak(): Promise<StreakData> {
    try {
      const response = await api.get('/gamification/streak');
      return response.data.data || response. data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar streak:', error);
      throw new Error(error.response?. data?.error || 'Erro ao buscar streak');
    }
  }

  /**
   * Atualizar streak (registrar atividade do dia)
   */
  async updateStreak(): Promise<StreakData> {
    try {
      const response = await api.post('/gamification/streak');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar streak:', error);
      throw new Error(error.response?.data?.error || 'Erro ao atualizar streak');
    }
  }

  /**
   * Buscar todos os badges
   */
  async getBadges(): Promise<BadgeData[]> {
    try {
      const response = await api.get('/gamification/badges');
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('❌ Erro ao buscar badges:', error);
      throw new Error(error.response?. data?.error || 'Erro ao buscar badges');
    }
  }

  /**
   * Desbloquear badge
   */
  async unlockBadge(badgeId: string): Promise<BadgeData> {
    try {
      const response = await api. post(`/gamification/badges/${badgeId}/unlock`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao desbloquear badge:', error);
      throw new Error(error.response?.data?.error || 'Erro ao desbloquear badge');
    }
  }

  /**
   * Buscar missões diárias
   */
  async getDailyMissions(): Promise<DailyMissionData[]> {
    try {
      const response = await api.get('/gamification/daily-missions');
      return response. data.data || response.data || [];
    } catch (error:  any) {
      console.error('❌ Erro ao buscar missões:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar missões');
    }
  }

  /**
   * Completar missão
   */
  async completeMission(missionId: string): Promise<DailyMissionData> {
    try {
      const response = await api.post(`/gamification/daily-missions/${missionId}/complete`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao completar missão:', error);
      throw new Error(error. response?.data?.error || 'Erro ao completar missão');
    }
  }

  /**
   * Buscar leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{ rank: number; name: string; level: number; xp: number }>> {
    try {
      const response = await api.get('/gamification/leaderboard', {
        params: { limit },
      });
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('❌ Erro ao buscar leaderboard:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar leaderboard');
    }
  }
}

export default new GamificationService();