import axios, { AxiosError } from 'axios';

// Base URL da API (vem do .env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

console.log('🔗 API URL configurada:', API_URL);

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
  (config) => {
    try {
      const token = localStorage. getItem('encrypted_accessToken');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('❌ Erro ao adicionar token à requisição:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

/**
 * Validação de resposta de refresh token
 */
function isValidRefreshResponse(response: any): response is { data: { data: { accessToken: string } } } {
  return (
    response &&
    typeof response === 'object' &&
    response.data &&
    typeof response.data === 'object' &&
    response.data.data &&
    typeof response.data. data === 'object' &&
    typeof response.data.data.accessToken === 'string'
  );
}

/**
 * Validação de erro de resposta
 */
function isAxiosError(error: any): error is AxiosError {
  return error && typeof error === 'object' && 'response' in error;
}

/**
 * Interceptor de respostas
 * Trata erros 401 (token expirado) e faz refresh automático
 * Sincroniza logout entre abas
 */
api.interceptors.response.use(
  (response) => response,
  async (error:  unknown) => {
    try {
      // Validação de segurança:  verifica se é um AxiosError
      if (! isAxiosError(error)) {
        console.error('❌ Erro desconhecido na resposta:', error);
        return Promise.reject(error);
      }

      // Validação:  verifica se error.config existe
      const originalRequest = error.config as any;
      
      if (! originalRequest) {
        console.error('❌ Erro:  request config não disponível');
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
            console.warn('⚠️ Refresh token inválido ou não encontrado, fazendo logout');
            handleLogoutSync();
            return Promise.reject(new Error('Refresh token não disponível'));
          }

          // Tenta renovar token com validação
          let response:  any;
          try {
            response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });
          } catch (refreshError) {
            console.error('❌ Erro ao chamar endpoint refresh:', refreshError);
            handleLogoutSync();
            return Promise.reject(refreshError);
          }

          // Validação rigorosa da resposta
          if (!isValidRefreshResponse(response)) {
            console.error('❌ Resposta inválida do refresh token:', response);
            handleLogoutSync();
            return Promise. reject(new Error('Resposta inválida do servidor'));
          }

          const { accessToken } = response.data.data;
          
          // Validação: token renovado deve ser string não-vazia
          if (! accessToken || typeof accessToken !== 'string') {
            console. warn('⚠️ Token inválido recebido, fazendo logout');
            handleLogoutSync();
            return Promise.reject(new Error('Token renovado inválido'));
          }

          // Salva novo token com validação
          try {
            localStorage.setItem('encrypted_accessToken', accessToken);
          } catch (storageError) {
            console. error('❌ Erro ao salvar token no localStorage:', storageError);
            return Promise.reject(storageError);
          }

          // Atualiza header da requisição original com validação
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          console.log('✅ Token renovado com sucesso');
          
          // Retry da requisição com novo token
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Erro inesperado ao renovar token:', refreshError);
          handleLogoutSync();
          return Promise.reject(refreshError);
        }
      }

      // Se erro 403 (proibido) ou 401 sem retry, faz logout
      if ((statusCode === 403 || statusCode === 401) && originalRequest._retry) {
        console.warn('⚠️ Acesso proibido ou token permanentemente inválido');
        handleLogoutSync();
        return Promise.reject(new Error('Sessão expirada ou acesso negado'));
      }

      // Se erro 500+ (erro do servidor), loga com detalhes
      if (statusCode && statusCode >= 500) {
        console.error('❌ Erro do servidor:', {
          status: statusCode,
          message: (error. response?.data as any)?.error || 'Erro desconhecido',
        });
      }

      return Promise.reject(error);
    } catch (unexpectedError) {
      console.error('❌ Erro inesperado no interceptor de resposta:', unexpectedError);
      return Promise.reject(unexpectedError);
    }
  }
);

/**
 * Faz logout sincronizado entre abas
 * Remove tokens e notifica outras abas
 */
function handleLogoutSync(): void {
  try {
    // Remove dados de autenticação
    localStorage.removeItem('encrypted_accessToken');
    localStorage.removeItem('encrypted_refreshToken');
    localStorage.removeItem('encrypted_user');
    
    // Dispara evento customizado para sincronizar com outras abas
    const logoutEvent = new CustomEvent('auth-logout', {
      detail:  { timestamp: Date.now(), source: 'api-interceptor' }
    });
    
    window.dispatchEvent(logoutEvent);
    
    console.log('🔄 Logout sincronizado - evento disparado para outras abas');
  } catch (error) {
    console.error('❌ Erro ao fazer logout sincronizado:', error);
  }
}

/**
 * Listener para sincronizar logout de outras abas
 * Quando um evento storage é disparado de outra aba
 */
window.addEventListener('storage', (event) => {
  try {
    // Se tokens foram removidos em outra aba (logout)
    if (
      (event.key === 'encrypted_accessToken' || 
       event.key === 'encrypted_refreshToken') &&
      event.newValue === null
    ) {
      console.log('🔄 Logout detectado em outra aba via storage event');
      
      // Dispara evento customizado para componentes reagirem
      const logoutEvent = new CustomEvent('auth-logout', {
        detail: { source: 'other-tab', timestamp: Date.now() }
      });
      
      window. dispatchEvent(logoutEvent);
    }
  } catch (error) {
    console.error('❌ Erro ao processar storage event:', error);
  }
});

/**
 * Listener global para erros não tratados
 * Ajuda a debug de problemas de rede
 */
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Network')) {
    console.error('❌ Erro de rede detectado:', event.message);
  }
});

export default api;