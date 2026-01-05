import api from '../api';

/**
 * Interface para Sessão de Estudo
 */
export interface StudySessionData {
  id?:  string;
  topic: string;
  durationMinutes: number;
  notes?:  string;
  promptsUsed?: string[];
  status?:  'pending' | 'completed';
  reviewCount?: number;
  nextReviewDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para Estatísticas de Estudo
 */
export interface StudyStats {
  totalSessions: number;
  totalMinutes: number;
  completedSessions: number;
  pendingSessions: number;
  averageDuration: number;
  topTopics: Array<{ topic: string; count: number }>;
  last7Days: Array<{ date: string; sessions: number; minutes: number }>;
}

/**
 * Serviço de API para Sessões de Estudo
 * Usa instância de axios configurada (já tem baseURL e interceptors)
 */
class StudySessionsService {
  /**
   * Buscar todas as sessões do usuário
   */
  async getAll(): Promise<StudySessionData[]> {
    try {
      const response = await api. get('/study-sessions');
      return response.data.data.sessions || response.data.sessions || [];
    } catch (error: any) {
      console.error('❌ Erro ao buscar sessões:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar sessões');
    }
  }

  /**
   * Buscar uma sessão específica por ID
   */
  async getById(id: string): Promise<StudySessionData> {
    try {
      const response = await api.get(`/study-sessions/${id}`);
      return response.data. data.session || response.data. session;
    } catch (error: any) {
      console.error('❌ Erro ao buscar sessão:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar sessão');
    }
  }

  /**
   * Criar nova sessão de estudo
   */
  async create(data: StudySessionData): Promise<StudySessionData> {
    try {
      const response = await api.post('/study-sessions', data);
      return response.data.data.session || response.data.session;
    } catch (error: any) {
      console.error('❌ Erro ao criar sessão:', error);
      throw new Error(error.response?.data?.error || 'Erro ao criar sessão');
    }
  }

  /**
   * Atualizar sessão existente
   */
  async update(id: string, data:  Partial<StudySessionData>): Promise<StudySessionData> {
    try {
      const response = await api.put(`/study-sessions/${id}`, data);
      return response.data.data.session || response.data.session;
    } catch (error:  any) {
      console.error('❌ Erro ao atualizar sessão:', error);
      throw new Error(error.response?.data?.error || 'Erro ao atualizar sessão');
    }
  }

  /**
   * Excluir sessão
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/study-sessions/${id}`);
    } catch (error: any) {
      console.error('❌ Erro ao excluir sessão:', error);
      throw new Error(error.response?.data?. error || 'Erro ao excluir sessão');
    }
  }

  /**
   * Marcar sessão como completada
   */
  async complete(id: string, quality?:  number): Promise<StudySessionData> {
    try {
      const response = await api.post(`/study-sessions/${id}/complete`, { quality });
      return response.data.data. session || response.data.session;
    } catch (error: any) {
      console.error('❌ Erro ao completar sessão:', error);
      throw new Error(error.response?. data?.error || 'Erro ao completar sessão');
    }
  }

  /**
   * Buscar estatísticas de estudo
   */
  async getStats(period?:  'week' | 'month' | 'year'): Promise<StudyStats> {
    try {
      const response = await api.get('/study-sessions/statistics', {
        params: { period },
      });
      return response. data.data.statistics || response.data.statistics;
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar estatísticas');
    }
  }

  /**
   * Buscar sessões para revisão
   */
  async getForReview(): Promise<StudySessionData[]> {
    try {
      const response = await api. get('/study-sessions/review');
      return response.data. data.sessions || response.data. sessions || [];
    } catch (error:  any) {
      console.error('❌ Erro ao buscar revisões:', error);
      throw new Error(error.response?.data?. error || 'Erro ao buscar revisões');
    }
  }
}

export default new StudySessionsService();