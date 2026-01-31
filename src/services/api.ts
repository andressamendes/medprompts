import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Interface para resposta de erro da API
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Verifica se o erro é um AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError(error);
}

/**
 * Extrai mensagem de erro de qualquer tipo de erro
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || defaultMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

// Interface estendida do Axios com nossos métodos customizados
interface CustomAxiosInstance extends AxiosInstance {
  getProfile: () => ReturnType<typeof profileAPI.getProfile>;
  updateProfile: typeof profileAPI.updateProfile;
  uploadAvatar: typeof profileAPI.uploadAvatar;
  changePassword: typeof profileAPI.changePassword;
  getPreferences: typeof profileAPI.getPreferences;
  updatePreferences: typeof profileAPI.updatePreferences;
}

const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Métodos de autenticação
export const authAPI = {
  login: (email: string, password: string) =>
    apiInstance.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    apiInstance.post('/auth/register', { name, email, password }),
  
  logout: () => apiInstance.post('/auth/logout'),
};

// Métodos de perfil de usuário
export const profileAPI = {
  getProfile: () => apiInstance.get('/profile'),
  
  updateProfile: (data: {
    name: string;
    university: string;
    graduationYear: number;
  }) => apiInstance.put('/profile', data),
  
  uploadAvatar: (formData: FormData) =>
    apiInstance.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiInstance.put('/profile/password', data),
  
  getPreferences: () => apiInstance.get('/profile/preferences'),
  
  updatePreferences: (data: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailNotifications: boolean;
  }) => apiInstance.put('/profile/preferences', data),
};

// Métodos de prompts
export const promptsAPI = {
  getPrompts: () => apiInstance.get('/prompts'),
  
  getPromptById: (id: string) => apiInstance.get(`/prompts/${id}`),
  
  createPrompt: (data: {
    title: string;
    content: string;
    specialty: string;
    tags: string[];
  }) => apiInstance.post('/prompts', data),
  
  updatePrompt: (id: string, data: {
    title: string;
    content: string;
    specialty: string;
    tags: string[];
  }) => apiInstance.put(`/prompts/${id}`, data),
  
  deletePrompt: (id: string) => apiInstance.delete(`/prompts/${id}`),
  
  favoritePrompt: (id: string) => apiInstance.post(`/prompts/${id}/favorite`),
  
  unfavoritePrompt: (id: string) => apiInstance.delete(`/prompts/${id}/favorite`),
};

// Métodos de sessões de estudo
export const studySessionsAPI = {
  getSessions: () => apiInstance.get('/study-sessions'),
  
  getSessionById: (id: string) => apiInstance.get(`/study-sessions/${id}`),
  
  createSession: (data: {
    title: string;
    subject: string;
    notes: string;
  }) => apiInstance.post('/study-sessions', data),
  
  updateSession: (id: string, data: {
    title: string;
    subject: string;
    notes: string;
  }) => apiInstance.put(`/study-sessions/${id}`, data),
  
  deleteSession: (id: string) => apiInstance.delete(`/study-sessions/${id}`),
};

// Criar instância customizada com métodos adicionais
const api = apiInstance as CustomAxiosInstance;

// Adicionar métodos de compatibilidade
api.getProfile = profileAPI.getProfile;
api.updateProfile = profileAPI.updateProfile;
api.uploadAvatar = profileAPI.uploadAvatar;
api.changePassword = profileAPI.changePassword;
api.getPreferences = profileAPI.getPreferences;
api.updatePreferences = profileAPI.updatePreferences;

export default api;
