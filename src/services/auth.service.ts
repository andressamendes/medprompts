import api from './api';

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  university?: string;
  graduationYear?: number;
  xp: number;
  level: number;
  badges: string[];
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  university?: string;
  graduationYear?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Serviço de autenticação
 * Gerencia login, registro, logout e tokens
 */
class AuthService {
  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      
      const authData = response.data.data;
      
      // Salva tokens e usuário
      this.saveAuthData(authData);
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao registrar');
    }
  }

  /**
   * Faz login do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      const authData = response.data.data;
      
      // Salva tokens e usuário
      this.saveAuthData(authData);
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Verifica se token ainda é válido
   */
  async verifyToken(): Promise<User | null> {
    try {
      const response = await api.get('/auth/verify');
      return response.data.data.user;
    } catch (error) {
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

      const response = await api.post('/auth/refresh', { refreshToken });
      
      const { accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      
      return accessToken;
    } catch (error: any) {
      this.clearAuthData();
      throw new Error(error.response?.data?.error || 'Erro ao renovar token');
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Salva dados de autenticação no localStorage
   */
  private saveAuthData(authData: AuthResponse): void {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  /**
   * Limpa dados de autenticação do localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();
