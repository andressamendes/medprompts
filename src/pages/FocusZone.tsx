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

const POMODORO_DURATION = 50 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

const LOFI_STATIONS = [
  {
    id: 'study',
    name: 'Lofi Study',
    icon: Coffee,
    audioUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    description: 'Beats suaves para estudo',
  },
  {
    id: 'chill',
    name: 'Chill Vibes',
    icon: Cloud,
    audioUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
    description: 'Relaxe e respire',
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: Zap,
    audioUrl: 'https://stream.zeno.fm/f6vhq8qqtg8uv',
    description: 'Concentração máxima',
  },
];

export default function FocusZone() {
  const navigate = useNavigate();
  const [sessionStartTime] = useState(Date.now());
  const [selectedStation, setSelectedStation] = useState(0);
  const [volume, setVolume] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = false;
      audioRef.current.volume = volume / 100;
    }
    
    audioRef.current.src = LOFI_STATIONS[selectedStation].audioUrl;
    audioRef.current.volume = volume / 100;
    
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        logger.warn('Erro ao reproduzir áudio', { error: String(error) });
        setIsPlaying(false);
      });
    }
  }, [selectedStation]);

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

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
      if (e.key.toLowerCase() === 'p') {
        toggleAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, volume, isPlaying]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    try {
      const notif = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe87');
      notif.volume = 0.5;
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
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration = currentMode === 'focus' ? POMODORO_DURATION : currentMode === 'short' ? SHORT_BREAK : LONG_BREAK;
    setTimeLeft(duration);
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    navigate(-1);
  };

  const changeStation = (index: number) => {
    setSelectedStation(index);
    logger.info('Estação alterada', {
      newStation: LOFI_STATIONS[index].name,
    });
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 30);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        logger.warn('Erro ao reproduzir áudio', { error: String(error) });
      });
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const circleRadius = 45;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleProgressOffset = circleCircumference * (1 - getProgress() / 100);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fundo gradiente médico profissional */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      
      {/* Overlay com padrão de grade médica sutil */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Gradiente de overlay para melhor contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Container de controles com z-index correto */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Header - z-index 30 */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-6 flex justify-between items-center bg-gradient-to-b from-black/95 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg">
              <Music2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base sm:text-xl">Focus Zone</h1>
              <p className="text-white/60 text-xs hidden sm:block">{LOFI_STATIONS[selectedStation].name}</p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExit}
            className="text-white/90 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Sair do Focus Zone"
          >
            <X className="w-5 h-5" />
            <span className="ml-2 hidden sm:inline">Sair</span>
          </Button>
        </div>

        {/* Timer central - z-index 40 (MAIOR que os controles inferiores) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-3 sm:px-4 z-40">
          <Card className="max-w-xs sm:max-w-sm mx-auto bg-black/70 backdrop-blur-2xl border-white/20 shadow-2xl">
            <div className="p-4 sm:p-8 space-y-3 sm:space-y-6">
              <div className="flex items-center justify-center gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i < completedPomodoros % 4
                        ? 'bg-indigo-400 w-2.5 h-2.5 shadow-lg shadow-indigo-400/50'
                        : 'bg-white/30 w-1.5 h-1.5'
                    }`}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-white/70 text-xs sm:text-sm uppercase tracking-widest font-medium">
                  {getModeLabel()}
                </p>
              </div>

              <div className="relative">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={circleProgressOffset}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative py-6 sm:py-10 text-center">
                  <p className="text-4xl sm:text-6xl font-bold text-white tabular-nums tracking-tight drop-shadow-2xl">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {isRunning ? (
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all text-white shadow-xl"
                    aria-label="Pausar timer"
                  >
                    <Pause className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all text-white shadow-xl"
                    aria-label="Iniciar timer"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </Button>
                )}

                <Button
                  onClick={resetTimer}
                  size="lg"
                  variant="ghost"
                  className="bg-white/5 hover:bg-white/15 text-white border border-white/20 transition-all hover:scale-105"
                  aria-label="Resetar timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center pt-2 sm:pt-3 border-t border-white/10">
                <p className="text-white/60 text-xs">
                  Pomodoros: <span className="font-bold text-white">{completedPomodoros}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Controles de música - z-index 20 (MENOR que o timer central) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-6 bg-gradient-to-t from-black/95 to-transparent">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {/* Botão Play/Pause da Música */}
            <div className="flex items-center justify-center mb-2">
              {isPlaying ? (
                <Button
                  onClick={toggleAudio}
                  size="lg"
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl transition-all hover:scale-105"
                  aria-label="Pausar música"
                >
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Pausar Música</span>
                </Button>
              ) : (
                <Button
                  onClick={toggleAudio}
                  size="lg"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white shadow-xl transition-all hover:scale-105 border border-white/20"
                  aria-label="Tocar música"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                  <span className="text-sm sm:text-base">Tocar Música</span>
                </Button>
              )}
            </div>

            {/* Controle de Volume */}
            <div className="flex items-center gap-3 sm:gap-4 bg-black/70 backdrop-blur-md rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-white/20">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 h-auto flex-shrink-0 transition-all"
                aria-label={volume === 0 ? "Ativar som" : "Desativar som"}
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>

              <div className="flex-1">
                <Slider
                  value={[volume]}
                  onValueChange={(val: number[]) => setVolume(val[0])}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                  aria-label="Controle de volume"
                />
              </div>

              <span className="text-white/70 text-xs sm:text-sm font-medium min-w-[2.5ch] sm:min-w-[3ch] text-right flex-shrink-0">
                {volume}%
              </span>
            </div>

            {/* Seletor de Estações */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {LOFI_STATIONS.map((station, index) => {
                const Icon = station.icon;
                return (
                  <button
                    key={station.id}
                    onClick={() => changeStation(index)}
                    className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 ${
                      selectedStation === index
                        ? 'bg-indigo-600/30 backdrop-blur-md border border-indigo-400/50 scale-105 shadow-lg shadow-indigo-500/20'
                        : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/20'
                    }`}
                    aria-label={`Selecionar estação ${station.name}`}
                  >
                    <Icon className={`w-3 h-3 sm:w-4 sm:h-4 transition-all ${
                      selectedStation === index ? 'text-indigo-200' : 'text-white/60 group-hover:text-white/80'
                    }`} />
                    <span className={`text-xs font-medium ${
                      selectedStation === index ? 'text-indigo-100' : 'text-white/60 group-hover:text-white/80'
                    }`}>
                      {station.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instruções de Atalhos */}
            <div className="text-center pt-1 sm:pt-2">
              <p className="text-white/40 text-xs">
                Espaço: Timer • P: Play/Pause • M: Mute • ESC: Sair
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
