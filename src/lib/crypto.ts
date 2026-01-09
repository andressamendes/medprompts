/**
 * Sistema de criptografia AES-256-GCM para dados sensíveis
 * Utiliza Web Crypto API nativa do navegador para máxima segurança
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recomendado para GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Gera uma chave de criptografia a partir de uma senha
 * Usa PBKDF2 com salt aleatório para derivar chave forte
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Importa a senha como chave raw
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Deriva chave AES a partir da senha
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Gera ID único do dispositivo para usar como senha base
 * Combina múltiplos fatores para criar identificador único
 */
function getDeviceId(): string {
  const factors = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width + 'x' + screen.height,
    window.location.hostname,
  ];
  
  return btoa(factors.join('|'));
}

/**
 * Encripta dados usando AES-256-GCM
 * @param data - Dados a serem encriptados (serão convertidos para JSON)
 * @returns String Base64 contendo salt + iv + dados encriptados
 */
export async function encryptData(data: unknown): Promise<string> {
  try {
    const password = getDeviceId();
    const encoder = new TextEncoder();
    
    // Converte dados para JSON e depois para buffer
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);

    // Gera salt e IV aleatórios
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Deriva chave a partir da senha
    const key = await deriveKey(password, salt);

    // Encripta os dados
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv as BufferSource },
      key,
      dataBuffer
    );

    // Combina salt + iv + dados encriptados
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(
      SALT_LENGTH + IV_LENGTH + encryptedArray.length
    );
    
    combined.set(salt, 0);
    combined.set(iv, SALT_LENGTH);
    combined.set(encryptedArray, SALT_LENGTH + IV_LENGTH);

    // Converte para Base64 para armazenamento
    const combinedArray = Array.from(combined);
    let binaryString = '';
    for (let i = 0; i < combinedArray.length; i++) {
      binaryString += String.fromCharCode(combinedArray[i]);
    }
    return btoa(binaryString);
  } catch (error) {
    console.error('Erro ao encriptar dados:', error);
    throw new Error('Falha na encriptação de dados');
  }
}

/**
 * Decripta dados usando AES-256-GCM
 * @param encryptedData - String Base64 contendo dados encriptados
 * @returns Dados originais desencriptados
 */
export async function decryptData<T>(encryptedData: string): Promise<T> {
  try {
    const password = getDeviceId();
    const decoder = new TextDecoder();

    // Converte de Base64 para buffer
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    // Extrai salt, iv e dados encriptados
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encryptedBuffer = combined.slice(SALT_LENGTH + IV_LENGTH);

    // Deriva chave a partir da senha
    const key = await deriveKey(password, salt);

    // Decripta os dados
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv as BufferSource },
      key,
      encryptedBuffer
    );

    // Converte buffer para string JSON e depois para objeto
    const decryptedString = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Erro ao decriptar dados:', error);
    throw new Error('Falha na decriptação de dados');
  }
}

/**
 * Verifica se a Web Crypto API está disponível
 */
export function isCryptoSupported(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.subtle &&
    typeof window.crypto.subtle.encrypt === 'function' &&
    typeof window.crypto.subtle.decrypt === 'function'
  );
}
