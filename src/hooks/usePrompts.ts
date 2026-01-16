import { useState } from 'react';
import api from '../services/api';

// Interfaces
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
  timesUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptData {
  title: string;
  content: string;
  category: string;
}

export interface UpdatePromptData {
  title?: string;
  content?: string;
  category?: string;
}

export interface PromptsFilters {
  search?: string;
  category?: string;
  isFavorite?: boolean;
  sortBy?: 'recent' | 'popular' | 'alphabetical';
}

/**
 * Hook para gerenciar prompts
 */
export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca todos os prompts do usuário com filtros opcionais
   */
  const fetchPrompts = async (filters?: PromptsFilters): Promise<Prompt[]> => {
    setLoading(true);
    setError(null);

    try {
      // Construir query string
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isFavorite !== undefined) params.append('isFavorite', String(filters.isFavorite));
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);

      const url = `/prompts${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ prompts: Prompt[] }>(url);

      setPrompts(response.data.prompts);
      return response.data.prompts;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao buscar prompts';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca um prompt específico por ID
   */
  const fetchPromptById = async (promptId: string): Promise<Prompt> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ prompt: Prompt }>(`/prompts/${promptId}`);
      return response.data.prompt;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao buscar prompt';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria um novo prompt
   */
  const createPrompt = async (data: CreatePromptData): Promise<Prompt> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ prompt: Prompt }>('/prompts', data);
      const newPrompt = response.data.prompt;

      setPrompts((prev) => [newPrompt, ...prev]);
      return newPrompt;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar prompt';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza um prompt existente
   */
  const updatePrompt = async (promptId: string, data: UpdatePromptData): Promise<Prompt> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put<{ prompt: Prompt }>(`/prompts/${promptId}`, data);
      const updatedPrompt = response.data.prompt;

      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? updatedPrompt : p))
      );

      return updatedPrompt;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar prompt';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deleta um prompt
   */
  const deletePrompt = async (promptId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/prompts/${promptId}`);

      setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar prompt';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Favorita/desfavorita um prompt
   */
  const toggleFavorite = async (promptId: string): Promise<Prompt> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ prompt: Prompt }>(`/prompts/${promptId}/favorite`);
      const updatedPrompt = response.data.prompt;

      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? updatedPrompt : p))
      );

      return updatedPrompt;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao favoritar prompt';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra uso de um prompt (incrementa timesUsed)
   */
  const usePrompt = async (promptId: string): Promise<Prompt> => {
    try {
      const response = await api.post<{ prompt: Prompt }>(`/prompts/${promptId}/use`);
      const updatedPrompt = response.data.prompt;

      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? updatedPrompt : p))
      );

      return updatedPrompt;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao registrar uso do prompt';
      throw new Error(errorMsg);
    }
  };

  /**
   * Busca categorias disponíveis
   */
  const fetchCategories = async (): Promise<string[]> => {
    try {
      const response = await api.get<{ categories: string[] }>('/prompts/categories');
      return response.data.categories;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao buscar categorias';
      throw new Error(errorMsg);
    }
  };

  /**
   * Busca prompts favoritos
   */
  const fetchFavoritePrompts = async (): Promise<Prompt[]> => {
    return fetchPrompts({ isFavorite: true });
  };

  /**
   * Busca prompts mais usados
   */
  const fetchPopularPrompts = async (): Promise<Prompt[]> => {
    return fetchPrompts({ sortBy: 'popular' });
  };

  /**
   * Busca prompts recentes
   */
  const fetchRecentPrompts = async (limit: number = 5): Promise<Prompt[]> => {
    setLoading(true);
    setError(null);

    try {
      const url = `/prompts?sortBy=recent&limit=${limit}`;
      const response = await api.get<{ prompts: Prompt[] }>(url);
      return response.data.prompts;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao buscar prompts recentes';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    prompts,
    loading,
    error,
    fetchPrompts,
    fetchPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    usePrompt,
    fetchCategories,
    fetchFavoritePrompts,
    fetchPopularPrompts,
    fetchRecentPrompts,
  };
};
