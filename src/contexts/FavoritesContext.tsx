import { createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { useSecureStorage } from '@/hooks/useSecureStorage';
import { logger } from '@/utils/logger';

const FAVORITES_KEY = 'medprompts-favorites';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
  count: number;
  isLoading: boolean;
  error: Error | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Usa hook seguro com criptografia AES-256
  const [favorites, setFavorites, clearStorage, isLoading, error] = useSecureStorage<string[]>(
    FAVORITES_KEY,
    []
  );

  // Log quando favoritos são carregados
  useEffect(() => {
    if (!isLoading && favorites.length > 0) {
      logger.debug('Favoritos carregados', {
        count: favorites.length,
        encrypted: true,
      });
    }
  }, [isLoading, favorites.length]);

  // Log de erros
  useEffect(() => {
    if (error) {
      logger.error('Erro no sistema de favoritos', error, {
        favoritesCount: favorites.length,
        storageKey: FAVORITES_KEY,
      });
    }
  }, [error, favorites.length]);

  /**
   * Adiciona ou remove favorito
   * Agora é async porque a encriptação é assíncrona
   */
  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!id) {
        logger.warn('Tentativa de alternar favorito sem ID');
        return;
      }

      const wasAlreadyFavorite = favorites.includes(id);

      try {
        await setFavorites((prev) =>
          prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );

        logger.info(wasAlreadyFavorite ? 'Favorito removido' : 'Favorito adicionado', {
          promptId: id,
          action: wasAlreadyFavorite ? 'remove' : 'add',
          totalFavorites: wasAlreadyFavorite ? favorites.length - 1 : favorites.length + 1,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        logger.error('Erro ao alternar favorito', err as Error, {
          promptId: id,
          wasAlreadyFavorite,
          currentFavoritesCount: favorites.length,
        });
        console.error('Erro ao alternar favorito:', err);
      }
    },
    [setFavorites, favorites]
  );

  /**
   * Verifica se prompt está nos favoritos
   * Continua síncrono para não quebrar componentes
   */
  const isFavorite = useCallback(
    (id: string) => {
      if (!id) return false;
      return favorites.includes(id);
    },
    [favorites]
  );

  /**
   * Limpa todos os favoritos
   */
  const clearFavorites = useCallback(() => {
    const previousCount = favorites.length;

    logger.info('Todos os favoritos limpos', {
      previousCount,
      timestamp: new Date().toISOString(),
    });

    clearStorage();
  }, [clearStorage, favorites.length]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        count: favorites.length,
        isLoading,
        error,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  
  if (context === undefined) {
    logger.error('useFavorites usado fora do FavoritesProvider', new Error('Context error'), {
      stack: new Error().stack,
    });
    throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  }
  
  return context;
}
