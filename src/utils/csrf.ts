/**
 * 🛡️ CSRF Protection Utilities
 *
 * Implementa proteção contra Cross-Site Request Forgery (OWASP A01:2021)
 *
 * Features:
 * - Token generation com Web Crypto API
 * - Validação segura de tokens
 * - Armazenamento em sessionStorage (limpa ao fechar tab)
 *
 * @see https://owasp.org/www-community/attacks/csrf
 */

/**
 * Gera um token CSRF criptograficamente seguro
 * @returns Token hexadecimal de 64 caracteres (32 bytes)
 */
export const generateCSRFToken = (): string => {
  try {
    // Gera 32 bytes aleatórios (256 bits)
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);

    // Converte para hexadecimal
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Erro ao gerar CSRF token:', error);
    throw new Error('Falha ao gerar token de segurança');
  }
};

/**
 * Valida se o token CSRF fornecido corresponde ao armazenado
 * @param token - Token a ser validado
 * @returns true se válido, false caso contrário
 */
export const validateCSRFToken = (token: string): boolean => {
  try {
    // Busca token armazenado
    const storedToken = sessionStorage.getItem('csrf_token');

    // Validações básicas
    if (!storedToken || !token) {
      console.warn('CSRF token ausente');
      return false;
    }

    // Valida formato (64 caracteres hexadecimais)
    if (token.length !== 64 || !/^[0-9a-f]{64}$/i.test(token)) {
      console.warn('CSRF token com formato inválido');
      return false;
    }

    // Comparação em tempo constante (previne timing attacks)
    if (token.length !== storedToken.length) {
      return false;
    }

    let mismatch = 0;
    for (let i = 0; i < token.length; i++) {
      mismatch |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
    }

    return mismatch === 0;
  } catch (error) {
    console.error('Erro ao validar CSRF token:', error);
    return false;
  }
};

/**
 * Inicializa um novo token CSRF e armazena em sessionStorage
 * @returns O token gerado
 */
export const initCSRFToken = (): string => {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Remove o token CSRF do sessionStorage
 * Útil ao fazer logout ou após operações sensíveis
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem('csrf_token');
};

/**
 * Obtém o token CSRF atual ou gera um novo se não existir
 * @returns O token CSRF
 */
export const getOrCreateCSRFToken = (): string => {
  const existingToken = sessionStorage.getItem('csrf_token');

  if (existingToken && existingToken.length === 64) {
    return existingToken;
  }

  return initCSRFToken();
};
