import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const {
  ENCRYPTION_KEY = '',
  ENCRYPTION_IV = ''
} = process.env;

// Validação de configuração
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 64) {
  logger.warn('⚠️ ENCRYPTION_KEY não configurada ou muito curta. Usando chave temporária (NÃO USE EM PRODUÇÃO)');
}

if (!ENCRYPTION_IV || ENCRYPTION_IV.length < 32) {
  logger.warn('⚠️ ENCRYPTION_IV não configurada ou muito curta. Usando IV temporário (NÃO USE EM PRODUÇÃO)');
}

/**
 * Criptografa texto usando AES-256-CBC
 * @param text - Texto a ser criptografado
 * @returns Texto criptografado em formato hexadecimal
 */
export const encrypt = (text: string): string => {
  try {
    if (!text || text.trim() === '') {
      return '';
    }

    // Usando crypto nativo do Node.js para AES-256
    const key = Buffer.from(ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 64), 'hex');
    const iv = Buffer.from(ENCRYPTION_IV || crypto.randomBytes(16).toString('hex').slice(0, 32), 'hex');
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    logger.error('Erro ao criptografar dados:', error);
    throw new Error('Falha na criptografia de dados');
  }
};

/**
 * Descriptografa texto usando AES-256-CBC
 * @param encryptedText - Texto criptografado em hexadecimal
 * @returns Texto original descriptografado
 */
export const decrypt = (encryptedText: string): string => {
  try {
    if (!encryptedText || encryptedText.trim() === '') {
      return '';
    }

    const key = Buffer.from(ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 64), 'hex');
    const iv = Buffer.from(ENCRYPTION_IV || crypto.randomBytes(16).toString('hex').slice(0, 32), 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Erro ao descriptografar dados:', error);
    throw new Error('Falha na descriptografia de dados');
  }
};

/**
 * Hash unidirecional usando SHA-256 (para dados que não precisam ser recuperados)
 * @param text - Texto a ser hasheado
 * @returns Hash SHA-256 em hexadecimal
 */
export const hash = (text: string): string => {
  try {
    return crypto.createHash('sha256').update(text).digest('hex');
  } catch (error) {
    logger.error('Erro ao gerar hash:', error);
    throw new Error('Falha ao gerar hash');
  }
};

/**
 * Gera chave de criptografia aleatória (32 bytes = 256 bits)
 * Usar para gerar ENCRYPTION_KEY no .env
 * @returns Chave hexadecimal de 64 caracteres
 */
export const generateEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Gera IV (Initialization Vector) aleatório (16 bytes = 128 bits)
 * Usar para gerar ENCRYPTION_IV no .env
 * @returns IV hexadecimal de 32 caracteres
 */
export const generateIV = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Criptografa objeto JSON completo
 * @param obj - Objeto a ser criptografado
 * @returns String JSON criptografada
 */
export const encryptObject = (obj: any): string => {
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
  } catch (error) {
    logger.error('Erro ao criptografar objeto:', error);
    throw new Error('Falha ao criptografar objeto');
  }
};

/**
 * Descriptografa objeto JSON
 * @param encryptedString - String criptografada
 * @returns Objeto original
 */
export const decryptObject = <T = any>(encryptedString: string): T => {
  try {
    const decryptedString = decrypt(encryptedString);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    logger.error('Erro ao descriptografar objeto:', error);
    throw new Error('Falha ao descriptografar objeto');
  }
};

/**
 * Criptografa campos sensíveis de um objeto mantendo outros campos
 * @param obj - Objeto com dados
 * @param fieldsToEncrypt - Array de campos a criptografar
 * @returns Objeto com campos especificados criptografados
 */
export const encryptFields = <T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T => {
  try {
    const result = { ...obj };
    
    fieldsToEncrypt.forEach(field => {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = encrypt(result[field] as string) as any;
      }
    });
    
    return result;
  } catch (error) {
    logger.error('Erro ao criptografar campos:', error);
    throw new Error('Falha ao criptografar campos específicos');
  }
};

/**
 * Descriptografa campos de um objeto
 * @param obj - Objeto com dados criptografados
 * @param fieldsToDecrypt - Array de campos a descriptografar
 * @returns Objeto com campos especificados descriptografados
 */
export const decryptFields = <T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T => {
  try {
    const result = { ...obj };
    
    fieldsToDecrypt.forEach(field => {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = decrypt(result[field] as string) as any;
      }
    });
    
    return result;
  } catch (error) {
    logger.error('Erro ao descriptografar campos:', error);
    throw new Error('Falha ao descriptografar campos específicos');
  }
};

// Log de inicialização
logger.info('🔐 Sistema de criptografia AES-256 inicializado');

export default {
  encrypt,
  decrypt,
  hash,
  generateEncryptionKey,
  generateIV,
  encryptObject,
  decryptObject,
  encryptFields,
  decryptFields
};
