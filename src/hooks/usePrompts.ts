import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

// Interfaces de Prompt
export interface Prompt {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdatePromptData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface PromptsFilters {
  category?: string;
  tags?: string[];
  search?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  sortBy?: 'createdAt' | 'usageCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook personalizado para gerenciar prompts
 */
export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lista todos os prompts do usuário
   */
  const fetchPrompts = useCallback(async (filters?: PromptsFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.isPublic !== undefined) params.append('isPublic', String(filters.isPublic));
      if (filters?.isFavorite !== undefined) params.append('isFavorite', String(filters.isFavorite));
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = `/prompts${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<{ prompts: Prompt[] }>(url);
      setPrompts(response.data.prompts);
    } catch (err: any) {
      console.error('Erro ao buscar prompts:', err);
      setError(err.message || 'Erro ao buscar prompts');
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca um prompt específico por ID
   */
  const getPromptById = useCallback(async (promptId: string): Promise<Prompt | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ prompt: Prompt }>(`/prompts/${promptId}`);
      return response.data.prompt;
    } catch (err: any) {
      console.error('Erro ao buscar prompt:', err);
      setError(err.message || 'Erro ao buscar prompt');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria novo prompt
   */
  const createPrompt = useCallback(async (data: CreatePromptData): Promise<Prompt | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<{ prompt: Prompt }>('/prompts', data);
      const newPrompt = response.data.prompt;

      // Adiciona prompt à lista local
      setPrompts((prev) => [newPrompt, ...prev]);

      return newPrompt;
    } catch (err: any) {
      console.error('Erro ao criar prompt:', err);
      setError(err.message || 'Erro ao criar prompt');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza prompt existente
   */
  const updatePrompt = useCallback(async (promptId: string, data: UpdatePromptData): Promise<Prompt | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put<{ prompt: Prompt }>(`/prompts/${promptId}`, data);
      const updatedPrompt = response.data.prompt;

      // Atualiza prompt na lista local
      setPrompts((prev) =>
        prev.map((prompt) => (prompt.id === promptId ? updatedPrompt : prompt))
      );

      return updatedPrompt;
    } catch (err: any) {
      console.error('Erro ao atualizar prompt:', err);
      setError(err.message || 'Erro ao atualizar prompt');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Deleta prompt
   */
  const deletePrompt = useCallback(async (promptId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(`/prompts/${promptId}`);

      // Remove prompt da lista local
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));

      return true;
    } catch (err: any) {
      console.error('Erro ao deletar prompt:', err);
      setError(err.message || 'Erro ao deletar prompt');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marca/desmarca prompt como favorito
   */
  const toggleFavorite = useCallback(async (promptId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<{ prompt: Prompt }>(`/prompts/${promptId}/favorite`);
      const updatedPrompt = response.data.prompt;

      // Atualiza prompt na lista local
      setPrompts((prev) =>
        prev.map((prompt) => (prompt.id === promptId ? updatedPrompt : prompt))
      );

      return true;
    } catch (err: any) {
      console.error('Erro ao favoritar prompt:', err);
      setError(err.message || 'Erro ao favoritar prompt');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Incrementa contador de uso do prompt
   */
  const incrementUsage = useCallback(async (promptId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<{ prompt: Prompt }>(`/prompts/${promptId}/use`);
      const updatedPrompt = response.data.prompt;

      // Atualiza prompt na lista local
      setPrompts((prev) =>
        prev.map((prompt) => (prompt.id === promptId ? updatedPrompt : prompt))
      );

      return true;
    } catch (err: any) {
      console.error('Erro ao incrementar uso:', err);
      return false;
    }
  }, []);

  /**
   * Copia texto do prompt para área de transferência
   */
  const copyPromptToClipboard = useCallback(async (prompt: Prompt): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      
      // Incrementa contador de uso
      await incrementUsage(prompt.id);
      
      return true;
    } catch (err) {
      console.error('Erro ao copiar prompt:', err);
      return false;
    }
  }, [incrementUsage]);

  /**
   * Busca prompts públicos (community)
   */
  const fetchPublicPrompts = useCallback(async (filters?: PromptsFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('isPublic', 'true');
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = `/prompts/public?${queryString}`;

      const response = await apiClient.get<{ prompts: Prompt[] }>(url);
      setPrompts(response.data.prompts);
    } catch (err: any) {
      console.error('Erro ao buscar prompts públicos:', err);
      setError(err.message || 'Erro ao buscar prompts públicos');
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    prompts,
    loading,
    error,
    fetchPrompts,
    getPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    incrementUsage,
    copyPromptToClipboard,
    fetchPublicPrompts,
  };
};

export default usePrompts;
