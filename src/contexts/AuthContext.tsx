import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth.service';
import { userService } from '../services/user.service';

// Interface do contexto de autenticação
interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUserData: () => Promise<void>;
}

// Cria o contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Props do Provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação
 * Gerencia estado global do usuário e funções de autenticação
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Verifica se usuário está autenticado ao carregar aplicação
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verifica se há token salvo
        if (authService.isAuthenticated()) {
          // Verifica se token ainda é válido
          const userData = await authService.verifyToken();
          
          if (userData) {
            setUser(userData);
            
            // Sincroniza dados de gamificação antigos (migração)
            await userService.syncGamificationData();
          } else {
            // Token inválido, limpa dados
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Faz login do usuário
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      
      // Sincroniza dados de gamificação antigos (migração)
      await userService.syncGamificationData();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra novo usuário
   */
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const authResponse = await authService.register(data);
      setUser(authResponse.user);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faz logout do usuário
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, remove usuário do estado
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário no estado
   * (Usado após atualizar perfil, adicionar XP, etc)
   */
  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  /**
   * Recarrega dados do usuário do backend
   */
  const refreshUserData = async (): Promise<void> => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar contexto de autenticação
 */
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};

export default AuthContext;
