import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Cloud, 
  Zap,
  Music2 
} from 'lucide-react';
import { logger } from '@/utils/logger';

// Duração dos timers (em segundos)
const POMODORO_DURATION = 50 * 60; // 50 minutos
const SHORT_BREAK = 5 * 60; // 5 minutos
const LONG_BREAK = 15 * 60; // 15 minutos

// Playlists Lofi do YouTube
const LOFI_STATIONS = [
  {
    id: 'study',
    name: 'Lofi Study',
    icon: Coffee,
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    description: 'Beats suaves para estudo',
  },
  {
    id: 'chill',
    name: 'Chill Vibes',
    icon: Cloud,
    embedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    description: 'Relaxe e respire',
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: Zap,
    embedUrl: 'https://www.youtube.com/embed/7NOSDKb0HlU',
    description: 'Concentração máxima',
  },
];

export default function FocusZone() {
  const navigate = useNavigate();
  const [sessionStartTime] = useState(Date.now());
  const [selectedStation, setSelectedStation] = useState(0);
  const [volume, setVolume] = useState(50);
  const [showControls, setShowControls] = useState(true);
  
  // Estados do Pomodoro
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Log entrada
  useEffect(() => {
    logger.info('Focus Zone ativado', {
      component: 'FocusZone',
      action: 'enter_focus_mode',
      station: LOFI_STATIONS[selectedStation].name,
    });

    // Inicializar audio
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    return () => {
      const sessionDuration = Date.now() - sessionStartTime;
      logger.info('Focus Zone encerrado', {
        component: 'FocusZone',
        action: 'exit_focus_mode',
        sessionDuration,
        timeInMinutes: (sessionDuration / 1000 / 60).toFixed(2),
        completedPomodoros,
      });
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer do Pomodoro
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Controlar volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Ocultar controles após inatividade
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  // Teclas de atalho
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
      if (e.key === ' ') {
        e.preventDefault();
        toggleTimer();
      }
      if (e.key.toLowerCase() === 'm') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, volume]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Som de notificação
    try {
      const notif = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe87');
      notif.play().catch(() => {});
    } catch {}

    if (currentMode === 'focus') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      logger.info('Pomodoro completado', {
        component: 'FocusZone',
        pomodoroNumber: newCount,
      });

      if (newCount % 4 === 0) {
        setCurrentMode('long');
        setTimeLeft(LONG_BREAK);
      } else {
        setCurrentMode('short');
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setCurrentMode('focus');
      setTimeLeft(POMODORO_DURATION);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    logger.info(isRunning ? 'Timer pausado' : 'Timer iniciado', {
      mode: currentMode,
      timeLeft,
    });
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration = currentMode === 'focus' ? POMODORO_DURATION : currentMode === 'short' ? SHORT_BREAK : LONG_BREAK;
    setTimeLeft(duration);
  };

  const handleExit = () => {
    navigate(-1);
  };

  const changeStation = (index: number) => {
    setSelectedStation(index);
    logger.info('Estação alterada', {
      newStation: LOFI_STATIONS[index].name,
    });
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 50);
    logger.info(volume > 0 ? 'Som silenciado' : 'Som ativado', {
      component: 'FocusZone',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (currentMode === 'focus') return 'from-indigo-500 to-purple-600';
    if (currentMode === 'short') return 'from-green-500 to-emerald-600';
    return 'from-blue-500 to-cyan-600';
  };

  const getModeLabel = () => {
    if (currentMode === 'focus') return 'Foco Profundo';
    if (currentMode === 'short') return 'Pausa Curta';
    return 'Pausa Longa';
  };

  const getProgress = () => {
    const total = currentMode === 'focus' ? POMODORO_DURATION : currentMode === 'short' ? SHORT_BREAK : LONG_BREAK;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* YouTube Player - Fullscreen Background */}
      <div className="absolute inset-0 pointer-events-none">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`${LOFI_STATIONS[selectedStation].embedUrl}?autoplay=1&mute=0&controls=0&loop=1&playlist=${LOFI_STATIONS[selectedStation].embedUrl.split('/').pop()}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3`}
          title="Lofi Music"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            pointerEvents: 'none',
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Overlay escuro para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 backdrop-blur-[2px]" />

      {/* Controles - aparecem ao mover o mouse */}
      <div
        className={`absolute inset-0 z-20 transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Header com botão sair */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <Music2 className="w-6 h-6 text-white/90 animate-pulse" />
            <div>
              <h1 className="text-white font-bold text-xl">Focus Zone</h1>
              <p className="text-white/60 text-xs">{LOFI_STATIONS[selectedStation].name}</p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExit}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Sair</span>
          </Button>
        </div>

        {/* Timer Pomodoro - Centro */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl animate-fade-in">
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 min-w-[280px] sm:min-w-[320px]">
              {/* Indicador de Pomodoros */}
              <div className="flex items-center justify-center gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i < completedPomodoros % 4
                        ? 'bg-white w-2.5 h-2.5 shadow-lg shadow-white/50'
                        : 'bg-white/30 w-1.5 h-1.5'
                    }`}
                  />
                ))}
              </div>

              {/* Modo atual */}
              <div className="text-center">
                <p className="text-white/70 text-xs uppercase tracking-widest font-medium">
                  {getModeLabel()}
                </p>
              </div>

              {/* Timer */}
              <div className="relative">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative py-8 sm:py-10 text-center">
                  <p className="text-5xl sm:text-6xl font-bold text-white tabular-nums tracking-tight drop-shadow-2xl">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className={`bg-gradient-to-r ${getTimerColor()} hover:scale-105 transition-transform text-white shadow-xl`}
                >
                  {isRunning ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>

                <Button
                  onClick={resetTimer}
                  size="lg"
                  variant="ghost"
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Contador */}
              <div className="text-center pt-3 border-t border-white/10">
                <p className="text-white/60 text-xs">
                  Pomodoros: <span className="font-bold text-white">{completedPomodoros}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Volume Control */}
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white/90 hover:text-white hover:bg-white/10 p-2 h-auto"
              >
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              <div className="flex-1">
                <Slider
                  value={[volume]}
                  onValueChange={(val: number[]) => setVolume(val[0])}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              <span className="text-white/70 text-sm font-medium min-w-[3ch] text-right">
                {volume}%
              </span>
            </div>

            {/* Station Selector */}
            <div className="flex items-center justify-center gap-3">
              {LOFI_STATIONS.map((station, index) => {
                const Icon = station.icon;
                return (
                  <button
                    key={station.id}
                    onClick={() => changeStation(index)}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      selectedStation === index
                        ? 'bg-white/20 backdrop-blur-md border border-white/30'
                        : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all ${
                      selectedStation === index ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`} />
                    <span className={`text-xs font-medium hidden sm:inline ${
                      selectedStation === index ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}>
                      {station.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instruções */}
            <div className="text-center">
              <p className="text-white/40 text-xs">
                Espaço: Play/Pause • M: Mute • ESC: Sair
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
