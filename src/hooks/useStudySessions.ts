import { useState } from 'react';
import api, { getErrorMessage } from '../services/api';

// Interfaces
export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // em minutos
  notes?: string;
  promptsUsed: string[];
  xpEarned: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudySessionData {
  subject: string;
  topic: string;
  duration: number;
  notes?: string;
  promptsUsed?: string[];
}

export interface UpdateStudySessionData {
  subject?: string;
  topic?: string;
  duration?: number;
  notes?: string;
  promptsUsed?: string[];
}

export interface StudySessionsFilters {
  startDate?: string;
  endDate?: string;
  subject?: string;
  minDuration?: number;
  sortBy?: 'recent' | 'duration' | 'xp';
}

export interface StudyStats {
  totalSessions: number;
  totalMinutes: number;
  totalXP: number;
  averageDuration: number;
  currentStreak: number;
  longestStreak: number;
  subjectsStudied: number;
  mostStudiedSubject: string;
}

export interface WeeklyStudyData {
  day: string;
  minutes: number;
  sessions: number;
}

export interface SubjectDistribution {
  subject: string;
  minutes: number;
  sessions: number;
  percentage: number;
}

/**
 * Hook para gerenciar sessões de estudo
 */
export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca todas as sessões com filtros opcionais
   */
  const fetchSessions = async (filters?: StudySessionsFilters): Promise<StudySession[]> => {
    setLoading(true);
    setError(null);

    try {
      // Construir query string
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.minDuration) params.append('minDuration', String(filters.minDuration));
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);

      const url = `/study-sessions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{ sessions: StudySession[] }>(url);

      setSessions(response.data.sessions);
      return response.data.sessions;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao buscar sessões');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca uma sessão específica por ID
   */
  const fetchSessionById = async (sessionId: string): Promise<StudySession> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ session: StudySession }>(`/study-sessions/${sessionId}`);
      return response.data.session;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao buscar sessão');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria uma nova sessão de estudo
   */
  const createSession = async (data: CreateStudySessionData): Promise<StudySession> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ session: StudySession; xpEarned: number }>(
        '/study-sessions',
        data
      );
      const newSession = response.data.session;

      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao criar sessão');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza uma sessão existente
   */
  const updateSession = async (
    sessionId: string,
    data: UpdateStudySessionData
  ): Promise<StudySession> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put<{ session: StudySession }>(`/study-sessions/${sessionId}`, data);
      const updatedSession = response.data.session;

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );

      return updatedSession;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao atualizar sessão');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deleta uma sessão
   */
  const deleteSession = async (sessionId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/study-sessions/${sessionId}`);

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao deletar sessão');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca estatísticas gerais de estudo
   */
  const fetchStats = async (): Promise<StudyStats> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<StudyStats>('/study-sessions/stats');
      return response.data;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao buscar estatísticas');
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca dados de estudo semanal (para gráficos)
   */
  const fetchWeeklyData = async (): Promise<WeeklyStudyData[]> => {
    try {
      const response = await api.get<{ weeklyData: WeeklyStudyData[] }>(
        '/study-sessions/weekly'
      );
      return response.data.weeklyData;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao buscar dados semanais');
      throw new Error(errorMsg);
    }
  };

  /**
   * Busca distribuição de estudo por matéria
   */
  const fetchSubjectDistribution = async (): Promise<SubjectDistribution[]> => {
    try {
      const response = await api.get<{ distribution: SubjectDistribution[] }>(
        '/study-sessions/subjects'
      );
      return response.data.distribution;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao buscar distribuição');
      throw new Error(errorMsg);
    }
  };

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    fetchSessionById,
    createSession,
    updateSession,
    deleteSession,
    fetchStats,
    fetchWeeklyData,
    fetchSubjectDistribution,
  };
};
