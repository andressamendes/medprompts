import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '../services/auth. service';

// Interface do contexto de autenticação
interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout:  () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUserData: () => Promise<void>;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ CORREÇÃO: useEffect único com fluxo sequencial
   * Evita race conditions entre localStorage e verificação de token
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // ETAPA 1: Tenta carregar usuário do localStorage
        const loadUserFromStorage = (): User | null => {
          try {
            const stored = localStorage.getItem('encrypted_user');
            if (stored) {
              const parsed = JSON.parse(stored) as User;
              return parsed;
            }
          } catch (error) {
            // Fallback:  remove dados corrompidos
            localStorage.removeItem('encrypted_user');
          }
          return null;
        };

        const cachedUser = loadUserFromStorage();

        // ETAPA 2: Verifica se há token válido
        if (! authService.isAuthenticated()) {
          // Sem token:  usuário não autenticado
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // ETAPA 3: Token existe, valida com backend
        try {
          const userData = await authService.verifyToken();

          if (isMounted) {
            if (userData) {
              // Token válido:  atualiza estado
              setUser(userData);
              setError(null);
            } else {
              // Token inválido:  limpa dados
              setUser(null);
              setError('Token expirado, faça login novamente');
            }
          }
        } catch (verifyError:  any) {
          // Erro na verificação:  usa cache se disponível
          if (isMounted) {
            if (cachedUser) {
              // Mantém usuário do cache temporariamente
              setUser(cachedUser);
              setError('Erro ao verificar autenticação, usando dados em cache');
            } else {
              setUser(null);
              setError('Erro ao verificar autenticação');
            }
          }
        }
      } catch (error:  any) {
        if (isMounted) {
          setUser(null);
          setError('Erro ao inicializar autenticação');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // ✅ Executa apenas uma vez na montagem

  /**
   * Faz login do usuário
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const userData = await authService. login(credentials);
      setUser(userData);
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra novo usuário
   */
  const register = async (data: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const userData = await authService.register(data);
      setUser(userData);
    } catch (error: any) {
      setError(error.message || 'Erro ao registrar usuário');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faz logout do usuário
   */
  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
      setUser(null);
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer logout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário no estado
   */
  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    // Atualiza localStorage também
    localStorage.setItem('encrypted_user', JSON.stringify(updatedUser));
  };

  /**
   * Recarrega dados do usuário do backend
   */
  const refreshUserData = async (): Promise<void> => {
    if (!authService.isAuthenticated()) {
      return;
    }

    try {
      const userData = await authService.verifyToken();
      if (userData) {
        setUser(userData);
      }
    } catch (error: any) {
      setError('Erro ao atualizar dados do usuário');
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
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};