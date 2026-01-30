/**
 * 🔒 Security Utilities
 *
 * Implementa sanitização e validação de conteúdo para prevenir XSS
 *
 * Features:
 * - Sanitização de URLs de imagem (data URLs e HTTP(S))
 * - Validação de formato de Data URLs
 * - Proteção contra XSS em avatar previews
 *
 * @see https://owasp.org/www-community/attacks/xss/
 */

import DOMPurify from 'dompurify';

/**
 * Sanitiza URL de imagem para prevenir XSS
 * @param url - URL a ser sanitizada (data URL ou HTTP(S))
 * @returns URL sanitizada ou string vazia se inválida
 */
export const sanitizeImageUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Valida e sanitiza Data URLs (base64)
  if (url.startsWith('data:image/')) {
    // Valida formato básico de data URL
    const dataUrlRegex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)$/;

    if (!dataUrlRegex.test(url)) {
      console.warn('Data URL com formato inválido detectado');
      return '';
    }

    // Sanitiza usando DOMPurify (remove scripts embutidos)
    return DOMPurify.sanitize(url, {
      ALLOWED_URI_REGEXP: /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/,
      ALLOWED_TAGS: [], // Não permite tags HTML em data URLs
      ALLOWED_ATTR: []
    });
  }

  // Valida URLs HTTP(S)
  if (url.match(/^https?:\/\//)) {
    try {
      const urlObj = new URL(url);

      // Apenas permite HTTP(S)
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        console.warn('Protocolo não permitido:', urlObj.protocol);
        return '';
      }

      // Retorna URL original (URLs externas são consideradas seguras)
      return url;
    } catch (error) {
      console.warn('URL malformada:', error);
      return '';
    }
  }

  // Valida Blob URLs (criadas com URL.createObjectURL)
  if (url.startsWith('blob:')) {
    // Blob URLs são seguras pois são geradas pelo navegador
    return url;
  }

  // Rejeita qualquer outro formato
  console.warn('Formato de URL não permitido:', url.substring(0, 50));
  return '';
};

/**
 * Sanitiza HTML genérico para prevenir XSS
 * @param html - HTML a ser sanitizado
 * @returns HTML sanitizado
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel']
  });
};

/**
 * Valida se uma string é um Data URL válido
 * @param url - String a ser validada
 * @returns true se for data URL válido
 */
export const isValidDataUrl = (url: string): boolean => {
  const dataUrlRegex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)$/;
  return dataUrlRegex.test(url);
};

/**
 * Remove caracteres potencialmente perigosos de strings
 * @param input - String de entrada
 * @returns String sanitizada
 */
export const sanitizeString = (input: string): string => {
  // Remove caracteres de controle e null bytes (intencional para sanitização)
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, '');
};

/**
 * Valida e sanitiza nome de arquivo
 * @param filename - Nome do arquivo
 * @returns Nome de arquivo sanitizado
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts e caracteres perigosos
  return filename
    .replace(/[/\\]/g, '') // Remove slashes
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove caracteres inválidos no Windows
    .substring(0, 255); // Limita tamanho
};
