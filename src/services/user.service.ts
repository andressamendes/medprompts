import { apiClient } from './api';
import { User } from './auth.service';

// Interfaces para operações de usuário
export interface UpdateProfileData {
  name?: string;
  university?: string;
  graduationYear?: number;
  bio?: string;
  avatarUrl?: string;
  studyGoalHours?: number;
  preferredAI?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  studyDays?: number[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AddXPData {
  xpAmount: number;
  reason: string;
}

export interface XPResponse {
  previousXP: number;
  currentXP: number;
  xpGained: number;
  previousLevel: number;
  currentLevel: number;
  leveledUp: boolean;
}

export interface AddBadgeData {
  badgeId: string;
}

export interface BadgeResponse {
  badgeId: string;
  totalBadges: number;
  badges: string[];
}

export interface UserStats {
  xp: number;
  level: number;
  badges: number;
  xpForNextLevel: number;
  xpNeeded: number;
  accountAge: number;
  lastLogin: string | null;
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
      const response = await apiClient.get<{ user: User }>('/users/profile');
      
      // Atualiza localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error: any) {
      console.error('Erro ao obter perfil:', error);
      throw new Error(error.message || 'Erro ao obter perfil');
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await apiClient.put<{ user: User }>('/users/profile', data);
      
      // Atualiza localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.put('/users/password', data);
      
      // Após alterar senha, limpa tokens (usuário precisa fazer login novamente)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      throw new Error(error.message || 'Erro ao alterar senha');
    }
  }

  /**
   * Adiciona XP ao usuário
   */
  async addXP(data: AddXPData): Promise<XPResponse> {
    try {
      const response = await apiClient.post<XPResponse>('/users/xp', data);
      
      // Atualiza XP e level no usuário do localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.xp = response.data.currentXP;
        user.level = response.data.currentLevel;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao adicionar XP:', error);
      throw new Error(error.message || 'Erro ao adicionar XP');
    }
  }

  /**
   * Adiciona badge ao usuário
   */
  async addBadge(data: AddBadgeData): Promise<BadgeResponse> {
    try {
      const response = await apiClient.post<BadgeResponse>('/users/badges', data);
      
      // Atualiza badges no usuário do localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.badges = response.data.badges;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao adicionar badge:', error);
      throw new Error(error.message || 'Erro ao adicionar badge');
    }
  }

  /**
   * Obtém estatísticas do usuário
   */
  async getStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get<UserStats>('/users/stats');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(error.message || 'Erro ao obter estatísticas');
    }
  }

  /**
   * Deleta conta do usuário
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      await apiClient.delete('/users/account', {
        data: { password },
      });
      
      // Remove dados do localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      throw new Error(error.message || 'Erro ao deletar conta');
    }
  }

  /**
   * Sincroniza dados de gamificação do localStorage com backend
   * (Migração de dados antigos do localStorage para API)
   */
  async syncGamificationData(): Promise<void> {
    try {
      // Busca dados antigos do localStorage
      const oldXP = parseInt(localStorage.getItem('userXP') || '0');
      // const oldLevel = parseInt(localStorage.getItem('userLevel') || '1');
      const oldBadges = JSON.parse(localStorage.getItem('unlockedBadges') || '[]');

      // Busca dados atuais do backend
      const currentUser = await this.getProfile();

      // Se XP antigo for maior, sincroniza
      if (oldXP > currentUser.xp) {
        await this.addXP({
          xpAmount: oldXP - currentUser.xp,
          reason: 'Migração de dados do localStorage',
        });
      }

      // Sincroniza badges antigas
      for (const badgeId of oldBadges) {
        if (!currentUser.badges.includes(badgeId)) {
          try {
            await this.addBadge({ badgeId });
          } catch (error) {
            console.warn(`Badge ${badgeId} já existe ou é inválida`);
          }
        }
      }

      // Remove dados antigos do localStorage
      localStorage.removeItem('userXP');
      localStorage.removeItem('userLevel');
      localStorage.removeItem('unlockedBadges');
      localStorage.removeItem('dailyMissionsCompleted');
      localStorage.removeItem('weeklyChallenge');
      
      console.log('✅ Dados de gamificação sincronizados com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar dados de gamificação:', error);
    }
  }
}

// Exporta instância única (singleton)
export const userService = new UserService();
export default userService;
