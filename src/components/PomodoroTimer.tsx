import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Clock, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  FOCUS_DURATION,
  BREAK_DURATION,
  XP_PER_SESSION,
  completeSession,
  getTodayStats,
} from '@/lib/pomodoro';

type TimerMode = 'focus' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION * 60); // em segundos
  const [todayStats, setTodayStats] = useState({ sessions: 0, minutes: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Carregar estatísticas do dia
  useEffect(() => {
    updateStats();
    
    const handleUpdate = () => {
      updateStats();
    };
    
    window.addEventListener('pomodoroUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('pomodoroUpdated', handleUpdate);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const updateStats = () => {
    const stats = getTodayStats();
    setTodayStats(stats);
  };

  // Timer principal
  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
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
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, timeLeft]);

  const handleTimerComplete = () => {
    setStatus('idle');
    
    // Registrar sessão e ganhar XP
    completeSession(mode);
    
    // Atualizar progresso de gamificação
    if (mode === 'focus') {
      toast({
        title: '🍅 Pomodoro completo!',
        description: `Parabéns! Você ganhou +${XP_PER_SESSION} XP de bônus.`,
      });
      
      // Disparar evento para atualizar XP
      window.dispatchEvent(new Event('progressUpdated'));
    } else {
      toast({
        title: '☕ Pausa completa!',
        description: 'Hora de voltar ao foco!',
      });
    }

    // Alternar modo automaticamente
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setTimeLeft(nextMode === 'focus' ? FOCUS_DURATION * 60 : BREAK_DURATION * 60);
    
    updateStats();

    // Notificação nativa (se permitido)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MedPrompts - Timer', {
        body: mode === 'focus' ? '🍅 Sessão de foco completa!' : '☕ Pausa completa!',
        icon: '/favicon.svg',
      });
    }
  };

  const handleStart = () => {
    setStatus('running');
    
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleReset = () => {
    setStatus('idle');
    setTimeLeft(mode === 'focus' ? FOCUS_DURATION * 60 : BREAK_DURATION * 60);
  };

  const handleSwitchMode = () => {
    setStatus('idle');
    const newMode = mode === 'focus' ? 'break' : 'focus';
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_DURATION * 60 : BREAK_DURATION * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = () => {
    const total = mode === 'focus' ? FOCUS_DURATION * 60 : BREAK_DURATION * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <Card className={mode === 'focus' ? 'border-red-300' : 'border-green-300'}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {mode === 'focus' ? (
              <>
                <Clock className="w-5 h-5 text-red-500" />
                Timer Pomodoro
              </>
            ) : (
              <>
                <Coffee className="w-5 h-5 text-green-500" />
                Pausa
              </>
            )}
          </span>
          <Badge variant={mode === 'focus' ? 'destructive' : 'default'}>
            {mode === 'focus' ? '🍅 Foco' : '☕ Pausa'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display do Timer */}
        <div className="text-center">
          <div className={`text-6xl font-bold tabular-nums ${
            mode === 'focus' ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatTime(timeLeft)}
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                mode === 'focus' ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${progressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Botões de controle */}
        <div className="flex gap-2 justify-center">
          {status === 'idle' || status === 'paused' ? (
            <Button onClick={handleStart} size="lg" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {status === 'paused' ? 'Continuar' : 'Iniciar'}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" size="lg" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          )}
          
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Botão trocar modo */}
        {status === 'idle' && (
          <Button
            onClick={handleSwitchMode}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Trocar para {mode === 'focus' ? 'Pausa' : 'Foco'}
          </Button>
        )}

        {/* Estatísticas do dia */}
        <div className="pt-3 border-t text-center space-y-1">
          <p className="text-sm text-muted-foreground">Hoje:</p>
          <div className="flex justify-center gap-4 text-sm">
            <span>
              <strong>{todayStats.sessions}</strong> sessões
            </span>
            <span>•</span>
            <span>
              <strong>{todayStats.minutes}</strong> minutos
            </span>
          </div>
          {mode === 'focus' && status === 'idle' && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Cada sessão de foco completa = +{XP_PER_SESSION} XP
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
