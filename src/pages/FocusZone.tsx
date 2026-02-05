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
  Trophy,
  Settings,
  RotateCcw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";

// ============================================================================
// CONSTANTES
// ============================================================================

// Configurações padrão do Pomodoro (em minutos)
const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,      // 25 minutos de foco
  shortBreak: 5,          // 5 minutos de pausa curta
  longBreak: 15,          // 15 minutos de pausa longa
  cyclesBeforeLongBreak: 4 // 4 ciclos antes da pausa longa
};

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

// Configurações customizáveis do Pomodoro
interface PomodoroSettings {
  focusDuration: number;      // Duração do foco em minutos
  shortBreak: number;         // Pausa curta em minutos
  longBreak: number;          // Pausa longa em minutos
  cyclesBeforeLongBreak: number; // Ciclos antes da pausa longa
}

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
const SETTINGS_STORAGE_KEY = 'focuszone_settings';

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

  // ========== Estados de Configurações ==========
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validar e mesclar com defaults para garantir todas as propriedades
        return {
          focusDuration: parsed.focusDuration ?? DEFAULT_SETTINGS.focusDuration,
          shortBreak: parsed.shortBreak ?? DEFAULT_SETTINGS.shortBreak,
          longBreak: parsed.longBreak ?? DEFAULT_SETTINGS.longBreak,
          cyclesBeforeLongBreak: parsed.cyclesBeforeLongBreak ?? DEFAULT_SETTINGS.cyclesBeforeLongBreak
        };
      }
    } catch {
      // Silenciar erros de parsing
    }
    return DEFAULT_SETTINGS;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);

  // ========== Estados do Pomodoro ==========
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timer, setTimer] = useState(settings.focusDuration * 60);
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

  // ========== Salvar configurações no localStorage ==========
  const saveSettings = useCallback((newSettings: PomodoroSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // Silenciar erros de storage
    }
  }, []);

  // ========== Funções de Configurações ==========
  const openSettings = () => {
    setTempSettings(settings);
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const applySettings = () => {
    // Validar valores mínimos
    const validatedSettings: PomodoroSettings = {
      focusDuration: Math.max(1, Math.min(120, tempSettings.focusDuration)),
      shortBreak: Math.max(1, Math.min(60, tempSettings.shortBreak)),
      longBreak: Math.max(1, Math.min(60, tempSettings.longBreak)),
      cyclesBeforeLongBreak: Math.max(1, Math.min(10, tempSettings.cyclesBeforeLongBreak))
    };

    setSettings(validatedSettings);
    saveSettings(validatedSettings);

    // Atualizar timer se não estiver rodando
    if (!isRunning) {
      setTimer(getDurationFromSettings(mode, validatedSettings));
    }

    setShowSettings(false);
    toast({
      title: "Configurações salvas",
      description: "As novas durações serão aplicadas no próximo ciclo."
    });
  };

  const resetToDefaults = () => {
    setTempSettings(DEFAULT_SETTINGS);
  };

  // ========== Funções do Pomodoro ==========

  const getDurationFromSettings = (currentMode: PomodoroMode, currentSettings: PomodoroSettings) => {
    switch (currentMode) {
      case 'focus': return currentSettings.focusDuration * 60;
      case 'shortBreak': return currentSettings.shortBreak * 60;
      case 'longBreak': return currentSettings.longBreak * 60;
    }
  };

  const getDuration = (currentMode: PomodoroMode) => {
    return getDurationFromSettings(currentMode, settings);
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

      if (newCycles % settings.cyclesBeforeLongBreak === 0) {
        setMode('longBreak');
        setTimer(settings.longBreak * 60);
      } else {
        setMode('shortBreak');
        setTimer(settings.shortBreak * 60);
      }
    } else {
      setMode('focus');
      setTimer(settings.focusDuration * 60);
    }
  }, [mode, completedCycles, settings]);

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

  // Calcular tempo total focado (ciclos completos * duração configurada)
  const totalFocusMinutes = Math.floor((completedCycles * settings.focusDuration * 60 + totalFocusTime) / 60);

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
        <header id="main-navigation" className="w-full p-3 sm:p-6 flex justify-between items-center" role="banner">
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

          <div className="flex items-center gap-2">
            <button
              onClick={openSettings}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 hover:scale-105"
              aria-label="Configurações do Pomodoro"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base hidden sm:inline">Config</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 hover:scale-105"
              aria-label="Sair do Focus Zone"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base hidden sm:inline">Sair</span>
            </button>
          </div>
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
                      aria-label={`Resetar timer para ${mode === 'focus' ? settings.focusDuration : mode === 'shortBreak' ? settings.shortBreak : settings.longBreak} minutos`}
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
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={volume}
                          aria-valuetext={`${volume} por cento`}
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
                      <div
                        className="h-2 bg-gray-200 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progresso das tarefas: ${progressPercent}% concluído`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right" aria-hidden="true">
                        {progressPercent}% concluído
                      </p>
                    </div>
                  )}

                  {/* Input para nova tarefa */}
                  <div className="flex gap-2 mb-4">
                    <label htmlFor="new-task-input" className="sr-only">
                      Adicionar nova tarefa
                    </label>
                    <input
                      id="new-task-input"
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
                      aria-describedby="task-input-hint"
                    />
                    <span id="task-input-hint" className="sr-only">
                      Pressione Enter para adicionar ou use o botão ao lado
                    </span>
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
                                    style={{ width: `${Math.min((task.focusTimeSpent / (settings.focusDuration * 60)) * 100, 100)}%` }}
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

      {/* Modal de Configurações */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeSettings}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between">
              <h2 id="settings-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                Configurações do Pomodoro
              </h2>
              <button
                onClick={closeSettings}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Fechar configurações"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Campos de Configuração */}
            <div className="space-y-4">
              {/* Duração do Foco */}
              <div className="space-y-2">
                <label htmlFor="focus-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duração do Foco (minutos)
                </label>
                <input
                  id="focus-duration"
                  type="number"
                  min="1"
                  max="120"
                  value={tempSettings.focusDuration}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, focusDuration: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  aria-describedby="focus-hint"
                />
                <p id="focus-hint" className="text-xs text-gray-500 dark:text-gray-400">
                  Técnica Pomodoro recomenda 25 minutos (1-120 min)
                </p>
              </div>

              {/* Pausa Curta */}
              <div className="space-y-2">
                <label htmlFor="short-break" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pausa Curta (minutos)
                </label>
                <input
                  id="short-break"
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.shortBreak}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  aria-describedby="short-break-hint"
                />
                <p id="short-break-hint" className="text-xs text-gray-500 dark:text-gray-400">
                  Recomendado: 5 minutos (1-60 min)
                </p>
              </div>

              {/* Pausa Longa */}
              <div className="space-y-2">
                <label htmlFor="long-break" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pausa Longa (minutos)
                </label>
                <input
                  id="long-break"
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.longBreak}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  aria-describedby="long-break-hint"
                />
                <p id="long-break-hint" className="text-xs text-gray-500 dark:text-gray-400">
                  Recomendado: 15 minutos (1-60 min)
                </p>
              </div>

              {/* Ciclos antes da pausa longa */}
              <div className="space-y-2">
                <label htmlFor="cycles" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ciclos antes da pausa longa
                </label>
                <input
                  id="cycles"
                  type="number"
                  min="1"
                  max="10"
                  value={tempSettings.cyclesBeforeLongBreak}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, cyclesBeforeLongBreak: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                  aria-describedby="cycles-hint"
                />
                <p id="cycles-hint" className="text-xs text-gray-500 dark:text-gray-400">
                  Recomendado: 4 ciclos (1-10 ciclos)
                </p>
              </div>
            </div>

            {/* Preview das configurações */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Resumo do ciclo:</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {tempSettings.cyclesBeforeLongBreak}× ({tempSettings.focusDuration} min foco + {tempSettings.shortBreak} min pausa) + {tempSettings.longBreak} min pausa longa
              </p>
              <p className="text-xs text-indigo-500 dark:text-indigo-500">
                Total por bloco: {(tempSettings.focusDuration + tempSettings.shortBreak) * tempSettings.cyclesBeforeLongBreak + tempSettings.longBreak} min
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Restaurar configurações padrão"
              >
                <RotateCcw className="w-4 h-4" />
                Padrão
              </button>
              <div className="flex gap-2">
                <button
                  onClick={closeSettings}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={applySettings}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  );
}
