// Sistema de Timer Pomodoro com XP

export interface PomodoroSession {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number; // em minutos
  type: 'focus' | 'break';
  completed: boolean;
  xpEarned: number;
}

export interface PomodoroState {
  totalSessions: number;
  totalMinutes: number;
  todaySessions: number;
  history: PomodoroSession[];
}

// Constantes
export const FOCUS_DURATION = 25; // minutos
export const BREAK_DURATION = 5; // minutos
export const XP_PER_SESSION = 15; // XP ao completar foco
export const STORAGE_KEY = 'medprompts_pomodoro';

// Inicializar estado
export function initializePomodoroState(): PomodoroState {
  return {
    totalSessions: 0,
    totalMinutes: 0,
    todaySessions: 0,
    history: [],
  };
}

// Carregar estado
export function loadPomodoroState(): PomodoroState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as PomodoroState;
      
      // Resetar contador diário se necessário
      const today = new Date().toDateString();
      const lastSession = state.history[0];
      
      if (lastSession && new Date(lastSession.startTime).toDateString() !== today) {
        state.todaySessions = 0;
      }
      
      return state;
    }
  } catch (error) {
    console.error('Erro ao carregar estado do Pomodoro:', error);
  }
  
  return initializePomodoroState();
}

// Salvar estado
export function savePomodoroState(state: PomodoroState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('pomodoroUpdated'));
  } catch (error) {
    console.error('Erro ao salvar estado do Pomodoro:', error);
  }
}

// Registrar sessão completa
export function completeSession(type: 'focus' | 'break'): PomodoroSession {
  const state = loadPomodoroState();
  
  const duration = type === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
  const xpEarned = type === 'focus' ? XP_PER_SESSION : 0;
  
  const session: PomodoroSession = {
    id: `pomodoro-${Date.now()}`,
    startTime: new Date(Date.now() - duration * 60 * 1000).toISOString(),
    endTime: new Date().toISOString(),
    duration,
    type,
    completed: true,
    xpEarned,
  };
  
  const newState: PomodoroState = {
    totalSessions: state.totalSessions + 1,
    totalMinutes: state.totalMinutes + duration,
    todaySessions: state.todaySessions + 1,
    history: [session, ...state.history].slice(0, 50), // Manter últimas 50
  };
  
  savePomodoroState(newState);
  
  // Atualizar XP no sistema de gamificação
  if (xpEarned > 0) {
    window.dispatchEvent(new CustomEvent('pomodoroXP', { detail: { xpEarned } }));
  }
  
  return session;
}

// Obter estatísticas do dia
export function getTodayStats(): { sessions: number; minutes: number } {
  const state = loadPomodoroState();
  const today = new Date().toDateString();
  
  const todaySessions = state.history.filter(
    s => new Date(s.startTime).toDateString() === today
  );
  
  const minutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  
  return {
    sessions: todaySessions.length,
    minutes,
  };
}

// Obter estatísticas totais
export function getTotalStats(): { sessions: number; minutes: number; hours: number } {
  const state = loadPomodoroState();
  
  return {
    sessions: state.totalSessions,
    minutes: state.totalMinutes,
    hours: Math.floor(state.totalMinutes / 60),
  };
}
