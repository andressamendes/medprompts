import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerConfig {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

const TIMER_CONFIG: TimerConfig = {
  focus: 25 * 60, // 25 minutos
  shortBreak: 5 * 60, // 5 minutos
  longBreak: 15 * 60, // 15 minutos
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [componentMountTime] = useState(Date.now());
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Log inicial quando componente é montado (executa apenas uma vez)
   
  useEffect(() => {
    logger.info('PomodoroTimer inicializado', {
      component: 'PomodoroTimer',
      action: 'component_mounted',
      initialMode: mode,
      initialTime: timeLeft,
      sessionsCompleted: 0,
      mountTimestamp: new Date().toISOString(),
    });

    return () => {
      // Log quando componente é desmontado
      const totalTimeUsed = Date.now() - componentMountTime;
      logger.info('PomodoroTimer desmontado', {
        component: 'PomodoroTimer',
        action: 'component_unmounted',
        sessionsCompleted,
        totalTimeInComponent: totalTimeUsed,
        wasRunning: isRunning,
        unmountTimestamp: new Date().toISOString(),
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer interval - handleTimerComplete é estável pois usa setters de estado
   
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    const sessionDuration = sessionStartTime ? Date.now() - sessionStartTime : 0;

    if (mode === 'focus') {
      const newSessionsCount = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCount);

      logger.info('🎉 Sessão Pomodoro COMPLETADA!', {
        component: 'PomodoroTimer',
        action: 'session_completed',
        achievement: 'pomodoro_session_25min',
        mode: 'focus',
        sessionNumber: newSessionsCount,
        sessionDuration,
        totalSessionsCompleted: newSessionsCount,
        completionTimestamp: new Date().toISOString(),
        productivity: {
          focusTime: TIMER_CONFIG.focus,
          actualDuration: sessionDuration,
          efficiency: ((TIMER_CONFIG.focus * 1000) / sessionDuration * 100).toFixed(2) + '%',
        },
      });

      // Verificar se completou 4 sessões (Pomodoro completo)
      if (newSessionsCount % 4 === 0) {
        logger.info('🏆 CICLO POMODORO COMPLETO (4 sessões)!', {
          component: 'PomodoroTimer',
          action: 'pomodoro_cycle_completed',
          achievement: 'full_pomodoro_cycle',
          totalSessions: newSessionsCount,
          cyclesCompleted: newSessionsCount / 4,
          totalFocusTime: newSessionsCount * TIMER_CONFIG.focus,
          completionTimestamp: new Date().toISOString(),
        });
      }
    } else {
      logger.info('Pausa concluída', {
        component: 'PomodoroTimer',
        action: 'break_completed',
        mode,
        breakDuration: mode === 'shortBreak' ? TIMER_CONFIG.shortBreak : TIMER_CONFIG.longBreak,
        sessionDuration,
        completionTimestamp: new Date().toISOString(),
      });
    }

    setSessionStartTime(null);
  };

  const toggleTimer = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);

    if (newIsRunning) {
      const startTime = Date.now();
      setSessionStartTime(startTime);

      logger.info('Timer iniciado', {
        component: 'PomodoroTimer',
        action: 'timer_started',
        mode,
        timeRemaining: timeLeft,
        sessionsCompleted,
        startTimestamp: new Date().toISOString(),
        timerConfig: {
          totalTime: TIMER_CONFIG[mode],
          timeElapsed: TIMER_CONFIG[mode] - timeLeft,
          progressPercentage: ((TIMER_CONFIG[mode] - timeLeft) / TIMER_CONFIG[mode] * 100).toFixed(2),
        },
      });
    } else {
      const pauseDuration = sessionStartTime ? Date.now() - sessionStartTime : 0;

      logger.info('Timer pausado', {
        component: 'PomodoroTimer',
        action: 'timer_paused',
        mode,
        timeRemaining: timeLeft,
        timePaused: pauseDuration,
        sessionsCompleted,
        pauseTimestamp: new Date().toISOString(),
        interruption: {
          wasRunningFor: pauseDuration,
          progressLost: ((TIMER_CONFIG[mode] - timeLeft) / TIMER_CONFIG[mode] * 100).toFixed(2) + '%',
        },
      });
    }
  };

  const resetTimer = () => {
    const wasRunning = isRunning;
    const timeLost = TIMER_CONFIG[mode] - timeLeft;
    
    setIsRunning(false);
    setTimeLeft(TIMER_CONFIG[mode]);
    setSessionStartTime(null);

    logger.warn('Timer resetado', {
      component: 'PomodoroTimer',
      action: 'timer_reset',
      mode,
      wasRunning,
      timeLost,
      sessionsCompleted,
      resetTimestamp: new Date().toISOString(),
      impact: {
        progressLost: (timeLost / TIMER_CONFIG[mode] * 100).toFixed(2) + '%',
        timeWasted: timeLost,
      },
    });
  };

  const changeMode = (newMode: TimerMode) => {
    const previousMode = mode;
    const timeLostInPreviousMode = TIMER_CONFIG[mode] - timeLeft;
    
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode]);
    setIsRunning(false);
    setSessionStartTime(null);

    logger.info('Modo do timer alterado', {
      component: 'PomodoroTimer',
      action: 'mode_changed',
      previousMode,
      newMode,
      timeLostInPreviousMode,
      newTime: TIMER_CONFIG[newMode],
      sessionsCompleted,
      changeTimestamp: new Date().toISOString(),
      context: {
        wasRunning: isRunning,
        switchReason: newMode === 'focus' ? 'back_to_work' : 'taking_break',
      },
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_CONFIG[mode] - timeLeft) / TIMER_CONFIG[mode]) * 100;

  const modeConfig = {
    focus: {
      label: 'Foco',
      color: 'bg-red-100 text-red-800',
      description: 'Concentração máxima por 25 minutos',
    },
    shortBreak: {
      label: 'Pausa Curta',
      color: 'bg-green-100 text-green-800',
      description: 'Descanso rápido de 5 minutos',
    },
    longBreak: {
      label: 'Pausa Longa',
      color: 'bg-blue-100 text-blue-800',
      description: 'Descanso prolongado de 15 minutos',
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle>Pomodoro Timer</CardTitle>
          </div>
          <Badge variant="secondary">
            {sessionsCompleted} sessões completadas
          </Badge>
        </div>
        <CardDescription>
          Técnica Pomodoro para maximizar seu foco e produtividade
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seletor de Modo */}
        <div className="flex gap-2">
          {(Object.keys(modeConfig) as TimerMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeMode(m)}
              className="flex-1"
              disabled={isRunning}
            >
              {modeConfig[m].label}
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <Badge className={`${modeConfig[mode].color} text-lg px-4 py-1`}>
            {modeConfig[mode].label}
          </Badge>

          <div className="text-7xl font-bold font-mono tracking-tight">
            {formatTime(timeLeft)}
          </div>

          <p className="text-sm text-muted-foreground">
            {modeConfig[mode].description}
          </p>

          {/* Barra de Progresso */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controles */}
        <div className="flex gap-3">
          <Button
            onClick={toggleTimer}
            className="flex-1 h-12"
            variant={isRunning ? 'secondary' : 'default'}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Iniciar
              </>
            )}
          </Button>

          <Button
            onClick={resetTimer}
            variant="outline"
            className="h-12 px-6"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
