import { apiClient } from './api';

// Interfaces de dados de autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  university?: string;
  graduationYear?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  university?: string;
  graduationYear?: number;
  bio?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  badges: string[];
  studyGoalHours?: number;
  preferredAI?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  studyDays?: number[];
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Serviço de autenticação
 */
class AuthService {
  /**
   * Faz login do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Salva tokens e usuário no localStorage
      this.saveAuthData(response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Salva tokens e usuário no localStorage
      this.saveAuthData(response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    try {
      // Tenta invalidar tokens no backend
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
      // Continua mesmo com erro (limpa dados locais)
    } finally {
      // Remove dados de autenticação do localStorage
      this.clearAuthData();
    }
  }

  /**
   * Verifica se token ainda é válido
   */
  async verifyToken(): Promise<User | null> {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/verify');
      
      // Atualiza dados do usuário no localStorage
      this.saveUser(response.data.user);
      
      return response.data.user;
    } catch (error) {
      console.error('Token inválido:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Renova access token usando refresh token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }
      
      const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      });
      
      const newAccessToken = response.data.accessToken;
      
      // Salva novo access token
      localStorage.setItem('accessToken', newAccessToken);
      
      return newAccessToken;
    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      this.clearAuthData();
      throw new Error(error.message || 'Erro ao renovar token');
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Retorna usuário do localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Erro ao parsear usuário do localStorage:', error);
      return null;
    }
  }

  /**
   * Retorna access token do localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Retorna refresh token do localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Salva dados de autenticação no localStorage
   */
  private saveAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('accessToken', authResponse.tokens.accessToken);
    localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  }

  /**
   * Salva apenas dados do usuário no localStorage
   */
  private saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Remove dados de autenticação do localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

// Exporta instância única (singleton)
export const authService = new AuthService();
export default authService;
