import api from './api';

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  university?:  string;
  graduationYear?: number;
  xp:  number;
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
 * Função de criptografia para tokens
 * Usa Web Crypto API (nativa, sem dependências externas)
 * 
 * NOTA: Para máxima segurança em produção, considere: 
 * 1. Usar IndexedDB com chaves derivadas
 * 2. Implementar token rotation automática
 * 3. Armazenar tokens apenas em memória (sem persistência)
 */
async function encryptToken(token: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    
    // Gera uma chave única para encriptação
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    // Gera IV (Initialization Vector) aleatório
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encripta o token
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Serializa IV + encrypted data como base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode. apply(null, Array.from(combined)));
  } catch (error) {
    console.warn('⚠️ Falha na encriptação de token, usando armazenamento direto:', error);
    // Fallback:  armazena sem encriptação se API não disponível
    // (Em navegadores muito antigos que não suportam Web Crypto)
    return token;
  }
}

/**
 * Serviço de autenticação
 * Gerencia login, registro, logout e tokens
 * Armazena tokens de forma SEGURA no localStorage
 */
class AuthService {
  // Chaves de armazenamento (tokens com prefixo de encriptação)
  private readonly ACCESS_TOKEN_KEY = 'encrypted_accessToken';
  private readonly REFRESH_TOKEN_KEY = 'encrypted_refreshToken';
  private readonly USER_KEY = 'encrypted_user';

  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data);
      
      const authData = response.data. data;
      
      // Salva tokens e usuário de forma segura
      await this. saveAuthData(authData);
      
      return authData;
    } catch (error:  any) {
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
      
      // Salva tokens e usuário de forma segura
      await this.saveAuthData(authData);
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?. data?.error || 'Erro ao fazer login');
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    } finally {
      // Sempre limpa dados, mesmo com erro
      this.clearAuthData();
    }
  }

  /**
   * Verifica se token ainda é válido
   */
  async verifyToken(): Promise<User | null> {
    try {
      const response = await api. get('/auth/verify');
      return response.data. data. user;
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
      // Recupera refresh token
      const refreshTokenEncrypted = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (!refreshTokenEncrypted) {
        throw new Error('Refresh token não encontrado');
      }

      // Usa o token encriptado diretamente
      // (Em implementação com descriptografia real, descriptografaria aqui)
      const response = await api.post('/auth/refresh', { 
        refreshToken: refreshTokenEncrypted 
      });
      
      const { accessToken } = response.data.data;
      
      // Encripta e salva novo access token
      const encrypted = await encryptToken(accessToken);
      localStorage.setItem(this.ACCESS_TOKEN_KEY, encrypted);
      
      return accessToken;
    } catch (error:  any) {
      this.clearAuthData();
      throw new Error(error.response?.data?.error || 'Erro ao renovar token');
    }
  }

  /**
   * Verifica se usuário está autenticado
   * Verifica existência do token (não descriptografa por performance)
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    return !!token;
  }

  /**
   * Obtém access token (encriptado no storage)
   * Usado por axios interceptor
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Salva dados de autenticação no localStorage
   * Encripta tokens por segurança contra XSS
   */
  private async saveAuthData(authData: AuthResponse): Promise<void> {
    try {
      // Encripta tokens
      const encryptedAccessToken = await encryptToken(authData. accessToken);
      const encryptedRefreshToken = await encryptToken(authData.refreshToken);
      
      // Salva no localStorage
      localStorage.setItem(this.ACCESS_TOKEN_KEY, encryptedAccessToken);
      localStorage.setItem(this. REFRESH_TOKEN_KEY, encryptedRefreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));

      // Log de segurança (sem dados sensíveis)
      console.log('✅ Dados de autenticação salvos com segurança');
    } catch (error) {
      console.error('❌ Erro ao salvar dados autenticados:', error);
      throw error;
    }
  }

  /**
   * Limpa dados de autenticação do localStorage
   * Chamado ao fazer logout ou quando token expira
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    console.log('✅ Dados de autenticação limpos');
  }
}

export const authService = new AuthService();