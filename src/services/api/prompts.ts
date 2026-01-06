import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Interface para Prompt personalizado
 */
export interface PromptData {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite?: boolean;
  usageCount?: number;
  isSystem?: boolean; // ✅ ADICIONADO: Marca se o prompt é do sistema (protegido contra edição/exclusão)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Serviço de API para Prompts Personalizados
 * Realiza operações CRUD com o backend
 */
class PromptsService {
  /**
   * Buscar todos os prompts do usuário
   */
  async getAll(): Promise<PromptData[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/prompts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar prompts:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar prompts');
    }
  }

  /**
   * Buscar um prompt específico por ID
   */
  async getById(id: string): Promise<PromptData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/prompts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar prompt:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar prompt');
    }
  }

  /**
   * Criar novo prompt
   */
  async create(data: PromptData): Promise<PromptData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/prompts`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar prompt:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar prompt');
    }
  }

  /**
   * Atualizar prompt existente
   */
  async update(id: string, data: Partial<PromptData>): Promise<PromptData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/prompts/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar prompt:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar prompt');
    }
  }

  /**
   * Excluir prompt
   */
  async delete(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/prompts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Erro ao excluir prompt:', error);
      throw new Error(error.response?.data?.message || 'Erro ao excluir prompt');
    }
  }

  /**
   * Favoritar/desfavoritar prompt
   */
  async toggleFavorite(id: string): Promise<PromptData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/prompts/${id}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao favoritar prompt:', error);
      throw new Error(error.response?.data?.message || 'Erro ao favoritar prompt');
    }
  }

  /**
   * Incrementar contador de uso
   */
  async incrementUsage(id: string): Promise<PromptData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/prompts/${id}/usage`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao incrementar uso:', error);
      throw new Error(error.response?.data?.message || 'Erro ao incrementar uso');
    }
  }
}

export default new PromptsService();
