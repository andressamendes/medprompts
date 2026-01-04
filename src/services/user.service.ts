import api from './api';
import { User } from './auth.service';

// Interfaces
export interface UpdateProfileData {
  name?: string;
  university?: string;
  graduationYear?: number;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  totalXP: number;
  averageDuration: number;
  currentStreak: number;
}

/**
 * Serviço de gerenciamento de usuário
 */
class UserService {
  /**
   * Obtém perfil do usuário autenticado
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/users/profile');
      return response.data.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao obter perfil');
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put('/users/profile', data);
      
      // Atualiza localStorage
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao atualizar perfil');
    }
  }

  /**
   * Obtém estatísticas do usuário
   */
  async getStats(): Promise<UserStats> {
    try {
      const response = await api.get('/users/stats');
      return response.data.data.stats;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao obter estatísticas');
    }
  }

  /**
   * Adiciona XP ao usuário
   */
  async addXP(amount: number): Promise<User> {
    try {
      const response = await api.post('/users/add-xp', { amount });
      
      // Atualiza localStorage
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao adicionar XP');
    }
  }

  /**
   * Sincroniza dados de gamificação antigos do localStorage
   * (Migração de dados mockados para API)
   */
  async syncGamificationData(): Promise<void> {
    try {
      // Verifica se há dados antigos no localStorage
      const oldXP = localStorage.getItem('userXP');
      const oldLevel = localStorage.getItem('userLevel');
      const oldBadges = localStorage.getItem('userBadges');

      if (oldXP || oldLevel || oldBadges) {
        await api.post('/users/sync-data', {
          xp: oldXP ? parseInt(oldXP) : undefined,
          level: oldLevel ? parseInt(oldLevel) : undefined,
          badges: oldBadges ? JSON.parse(oldBadges) : undefined,
        });

        // Remove dados antigos após sincronização
        localStorage.removeItem('userXP');
        localStorage.removeItem('userLevel');
        localStorage.removeItem('userBadges');
      }
    } catch (error) {
      // Não lança erro, apenas registra no console
      console.warn('Erro ao sincronizar dados de gamificação:', error);
    }
  }
}

export const userService = new UserService();
