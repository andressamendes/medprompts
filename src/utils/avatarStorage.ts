/**
 * 💾 Avatar Storage - IndexedDB
 *
 * Gerencia armazenamento de avatares usando IndexedDB (OWASP A04:2021 - Insecure Design)
 *
 * Vantagens sobre localStorage:
 * - Capacidade: 50MB+ vs 5-10MB
 * - Performance: Não bloqueia thread principal
 * - Segurança: Isolamento por origem
 * - Tipagem: Suporta Blob nativo (não precisa base64)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */

const DB_NAME = 'medprompts_storage';
const DB_VERSION = 1;
const STORE_NAME = 'avatars';

/**
 * Interface para dados do avatar
 */
interface AvatarData {
  userId: string;
  blob: Blob;
  mimeType: string;
  uploadedAt: number;
  size: number;
}

/**
 * Classe para gerenciar conexão com IndexedDB
 */
class AvatarStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Inicializa conexão com IndexedDB
   * @returns Promise da conexão
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Criar object store se não existir
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'userId' });
          store.createIndex('uploadedAt', 'uploadedAt', { unique: false });

          console.info('IndexedDB: Object store criado', {
            storeName: STORE_NAME,
            version: DB_VERSION
          });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Salva avatar no IndexedDB
   * @param userId - ID do usuário
   * @param blob - Blob da imagem
   * @param mimeType - MIME type da imagem
   * @returns Promise<void>
   */
  async saveAvatar(userId: string, blob: Blob, mimeType: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const avatarData: AvatarData = {
        userId,
        blob,
        mimeType,
        uploadedAt: Date.now(),
        size: blob.size
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(avatarData);

        request.onsuccess = () => {
          console.info('Avatar salvo no IndexedDB', {
            userId,
            size: blob.size,
            mimeType
          });
          resolve();
        };

        request.onerror = () => {
          console.error('Erro ao salvar avatar:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao salvar avatar no IndexedDB:', error);
      throw new Error('Falha ao salvar avatar');
    }
  }

  /**
   * Recupera avatar do IndexedDB
   * @param userId - ID do usuário
   * @returns Promise<string | null> - URL do avatar ou null
   */
  async getAvatar(userId: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(userId);

        request.onsuccess = () => {
          const result = request.result as AvatarData | undefined;

          if (!result) {
            resolve(null);
            return;
          }

          // Cria URL do blob
          const url = URL.createObjectURL(result.blob);

          console.info('Avatar recuperado do IndexedDB', {
            userId,
            size: result.size,
            mimeType: result.mimeType,
            uploadedAt: new Date(result.uploadedAt).toISOString()
          });

          resolve(url);
        };

        request.onerror = () => {
          console.error('Erro ao recuperar avatar:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao recuperar avatar do IndexedDB:', error);
      return null;
    }
  }

  /**
   * Remove avatar do IndexedDB
   * @param userId - ID do usuário
   * @returns Promise<void>
   */
  async deleteAvatar(userId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(userId);

        request.onsuccess = () => {
          console.info('Avatar removido do IndexedDB', { userId });
          resolve();
        };

        request.onerror = () => {
          console.error('Erro ao remover avatar:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao remover avatar do IndexedDB:', error);
      throw new Error('Falha ao remover avatar');
    }
  }

  /**
   * Verifica se há avatar salvo para o usuário
   * @param userId - ID do usuário
   * @returns Promise<boolean>
   */
  async hasAvatar(userId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const request = store.get(userId);

        request.onsuccess = () => {
          resolve(!!request.result);
        };

        request.onerror = () => {
          resolve(false);
        };
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém informações do avatar sem carregar a imagem
   * @param userId - ID do usuário
   * @returns Promise<Omit<AvatarData, 'blob'> | null>
   */
  async getAvatarInfo(userId: string): Promise<Omit<AvatarData, 'blob'> | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(userId);

        request.onsuccess = () => {
          const result = request.result as AvatarData | undefined;

          if (!result) {
            resolve(null);
            return;
          }

          // Retorna info sem o blob (economiza memória)
          resolve({
            userId: result.userId,
            mimeType: result.mimeType,
            uploadedAt: result.uploadedAt,
            size: result.size
          });
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao obter info do avatar:', error);
      return null;
    }
  }

  /**
   * Limpa todos os avatares do IndexedDB
   * Útil para logout ou limpeza de dados
   * @returns Promise<void>
   */
  async clearAllAvatars(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
          console.info('Todos os avatares foram removidos do IndexedDB');
          resolve();
        };

        request.onerror = () => {
          console.error('Erro ao limpar avatares:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao limpar avatares do IndexedDB:', error);
      throw new Error('Falha ao limpar avatares');
    }
  }

  /**
   * Migra avatar do localStorage para IndexedDB
   * @param userId - ID do usuário
   * @param dataUrl - Data URL do localStorage
   * @returns Promise<boolean> - true se migrado com sucesso
   */
  async migrateFromLocalStorage(userId: string, dataUrl: string): Promise<boolean> {
    try {
      // Valida data URL
      if (!dataUrl.startsWith('data:image/')) {
        console.warn('Data URL inválida para migração');
        return false;
      }

      // Converte data URL para Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Extrai MIME type
      const mimeTypeMatch = dataUrl.match(/^data:([^;]+);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

      // Salva no IndexedDB
      await this.saveAvatar(userId, blob, mimeType);

      console.info('Avatar migrado do localStorage para IndexedDB', {
        userId,
        fromSize: dataUrl.length,
        toSize: blob.size,
        mimeType
      });

      return true;
    } catch (error) {
      console.error('Erro ao migrar avatar do localStorage:', error);
      return false;
    }
  }
}

/**
 * Instância global do gerenciador
 */
export const avatarStorage = new AvatarStorageManager();

/**
 * Converte File para Blob (helper function)
 * @param file - Arquivo a ser convertido
 * @returns Promise<Blob>
 */
export const fileToBlob = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) {
        reject(new Error('Falha ao ler arquivo'));
        return;
      }

      // Cria blob a partir do ArrayBuffer
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};
