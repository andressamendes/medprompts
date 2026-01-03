import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../services/auth.service';
// import { authService } from '../services/auth.service'; // Descomentar quando backend estiver pronto
// import { userService } from '../services/user.service'; // Descomentar quando backend estiver pronto

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
   * 🎭 MODO MOCK: Carrega do localStorage sem verificar API
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 🎭 MODO MOCK: Carrega usuário do localStorage sem verificar API
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        if (userStr && token) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log('✅ Usuário carregado do localStorage:', userData.name);
        } else {
          setUser(null);
        }
        
        // ⚠️ QUANDO BACKEND ESTIVER PRONTO, descomente e use:
        /*
        if (authService.isAuthenticated()) {
          const userData = await authService.verifyToken();
          if (userData) {
            setUser(userData);
            await userService.syncGamificationData();
          } else {
            setUser(null);
          }
        }
        */
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
   * 🎭 MODO MOCK: Login é feito diretamente no componente Login.tsx
   */
  const login = async (_credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      
      // ⚠️ QUANDO BACKEND ESTIVER PRONTO, descomente:
      /*
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      await userService.syncGamificationData();
      */
      
      // 🎭 MODO MOCK: Por enquanto, apenas carrega do localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra novo usuário
   * 🎭 MODO MOCK: Registro é feito diretamente no componente Register.tsx
   */
  const register = async (_data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      
      // ⚠️ QUANDO BACKEND ESTIVER PRONTO, descomente:
      /*
      const authResponse = await authService.register(data);
      setUser(authResponse.user);
      */
      
      // 🎭 MODO MOCK: Por enquanto, apenas carrega do localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
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
      
      // ⚠️ QUANDO BACKEND ESTIVER PRONTO, descomente:
      // await authService.logout();
      
      // 🎭 MODO MOCK: Limpa localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setUser(null);
      console.log('✅ Logout realizado');
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
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  /**
   * Recarrega dados do usuário do backend
   */
  const refreshUserData = async (): Promise<void> => {
    try {
      // ⚠️ QUANDO BACKEND ESTIVER PRONTO, descomente:
      /*
      const userData = await userService.getProfile();
      setUser(userData);
      */
      
      // 🎭 MODO MOCK: Recarrega do localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
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
