import { useState, useEffect, useCallback } from 'react';
import { encryptData, decryptData, isCryptoSupported } from '@/lib/crypto';

/**
 * Hook customizado para armazenamento seguro com criptografia AES-256
 * Substitui localStorage com encriptação automática
 * 
 * @param key - Chave única para identificar o valor no storage
 * @param initialValue - Valor inicial se não houver dado armazenado
 * @returns [value, setValue, removeValue, isLoading, error]
 * 
 * @example
 * const [user, setUser, removeUser] = useSecureStorage('user', null);
 */
export function useSecureStorage<T>(
  key: string,
  initialValue: T
): [
  T,
  (value: T | ((prev: T) => T)) => Promise<void>,
  () => void,
  boolean,
  Error | null
] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Prefixo para todas as chaves encriptadas
  const ENCRYPTED_PREFIX = 'encrypted_';
  const storageKey = `${ENCRYPTED_PREFIX}${key}`;

  /**
   * Carrega e decripta valor inicial do localStorage
   */
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Verifica se Web Crypto API está disponível
        if (!isCryptoSupported()) {
          console.warn('Web Crypto API não disponível, usando localStorage padrão');
          const item = window.localStorage.getItem(key);
          if (item) {
            setStoredValue(JSON.parse(item));
          }
          return;
        }

        const encryptedItem = window.localStorage.getItem(storageKey);
        
        if (encryptedItem) {
          // Decripta o valor armazenado
          const decryptedValue = await decryptData<T>(encryptedItem);
          setStoredValue(decryptedValue);
        } else {
          // Migra dados antigos não encriptados se existirem
          const oldItem = window.localStorage.getItem(key);
          if (oldItem) {
            const parsedValue = JSON.parse(oldItem);
            setStoredValue(parsedValue);
            
            // Encripta e migra para novo formato
            const encrypted = await encryptData(parsedValue);
            window.localStorage.setItem(storageKey, encrypted);
            window.localStorage.removeItem(key); // Remove versão antiga
          }
        }
      } catch (err) {
        console.error(`Erro ao carregar ${key} do storage:`, err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
        
        // Fallback: tenta carregar versão não encriptada
        try {
          const item = window.localStorage.getItem(key);
          if (item) {
            setStoredValue(JSON.parse(item));
          }
        } catch {
          // Se tudo falhar, usa valor inicial
          setStoredValue(initialValue);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key, storageKey, initialValue]);

  /**
   * Salva valor encriptado no localStorage
   */
  const setValue = useCallback(
    async (value: T | ((prev: T) => T)) => {
      // Resolve valor se for função (FORA do try)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      try {
        setError(null);
        
        // Atualiza estado imediatamente
        setStoredValue(valueToStore);

        // Verifica se Web Crypto API está disponível
        if (!isCryptoSupported()) {
          console.warn('Web Crypto API não disponível, usando localStorage padrão');
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return;
        }

        // Encripta e salva
        const encrypted = await encryptData(valueToStore);
        window.localStorage.setItem(storageKey, encrypted);

        // Dispara evento customizado para sincronização entre abas
        window.dispatchEvent(
          new CustomEvent('secure-storage-change', {
            detail: { key, value: valueToStore },
          })
        );
      } catch (err) {
        console.error(`Erro ao salvar ${key} no storage:`, err);
        setError(err instanceof Error ? err : new Error('Erro ao salvar dados'));
        
        // Fallback: tenta salvar sem encriptação
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (fallbackErr) {
          console.error('Falha total ao salvar dados:', fallbackErr);
        }
      }
    },
    [key, storageKey, storedValue]
  );

  /**
   * Remove valor do localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(key); // Remove também versão antiga se existir

      // Dispara evento de remoção
      window.dispatchEvent(
        new CustomEvent('secure-storage-change', {
          detail: { key, value: null },
        })
      );
    } catch (err) {
      console.error(`Erro ao remover ${key} do storage:`, err);
      setError(err instanceof Error ? err : new Error('Erro ao remover dados'));
    }
  }, [key, storageKey, initialValue]);

  /**
   * Sincroniza mudanças entre abas/janelas
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Evento nativo do localStorage
        if (e.key === storageKey && e.newValue) {
          decryptData<T>(e.newValue)
            .then(setStoredValue)
            .catch((err) => {
              console.error('Erro ao sincronizar storage:', err);
            });
        }
      } else {
        // Evento customizado (mesma aba)
        const detail = (e as CustomEvent).detail;
        if (detail.key === key) {
          setStoredValue(detail.value ?? initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('secure-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('secure-storage-change', handleStorageChange as EventListener);
    };
  }, [key, storageKey, initialValue]);

  return [storedValue, setValue, removeValue, isLoading, error];
}
