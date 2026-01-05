import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  unlockedAt?: string;
  isUnlocked:  boolean;
  progress?:  number;
  target?: number;
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
  title:  string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  completedAt?: string;
}

/**
 * Interface para dados completos de gamificação
 */
export interface GamificationData {
  xp:  UserXPData;
  badges: BadgeData[];
  streak: StreakData;
  dailyMissions: DailyMissionData[];
}

/**
 * Serviço de API para Sistema de Gamificação
 * Gerencia XP, níveis, badges, streaks e missões
 */
class GamificationService {
  /**
   * Buscar todos os dados de gamificação do usuário
   */
  async getAll(): Promise<GamificationData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gamification`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error:  any) {
      console.error('Erro ao buscar dados de gamificação:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar dados de gamificação');
    }
  }

  /**
   * Buscar dados de XP e nível
   */
  async getXP(): Promise<UserXPData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios. get(`${API_URL}/api/gamification/xp`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response. data;
    } catch (error: any) {
      console.error('Erro ao buscar XP:', error);
      throw new Error(error.response?.data?. message || 'Erro ao buscar XP');
    }
  }

  /**
   * Adicionar XP ao usuário
   */
  async addXP(amount: number, source: string): Promise<UserXPData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gamification/xp`,
        { amount, source },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao adicionar XP:', error);
      throw new Error(error.response?.data?.message || 'Erro ao adicionar XP');
    }
  }

  /**
   * Buscar todos os badges
   */
  async getBadges(): Promise<BadgeData[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gamification/badges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar badges:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar badges');
    }
  }

  /**
   * Desbloquear badge
   */
  async unlockBadge(badgeId: string): Promise<BadgeData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gamification/badges/${badgeId}/unlock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao desbloquear badge:', error);
      throw new Error(error.response?.data?.message || 'Erro ao desbloquear badge');
    }
  }

  /**
   * Buscar dados de streak
   */
  async getStreak(): Promise<StreakData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gamification/streak`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar streak:', error);
      throw new Error(error. response?.data?.message || 'Erro ao buscar streak');
    }
  }

  /**
   * Atualizar streak (registrar atividade do dia)
   */
  async updateStreak(): Promise<StreakData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios. post(
        `${API_URL}/api/gamification/streak`,
        {},
        {
          headers: {
            Authorization:  `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar streak:', error);
      throw new Error(error. response?.data?.message || 'Erro ao atualizar streak');
    }
  }

  /**
   * Buscar missões diárias
   */
  async getDailyMissions(): Promise<DailyMissionData[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gamification/daily-missions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar missões diárias:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar missões diárias');
    }
  }

  /**
   * Atualizar progresso de missão
   */
  async updateMissionProgress(missionId: string, progress: number): Promise<DailyMissionData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/gamification/daily-missions/${missionId}`,
        { progress },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar missão:', error);
      throw new Error(error.response?.data?. message || 'Erro ao atualizar missão');
    }
  }

  /**
   * Completar missão e resgatar recompensa
   */
  async completeMission(missionId:  string): Promise<{ mission: DailyMissionData; xpData: UserXPData }> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios. post(
        `${API_URL}/api/gamification/daily-missions/${missionId}/complete`,
        {},
        {
          headers: {
            Authorization:  `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao completar missão:', error);
      throw new Error(error. response?.data?.message || 'Erro ao completar missão');
    }
  }

  /**
   * Buscar histórico de XP (para gráficos)
   */
  async getXPHistory(days: number = 30): Promise<{ date: string; xp: number }[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gamification/xp/history`, {
        params: { days },
        headers:  {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar histórico de XP:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar histórico de XP');
    }
  }

  /**
   * Buscar ranking de usuários (leaderboard)
   */
  async getLeaderboard(limit: number = 10): Promise<{ userId: string; name: string; level: number; xp: number; rank: number }[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gamification/leaderboard`, {
        params: { limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response. data;
    } catch (error: any) {
      console.error('Erro ao buscar leaderboard:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar leaderboard');
    }
  }
}

export default new GamificationService();