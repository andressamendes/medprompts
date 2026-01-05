import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth.service';

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
export const AuthProvider: React. FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Carrega usuário do localStorage ao montar a aplicação
   */
  useEffect(() => {
    const loadUserFromStorage = (): User | null => {
      try {
        const stored = localStorage.getItem('encrypted_user');
        if (stored) {
          return JSON.parse(stored) as User;
        }
      } catch (error) {
        console.error('Erro ao carregar usuário do storage:', error);
      }
      return null;
    };

    setUser(loadUserFromStorage());
    setLoading(false);
  }, []);

  /**
   * Verifica se usuário está autenticado ao carregar aplicação
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Verifica se há token salvo
        if (authService.isAuthenticated()) {
          try {
            // Verifica se token ainda é válido com o backend
            const userData = await authService.verifyToken();

            if (userData) {
              setUser(userData);
              console.log('✅ Usuário autenticado:', userData.email);
            } else {
              // Token inválido, limpa dados
              setUser(null);
              console.warn('⚠️ Token inválido, limpando dados');
            }
          } catch (verifyError) {
            console. error('Erro ao verificar token:', verifyError);
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

    // Só executa se não tiver usuário carregado ainda
    if (user === null && loading) {
      initializeAuth();
    }
  }, []);

  /**
   * Faz login do usuário
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);

      console.log('✅ Login bem-sucedido:', authResponse. user.email);
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
  const register = async (data:  RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const authResponse = await authService.register(data);
      setUser(authResponse.user);

      console.log('✅ Registro bem-sucedido:', authResponse.user.email);
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
      await authService. logout();
      setUser(null);

      console.log('✅ Logout bem-sucedido');
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
    // Atualiza também no localStorage
    localStorage.setItem('encrypted_user', JSON.stringify(updatedUser));

    console.log('✅ Usuário atualizado:', updatedUser.email);
  };

  /**
   * Recarrega dados do usuário do backend
   * Sincroniza estado local com servidor
   */
  const refreshUserData = async (): Promise<void> => {
    try {
      if (! authService.isAuthenticated()) {
        console.warn('⚠️ Usuário não autenticado, não é possível recarregar dados');
        return;
      }

      const userData = await authService. verifyToken();

      if (userData) {
        setUser(userData);
        localStorage.setItem('encrypted_user', JSON.stringify(userData));

        console.log('✅ Dados do usuário recarregados');
      } else {
        // Token expirou durante a verificação
        setUser(null);
        console.warn('⚠️ Token expirado durante recarregamento');
      }
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
      // Não lança erro, apenas loga
    }
  };

  /**
   * Sincroniza entre abas/janelas
   * Se usuário faz logout em uma aba, remove de todas
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Se tokens foram removidos (logout em outra aba)
      if (
        e.key === 'encrypted_accessToken' &&
        e.newValue === null
      ) {
        console.log('🔄 Logout detectado em outra aba, sincronizando...');
        setUser(null);
      }

      // Se usuário foi atualizado em outra aba
      if (e.key === 'encrypted_user' && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue) as User;
          setUser(updatedUser);
          console.log('🔄 Dados do usuário sincronizados de outra aba');
        } catch (error) {
          console.error('Erro ao sincronizar usuário:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
 * Hook para usar contexto de autenticação
 * Lança erro se usado fora do Provider
 */
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (! context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}