import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

// Interfaces de Session
export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  topic?: string;
  duration: number;
  xpEarned: number;
  notes?: string;
  aiUsed?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudySessionData {
  subject: string;
  topic?: string;
  duration: number;
  notes?: string;
  aiUsed?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  date?: string;
}

export interface UpdateStudySessionData {
  subject?: string;
  topic?: string;
  duration?: number;
  notes?: string;
  aiUsed?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  date?: string;
}

export interface StudySessionsFilters {
  subject?: string;
  aiUsed?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'duration' | 'xpEarned';
  sortOrder?: 'asc' | 'desc';
}

export interface StudyStats {
  totalSessions: number;
  totalHours: number;
  totalXP: number;
  averageSessionDuration: number;
  mostStudiedSubject: string;
  currentStreak: number;
  longestStreak: number;
  studyDaysThisWeek: number;
  studyDaysThisMonth: number;
  sessionsToday: number;
  hoursToday: number;
}

export interface WeeklyStudyData {
  day: string;
  hours: number;
  sessions: number;
}

export interface SubjectDistribution {
  subject: string;
  hours: number;
  sessions: number;
  percentage: number;
}

/**
 * Hook personalizado para gerenciar sessões de estudo
 */
export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lista todas as sessões de estudo do usuário
   */
  const fetchSessions = useCallback(async (filters?: StudySessionsFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.aiUsed) params.append('aiUsed', filters.aiUsed);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = `/study-sessions${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<{ sessions: StudySession[] }>(url);
      setSessions(response.data.sessions);
    } catch (err: any) {
      console.error('Erro ao buscar sessões:', err);
      setError(err.message || 'Erro ao buscar sessões');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca uma sessão específica por ID
   */
  const getSessionById = useCallback(async (sessionId: string): Promise<StudySession | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ session: StudySession }>(`/study-sessions/${sessionId}`);
      return response.data.session;
    } catch (err: any) {
      console.error('Erro ao buscar sessão:', err);
      setError(err.message || 'Erro ao buscar sessão');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria nova sessão de estudo
   */
  const createSession = useCallback(async (data: CreateStudySessionData): Promise<StudySession | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<{ session: StudySession; xpEarned: number }>(
        '/study-sessions',
        data
      );
      const newSession = response.data.session;

      // Adiciona sessão à lista local
      setSessions((prev) => [newSession, ...prev]);

      return newSession;
    } catch (err: any) {
      console.error('Erro ao criar sessão:', err);
      setError(err.message || 'Erro ao criar sessão');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza sessão existente
   */
  const updateSession = useCallback(async (sessionId: string, data: UpdateStudySessionData): Promise<StudySession | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put<{ session: StudySession }>(`/study-sessions/${sessionId}`, data);
      const updatedSession = response.data.session;

      // Atualiza sessão na lista local
      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? updatedSession : session))
      );

      return updatedSession;
    } catch (err: any) {
      console.error('Erro ao atualizar sessão:', err);
      setError(err.message || 'Erro ao atualizar sessão');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Deleta sessão de estudo
   */
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(`/study-sessions/${sessionId}`);

      // Remove sessão da lista local
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      return true;
    } catch (err: any) {
      console.error('Erro ao deletar sessão:', err);
      setError(err.message || 'Erro ao deletar sessão');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtém estatísticas de estudo do usuário
   */
  const getStudyStats = useCallback(async (): Promise<StudyStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<StudyStats>('/study-sessions/stats');
      return response.data;
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err.message || 'Erro ao buscar estatísticas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtém dados de estudo da semana (para gráficos)
   */
  const getWeeklyData = useCallback(async (): Promise<WeeklyStudyData[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ weeklyData: WeeklyStudyData[] }>(
        '/study-sessions/stats/weekly'
      );
      return response.data.weeklyData;
    } catch (err: any) {
      console.error('Erro ao buscar dados semanais:', err);
      setError(err.message || 'Erro ao buscar dados semanais');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtém distribuição de estudo por matéria
   */
  const getSubjectDistribution = useCallback(async (): Promise<SubjectDistribution[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ distribution: SubjectDistribution[] }>(
        '/study-sessions/stats/subjects'
      );
      return response.data.distribution;
    } catch (err: any) {
      console.error('Erro ao buscar distribuição:', err);
      setError(err.message || 'Erro ao buscar distribuição');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Migra dados de sessões antigas do localStorage para API
   */
  const syncSessionsData = useCallback(async (): Promise<void> => {
    try {
      const oldSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');

      if (oldSessions.length === 0) {
        console.log('✅ Nenhuma sessão antiga para migrar');
        return;
      }

      console.log(`🔄 Migrando ${oldSessions.length} sessões antigas...`);

      for (const oldSession of oldSessions) {
        try {
          await createSession({
            subject: oldSession.subject || 'Geral',
            topic: oldSession.topic,
            duration: oldSession.duration,
            notes: oldSession.notes,
            aiUsed: oldSession.aiUsed,
            date: oldSession.date,
          });
        } catch (error) {
          console.warn('Erro ao migrar sessão:', error);
        }
      }

      // Remove dados antigos do localStorage
      localStorage.removeItem('studySessions');
      console.log('✅ Sessões migradas com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar sessões:', error);
    }
  }, [createSession]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
    getStudyStats,
    getWeeklyData,
    getSubjectDistribution,
    syncSessionsData,
  };
};

export default useStudySessions;
