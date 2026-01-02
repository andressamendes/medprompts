import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useSecureStorage } from '@/hooks/useSecureStorage';

type Theme = 'light' | 'dark';

const THEME_KEY = 'medprompts-theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  isDark: boolean;
  isLoading: boolean;
  error: Error | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Detecta preferência do sistema como fallback
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme: Theme = systemPrefersDark ? 'dark' : 'light';

  // Usa hook seguro com criptografia AES-256
  const [theme, setThemeStorage, , isLoading, error] = useSecureStorage<Theme>(
    THEME_KEY,
    defaultTheme
  );

  /**
   * Alterna entre light e dark
   */
  const toggleTheme = useCallback(async () => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      await setThemeStorage(newTheme);
      
      // Aplica classe no documento para Tailwind
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    } catch (err) {
      console.error('Erro ao alternar tema:', err);
    }
  }, [theme, setThemeStorage]);

  /**
   * Define tema específico
   */
  const setTheme = useCallback(
    async (newTheme: Theme) => {
      try {
        await setThemeStorage(newTheme);
        
        // Aplica classe no documento
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      } catch (err) {
        console.error('Erro ao definir tema:', err);
      }
    },
    [setThemeStorage]
  );

  // Aplica tema inicial ao carregar
  if (!isLoading && theme) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark',
        isLoading,
        error,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}
