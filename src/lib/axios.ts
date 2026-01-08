import axios from 'axios';

/**
 * Configuração global do Axios para comunicação com o backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para adicionar token de autenticação em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medprompts-token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para tratamento de erros de resposta
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado ou inválido
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      // Lista de rotas públicas que NÃO devem forçar logout
      const publicRoutes = ['/', '/prompts', '/login', '/register', '/guia-ias', '/recursos', '/focus-zone'];
      
      // Só remove token e redireciona se estiver em rota protegida
      if (!publicRoutes.includes(currentPath)) {
        localStorage.removeItem('medprompts-token');
        localStorage.removeItem('medprompts-user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
