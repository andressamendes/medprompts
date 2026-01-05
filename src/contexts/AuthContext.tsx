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
   * Carrega usuário do localStorage ao montar a aplicação
   */
  useEffect(() => {
    const loadUserFromStorage = (): User | null => {
      try {
        const stored = localStorage.getItem('encrypted_user');
        if (stored) {
          const parsed = JSON.parse(stored) as User;
          console.log('✅ Usuário carregado do localStorage');
          return parsed;
        }
      } catch (error) {
        console.error('❌ Erro ao carregar usuário do storage:', error);
        // Fallback:  remove dados corrompidos
        localStorage.removeItem('encrypted_user');
      }
      return null;
    };

    try {
      const savedUser = loadUserFromStorage();
      setUser(savedUser);
    } catch (error) {
      console.error('❌ Erro ao inicializar usuário:', error);
      setUser(null);
    }
  }, []);

  /**
   * Verifica se usuário está autenticado ao carregar aplicação
   * Sincroniza com backend para validar token
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Verifica se há token salvo
        if (! authService.isAuthenticated()) {
          console. log('⚠️ Nenhum token encontrado');
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        try {
          // Verifica se token ainda é válido com o backend
          const userData = await authService.verifyToken();

          if (isMounted) {
            if (userData) {
              setUser(userData);
              console. log('✅ Usuário autenticado:', userData.email);
              setError(null);
            } else {
              // Token inválido, limpa dados
              setUser(null);
              console.warn('⚠️ Token inválido, limpando dados');
              setError('Token expirado, faça login novamente');
            }
          }
        } catch (verifyError) {
          console. error('❌ Erro ao verificar token:', verifyError);
          
          if (isMounted) {
            setUser(null);
            setError('Erro ao verificar autenticação');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        
        if (isMounted) {
          setUser(null);
          setError('Erro na inicialização da autenticação');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Só executa se houver token
    if (authService.isAuthenticated()) {
      initializeAuth();
    } else {
      setLoading(false);
    }

    // Cleanup function para evitar memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Faz login do usuário
   * Trata erros adequadamente
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Validação básica
      if (!credentials.email || ! credentials.password) {
        throw new Error('Email e senha são obrigatórios');
      }

      try {
        const authResponse = await authService.login(credentials);
        
        // Validação da resposta
        if (!authResponse.user) {
          throw new Error('Resposta de login inválida');
        }

        setUser(authResponse.user);
        console.log('✅ Login bem-sucedido:', authResponse. user.email);
      } catch (loginError) {
        const errorMessage = loginError instanceof Error 
          ? loginError.message 
          : 'Erro ao fazer login';
        
        console.error('❌ Erro no serviço de login:', loginError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao fazer login';
      
      console.error('❌ Erro ao fazer login:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra novo usuário
   * Trata erros adequadamente
   */
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Validação básica
      if (!data.name || !data.email || !data.password) {
        throw new Error('Nome, email e senha são obrigatórios');
      }

      try {
        const authResponse = await authService.register(data);
        
        // Validação da resposta
        if (!authResponse.user) {
          throw new Error('Resposta de registro inválida');
        }

        setUser(authResponse.user);
        console.log('✅ Registro bem-sucedido:', authResponse.user.email);
      } catch (registerError) {
        const errorMessage = registerError instanceof Error 
          ? registerError.message 
          : 'Erro ao registrar';
        
        console.error('❌ Erro no serviço de registro:', registerError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ?  error.message 
        : 'Erro desconhecido ao registrar';
      
      console.error('❌ Erro ao registrar:', error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Faz logout do usuário
   * Trata erros adequadamente
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      try {
        // Tenta chamar endpoint de logout (pode falhar se offline)
        await authService.logout();
        console.log('✅ Logout bem-sucedido');
      } catch (logoutError) {
        // Mesmo com erro, continua com limpeza local
        console.warn('⚠️ Erro ao fazer logout no servidor:', logoutError);
      } finally {
        // Sempre limpa dados locais
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      // Mesmo com erro, tenta limpar
      setUser(null);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário no estado
   * (Usado após atualizar perfil, adicionar XP, etc)
   */
  const updateUser = (updatedUser: User): void => {
    try {
      if (! updatedUser || !updatedUser.id) {
        throw new Error('Dados de usuário inválidos');
      }

      setUser(updatedUser);
      
      // Atualiza também no localStorage com tratamento de erro
      try {
        localStorage.setItem('encrypted_user', JSON.stringify(updatedUser));
      } catch (storageError) {
        console.error('❌ Erro ao salvar usuário no localStorage:', storageError);
        setError('Erro ao salvar dados locais');
      }

      console.log('✅ Usuário atualizado:', updatedUser.email);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao atualizar usuário';
      
      console.error('❌ Erro ao atualizar usuário:', error);
      setError(errorMessage);
    }
  };

  /**
   * Recarrega dados do usuário do backend
   * Sincroniza estado local com servidor
   */
  const refreshUserData = async (): Promise<void> => {
    try {
      if (!authService.isAuthenticated()) {
        console.warn('⚠️ Usuário não autenticado, não é possível recarregar dados');
        setError('Usuário não autenticado');
        return;
      }

      try {
        const userData = await authService.verifyToken();

        if (userData) {
          setUser(userData);
          
          // Atualiza localStorage
          try {
            localStorage.setItem('encrypted_user', JSON. stringify(userData));
          } catch (storageError) {
            console.error('❌ Erro ao salvar usuário no localStorage:', storageError);
          }

          console.log('✅ Dados do usuário recarregados');
          setError(null);
        } else {
          // Token expirou
          setUser(null);
          setError('Sessão expirada, faça login novamente');
          console.warn('⚠️ Token expirado durante recarregamento');
        }
      } catch (verifyError) {
        const errorMessage = verifyError instanceof Error 
          ? verifyError. message 
          : 'Erro ao recarregar dados';
        
        console.error('❌ Erro ao recarregar dados do usuário:', verifyError);
        setError(errorMessage);
        // Não lança erro, apenas loga
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido';
      
      console.error('❌ Erro inesperado ao recarregar dados:', error);
      setError(errorMessage);
    }
  };

  /**
   * Sincroniza entre abas/janelas
   * Se usuário faz logout em uma aba, remove de todas
   */
  useEffect(() => {
    const handleStorageChange = (e:  StorageEvent) => {
      try {
        // Se tokens foram removidos (logout em outra aba)
        if (
          (e.key === 'encrypted_accessToken' ||
           e.key === 'encrypted_refreshToken') &&
          e.newValue === null
        ) {
          console.log('🔄 Logout detectado em outra aba, sincronizando...');
          setUser(null);
          setError('Você foi desconectado em outra aba');
        }

        // Se usuário foi atualizado em outra aba
        if (e.key === 'encrypted_user' && e.newValue) {
          try {
            const updatedUser = JSON.parse(e.newValue) as User;
            setUser(updatedUser);
            console.log('🔄 Dados do usuário sincronizados de outra aba');
            setError(null);
          } catch (parseError) {
            console.error('❌ Erro ao parsear usuário sincronizado:', parseError);
            setError('Erro ao sincronizar dados');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar mudança de storage:', error);
      }
    };

    const handleAuthLogout = () => {
      console.log('🔄 Evento de logout detectado');
      setUser(null);
      setError('Sua sessão foi encerrada');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-logout', handleAuthLogout as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-logout', handleAuthLogout as EventListener);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated:  !!user,
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