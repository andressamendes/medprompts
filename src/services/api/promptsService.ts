import api from '@/lib/axios';
import {
  Prompt,
  PromptsListResponse,
  PromptResponse,
  CreatePromptDTO,
  UpdatePromptDTO,
  FillPromptVariablesResponse,
} from '@/types/prompt';

/**
 * Serviço de comunicação com API de Prompts
 */
export class PromptsService {
  private static baseURL = '/api/v1/prompts';

  /**
   * Lista todos os prompts (sistema + usuário)
   */
  static async listPrompts(params?: {
    search?: string;
    category?: string;
    tags?: string;
    isFavorite?: boolean;
    sortBy?: string;
    limit?: number;
    includeSystem?: boolean;
  }): Promise<Prompt[]> {
    try {
      const response = await api.get<PromptsListResponse>(this.baseURL, { params });
      return response.data.prompts || [];
    } catch (error) {
      console.error('Erro ao listar prompts:', error);
      throw error;
    }
  }

  /**
   * Busca um prompt por ID
   */
  static async getPromptById(promptId: string): Promise<Prompt> {
    try {
      const response = await api.get<PromptResponse>(`${this.baseURL}/${promptId}`);
      return response.data.prompt;
    } catch (error) {
      console.error('Erro ao buscar prompt:', error);
      throw error;
    }
  }

  /**
   * Cria um novo prompt personalizado
   */
  static async createPrompt(data: CreatePromptDTO): Promise<Prompt> {
    try {
      const response = await api.post<PromptResponse>(this.baseURL, data);
      return response.data.prompt;
    } catch (error) {
      console.error('Erro ao criar prompt:', error);
      throw error;
    }
  }

  /**
   * Atualiza um prompt existente
   */
  static async updatePrompt(promptId: string, data: UpdatePromptDTO): Promise<Prompt> {
    try {
      const response = await api.put<PromptResponse>(`${this.baseURL}/${promptId}`, data);
      return response.data.prompt;
    } catch (error) {
      console.error('Erro ao atualizar prompt:', error);
      throw error;
    }
  }

  /**
   * Deleta um prompt
   */
  static async deletePrompt(promptId: string): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${promptId}`);
    } catch (error) {
      console.error('Erro ao deletar prompt:', error);
      throw error;
    }
  }

  /**
   * Favorita/desfavorita um prompt
   */
  static async toggleFavorite(promptId: string): Promise<Prompt> {
    try {
      const response = await api.post<PromptResponse>(`${this.baseURL}/${promptId}/favorite`);
      return response.data.prompt;
    } catch (error) {
      console.error('Erro ao favoritar prompt:', error);
      throw error;
    }
  }

  /**
/**
 * Registra uso do prompt (incrementa contador)
 */
static async recordUsage(promptId: string): Promise<Prompt> {
  try {
    const response = await api.post<PromptResponse>(`${this.baseURL}/${promptId}/use`);
    return response.data.prompt;
  } catch (error) {
    console.error('Erro ao registrar uso do prompt:', error);
    throw error;
  }
}


  /**
   * Preenche variáveis do prompt com valores fornecidos
   */
  static async fillPromptVariables(
    promptId: string,
    values: Record<string, string>
  ): Promise<FillPromptVariablesResponse['data']> {
    try {
      const response = await api.post<FillPromptVariablesResponse>(
        `${this.baseURL}/${promptId}/fill`,
        { values }
      );
      return response.data.data;
    } catch (error) {
      console.error('Erro ao preencher variáveis:', error);
      throw error;
    }
  }

  /**
   * Lista categorias disponíveis
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await api.get<{ success: boolean; categories: string[] }>(
        `${this.baseURL}/categories`
      );
      return response.data.categories || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Lista tags populares do usuário
   */
  static async getPopularTags(): Promise<string[]> {
    try {
      const response = await api.get<{ success: boolean; tags: string[] }>(
        `${this.baseURL}/tags`
      );
      return response.data.tags || [];
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }
  }
}

export default PromptsService;
