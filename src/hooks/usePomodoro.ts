import { useState, useEffect, useRef, useCallback } from 'react';

export type PomodoroMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  pomodorosCompleted: number;
}

const DURATIONS = {
  FOCUS: 25 * 60, // 25 minutos
  SHORT_BREAK: 5 * 60, // 5 minutos
  LONG_BREAK: 15 * 60, // 15 minutos
};

export const usePomodoro = () => {
  const [state, setState] = useState<PomodoroState>({
    mode: 'FOCUS',
    timeLeft: DURATIONS.FOCUS,
    isRunning: false,
    pomodorosCompleted: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeLeft: DURATIONS[prev.mode],
      isRunning: false,
    }));
  }, []);

  const switchMode = useCallback((newMode: PomodoroMode) => {
    setState({
      mode: newMode,
      timeLeft: DURATIONS[newMode],
      isRunning: false,
      pomodorosCompleted: state.pomodorosCompleted,
    });
  }, [state.pomodorosCompleted]);

  const skip = useCallback(() => {
    const isCurrentlyFocus = state.mode === 'FOCUS';
    const newPomodoros = isCurrentlyFocus ? state.pomodorosCompleted + 1 : state.pomodorosCompleted;
    
    // Protocolo de balance: a cada 4 pomodoros, long break
    const nextMode = isCurrentlyFocus 
      ? (newPomodoros % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK')
      : 'FOCUS';
    
    setState({
      mode: nextMode,
      timeLeft: DURATIONS[nextMode],
      isRunning: false,
      pomodorosCompleted: newPomodoros,
    });
  }, [state.mode, state.pomodorosCompleted]);

  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            // Timer completo!
            const isCurrentlyFocus = prev.mode === 'FOCUS';
            const newPomodoros = isCurrentlyFocus ? prev.pomodorosCompleted + 1 : prev.pomodorosCompleted;
            
            // Notificação
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(isCurrentlyFocus ? 'Foco completo!' : 'Pausa completa!', {
                body: isCurrentlyFocus ? 'Hora de fazer uma pausa!' : 'Hora de focar!',
              });
            }

            // Próximo modo
            const nextMode = isCurrentlyFocus 
              ? (newPomodoros % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK')
              : 'FOCUS';

            return {
              mode: nextMode,
              timeLeft: DURATIONS[nextMode],
              isRunning: false,
              pomodorosCompleted: newPomodoros,
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, state.timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    start,
    pause,
    reset,
    switchMode,
    skip,
    formatTime,
  };
};
