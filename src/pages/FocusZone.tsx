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
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=0&loop=1&playlist=jfKfPfyJRdk',
    description: 'Beats suaves para estudo',
  },
  {
    id: 'chill',
    name: 'Chill Vibes',
    icon: Cloud,
    url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&mute=0&controls=0&loop=1&playlist=5qap5aO4i9A',
    description: 'Relaxe e respire',
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: Zap,
    url: 'https://www.youtube.com/embed/7NOSDKb0HlU?autoplay=1&mute=0&controls=0&loop=1&playlist=7NOSDKb0HlU',
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (currentMode === 'focus') return 'from-amber-400 to-orange-500';
    if (currentMode === 'short') return 'from-green-400 to-emerald-500';
    return 'from-blue-400 to-indigo-500';
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
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-[#2d1b3d] via-[#3d2a4a] to-[#4a2c5a]">
      {/* Imagem de fundo com overlay - Simulando ambiente de cafeteria/biblioteca */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1920&q=80')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/60" />

      {/* Partículas flutuantes animadas (efeito neve/poeira) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: -10 + '%',
              animation: `fall ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: Math.random() * 10 + 's',
            }}
          />
        ))}
      </div>

      {/* Container principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header com controles */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-300" />
            <h1 className="text-white font-semibold text-lg">Focus Zone</h1>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExit}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Sair (ESC)</span>
          </Button>
        </div>

        {/* Timer Pomodoro - Card Central */}
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl">
          <div className="p-8 space-y-6">
            {/* Indicador de Pomodoros */}
            <div className="flex items-center justify-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < completedPomodoros % 4
                      ? 'bg-amber-400 w-3 h-3'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Modo atual */}
            <div className="text-center">
              <p className="text-white/70 text-sm uppercase tracking-wider font-medium">
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
                  stroke="rgba(255,255,255,0.1)"
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
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="relative py-12 text-center">
                <p className="text-7xl font-bold text-white tabular-nums">
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
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>

            {/* Contador de Pomodoros */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-white/60 text-sm">
                🍅 Pomodoros completados hoje: <span className="font-bold text-white">{completedPomodoros}</span>
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
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    selectedStation === index
                      ? 'bg-white/20 backdrop-blur-md border-2 border-white/40 scale-105'
                      : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    selectedStation === index ? 'text-amber-300' : 'text-white/60'
                  }`} />
                  <p className={`text-xs font-medium ${
                    selectedStation === index ? 'text-white' : 'text-white/60'
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
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 mr-2" />
              ) : (
                <Volume2 className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm">{isMuted ? 'Ativar som' : 'Silenciar'}</span>
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            Espaço para Play/Pause • ESC para sair
          </p>
        </div>
      </div>

      {/* Player de música (invisível) */}
      <div className="absolute -left-[9999px]">
        <iframe
          ref={iframeRef}
          width="1"
          height="1"
          src={LOFI_STATIONS[selectedStation].url + (isMuted ? '&mute=1' : '&mute=0')}
          title="Lofi Music"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) translateX(${Math.random() * 20 - 10}vw);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
