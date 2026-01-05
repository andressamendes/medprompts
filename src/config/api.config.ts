/**
 * Configuração centralizada da API
 * Define base URL, timeout e headers padrão
 */

// Base URL da API (vem do .env)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Timeout padrão (10 segundos)
export const API_TIMEOUT = 10000;

// Headers padrão
export const API_HEADERS = {
  'Content-Type': 'application/json',
};

// Configuração do Axios
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: API_HEADERS,
};

// Keys de localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'encrypted_accessToken',
  REFRESH_TOKEN: 'encrypted_refreshToken',
  USER:  'encrypted_user',
};

// Log em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔗 API configurada:', API_BASE_URL);
}