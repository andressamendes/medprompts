import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// URL base da API (ajuste conforme seu ambiente)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Interface para respostas de erro padronizadas
export interface APIError {
  success: false;
  error: string;
  details?: string;
}

// Interface para respostas de sucesso padronizadas
export interface APIResponse<T = any> {
  success: true;
  message?: string;
  data: T;
}

// Cria instância do Axios com configurações base
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição: adiciona token JWT automaticamente
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Busca token do localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta: trata erros globalmente
api.interceptors.response.use(
  (response) => {
    // Retorna apenas os dados da resposta
    return response.data;
  },
  async (error: AxiosError<APIError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Se erro 401 (não autorizado) e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Tenta renovar token com refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post<APIResponse<{ accessToken: string }>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          
          const newAccessToken = response.data.data.accessToken;
          
          // Salva novo token
          localStorage.setItem('accessToken', newAccessToken);
          
          // Atualiza header da requisição original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          
          // Refaz requisição original
          return api(originalRequest);
        } catch (refreshError) {
          // Se refresh falhar, desloga usuário
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redireciona para login
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        }
      } else {
        // Sem refresh token, desloga
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        window.location.href = '/login';
      }
    }
    
    // Retorna erro formatado
    const errorMessage = error.response?.data?.error || 'Erro ao conectar com servidor';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      details: error.response?.data?.details,
    });
  }
);

// Funções auxiliares para requisições tipadas
export const apiClient = {
  get: <T = any>(url: string, config?: any) => 
    api.get<any, APIResponse<T>>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: any) => 
    api.post<any, APIResponse<T>>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: any) => 
    api.put<any, APIResponse<T>>(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: any) => 
    api.patch<any, APIResponse<T>>(url, data, config),
    
  delete: <T = any>(url: string, config?: any) => 
    api.delete<any, APIResponse<T>>(url, config),
};

export default api;
