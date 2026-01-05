import api from '../api';

/**
 * Interface para Prompt personalizado
 */
export interface PromptData {
  id?:  string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite?: boolean;
  timesUsed?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Serviço de API para Prompts Personalizados
 * Usa instância de axios configurada (já tem baseURL e interceptors)
 */
class PromptsService {
  /**
   * Buscar todos os prompts do usuário
   */
  async getAll(): Promise<PromptData[]> {
    try {
      const response = await api.get('/prompts');
      return response.data. data. prompts || response.data.prompts || [];
    } catch (error:  any) {
      console.error('❌ Erro ao buscar prompts:', error);
      throw new Error(error.response?.data?. error || 'Erro ao buscar prompts');
    }
  }

  /**
   * Buscar um prompt específico por ID
   */
  async getById(id: string): Promise<PromptData> {
    try {
      const response = await api.get(`/prompts/${id}`);
      return response.data.data.prompt || response.data.prompt;
    } catch (error: any) {
      console.error('❌ Erro ao buscar prompt:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar prompt');
    }
  }

  /**
   * Criar novo prompt
   */
  async create(data: PromptData): Promise<PromptData> {
    try {
      const response = await api.post('/prompts', data);
      return response. data.data.prompt || response.data.prompt;
    } catch (error: any) {
      console.error('❌ Erro ao criar prompt:', error);
      throw new Error(error.response?.data?.error || 'Erro ao criar prompt');
    }
  }

  /**
   * Atualizar prompt existente
   */
  async update(id: string, data:  Partial<PromptData>): Promise<PromptData> {
    try {
      const response = await api.put(`/prompts/${id}`, data);
      return response.data.data. prompt || response.data.prompt;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar prompt:', error);
      throw new Error(error.response?.data?.error || 'Erro ao atualizar prompt');
    }
  }

  /**
   * Excluir prompt
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/prompts/${id}`);
    } catch (error: any) {
      console.error('❌ Erro ao excluir prompt:', error);
      throw new Error(error.response?.data?.error || 'Erro ao excluir prompt');
    }
  }

  /**
   * Favoritar/desfavoritar prompt
   */
  async toggleFavorite(id: string): Promise<PromptData> {
    try {
      const response = await api.post(`/prompts/${id}/favorite`);
      return response.data.data.prompt || response.data.prompt;
    } catch (error: any) {
      console.error('❌ Erro ao favoritar prompt:', error);
      throw new Error(error.response?.data?.error || 'Erro ao favoritar prompt');
    }
  }

  /**
   * Registrar uso do prompt
   */
  async incrementUsage(id: string): Promise<PromptData> {
    try {
      const response = await api.post(`/prompts/${id}/use`);
      return response.data.data.prompt || response.data.prompt;
    } catch (error: any) {
      console.error('❌ Erro ao registrar uso:', error);
      throw new Error(error.response?.data?.error || 'Erro ao registrar uso');
    }
  }
}

export default new PromptsService();