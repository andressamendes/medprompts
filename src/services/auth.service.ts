// Tipos de dados
export interface User {
  id: string;
  name: string;
  email: string;
  university?: string;
  graduationYear?: number;
  avatar?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Chaves para armazenar no localStorage
const USERS_STORAGE_KEY = 'medprompts_users';
const TOKEN_STORAGE_KEY = 'medprompts_token';
const CURRENT_USER_KEY = 'encrypted_user';

/**
 * Serviço de autenticação MOCK - VERSÃO SÍNCRONA
 */
class AuthService {
  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private generateToken(userId: string): string {
    return btoa(`${userId}:${Date.now()}`);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return !!(token && user);
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (!userStr) {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('Email não encontrado. Por favor, registre-se primeiro.');
    }

    const token = this.generateToken(user.id);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { user, token };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const users = this.getUsers();

    if (users.some(u => u.email === data.email)) {
      throw new Error('Este email já está registrado. Faça login.');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    const token = this.generateToken(newUser.id);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { user: newUser, token };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  async verifyToken(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }
    return this.getCurrentUser();
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    this.saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  }
}

export const authService = new AuthService();
