import { useState, useEffect } from 'react';
import { HospitalInfirmary } from './HospitalInfirmary';
import { AvatarCustomizationModal } from './AvatarCustomizationModal';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useStudyRoom } from '@/hooks/useStudyRoom';
import { AvatarCustomization, DEFAULT_AVATAR } from '@/types/avatar.types';
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
  GripVertical,
  Loader2,
  User,
  Sparkles,
  Activity
} from 'lucide-react';

interface Task {
  id: string;
  text: string;
  timeBlock: number;
  completed: boolean;
}

const STORAGE_KEY_AVATAR = 'medfocus_avatar_customization';

export const FullscreenStudyRoom = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(25);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [hasCustomized, setHasCustomized] = useState(false);

  // Carregar avatar do localStorage
  const [avatarCustomization, setAvatarCustomization] = useState<AvatarCustomization>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AVATAR);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_AVATAR;
      }
    }
    return DEFAULT_AVATAR;
  });

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

  const {
    stats,
    isLoading,
    currentUser,
    otherUsers,
    updateUserStatus,
    updateUserAvatar,
    incrementPomodoros,
  } = useStudyRoom('Você', mode, avatarCustomization);

  // Mostrar modal na primeira visita
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AVATAR);
    if (!saved && !hasCustomized) {
      setShowAvatarModal(true);
    }
  }, [hasCustomized]);

  // Sincronizar status
  useEffect(() => {
    updateUserStatus(mode);
  }, [mode, updateUserStatus]);

  // Incrementar pomodoros
  useEffect(() => {
    if (pomodorosCompleted > 0) {
      incrementPomodoros();
    }
  }, [pomodorosCompleted, incrementPomodoros]);

  // Salvar avatar
  const handleSaveAvatar = (customization: AvatarCustomization) => {
    setAvatarCustomization(customization);
    localStorage.setItem(STORAGE_KEY_AVATAR, JSON.stringify(customization));
    updateUserAvatar(customization.avatarType, customization.classYear);
    setHasCustomized(true);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Atalho SPACE
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        isRunning ? pause() : start();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isRunning, pause, start]);

  // Tarefas
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

  const getModeGradient = () => {
    switch (mode) {
      case 'FOCUS': return 'from-green-500 to-emerald-500';
      case 'SHORT_BREAK': return 'from-orange-500 to-amber-500';
      case 'LONG_BREAK': return 'from-purple-500 to-violet-500';
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[600px] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-blue-950 rounded-xl">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
            <div className="absolute inset-0 h-16 w-16 animate-ping text-blue-300 opacity-20">
              <Activity className="h-16 w-16" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🏥 MedFocus
            </p>
            <p className="text-sm text-muted-foreground">Entrando na enfermaria...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AvatarCustomizationModal
        open={showAvatarModal}
        onOpenChange={setShowAvatarModal}
        initialCustomization={avatarCustomization}
        onSave={handleSaveAvatar}
      />

      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
        {/* Canvas */}
        <div className={isFullscreen ? 'h-screen w-screen' : 'relative'}>
          <HospitalInfirmary 
            mode={mode}
            currentUser={currentUser}
            otherUsers={otherUsers}
          />
        </div>

        {/* Botões superiores (não fullscreen) */}
        {!isFullscreen && (
          <div className="absolute top-6 right-6 flex gap-3">
            <Button
              onClick={() => setShowAvatarModal(true)}
              size="lg"
              className="gap-2 shadow-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              <User className="h-5 w-5" />
              <span className="font-semibold">Editar Avatar</span>
            </Button>
            <Button
              onClick={toggleFullscreen}
              size="lg"
              className="gap-2 shadow-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
            >
              <Maximize2 className="h-5 w-5" />
              <span className="font-semibold">Tela Cheia</span>
            </Button>
          </div>
        )}

        {/* Stats da sala (não fullscreen) */}
        {!isFullscreen && stats && (
          <div className="absolute top-6 left-6 bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl rounded-2xl px-6 py-4 text-white shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="font-bold text-sm">🏥 MedFocus</span>
            </div>
            <div className="flex items-center gap-5 text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-300">👥</span>
                <span>{stats.totalUsers}/30</span>
              </span>
              <span className="flex items-center gap-1.5 text-green-400">
                <span>🟢</span>
                <span>{stats.focusing}</span>
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span>🟡</span>
                <span>{stats.shortBreak}</span>
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span>🟣</span>
                <span>{stats.longBreak}</span>
              </span>
            </div>
          </div>
        )}

        {/* HUD - Timer Pomodoro */}
        {isFullscreen && (
          <div className="absolute top-6 right-6 z-50">
            <Card className={`bg-black/90 backdrop-blur-xl border-3 ${getModeColor()} shadow-2xl`}>
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg font-bold flex items-center gap-2 ${getModeColor()}`}>
                    <div className={`w-3 h-3 rounded-full animate-pulse bg-gradient-to-r ${getModeGradient()}`} />
                    {getModeLabel()}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setIsTimerMinimized(!isTimerMinimized)}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-white hover:bg-white/20"
                    >
                      {isTimerMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={toggleFullscreen}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-white hover:bg-white/20"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isTimerMinimized && (
                <CardContent className="space-y-4 px-5 pb-5">
                  <div className={`text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r ${getModeGradient()} text-center`}>
                    {formatTime(timeLeft)}
                  </div>

                  <div className="flex gap-2 justify-center">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${
                          i < pomodorosCompleted % 4 
                            ? `bg-gradient-to-r ${getModeGradient()} shadow-lg` 
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={isRunning ? pause : start}
                      size="sm"
                      className={`gap-2 bg-gradient-to-r ${getModeGradient()} hover:opacity-90 font-semibold shadow-lg`}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Iniciar
                        </>
                      )}
                    </Button>
                    
                    <Button onClick={reset} size="sm" variant="outline" className="hover:bg-white/10">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    <Button onClick={skip} size="sm" variant="outline" className="hover:bg-white/10">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-white/70 text-center font-medium">
                    🎯 {pomodorosCompleted} pomodoros hoje
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* HUD - Tarefas */}
        {isFullscreen && (
          <div className="absolute bottom-6 left-6 z-50 w-96">
            <Card className="bg-black/90 backdrop-blur-xl border-2 border-blue-500/50 shadow-2xl">
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-blue-400 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    📋 Tarefas
                  </CardTitle>
                  <Button
                    onClick={() => setIsTasksExpanded(!isTasksExpanded)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-white hover:bg-white/20"
                  >
                    {isTasksExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              {isTasksExpanded && (
                <CardContent className="space-y-4 px-5 pb-5">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova tarefa..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addTask();
                      }}
                      className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-blue-500"
                    />
                    <Input
                      type="number"
                      min="5"
                      max="120"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(Number(e.target.value))}
                      className="w-20 bg-white/10 border-white/30 text-white focus:border-blue-500"
                    />
                    <Button onClick={addTask} size="sm" className="px-3 bg-blue-500 hover:bg-blue-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-white/50 text-sm">
                        Nenhuma tarefa adicionada
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                            task.completed
                              ? 'bg-white/5 border-white/10'
                              : 'bg-white/10 border-white/20'
                          }`}
                        >
                          <GripVertical className="h-4 w-4 text-white/30 flex-shrink-0 cursor-move" />
                          
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task.id)}
                            className="h-4 w-4 rounded flex-shrink-0 cursor-pointer"
                          />

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate font-medium ${
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
                            className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-red-500/20 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  {tasks.length > 0 && (
                    <div className="flex gap-4 text-xs text-white/70 pt-3 border-t border-white/10 font-medium">
                      <span>Total: {tasks.length}</span>
                      <span>✓ {tasks.filter(t => t.completed).length}</span>
                      <span>⏱️ {tasks.reduce((acc, t) => acc + t.timeBlock, 0)} min</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* HUD - Stats */}
        {isFullscreen && stats && (
          <div className="absolute bottom-6 right-6 z-50">
            <Card className="bg-black/90 backdrop-blur-xl border-2 border-white/10 shadow-2xl">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 text-white">
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span>🏥 Enfermaria</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-white/70">Total:</span>
                    <span className="text-right font-mono font-semibold">{stats.totalUsers}/30</span>
                    
                    <span className="text-green-400">🟢 Focando:</span>
                    <span className="text-right font-mono font-semibold text-green-400">{stats.focusing}</span>
                    
                    <span className="text-orange-400">🟡 Pausa:</span>
                    <span className="text-right font-mono font-semibold text-orange-400">{stats.shortBreak}</span>
                    
                    <span className="text-purple-400">🟣 Longa:</span>
                    <span className="text-right font-mono font-semibold text-purple-400">{stats.longBreak}</span>
                    
                    <span className="text-white/70">Vagas:</span>
                    <span className="text-right font-mono font-semibold">{stats.availableSeats}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Atalhos */}
        {isFullscreen && (
          <div className="absolute top-6 left-6 z-50">
            <div className="bg-black/80 backdrop-blur-xl rounded-xl px-4 py-3 text-white/80 text-xs border border-white/10 shadow-xl">
              <div className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Atalhos:
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-mono">ESC</kbd>
                  <span>Sair</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-mono">SPACE</kbd>
                  <span>Play/Pause</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </>
  );
};
