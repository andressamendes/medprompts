import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { completeSession, getTodayStats, FOCUS_DURATION, BREAK_DURATION } from '@/lib/pomodoro';

type TimerMode = 'focus' | 'break';

export function PomodoroTimer() {
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [todayStats, setTodayStats] = useState(getTodayStats());

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      completeSession(mode);
      setTodayStats(getTodayStats());
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    const duration = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
    setTimeRemaining(duration * 60);
    setIsRunning(false);
  };

  const handleModeSwitch = () => {
    const newMode: TimerMode = mode === 'focus' ? 'break' : 'focus';
    const duration = newMode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
    setMode(newMode);
    setTimeRemaining(duration * 60);
    setIsRunning(false);
  };

  const totalDuration = (mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION) * 60;
  const progressPercentage = ((totalDuration - timeRemaining) / totalDuration) * 100;

  return (
    <Card data-tutorial="pomodoro-timer" className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {mode === 'focus' ? '📚' : '☕'} Timer Pomodoro
          </span>
          <span className="text-sm text-muted-foreground">
            {todayStats.sessions} sessões hoje
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'focus' ? 'Tempo de estudo' : 'Tempo de descanso'}
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleStartPause}
            variant={isRunning ? 'outline' : 'default'}
            size="lg"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Iniciar
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" /> Resetar
          </Button>
          <Button onClick={handleModeSwitch} variant="outline" size="lg">
            <Coffee className="w-4 h-4 mr-2" />
            {mode === 'focus' ? 'Descanso' : 'Trabalho'}
          </Button>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Técnica Pomodoro:</strong> {FOCUS_DURATION}min de estudo + {BREAK_DURATION}min de descanso
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
