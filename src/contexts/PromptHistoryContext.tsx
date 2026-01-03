import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const PromptHistoryContext = createContext<PromptHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'medprompts_history';
const MAX_HISTORY_SIZE = 50;

export function PromptHistoryProvider({ children }: { children: ReactNode }) {
  const logger = useLogger();
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);

  // Carrega histórico do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
        logger.info('Histórico de prompts carregado', {
          historySize: parsed.length,
        });
      }
    } catch (error) {
      logger.error('Erro ao carregar histórico de prompts', error as Error);
    }
  }, [logger]);

  // Salva histórico no localStorage quando muda
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        logger.error('Erro ao salvar histórico de prompts', error as Error);
      }
    }
  }, [history, logger]);

  const addToHistory = (prompt: { id: string; title: string; category: string }) => {
    setHistory((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.id === prompt.id);
      const now = Date.now();

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
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    logger.info('Histórico de prompts limpo');
  };

  const getRecentPrompts = (limit = 10): PromptHistoryEntry[] => {
    return [...history]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  const getMostViewed = (limit = 10): PromptHistoryEntry[] => {
    return [...history]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  };

  return (
    <PromptHistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        getRecentPrompts,
        getMostViewed,
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
