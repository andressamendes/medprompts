import { usePomodoro } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

export const PomodoroTimer = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    pomodorosCompleted,
    start,
    pause,
    reset,
    switchMode,
    skip,
    formatTime,
  } = usePomodoro();

  const getModeLabel = () => {
    switch (mode) {
      case 'FOCUS': return 'FOCO';
      case 'SHORT_BREAK': return 'PAUSA CURTA';
      case 'LONG_BREAK': return 'PAUSA LONGA';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'FOCUS': return 'text-green-500';
      case 'SHORT_BREAK': return 'text-blue-500';
      case 'LONG_BREAK': return 'text-purple-500';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full">
      {/* Modo atual */}
      <div className={`text-xl md:text-2xl font-bold ${getModeColor()}`}>
        {getModeLabel()}
      </div>

      {/* Timer display */}
      <div className="text-5xl md:text-7xl font-mono font-bold text-gray-900 dark:text-white">
        {formatTime(timeLeft)}
      </div>

      {/* Pomodoros completados */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < pomodorosCompleted % 4 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          className="w-full sm:w-32"
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </>
          )}
        </Button>
        
        <Button onClick={reset} size="lg" variant="outline">
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button onClick={skip} size="lg" variant="outline">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Botões de modo */}
      <div className="flex flex-wrap gap-2 justify-center w-full">
        <Button
          onClick={() => switchMode('FOCUS')}
          variant={mode === 'FOCUS' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Foco
        </Button>
        <Button
          onClick={() => switchMode('SHORT_BREAK')}
          variant={mode === 'SHORT_BREAK' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Pausa Curta
        </Button>
        <Button
          onClick={() => switchMode('LONG_BREAK')}
          variant={mode === 'LONG_BREAK' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Pausa Longa
        </Button>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {pomodorosCompleted} pomodoros completados hoje
      </div>
    </div>
  );
};
