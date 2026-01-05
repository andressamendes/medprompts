import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Base URL da API (vem do . env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL configurada:', API_URL);
}

/**
 * Tipos para respostas da API
 */
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Cliente HTTP configurado
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisições
 * Adiciona token de autenticação automaticamente
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage. getItem('encrypted_accessToken');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('[API] Erro ao adicionar token:', error);
      return config;
    }
  },
  (error: unknown) => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

/**
 * Validação de resposta de refresh token
 */
function isValidRefreshResponse(response: unknown): response is AxiosResponse<{ data: RefreshTokenResponse }> {
  return (
    response instanceof Object &&
    'data' in response &&
    typeof response.data === 'object' &&
    response.data !== null &&
    'data' in response.data &&
    typeof response.data.data === 'object' &&
    response.data.data !== null &&
    'accessToken' in response.data.data &&
    typeof response.data.data.accessToken === 'string'
  );
}

/**
 * Validação de erro de resposta
 */
function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

/**
 * Tipo para config com retry flag
 */
interface RequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Interceptor de respostas
 * Trata erros 401 (token expirado) e faz refresh automático
 * Sincroniza logout entre abas
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    try {
      // Validação de segurança:    verifica se é um AxiosError
      if (! isAxiosError(error)) {
        console.error('[API] Erro desconhecido:', error);
        return Promise.reject(error);
      }

      // Validação:    verifica se error.config existe
      const originalRequest = error.config as RequestConfigWithRetry;
      
      if (!originalRequest) {
        console.error('[API] Config não disponível');
        return Promise.reject(error);
      }

      const statusCode = error.response?.status;

      // Se erro 401 (não autorizado) e não é retry
      if (statusCode === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('encrypted_refreshToken');
          
          // Validação: refresh token deve existir
          if (!refreshToken || typeof refreshToken !== 'string') {
            handleLogoutSync();
            return Promise.reject(new Error('Refresh token não disponível'));
          }

          // Tenta renovar token
          let response:  unknown;
          try {
            response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });
          } catch (refreshError) {
            if (process.env.NODE_ENV === 'development') {
              console. error('[API] Erro ao chamar refresh:', refreshError);
            }
            handleLogoutSync();
            return Promise.reject(refreshError);
          }

          // Validação rigorosa da resposta
          if (! isValidRefreshResponse(response)) {
            if (process.env.NODE_ENV === 'development') {
              console.error('[API] Resposta refresh inválida');
            }
            handleLogoutSync();
            return Promise.reject(new Error('Resposta inválida do servidor'));
          }

          const { accessToken } = response.data.data;
          
          // Validação: token renovado deve ser string não-vazia
          if (! accessToken || typeof accessToken !== 'string') {
            handleLogoutSync();
            return Promise. reject(new Error('Token renovado inválido'));
          }

          // Salva novo token com validação
          try {
            localStorage.setItem('encrypted_accessToken', accessToken);
          } catch (storageError) {
            console. error('[API] Erro ao salvar token:', storageError);
            return Promise.reject(storageError);
          }

          // Atualiza header da requisição original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[API] Token renovado com sucesso');
          }
          
          // Retry da requisição com novo token
          return api(originalRequest);
        } catch (refreshError) {
          console.error('[API] Erro inesperado:', refreshError);
          handleLogoutSync();
          return Promise.reject(refreshError);
        }
      }

      // Se erro 403 ou 401 sem retry, faz logout
      if ((statusCode === 403 || statusCode === 401) && originalRequest._retry) {
        handleLogoutSync();
        return Promise.reject(new Error('Sessão expirada'));
      }

      // Se erro 500+, loga
      if (statusCode && statusCode >= 500) {
        console.error('[API] Erro 500+:', statusCode);
      }

      return Promise.reject(error);
    } catch (unexpectedError) {
      console.error('[API] Erro no interceptor:', unexpectedError);
      return Promise.reject(unexpectedError);
    }
  }
);

/**
 * Faz logout sincronizado entre abas
 */
function handleLogoutSync(): void {
  try {
    localStorage.removeItem('encrypted_accessToken');
    localStorage.removeItem('encrypted_refreshToken');
    localStorage.removeItem('encrypted_user');
    
    const logoutEvent = new CustomEvent('auth-logout', {
      detail:   { timestamp: Date.now(), source: 'api-interceptor' }
    });
    
    window.dispatchEvent(logoutEvent);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Logout sincronizado');
    }
  } catch (error) {
    console.error('[API] Erro ao fazer logout:', error);
  }
}

/**
 * Listener para sincronizar logout de outras abas
 */
window.addEventListener('storage', (event:  StorageEvent) => {
  try {
    if (
      (event.key === 'encrypted_accessToken' || 
       event.key === 'encrypted_refreshToken') &&
      event.newValue === null
    ) {
      const logoutEvent = new CustomEvent('auth-logout', {
        detail:  { source: 'other-tab', timestamp: Date.now() }
      });
      
      window.dispatchEvent(logoutEvent);
    }
  } catch (error) {
    console.error('[API] Erro ao processar storage event:', error);
  }
});

/**
 * Listener global para erros de rede
 */
window.addEventListener('error', (event: ErrorEvent) => {
  if (event.message?.includes('Network')) {
    console.error('[API] Erro de rede:', event.message);
  }
});

export default api;