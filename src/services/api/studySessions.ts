import axios from 'axios';

const API_URL = import.meta.env. VITE_API_URL || 'http://localhost:3001';

/**
 * Interface para Sessão de Estudo
 */
export interface StudySessionData {
  id?:  string;
  subject: string; // ✅ ADICIONADO para evitar erro de tipagem
  topic: string;
  duration: number; // em minutos
  notes?:  string;
  date: string; // ✅ ADICIONADO para evitar erro de tipagem
  xpEarned?:  number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para Estatísticas de Estudo
 */
export interface StudyStats {
  totalMinutes: number;
  totalSessions: number;
  totalXP: number;
  averageDuration: number;
  sessionsBySubject: { [key: string]: number };
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}

/**
 * Serviço de API para Sessões de Estudo
 * Realiza operações CRUD e busca estatísticas
 */
class StudySessionsService {
  /**
   * Buscar todas as sessões do usuário
   */
  async getAll(): Promise<StudySessionData[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/study-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar sessões:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar sessões');
    }
  }

  /**
   * Buscar sessões por período
   */
  async getByPeriod(period: 'today' | 'week' | 'month' | 'all'): Promise<StudySessionData[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/study-sessions`, {
        params: { period },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar sessões por período:', error);
      throw new Error(error.response?.data?. message || 'Erro ao buscar sessões');
    }
  }

  /**
   * Buscar uma sessão específica por ID
   */
  async getById(id: string): Promise<StudySessionData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/study-sessions/${id}`, {
        headers: {
          Authorization:  `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar sessão:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar sessão');
    }
  }

  /**
   * Criar nova sessão de estudo
   */
  async create(data: StudySessionData): Promise<StudySessionData> {
    try {
      const token = localStorage.getItem('token');
      
      // Calcular XP:  0.5 XP por minuto
      const xpEarned = Math.floor(data.duration / 2);
      
      const response = await axios.post(
        `${API_URL}/api/study-sessions`,
        { ...data, xpEarned },
        {
          headers:  {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar sessão:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar sessão');
    }
  }

  /**
   * Atualizar sessão existente
   */
  async update(id: string, data: Partial<StudySessionData>): Promise<StudySessionData> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/study-sessions/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response. data;
    } catch (error: any) {
      console.error('Erro ao atualizar sessão:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar sessão');
    }
  }

  /**
   * Excluir sessão
   */
  async delete(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/study-sessions/${id}`, {
        headers: {
          Authorization:  `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Erro ao excluir sessão:', error);
      throw new Error(error.response?.data?.message || 'Erro ao excluir sessão');
    }
  }

  /**
   * Buscar estatísticas de estudo
   */
  async getStats(): Promise<StudyStats> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/study-sessions/stats`, {
        headers: {
          Authorization:  `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error(error.response?. data?.message || 'Erro ao buscar estatísticas');
    }
  }
}

export default new StudySessionsService();