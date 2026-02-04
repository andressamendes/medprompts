import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Check,
  Trash2,
  Edit2,
  ListTodo,
  Trophy
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";

// ============================================================================
// CONSTANTES
// ============================================================================

// Durações em segundos
const FOCUS_DURATION = 50 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

// Streams de música Lo-fi (SomaFM - confiáveis e com CORS)
const STATIONS = [
  {
    name: "Groove Salad",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
    color: "from-amber-400/20 to-orange-400/20"
  },
  {
    name: "Groove Salad Classic",
    url: "https://ice1.somafm.com/gsclassic-128-mp3",
    color: "from-blue-400/20 to-cyan-400/20"
  },
  {
    name: "Space Station",
    url: "https://ice1.somafm.com/spacestation-128-mp3",
    color: "from-purple-400/20 to-pink-400/20"
  }
];

// Áudio de notificação
const ALARM_SOUND = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

// LocalStorage keys
const TASKS_STORAGE_KEY = 'focuszone_tasks';

// ============================================================================
// TIPOS
// ============================================================================

type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  focusTimeSpent: number; // Tempo dedicado em segundos
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function FocusZone() {
  const navigate = useNavigate();

  // ========== Estados do Pomodoro ==========
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timer, setTimer] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioAlarmRef = useRef<HTMLAudioElement>(null);

  // ========== Estados do Player ==========
  const [stationIndex, setStationIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ========== Estados do Checklist ==========
  // Inicializar tarefas diretamente do localStorage para evitar race condition
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Migrar formato antigo (completed: boolean) para novo (status: TaskStatus)
          return parsed.map((task: Record<string, unknown>): Task => {
            const baseTask = {
              id: task.id as string,
              text: task.text as string,
              createdAt: task.createdAt as number,
              completedAt: task.completedAt as number | undefined,
              focusTimeSpent: (task.focusTimeSpent as number) ?? 0,
            };

            // Migrar formato antigo
            if ('completed' in task && !('status' in task)) {
              return {
                ...baseTask,
                status: task.completed ? 'completed' as TaskStatus : 'pending' as TaskStatus,
              };
            }

            return {
              ...baseTask,
              status: (task.status as TaskStatus) ?? 'pending',
            };
          });
        }
      }
    } catch {
      // Silenciar erros de parsing
    }
    return [];
  });

  // ========== Estados de Estatísticas ==========
  const [totalFocusTime, setTotalFocusTime] = useState(0); // Tempo total focado na sessão
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  // ========== Salvar tarefas no localStorage (com debounce) ==========
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Debounce de 500ms para evitar writes excessivos durante edição rápida
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch {
        // Silenciar erros de storage
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tasks]);

  // ========== Funções do Pomodoro ==========

  const getDuration = (currentMode: PomodoroMode) => {
    switch (currentMode) {
      case 'focus': return FOCUS_DURATION;
      case 'shortBreak': return SHORT_BREAK;
      case 'longBreak': return LONG_BREAK;
    }
  };

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    if (audioAlarmRef.current) {
      audioAlarmRef.current.currentTime = 0;
      audioAlarmRef.current.play();
    }

    if (mode === 'focus') {
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);

      if (newCycles % 4 === 0) {
        setMode('longBreak');
        setTimer(LONG_BREAK);
      } else {
        setMode('shortBreak');
        setTimer(SHORT_BREAK);
      }
    } else {
      setMode('focus');
      setTimer(FOCUS_DURATION);
    }
  }, [mode, completedCycles]);

  // Decrementar timer e incrementar tempo de foco
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            handleTimerComplete();
            return 0;
          }
        });

        // Incrementar tempo de foco apenas no modo foco
        if (mode === 'focus') {
          setTotalFocusTime(prev => prev + 1);

          // Atualizar tempo da tarefa em andamento
          setTasks(prevTasks => prevTasks.map(task => {
            if (task.status === 'in_progress') {
              return { ...task, focusTimeSpent: task.focusTimeSpent + 1 };
            }
            return task;
          }));
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, handleTimerComplete, mode]);

  const changeMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setTimer(getDuration(newMode));
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(getDuration(mode));
    if (audioAlarmRef.current) {
      audioAlarmRef.current.pause();
      audioAlarmRef.current.currentTime = 0;
    }
  };

  // ========== Funções do Player ==========

  const nextStation = () => {
    setStationIndex((idx) => (idx + 1) % STATIONS.length);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (!playing) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setPlaying((p) => !p);
    } catch (error) {
      console.error('Erro ao reproduzir audio:', error);
      toast({
        title: 'Erro ao reproduzir',
        description: 'Não foi possível iniciar a música. Verifique sua conexão.',
        variant: 'destructive'
      });
    }
  }, [playing]);

  const toggleMute = useCallback(() => {
    setVolume(volume > 0 ? 0 : 50);
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // ========== Cleanup ao sair da página ==========
  useEffect(() => {
    // Captura refs no momento do efeito para evitar stale refs no cleanup
    const audioElement = audioRef.current;
    const alarmElement = audioAlarmRef.current;
    const intervalId = intervalRef.current;

    return () => {
      // Parar música ao desmontar componente
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      // Parar alarme
      if (alarmElement) {
        alarmElement.pause();
        alarmElement.currentTime = 0;
      }
      // Limpar timer
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // ========== Funções do Checklist ==========

  const generateId = () => `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const addTask = () => {
    const text = newTaskText.trim();
    if (!text) return;

    const newTask: Task = {
      id: generateId(),
      text,
      status: 'pending',
      createdAt: Date.now(),
      focusTimeSpent: 0
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
    newTaskInputRef.current?.focus();
  };

  // Ciclar entre estados: pending → in_progress → completed → pending
  const cycleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        let newStatus: TaskStatus;

        if (task.status === 'pending') {
          // Se já existe uma tarefa em andamento, primeiro a pausa
          const hasInProgress = prev.some(t => t.id !== taskId && t.status === 'in_progress');
          if (hasInProgress) {
            // Pausar a outra tarefa
            prev.forEach(t => {
              if (t.status === 'in_progress' && t.id !== taskId) {
                t.status = 'pending';
              }
            });
          }
          newStatus = 'in_progress';
        } else if (task.status === 'in_progress') {
          newStatus = 'completed';
          // Trigger celebration animation
          setCelebratingTaskId(taskId);
          setTimeout(() => setCelebratingTaskId(null), 600);
        } else {
          newStatus = 'pending';
        }

        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? Date.now() : undefined
        };
      }
      return task;
    }));
  };

  // Marcar tarefa diretamente como concluída (atalho)
  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.status !== 'completed') {
        setCelebratingTaskId(taskId);
        setTimeout(() => setCelebratingTaskId(null), 600);
        return {
          ...task,
          status: 'completed' as TaskStatus,
          completedAt: Date.now()
        };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = () => {
    if (!editingTaskId) return;

    const text = editingText.trim();
    if (!text) {
      cancelEdit();
      return;
    }

    setTasks(prev => prev.map(task =>
      task.id === editingTaskId ? { ...task, text } : task
    ));
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  // Estatísticas
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentTask = tasks.find(t => t.status === 'in_progress');

  // Calcular tempo total focado (ciclos completos * 50min)
  const totalFocusMinutes = Math.floor((completedCycles * 50 * 60 + totalFocusTime) / 60);

  // ========== Atalhos de teclado ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Não processar se estiver editando
      if (editingTaskId || document.activeElement?.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          cancelEdit();
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        navigate(-1);
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsRunning((v) => !v);
      }
      if (e.key.toLowerCase() === 'm') {
        toggleMute();
      }
      if (e.key.toLowerCase() === 'p') {
        togglePlay();
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        newTaskInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, playing, editingTaskId, navigate, toggleMute, togglePlay]);

  // ========== Cálculos de renderização ==========
  const minutes = Math.floor(timer / 60).toString().padStart(2, "0");
  const seconds = (timer % 60).toString().padStart(2, "0");

  const totalDuration = getDuration(mode);
  const progress = ((totalDuration - timer) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (progress / 100) * circumference;

  const modeLabels = {
    focus: 'Foco Profundo',
    shortBreak: 'Pausa Curta',
    longBreak: 'Pausa Longa'
  };

  const modeColors = {
    focus: { bg: '#6366f1', light: '#e0e7ff' },
    shortBreak: { bg: '#10b981', light: '#d1fae5' },
    longBreak: { bg: '#8b5cf6', light: '#ede9fe' }
  };

  // ========== RENDER ==========
  return (
    <>
      <SEOHead
        title="Focus Zone - Pomodoro"
        description="Timer Pomodoro com musica lo-fi para estudos focados. Gerencie tarefas e mantenha o foco durante suas sessoes de estudo."
        canonical="https://andressamendes.github.io/medprompts/focus-zone"
        breadcrumbs={[
          { name: 'Home', url: 'https://andressamendes.github.io/medprompts/' },
          { name: 'Focus Zone', url: 'https://andressamendes.github.io/medprompts/focus-zone' }
        ]}
      />
      <main id="main-content" className="relative min-h-screen overflow-hidden">
        {/* Fundo gradiente médico profissional */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />

      {/* Overlay com padrão de grade médica sutil */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Gradiente de overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="w-full p-3 sm:p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">
              Focus Zone
            </h1>
          </div>

          {/* Estatísticas da Sessão */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{completedCycles}</p>
                <p className="text-[10px] text-gray-300 uppercase tracking-wide">Pomodoros</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-lg font-bold text-white">{totalFocusMinutes}</p>
                <p className="text-[10px] text-gray-300 uppercase tracking-wide">min focados</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-lg font-bold text-green-400">{completedCount}</span>
                  {inProgressCount > 0 && <span className="text-sm font-bold text-indigo-400">+{inProgressCount}</span>}
                  <span className="text-gray-400 text-sm">/{totalCount}</span>
                </div>
                <p className="text-[10px] text-gray-300 uppercase tracking-wide">
                  {pendingCount > 0 ? `${pendingCount} pendentes` : 'tarefas'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 hover:scale-105"
            aria-label="Sair do Focus Zone"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base hidden sm:inline">Sair</span>
          </button>
        </header>

        {/* CONTEÚDO PRINCIPAL - Layout de duas colunas */}
        <section className="flex-1 flex items-start justify-center px-3 sm:px-6 pb-6 pt-2" aria-label="Timer Pomodoro e lista de tarefas">
          <div className="w-full max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

              {/* ============================================================ */}
              {/* COLUNA ESQUERDA - Timer Pomodoro + Player (60% em desktop) */}
              {/* ============================================================ */}
              <div className="w-full lg:w-[60%]">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-8 space-y-5 border border-white/20">

                  {/* Seletor de Modos */}
                  <div className="flex gap-2 justify-center flex-wrap" role="group" aria-label="Selecionar modo do timer">
                    <button
                      onClick={() => changeMode('focus')}
                      aria-pressed={mode === 'focus'}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        mode === 'focus'
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Foco
                    </button>
                    <button
                      onClick={() => changeMode('shortBreak')}
                      aria-pressed={mode === 'shortBreak'}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        mode === 'shortBreak'
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Pausa 5min
                    </button>
                    <button
                      onClick={() => changeMode('longBreak')}
                      aria-pressed={mode === 'longBreak'}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        mode === 'longBreak'
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Pausa 15min
                    </button>
                  </div>

                  {/* Label do modo atual */}
                  <div className="text-center">
                    <p className="text-gray-600 font-medium text-sm">
                      {modeLabels[mode]}
                    </p>
                  </div>

                  {/* TIMER POMODORO */}
                  <div className="flex flex-col items-center">
                    <div className={`relative ${isRunning ? 'animate-pulse' : ''}`} style={{ animationDuration: '2s' }}>
                      {/* Glow effect quando rodando */}
                      {isRunning && (
                        <div
                          className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
                          style={{ backgroundColor: modeColors[mode].bg, animationDuration: '1.5s' }}
                        />
                      )}
                      <svg width={200} height={200} viewBox="0 0 200 200" className="transform -rotate-90 relative z-10" role="img" aria-hidden="true">
                        {/* Círculo de fundo */}
                        <circle
                          cx={100}
                          cy={100}
                          r={90}
                          stroke={modeColors[mode].light}
                          strokeWidth={8}
                          fill="transparent"
                        />
                        {/* Círculo de progresso */}
                        <circle
                          cx={100}
                          cy={100}
                          r={90}
                          stroke={modeColors[mode].bg}
                          strokeWidth={8}
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className={`transition-all duration-1000 ease-in-out ${isRunning ? 'drop-shadow-lg' : ''}`}
                          style={isRunning ? { filter: `drop-shadow(0 0 8px ${modeColors[mode].bg})` } : {}}
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        {/* Indicador de "rodando" */}
                        {isRunning && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                              {mode === 'focus' ? 'Focando' : 'Pausa'}
                            </span>
                          </div>
                        )}
                        <p
                          role="timer"
                          aria-live="polite"
                          aria-atomic="true"
                          className="text-5xl sm:text-6xl font-bold tabular-nums"
                          style={{ color: modeColors[mode].bg }}
                        >
                          <span className="sr-only">{`${minutes} minutos e ${seconds} segundos restantes`}</span>
                          <span aria-hidden="true">{minutes}:{seconds}</span>
                        </p>
                        {/* Tarefa atual em andamento */}
                        {currentTask && mode === 'focus' && (
                          <p className="mt-1 text-xs text-gray-500 max-w-[150px] truncate text-center" title={currentTask.text}>
                            📌 {currentTask.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contador de ciclos */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Ciclos completados: <span className="font-bold text-blue-600">{completedCycles}</span>
                    </p>
                    <div className="flex justify-center gap-1 mt-2" role="img" aria-label={`Progresso: ${completedCycles % 4} de 4 ciclos para pausa longa`}>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          aria-hidden="true"
                          className={`w-2 h-2 rounded-full transition-all ${
                            i < (completedCycles % 4)
                              ? 'bg-blue-600 scale-125'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* CONTROLES DO POMODORO */}
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    <button
                      className={`${
                        isRunning
                          ? "bg-amber-500 hover:bg-amber-600 ring-2 ring-amber-300 animate-pulse"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-semibold rounded-xl px-6 py-3 sm:px-8 sm:py-3 transition-all shadow-lg hover:scale-105 flex-1 max-w-[180px] flex items-center justify-center gap-2`}
                      onClick={() => setIsRunning(!isRunning)}
                      aria-label={isRunning ? "Pausar timer" : "Iniciar timer"}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="w-5 h-5" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Iniciar</span>
                        </>
                      )}
                    </button>

                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-blue-700 font-semibold rounded-xl px-5 py-3 sm:px-6 sm:py-3 transition-all shadow-lg hover:scale-105"
                      onClick={resetTimer}
                      aria-label={`Resetar timer para ${mode === 'focus' ? '50' : mode === 'shortBreak' ? '5' : '15'} minutos`}
                    >
                      Reset
                    </button>
                  </div>

                  {/* PLAYER LO-FI */}
                  <div className={`bg-gradient-to-br ${STATIONS[stationIndex].color} rounded-2xl shadow-inner p-4 sm:p-5 border border-blue-200/30 backdrop-blur-sm`}>
                    <div className="flex flex-col gap-3 items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${playing ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} aria-hidden="true" />
                        <span className="sr-only">{playing ? 'Reproduzindo:' : 'Pausado:'}</span>
                        <span className="font-semibold text-blue-900 text-sm sm:text-base">
                          {STATIONS[stationIndex].name}
                        </span>
                      </div>

                      <div className="flex gap-2 sm:gap-3 w-full items-center">
                        <button
                          onClick={togglePlay}
                          className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                          aria-label={playing ? "Pausar Rádio" : "Tocar Rádio"}
                        >
                          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{playing ? "Pausar" : "Play"}</span>
                        </button>

                        <button
                          onClick={nextStation}
                          className="px-4 py-2.5 sm:px-5 sm:py-3 bg-white hover:bg-gray-50 text-blue-700 font-semibold border-2 border-blue-300 rounded-xl shadow-lg transition-all hover:scale-105"
                          aria-label="Próxima Estação"
                        >
                          Trocar
                        </button>
                      </div>

                      {/* Controle de Volume */}
                      <div className="flex items-center gap-3 w-full">
                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/20 rounded-lg transition-all"
                          aria-label={volume === 0 ? "Ativar som" : "Desativar som"}
                        >
                          {volume === 0 ? (
                            <VolumeX className="w-5 h-5 text-blue-900" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-blue-900" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          aria-label="Controle de volume"
                        />
                        <span className="text-blue-900 font-semibold text-sm min-w-[3ch]">
                          {volume}%
                        </span>
                      </div>
                    </div>

                    <audio
                      ref={audioRef}
                      src={STATIONS[stationIndex].url}
                      aria-label={`Stream ${STATIONS[stationIndex].name}`}
                      className="sr-only"
                      preload="none"
                      onEnded={() => setPlaying(false)}
                    />
                  </div>

                  {/* Atalhos de teclado como badges */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center mb-2">Atalhos de teclado</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono shadow-sm">
                        <span className="text-gray-500">Space</span>
                        <span className="text-gray-700">Timer</span>
                      </kbd>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono shadow-sm">
                        <span className="text-gray-500">P</span>
                        <span className="text-gray-700">Música</span>
                      </kbd>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono shadow-sm">
                        <span className="text-gray-500">M</span>
                        <span className="text-gray-700">Mute</span>
                      </kbd>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono shadow-sm">
                        <span className="text-gray-500">N</span>
                        <span className="text-gray-700">Tarefa</span>
                      </kbd>
                      <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono shadow-sm">
                        <span className="text-gray-500">Esc</span>
                        <span className="text-gray-700">Sair</span>
                      </kbd>
                    </div>
                  </div>

                  {/* Audio do alarme */}
                  <audio
                    ref={audioAlarmRef}
                    src={ALARM_SOUND}
                    preload="auto"
                    className="sr-only"
                  />
                </div>
              </div>

              {/* ============================================================ */}
              {/* COLUNA DIREITA - Checklist de Tarefas (40% em desktop) */}
              {/* ============================================================ */}
              <div className="w-full lg:w-[40%]">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-6 border border-white/20 h-full flex flex-col">

                  {/* Header do Checklist */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                      <h2 className="text-lg font-bold text-gray-800">Tarefas</h2>
                    </div>

                    {/* Contador de tarefas */}
                    {totalCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-600" aria-label={`${completedCount} de ${totalCount} tarefas concluídas`}>
                          <span className="text-green-600" aria-hidden="true">{completedCount}</span>
                          <span className="text-gray-400" aria-hidden="true">/</span>
                          <span aria-hidden="true">{totalCount}</span>
                        </div>
                        {completedCount === totalCount && totalCount > 0 && (
                          <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" aria-hidden="true" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Barra de progresso */}
                  {totalCount > 0 && (
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {progressPercent}% concluído
                      </p>
                    </div>
                  )}

                  {/* Input para nova tarefa */}
                  <div className="flex gap-2 mb-4">
                    <input
                      ref={newTaskInputRef}
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTask();
                        }
                      }}
                      placeholder="Nova tarefa..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={addTask}
                      disabled={!newTaskText.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all hover:scale-105 disabled:hover:scale-100"
                      aria-label="Adicionar tarefa"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Lista de tarefas */}
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[400px] lg:max-h-none">
                    {tasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                        <ListTodo className="w-12 h-12 mb-3 opacity-50" aria-hidden="true" />
                        <p className="text-sm">Nenhuma tarefa ainda</p>
                        <p className="text-xs mt-1">Pressione N para adicionar</p>
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`
                            group flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300
                            ${task.status === 'completed' && 'bg-green-50 border-green-200'}
                            ${task.status === 'in_progress' && 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'}
                            ${task.status === 'pending' && 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'}
                            ${celebratingTaskId === task.id ? 'animate-pulse scale-[1.02]' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {/* Botão de estado com três fases - Touch target 44x44px (WCAG 2.5.5) */}
                            <button
                              onClick={() => cycleTaskStatus(task.id)}
                              className={`
                                flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all
                                ${task.status === 'completed' && 'bg-green-500 border-green-500 text-white'}
                                ${task.status === 'in_progress' && 'bg-indigo-500 border-indigo-500 text-white animate-pulse'}
                                ${task.status === 'pending' && 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}
                              `}
                              aria-label={
                                task.status === 'pending' ? 'Iniciar tarefa' :
                                task.status === 'in_progress' ? 'Concluir tarefa' :
                                'Reabrir tarefa'
                              }
                              title={
                                task.status === 'pending' ? 'Clique para iniciar' :
                                task.status === 'in_progress' ? 'Clique para concluir' :
                                'Clique para reabrir'
                              }
                            >
                              {task.status === 'completed' && <Check className="w-5 h-5" />}
                              {task.status === 'in_progress' && <Play className="w-4 h-4" />}
                            </button>

                            {/* Texto da tarefa */}
                            {editingTaskId === task.id ? (
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                onBlur={saveEdit}
                                autoFocus
                                className="flex-1 px-2 py-1 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              />
                            ) : (
                              <div className="flex-1 min-w-0">
                                <span
                                  onDoubleClick={() => startEditing(task)}
                                  className={`
                                    block text-sm transition-all cursor-pointer
                                    ${task.status === 'completed' ? 'text-gray-500 line-through' : ''}
                                    ${task.status === 'in_progress' ? 'text-indigo-800 font-medium' : ''}
                                    ${task.status === 'pending' ? 'text-gray-800' : ''}
                                  `}
                                >
                                  {task.text}
                                </span>
                                {/* Badge de estado */}
                                {task.status === 'in_progress' && (
                                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-indigo-600 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                    Em andamento
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Ações - Visíveis em touch, hover em desktop */}
                            {/* Touch targets de 44x44px mínimo para WCAG 2.5.5 */}
                            {!editingTaskId && (
                              <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                {/* Botão de conclusão rápida para tarefas pendentes */}
                                {task.status === 'pending' && (
                                  <button
                                    onClick={() => completeTask(task.id)}
                                    className="min-w-[44px] min-h-[44px] p-2.5 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                                    aria-label="Concluir tarefa"
                                    title="Concluir direto"
                                  >
                                    <Check className="w-5 h-5 text-green-600" />
                                  </button>
                                )}
                                <button
                                  onClick={() => startEditing(task)}
                                  className="min-w-[44px] min-h-[44px] p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                                  aria-label="Editar tarefa"
                                >
                                  <Edit2 className="w-5 h-5 text-gray-500" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="min-w-[44px] min-h-[44px] p-2.5 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                                  aria-label="Excluir tarefa"
                                >
                                  <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Barra de progresso de tempo por tarefa */}
                          {task.status !== 'pending' && task.focusTimeSpent > 0 && (
                            <div className="ml-10">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      task.status === 'completed' ? 'bg-green-400' : 'bg-indigo-400'
                                    }`}
                                    style={{ width: `${Math.min((task.focusTimeSpent / (50*60)) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-500 tabular-nums min-w-[40px]">
                                  {Math.floor(task.focusTimeSpent / 60)}min
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer com legenda de estados */}
                  {tasks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
                          Pendente
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-indigo-500" />
                          Em andamento
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-green-500" />
                          Concluída
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 text-center mt-2">
                        Clique no círculo para avançar estado • Duplo clique no texto para editar
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* Confetti Animation (quando todas as tarefas são concluídas) */}
      {completedCount === totalCount && totalCount > 0 && completedCount > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50" role="status" aria-live="polite">
          <span className="sr-only">Parabéns! Todas as tarefas foram concluídas!</span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl animate-bounce" aria-hidden="true">🎉</div>
          </div>
        </div>
      )}
    </main>
    </>
  );
}
