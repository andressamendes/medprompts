import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Volume2, VolumeX, Play, Pause, RotateCcw, Coffee, Cloud, Zap } from 'lucide-react';
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
    videoId: 'jfKfPfyJRdk',
    description: 'Beats suaves para estudo',
  },
  {
    id: 'chill',
    name: 'Chill Vibes',
    icon: Cloud,
    videoId: '5qap5aO4i9A',
    description: 'Relaxe e respire',
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: Zap,
    videoId: '7NOSDKb0HlU',
    description: 'Concentração máxima',
  },
];

export default function FocusZone() {
  const navigate = useNavigate();
  const [sessionStartTime] = useState(Date.now());
  const [selectedStation, setSelectedStation] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Estados do Pomodoro
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Log entrada
  useEffect(() => {
    logger.info('Focus Zone ativado', {
      component: 'FocusZone',
      action: 'enter_focus_mode',
      station: LOFI_STATIONS[selectedStation].name,
    });

    return () => {
      const sessionDuration = Date.now() - sessionStartTime;
      logger.info('Focus Zone encerrado', {
        component: 'FocusZone',
        action: 'exit_focus_mode',
        sessionDuration,
        timeInMinutes: (sessionDuration / 1000 / 60).toFixed(2),
        completedPomodoros,
      });
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

  // Controlar mute via postMessage
  useEffect(() => {
    if (iframeRef.current) {
      const command = isMuted ? 'mute' : 'unMute';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command }),
        '*'
      );
    }
  }, [isMuted]);

  // Tecla ESC para sair, Espaço para play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
      if (e.key === ' ') {
        e.preventDefault();
        toggleTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Som de notificação
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe87');
      audio.play().catch(() => {});
    } catch {}

    if (currentMode === 'focus') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      logger.info('Pomodoro completado', {
        component: 'FocusZone',
        pomodoroNumber: newCount,
      });

      // Após 4 pomodoros, pausa longa
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
    setIsMuted(!isMuted);
    logger.info(isMuted ? 'Som ativado' : 'Som silenciado', {
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
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-background to-secondary/20">
      {/* Overlay escuro para modo imersivo */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-pink-950/90" />

      {/* Ondas animadas de fundo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 bg-gradient-to-r from-indigo-500/30 to-transparent rounded-full animate-wave-slow" />
        <div className="absolute w-[180%] h-[180%] -bottom-1/2 -right-1/2 bg-gradient-to-l from-purple-500/30 to-transparent rounded-full animate-wave-reverse" />
        <div className="absolute w-[160%] h-[160%] top-1/4 left-1/4 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full animate-pulse-slow" />
      </div>

      {/* Partículas flutuantes grandes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute rounded-full bg-primary/10 backdrop-blur-sm animate-float-slow"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 20 + 20 + 's',
            }}
          />
        ))}
      </div>

      {/* Partículas pequenas caindo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute rounded-full bg-foreground/30"
            style={{
              width: Math.random() * 3 + 2 + 'px',
              height: Math.random() * 3 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: -10 + '%',
              animation: `fall ${Math.random() * 8 + 12}s linear infinite`,
              animationDelay: Math.random() * 10 + 's',
            }}
          />
        ))}
      </div>

      {/* Pulsos de luz radiantes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow-delayed" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse-glow-slow" />
      </div>

      {/* Container principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header com controles */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary animate-pulse" />
            <h1 className="text-foreground font-semibold text-lg">Focus Zone</h1>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExit}
            className="text-foreground hover:bg-secondary transition-all"
          >
            <X className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Sair (ESC)</span>
          </Button>
        </div>

        {/* Timer Pomodoro - Card Central */}
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border shadow-2xl animate-fade-in">
          <div className="p-8 space-y-6">
            {/* Indicador de Pomodoros */}
            <div className="flex items-center justify-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i < completedPomodoros % 4
                      ? 'bg-primary w-3 h-3 shadow-lg shadow-primary/50'
                      : 'bg-muted w-2 h-2'
                  }`}
                />
              ))}
            </div>

            {/* Modo atual */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                {getModeLabel()}
              </p>
            </div>

            {/* Timer principal */}
            <div className="relative">
              {/* Progresso circular */}
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="relative py-12 text-center">
                <p className="text-7xl font-bold text-foreground tabular-nums drop-shadow-lg">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>

            {/* Controles do timer */}
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`bg-gradient-to-r ${getTimerColor()} hover:scale-110 transition-transform text-white shadow-lg`}
              >
                {isRunning ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <Button
                onClick={resetTimer}
                size="lg"
                variant="outline"
                className="backdrop-blur-sm transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>

            {/* Contador de Pomodoros */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm">
                🍅 Pomodoros completados hoje: <span className="font-bold text-foreground">{completedPomodoros}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Seletor de Estações Lofi */}
        <div className="mt-8 w-full max-w-md">
          <div className="grid grid-cols-3 gap-3">
            {LOFI_STATIONS.map((station, index) => {
              const Icon = station.icon;
              return (
                <button
                  key={station.id}
                  onClick={() => changeStation(index)}
                  className={`p-4 rounded-xl transition-all duration-300 border ${
                    selectedStation === index
                      ? 'bg-primary/20 backdrop-blur-md border-primary scale-105 shadow-xl'
                      : 'bg-card/30 backdrop-blur-sm border-border hover:bg-card/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 transition-all ${
                    selectedStation === index ? 'text-primary animate-pulse' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-xs font-medium ${
                    selectedStation === index ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {station.name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Controle de volume */}
          <div className="mt-4 flex items-center justify-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground transition-all"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-5 h-5 mr-2" />
                  <span className="text-sm">Ativar som</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 mr-2" />
                  <span className="text-sm">Silenciar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Espaço para Play/Pause • ESC para sair
          </p>
        </div>
      </div>

      {/* Player de música do YouTube */}
      <iframe
        ref={iframeRef}
        className="absolute -left-[9999px]"
        width="1"
        height="1"
        src={`https://www.youtube.com/embed/${LOFI_STATIONS[selectedStation].videoId}?autoplay=1&enablejsapi=1&controls=0&loop=1&playlist=${LOFI_STATIONS[selectedStation].videoId}`}
        title="Lofi Music"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes wave-slow {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes wave-reverse {
          0% {
            transform: rotate(360deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.6;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.4;
          }
        }

        @keyframes pulse-glow-delayed {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.6);
            opacity: 0.35;
          }
        }

        @keyframes pulse-glow-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.3;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-wave-slow {
          animation: wave-slow 60s ease-in-out infinite;
        }

        .animate-wave-reverse {
          animation: wave-reverse 50s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 40s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 8s ease-in-out infinite;
        }

        .animate-pulse-glow-delayed {
          animation: pulse-glow-delayed 10s ease-in-out infinite 2s;
        }

        .animate-pulse-glow-slow {
          animation: pulse-glow-slow 12s ease-in-out infinite 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
