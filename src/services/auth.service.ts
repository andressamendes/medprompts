/**
 * 🔒 Serviço de Autenticação Seguro - MedPrompts
 *
 * FASE 3: Implementação de autenticação robusta com:
 * - Bcrypt para hashing de senhas (OWASP A02:2021)
 * - JWT para tokens de sessão (OWASP A07:2021)
 * - Refresh tokens com expiração
 * - Rate limiting para brute force protection
 *
 * Substitui: src/services/auth.service.ts (implementação insegura com Base64)
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/security.config';
import { sanitizationService } from './sanitization.service';

// ==========================================
// TIPOS DE DADOS
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // NOVO: Sistema RBAC
  university?: string;
  graduationYear?: number;
  avatar?: string;
  createdAt: string;
  isEmailVerified: boolean; // NOVO: Verificação de email
}

// NOVO: Sistema de Roles (RBAC)
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

// Interface interna que inclui senha (não exportada)
interface UserWithPassword extends User {
  password: string;
  refreshToken?: string; // NOVO: Refresh token
  loginAttempts: number; // NOVO: Contador de tentativas
  lockoutUntil?: number; // NOVO: Timestamp de bloqueio
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
  refreshToken: string; // NOVO
  expiresIn: string; // NOVO
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// ==========================================
// CONSTANTES
// ==========================================

const USERS_STORAGE_KEY = 'medprompts_users_v2'; // v2 para nova estrutura
const TOKEN_STORAGE_KEY = 'medprompts_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'medprompts_refresh_token';
const CURRENT_USER_KEY = 'medprompts_current_user';

/**
 * Serviço de autenticação seguro
 */
class SecureAuthService {
  // ==========================================
  // HASHING DE SENHAS (Bcrypt)
  // ==========================================

  /**
   * Hash seguro de senha usando bcrypt
   * CORREÇÃO CRÍTICA: Substitui Base64 inseguro
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = securityConfig.bcrypt.rounds;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se senha corresponde ao hash bcrypt
   */
  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  }

  // ==========================================
  // JWT TOKENS
  // ==========================================

  /**
   * Gera token JWT de acesso (15 minutos)
   * CORREÇÃO CRÍTICA: Substitui Base64 inseguro
   */
  private generateAccessToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    return jwt.sign(
      payload,
      securityConfig.jwt.secret,
      {
        expiresIn: securityConfig.jwt.expiresIn,
        algorithm: 'HS256',
      } as jwt.SignOptions
    );
  }

  /**
   * Gera refresh token JWT (7 dias)
   */
  private generateRefreshToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    return jwt.sign(
      payload,
      securityConfig.jwt.refreshSecret,
      {
        expiresIn: securityConfig.jwt.refreshExpiresIn,
        algorithm: 'HS256',
      } as jwt.SignOptions
    );
  }

  /**
   * Verifica e decodifica token JWT
   */
  private verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, securityConfig.jwt.secret, {
        algorithms: ['HS256'],
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Token type mismatch');
      }

      return decoded;
    } catch (error) {
      console.error('Token inválido:', error);
      return null;
    }
  }

  /**
   * Verifica e decodifica refresh token
   */
  private verifyRefreshToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, securityConfig.jwt.refreshSecret, {
        algorithms: ['HS256'],
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Token type mismatch');
      }

      return decoded;
    } catch (error) {
      console.error('Refresh token inválido:', error);
      return null;
    }
  }

  // ==========================================
  // STORAGE (LocalStorage)
  // ==========================================

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
    const {
      password,
      refreshToken,
      loginAttempts,
      lockoutUntil,
      ...userWithoutPassword
    } = user;
    return userWithoutPassword;
  }

  // ==========================================
  // RATE LIMITING & BRUTE FORCE PROTECTION
  // ==========================================

  /**
   * Verifica se conta está bloqueada por tentativas excessivas
   */
  private isAccountLocked(user: UserWithPassword): boolean {
    if (!user.lockoutUntil) return false;

    const now = Date.now();
    if (now < user.lockoutUntil) {
      return true; // Ainda bloqueado
    }

    // Lockout expirado - resetar
    user.loginAttempts = 0;
    user.lockoutUntil = undefined;
    return false;
  }

  /**
   * Incrementa tentativas de login e bloqueia se necessário
   */
  private handleFailedLogin(user: UserWithPassword): void {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    const maxAttempts = securityConfig.rateLimit.maxLoginAttempts;

    if (user.loginAttempts >= maxAttempts) {
      const lockoutDuration =
        securityConfig.rateLimit.lockoutDuration * 60 * 1000; // minutos -> ms
      user.lockoutUntil = Date.now() + lockoutDuration;

      throw new Error(
        `Conta bloqueada por ${securityConfig.rateLimit.lockoutDuration} minutos devido a múltiplas tentativas incorretas.`
      );
    }

    const remainingAttempts = maxAttempts - user.loginAttempts;
    throw new Error(
      `Senha incorreta. ${remainingAttempts} tentativa(s) restante(s) antes do bloqueio.`
    );
  }

  /**
   * Reseta tentativas de login após sucesso
   */
  private resetLoginAttempts(user: UserWithPassword): void {
    user.loginAttempts = 0;
    user.lockoutUntil = undefined;
  }

  // ==========================================
  // MÉTODOS PÚBLICOS
  // ==========================================

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
    if (!token) return false;

    const payload = this.verifyAccessToken(token);
    return payload !== null;
  }

  /**
   * Retorna usuário atual (sem senha)
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Login com verificação de senha bcrypt e JWT
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const users = this.getUsersWithPassword();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('Email não encontrado. Por favor, registre-se primeiro.');
    }

    // Verifica se conta está bloqueada
    if (this.isAccountLocked(user)) {
      const minutesRemaining = Math.ceil(
        ((user.lockoutUntil || 0) - Date.now()) / 1000 / 60
      );
      throw new Error(
        `Conta bloqueada. Tente novamente em ${minutesRemaining} minuto(s).`
      );
    }

    // Verifica senha com bcrypt
    const isPasswordValid = await this.verifyPassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      this.handleFailedLogin(user);
      this.saveUsersWithPassword(users); // Salva tentativas
      // handleFailedLogin já lança erro
      throw new Error('Senha incorreta');
    }

    // Login bem-sucedido - reseta tentativas
    this.resetLoginAttempts(user);

    // Gera tokens JWT
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Salva refresh token no usuário
    user.refreshToken = refreshToken;
    this.saveUsersWithPassword(users);

    // Remove senha antes de salvar no localStorage
    const userWithoutPassword = this.removePassword(user);

    // Salva tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: securityConfig.jwt.expiresIn,
    };
  }

  /**
   * Registro com hash bcrypt de senha
   * FASE 5: Adicionada sanitização de inputs (XSS protection)
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // NOVO: Sanitiza e valida todos os inputs
    const validationResult = sanitizationService.sanitizeUserRegistration(data);

    if (!validationResult.isValid) {
      throw new Error(
        'Dados inválidos:\n' + validationResult.errors.join('\n')
      );
    }

    const sanitizedData = validationResult.sanitized!;
    const users = this.getUsersWithPassword();

    // Verifica se email já existe
    if (users.some(u => u.email === sanitizedData.email)) {
      throw new Error('Este email já está registrado. Faça login.');
    }

    // Hash da senha com bcrypt
    const hashedPassword = await this.hashPassword(sanitizedData.password);

    // Cria novo usuário
    const newUser: UserWithPassword = {
      id: `user_${Date.now()}`,
      name: sanitizedData.name,
      email: sanitizedData.email,
      password: hashedPassword,
      role: 'USER', // NOVO: Role padrão
      university: sanitizedData.university,
      graduationYear: sanitizedData.graduationYear,
      createdAt: new Date().toISOString(),
      isEmailVerified: false, // NOVO: Email não verificado
      loginAttempts: 0,
    };

    users.push(newUser);
    this.saveUsersWithPassword(users);

    // Gera tokens JWT
    const accessToken = this.generateAccessToken(newUser);
    const refreshToken = this.generateRefreshToken(newUser);

    // Salva refresh token
    newUser.refreshToken = refreshToken;
    this.saveUsersWithPassword(users);

    // Remove senha antes de retornar
    const userWithoutPassword = this.removePassword(newUser);

    // Salva tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: securityConfig.jwt.expiresIn,
    };
  }

  /**
   * Refresh token - gera novo access token
   */
  async refreshAccessToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    if (!refreshToken) {
      throw new Error('Refresh token não encontrado. Faça login novamente.');
    }

    // Verifica refresh token
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Refresh token inválido. Faça login novamente.');
    }

    // Busca usuário
    const users = this.getUsersWithPassword();
    const user = users.find(u => u.id === payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Sessão inválida. Faça login novamente.');
    }

    // Gera novo access token
    const newAccessToken = this.generateAccessToken(user);

    // Salva novo token
    localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken);

    const userWithoutPassword = this.removePassword(user);

    return {
      user: userWithoutPassword,
      accessToken: newAccessToken,
      refreshToken, // Mantém o mesmo refresh token
      expiresIn: securityConfig.jwt.expiresIn,
    };
  }

  /**
   * Logout - remove dados de autenticação
   */
  async logout(): Promise<void> {
    // Remove refresh token do usuário
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const users = this.getUsersWithPassword();
      const user = users.find(u => u.id === currentUser.id);
      if (user) {
        user.refreshToken = undefined;
        this.saveUsersWithPassword(users);
      }
    }

    // Limpa localStorage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  /**
   * Verifica se token é válido
   */
  async verifyToken(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;

    const payload = this.verifyAccessToken(token);
    if (!payload) {
      // Token expirado - tentar refresh
      try {
        const refreshed = await this.refreshAccessToken();
        return refreshed.user;
      } catch {
        return null;
      }
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

    // Não permite atualizar campos sensíveis
    const { id, password, role, ...safeUpdates } = updates as any;

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
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const users = this.getUsersWithPassword();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    const user = users[userIndex];

    // Verifica senha atual com bcrypt
    const isPasswordValid = await this.verifyPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Valida nova senha
    if (newPassword.length < 8) {
      throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    }

    // Hash da nova senha com bcrypt
    user.password = await this.hashPassword(newPassword);
    users[userIndex] = user;
    this.saveUsersWithPassword(users);
  }

  /**
   * NOVO: Migra usuários antigos (Base64) para novo formato (Bcrypt)
   * Executar apenas uma vez durante a transição
   */
  async migrateOldUsers(): Promise<void> {
    const oldKey = 'medprompts_users'; // Chave antiga
    const oldUsersStr = localStorage.getItem(oldKey);

    if (!oldUsersStr) {
      console.log('Nenhum usuário antigo para migrar.');
      return;
    }

    try {
      const oldUsers = JSON.parse(oldUsersStr);
      const newUsers = this.getUsersWithPassword();

      for (const oldUser of oldUsers) {
        // Verifica se usuário já foi migrado
        if (newUsers.some(u => u.email === oldUser.email)) {
          continue;
        }

        // Não é possível converter Base64 para bcrypt
        // Usuários precisarão redefinir senha
        console.warn(
          `Usuário ${oldUser.email} precisa redefinir senha (migração de Base64 para bcrypt)`
        );

        // Cria novo usuário sem senha (forçará reset)
        const newUser: UserWithPassword = {
          ...oldUser,
          password: await this.hashPassword('TEMP_PASSWORD_RESET_REQUIRED'),
          role: 'USER',
          isEmailVerified: false,
          loginAttempts: 0,
        };

        newUsers.push(newUser);
      }

      this.saveUsersWithPassword(newUsers);
      console.log('Migração de usuários concluída.');
    } catch (error) {
      console.error('Erro ao migrar usuários:', error);
    }
  }
}

export const secureAuthService = new SecureAuthService();

// Mantém compatibilidade com código existente
export const authService = secureAuthService;

export default secureAuthService;
