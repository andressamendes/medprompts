/**
 * 🔐 File Validation Utilities
 *
 * Implementa validação robusta de arquivos usando Magic Bytes (OWASP A03:2021)
 *
 * Features:
 * - Validação de magic bytes (assinaturas reais dos arquivos)
 * - Validação de MIME type e extensão
 * - Limite de tamanho de arquivo
 * - Prevenção de upload de arquivos maliciosos disfarçados
 *
 * @see https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload
 */

/**
 * Magic Bytes (assinaturas de arquivos) permitidos
 * Cada tipo de imagem tem uma assinatura única nos primeiros bytes
 */
const ALLOWED_IMAGE_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF], // JPEG/JPG
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  'image/webp': [0x52, 0x49, 0x46, 0x46], // WEBP (RIFF header)
};

/**
 * Extensões de arquivo permitidas
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * MIME types permitidos
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Tamanho máximo de arquivo (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB em bytes

/**
 * Interface de resultado de validação
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    size?: number;
    type?: string;
    extension?: string;
  };
}

/**
 * Lê os primeiros bytes de um arquivo
 * @param file - Arquivo a ser lido
 * @param bytesToRead - Número de bytes a ler
 * @returns Array de bytes
 */
const readFileBytes = async (file: File, bytesToRead: number): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        const arr = new Uint8Array(e.target.result as ArrayBuffer);
        resolve(arr);
      } else {
        reject(new Error('Falha ao ler arquivo'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    // Lê apenas os primeiros bytes necessários
    const blob = file.slice(0, bytesToRead);
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Valida se os magic bytes do arquivo correspondem ao MIME type
 * @param fileBytes - Primeiros bytes do arquivo
 * @param mimeType - MIME type declarado
 * @returns true se os magic bytes correspondem
 */
const validateMagicBytes = (fileBytes: Uint8Array, mimeType: string): boolean => {
  const signature = ALLOWED_IMAGE_SIGNATURES[mimeType];

  if (!signature) {
    console.warn('MIME type não reconhecido:', mimeType);
    return false;
  }

  // Verifica se os primeiros bytes correspondem à assinatura
  for (let i = 0; i < signature.length; i++) {
    if (fileBytes[i] !== signature[i]) {
      console.warn(
        `Magic byte mismatch: esperado ${signature[i].toString(16)}, ` +
        `encontrado ${fileBytes[i]?.toString(16)} na posição ${i}`
      );
      return false;
    }
  }

  return true;
};

/**
 * Valida arquivo de imagem de forma robusta
 * @param file - Arquivo a ser validado
 * @returns Resultado da validação com detalhes
 */
export const validateImageFile = async (file: File): Promise<ValidationResult> => {
  try {
    // 1️⃣ Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB`,
        details: {
          size: file.size,
          type: file.type,
        },
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: 'Arquivo vazio',
        details: {
          size: 0,
          type: file.type,
        },
      };
    }

    // 2️⃣ Validação de extensão
    const extension = ('.' + file.name.split('.').pop()?.toLowerCase()) || '';

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Extensão não permitida. Permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`,
        details: {
          extension,
          size: file.size,
          type: file.type,
        },
      };
    }

    // 3️⃣ Validação de MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Permitidos: imagens JPEG, PNG, WebP`,
        details: {
          type: file.type,
          extension,
          size: file.size,
        },
      };
    }

    // 4️⃣ Validação de Magic Bytes (assinatura real do arquivo)
    // Lê os primeiros 10 bytes (suficiente para PNG que tem 8 bytes)
    const fileBytes = await readFileBytes(file, 10);

    if (!validateMagicBytes(fileBytes, file.type)) {
      return {
        valid: false,
        error: 'Arquivo corrompido ou tipo incorreto. A assinatura do arquivo não corresponde ao tipo declarado.',
        details: {
          type: file.type,
          extension,
          size: file.size,
        },
      };
    }

    // ✅ Arquivo válido
    return {
      valid: true,
      details: {
        type: file.type,
        extension,
        size: file.size,
      },
    };

  } catch (error) {
    console.error('Erro ao validar arquivo:', error);
    return {
      valid: false,
      error: 'Erro ao processar arquivo. Tente novamente.',
    };
  }
};

/**
 * Rate limiter simples para uploads
 * Previne spam de uploads
 */
class UploadRateLimiter {
  private lastUploadTime = 0;
  private readonly cooldownMs = 60000; // 60 segundos

  /**
   * Verifica se pode fazer upload
   * @returns true se permitido, false se em cooldown
   */
  canUpload(): boolean {
    const now = Date.now();
    const timeSinceLastUpload = now - this.lastUploadTime;

    if (timeSinceLastUpload < this.cooldownMs) {
      return false;
    }

    this.lastUploadTime = now;
    return true;
  }

  /**
   * Retorna tempo restante de cooldown em segundos
   * @returns Segundos restantes ou 0
   */
  getCooldownRemaining(): number {
    const now = Date.now();
    const timeSinceLastUpload = now - this.lastUploadTime;
    const remaining = this.cooldownMs - timeSinceLastUpload;

    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  /**
   * Reseta o rate limiter (para testes ou logout)
   */
  reset(): void {
    this.lastUploadTime = 0;
  }
}

/**
 * Instância global do rate limiter
 */
export const uploadRateLimiter = new UploadRateLimiter();
