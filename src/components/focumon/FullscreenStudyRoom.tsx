import { useState, useEffect } from 'react';
import { HospitalConferenceRoom } from './HospitalConferenceRoom';
import { usePomodoro } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  GripVertical
} from 'lucide-react';

interface Task {
  id: string;
  text: string;
  timeBlock: number;
  completed: boolean;
}

export const FullscreenStudyRoom = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(25);

  const {
    mode,
    timeLeft,
    isRunning,
    pomodorosCompleted,
    start,
    pause,
    reset,
    skip,
    formatTime,
  } = usePomodoro();

  // Entrar/Sair do fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Detectar quando sair do fullscreen com ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Funções de tarefas
  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      timeBlock: newTaskTime,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setNewTaskTime(25);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const getModeColor = () => {
    switch (mode) {
      case 'FOCUS': return 'text-green-500 border-green-500';
      case 'SHORT_BREAK': return 'text-orange-500 border-orange-500';
      case 'LONG_BREAK': return 'text-purple-500 border-purple-500';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'FOCUS': return 'FOCO';
      case 'SHORT_BREAK': return 'PAUSA CURTA';
      case 'LONG_BREAK': return 'PAUSA LONGA';
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Canvas Principal */}
      <div className={isFullscreen ? 'h-screen w-screen' : 'relative'}>
        <HospitalConferenceRoom 
          mode={mode}
          currentUser={{
            id: 'current-user',
            username: 'Você',
            status: mode,
            position: { row: 0, col: 0 }
          }}
        />
      </div>

      {/* Botão de Fullscreen (quando não está em fullscreen) */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4">
          <Button
            onClick={toggleFullscreen}
            size="lg"
            className="gap-2 shadow-lg"
          >
            <Maximize2 className="h-5 w-5" />
            Modo Tela Cheia
          </Button>
        </div>
      )}

      {/* HUD - Timer Pomodoro (Overlay Superior Direito) */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-50">
          <Card className={`bg-black/80 backdrop-blur-md border-2 ${getModeColor()} shadow-2xl`}>
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg font-bold ${getModeColor()}`}>
                  {getModeLabel()}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    onClick={() => setIsTimerMinimized(!isTimerMinimized)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    {isTimerMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={toggleFullscreen}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isTimerMinimized && (
              <CardContent className="space-y-3 px-4 pb-4">
                {/* Timer Display */}
                <div className="text-5xl font-mono font-bold text-white text-center">
                  {formatTime(timeLeft)}
                </div>

                {/* Pomodoros Completados */}
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < pomodorosCompleted % 4 ? 'bg-green-500' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Controles */}
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={isRunning ? pause : start}
                    size="sm"
                    className="gap-1"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="h-3 w-3" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Iniciar
                      </>
                    )}
                  </Button>
                  
                  <Button onClick={reset} size="sm" variant="outline">
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  
                  <Button onClick={skip} size="sm" variant="outline">
                    <SkipForward className="h-3 w-3" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="text-xs text-white/70 text-center">
                  {pomodorosCompleted} pomodoros hoje
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* HUD - Lista de Tarefas (Overlay Inferior Esquerdo) */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-4 z-50 w-96">
          <Card className="bg-black/80 backdrop-blur-md border-2 border-blue-500 shadow-2xl">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-blue-500">
                  📋 Tarefas
                </CardTitle>
                <Button
                  onClick={() => setIsTasksExpanded(!isTasksExpanded)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  {isTasksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>

            {isTasksExpanded && (
              <CardContent className="space-y-3 px-4 pb-4">
                {/* Adicionar Tarefa */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nova tarefa..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTask();
                    }}
                    className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  />
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(Number(e.target.value))}
                    className="w-16 bg-white/10 border-white/30 text-white"
                  />
                  <Button onClick={addTask} size="sm" className="px-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de Tarefas */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tasks.length === 0 ? (
                    <div className="text-center py-4 text-white/50 text-sm">
                      Nenhuma tarefa adicionada
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          task.completed
                            ? 'bg-white/5 border-white/20'
                            : 'bg-white/10 border-white/30'
                        }`}
                      >
                        <GripVertical className="h-3 w-3 text-white/30 flex-shrink-0" />
                        
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task.id)}
                          className="h-3 w-3 rounded flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${
                              task.completed ? 'line-through text-white/50' : 'text-white'
                            }`}
                          >
                            {task.text}
                          </p>
                          <p className="text-xs text-white/50">{task.timeBlock} min</p>
                        </div>

                        <Button
                          onClick={() => removeTask(task.id)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-white/50 hover:text-white hover:bg-white/20 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Estatísticas */}
                {tasks.length > 0 && (
                  <div className="flex gap-4 text-xs text-white/70 pt-2 border-t border-white/20">
                    <span>Total: {tasks.length}</span>
                    <span>Concluídas: {tasks.filter(t => t.completed).length}</span>
                    <span>Tempo: {tasks.reduce((acc, t) => acc + t.timeBlock, 0)} min</span>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Atalhos de Teclado (visível em fullscreen) */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 text-white/70 text-xs">
            <div className="font-semibold mb-1">Atalhos:</div>
            <div>ESC - Sair</div>
            <div>SPACE - Play/Pause</div>
          </div>
        </div>
      )}

      {/* Atalho de teclado */}
      {isFullscreen && (
        <div className="hidden">
          {/* Listener de teclas */}
          <input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === ' ') {
                e.preventDefault();
                isRunning ? pause() : start();
              }
            }}
            className="opacity-0 absolute"
          />
        </div>
      )}
    </div>
  );
};
