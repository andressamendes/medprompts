import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useSecureStorage } from '@/hooks/useSecureStorage';
import { useLogger } from '@/utils/logger';

export interface PromptHistoryEntry {
  id: string;
  title: string;
  category: string;
  timestamp: number;
  viewCount: number;
}

interface PromptHistoryContextType {
  history: PromptHistoryEntry[];
  addToHistory: (prompt: { id: string; title: string; category: string }) => void;
  clearHistory: () => void;
  getRecentPrompts: (limit?: number) => PromptHistoryEntry[];
  getMostViewed: (limit?: number) => PromptHistoryEntry[];
  isLoading: boolean;
}

const PromptHistoryContext = createContext<PromptHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'medprompts_history';
const MAX_HISTORY_SIZE = 50;

export function PromptHistoryProvider({ children }: { children: ReactNode }) {
  const logger = useLogger();

  // Usa armazenamento seguro com criptografia AES-256
  const [history, setHistory, clearStorage, isLoading] = useSecureStorage<PromptHistoryEntry[]>(
    STORAGE_KEY,
    []
  );

  const addToHistory = useCallback((prompt: { id: string; title: string; category: string }) => {
    const now = Date.now();

    setHistory((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.id === prompt.id);
      let newHistory: PromptHistoryEntry[];

      if (existingIndex !== -1) {
        // Atualiza entrada existente
        newHistory = [...prev];
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          timestamp: now,
          viewCount: newHistory[existingIndex].viewCount + 1,
        };
      } else {
        // Adiciona nova entrada
        const newEntry: PromptHistoryEntry = {
          id: prompt.id,
          title: prompt.title,
          category: prompt.category,
          timestamp: now,
          viewCount: 1,
        };
        newHistory = [newEntry, ...prev];
      }

      // Limita tamanho do histórico
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory = newHistory.slice(0, MAX_HISTORY_SIZE);
      }

      logger.debug('Prompt adicionado ao histórico', {
        promptId: prompt.id,
        promptTitle: prompt.title,
        totalHistory: newHistory.length,
      });

      return newHistory;
    });
  }, [setHistory, logger]);

  const clearHistory = useCallback(() => {
    clearStorage();
    logger.info('Histórico de prompts limpo');
  }, [clearStorage, logger]);

  const getRecentPrompts = useCallback((limit = 10): PromptHistoryEntry[] => {
    return [...history]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, [history]);

  const getMostViewed = useCallback((limit = 10): PromptHistoryEntry[] => {
    return [...history]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }, [history]);

  return (
    <PromptHistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        getRecentPrompts,
        getMostViewed,
        isLoading,
      }}
    >
      {children}
    </PromptHistoryContext.Provider>
  );
}

export function usePromptHistory() {
  const context = useContext(PromptHistoryContext);
  if (context === undefined) {
    throw new Error('usePromptHistory deve ser usado dentro de PromptHistoryProvider');
  }
  return context;
}
