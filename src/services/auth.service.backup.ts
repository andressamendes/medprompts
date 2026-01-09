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

// Interface interna que inclui senha (não exportada)
interface UserWithPassword extends User {
  password: string;
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
 * Serviço de autenticação com verificação de senha
 */
class AuthService {
  /**
   * Hash básico de senha (Base64)
   * Em produção real, usar bcrypt ou similar no backend
   */
  private hashPassword(password: string): string {
    return btoa(password + 'medprompts_salt_2026');
  }

  /**
   * Verifica se a senha corresponde ao hash
   */
  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  /**
   * Busca usuários com senha do localStorage
   */
  private getUsersWithPassword(): UserWithPassword[] {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  /**
   * Salva usuários com senha no localStorage
   */
  private saveUsersWithPassword(users: UserWithPassword[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw new Error('Não foi possível salvar os dados do usuário');
    }
  }

  /**
   * Remove senha do objeto User (segurança)
   */
  private removePassword(user: UserWithPassword): User {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Gera token de autenticação
   */
  private generateToken(userId: string): string {
    return btoa(`${userId}:${Date.now()}`);
  }

  /**
   * Busca usuários sem senha (compatibilidade)
   */
  getUsers(): User[] {
    const users = this.getUsersWithPassword();
    return users.map(u => this.removePassword(u));
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return !!(token && user);
  }

  /**
   * Retorna usuário atual (sem senha)
   */
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

  /**
   * Login com verificação de senha
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const users = this.getUsersWithPassword();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('Email não encontrado. Por favor, registre-se primeiro.');
    }

    // CORREÇÃO CRÍTICA: Verifica senha
    if (!this.verifyPassword(credentials.password, user.password)) {
      throw new Error('Senha incorreta. Tente novamente.');
    }

    // Remove senha antes de salvar no localStorage
    const userWithoutPassword = this.removePassword(user);

    const token = this.generateToken(user.id);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return { user: userWithoutPassword, token };
  }

  /**
   * Registro com hash de senha
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const users = this.getUsersWithPassword();

    // Verifica se email já existe
    if (users.some(u => u.email === data.email)) {
      throw new Error('Este email já está registrado. Faça login.');
    }

    // CORREÇÃO CRÍTICA: Salva senha com hash
    const newUser: UserWithPassword = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: this.hashPassword(data.password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsersWithPassword(users);

    // Remove senha antes de retornar
    const userWithoutPassword = this.removePassword(newUser);

    const token = this.generateToken(newUser.id);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return { user: userWithoutPassword, token };
  }

  /**
   * Logout - remove dados de autenticação
   */
  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  /**
   * Verifica se token é válido
   */
  async verifyToken(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }
    return this.getCurrentUser();
  }

  /**
   * Atualiza dados do usuário (exceto senha)
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getUsersWithPassword();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    // Não permite atualizar senha por aqui (use updatePassword)
    const { ...safeUpdates } = updates;

    const updatedUser = { ...users[userIndex], ...safeUpdates };
    users[userIndex] = updatedUser;
    this.saveUsersWithPassword(users);

    // Remove senha antes de salvar no localStorage
    const userWithoutPassword = this.removePassword(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return userWithoutPassword;
  }

  /**
   * Atualiza senha do usuário
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const users = this.getUsersWithPassword();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const user = users[userIndex];

    // Verifica senha atual
    if (!this.verifyPassword(currentPassword, user.password)) {
      throw new Error('Senha atual incorreta');
    }

    // Atualiza com nova senha
    user.password = this.hashPassword(newPassword);
    users[userIndex] = user;
    this.saveUsersWithPassword(users);
  }
}

export const authService = new AuthService();
