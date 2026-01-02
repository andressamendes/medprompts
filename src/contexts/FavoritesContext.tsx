import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useSecureStorage } from '@/hooks/useSecureStorage';

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

  /**
   * Adiciona ou remove favorito
   * Agora é async porque a encriptação é assíncrona
   */
  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!id) return;

      try {
        await setFavorites((prev) =>
          prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
      } catch (err) {
        console.error('Erro ao alternar favorito:', err);
      }
    },
    [setFavorites]
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
    clearStorage();
  }, [clearStorage]);

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
    throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  }
  return context;
}
