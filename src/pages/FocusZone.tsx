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

// ============================================================================
// CONSTANTES
// ============================================================================

// Durações em segundos
const FOCUS_DURATION = 50 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

// Streams de música Lo-fi funcionais
const STATIONS = [
  {
    name: "Lofi Hip Hop",
    url: "https://stream.zeno.fm/f3wvbbqmdg8uv",
    color: "from-amber-400/20 to-orange-400/20"
  },
  {
    name: "Chillhop Radio",
    url: "https://stream.zeno.fm/0r0xa792kwzuv",
    color: "from-blue-400/20 to-cyan-400/20"
  },
  {
    name: "Jazzy Beats",
    url: "https://stream.zeno.fm/f6vhq8qqtg8uv",
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

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
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
          return parsed;
        }
      }
    } catch {
      // Silenciar erros de parsing
    }
    return [];
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  // SEO: Definir título da página
  useEffect(() => {
    document.title = "Focus Zone - Pomodoro | MedPrompts";
  }, []);

  // ========== Salvar tarefas no localStorage ==========
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Silenciar erros de storage
    }
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

  // Decrementar timer
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
  }, [isRunning, handleTimerComplete]);

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

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (!playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setPlaying((p) => !p);
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
    return () => {
      // Parar música ao desmontar componente
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // Parar alarme
      if (audioAlarmRef.current) {
        audioAlarmRef.current.pause();
        audioAlarmRef.current.currentTime = 0;
      }
      // Limpar timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
      completed: false,
      createdAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
    newTaskInputRef.current?.focus();
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const nowCompleted = !task.completed;

        // Trigger celebration animation
        if (nowCompleted) {
          setCelebratingTaskId(taskId);
          setTimeout(() => setCelebratingTaskId(null), 600);
        }

        return {
          ...task,
          completed: nowCompleted,
          completedAt: nowCompleted ? Date.now() : undefined
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
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
                    <div className="relative">
                      <svg width={200} height={200} viewBox="0 0 200 200" className="transform -rotate-90" role="img" aria-hidden="true">
                        <circle
                          cx={100}
                          cy={100}
                          r={90}
                          stroke={modeColors[mode].light}
                          strokeWidth={8}
                          fill="transparent"
                        />
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
                          className="transition-all duration-1000 ease-in-out"
                        />
                      </svg>

                      <div className="absolute inset-0 flex items-center justify-center">
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
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-semibold rounded-xl px-6 py-3 sm:px-8 sm:py-3 transition-all shadow-lg hover:scale-105 flex-1 max-w-[160px]`}
                      onClick={() => setIsRunning(!isRunning)}
                    >
                      {isRunning ? "Pausar" : "Iniciar"}
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

                  {/* Atalhos de teclado */}
                  <div className="text-center pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Espaço: Timer • P: Música • M: Mute • N: Nova tarefa • ESC: Sair
                    </p>
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
                            group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300
                            ${task.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                            }
                            ${celebratingTaskId === task.id ? 'animate-pulse scale-[1.02]' : ''}
                          `}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`
                              flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                              ${task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-indigo-500'
                              }
                            `}
                            aria-label={task.completed ? 'Desmarcar tarefa' : 'Marcar como concluída'}
                          >
                            {task.completed && <Check className="w-4 h-4" />}
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
                            <span
                              className={`
                                flex-1 text-sm transition-all
                                ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}
                              `}
                            >
                              {task.text}
                            </span>
                          )}

                          {/* Ações - Visíveis em touch, hover em desktop */}
                          {!editingTaskId && (
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditing(task)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Editar tarefa"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                aria-label="Excluir tarefa"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer com dica */}
                  {tasks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Clique no círculo para concluir • Duplo clique para editar
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
  );
}
