import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react";

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

export default function FocusZone() {
  const navigate = useNavigate();
  
  // Estados do Pomodoro
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timer, setTimer] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioAlarmRef = useRef<HTMLAudioElement>(null);

  // Estados do Player
  const [stationIndex, setStationIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Obter duração baseada no modo
  const getDuration = (currentMode: PomodoroMode) => {
    switch (currentMode) {
      case 'focus': return FOCUS_DURATION;
      case 'shortBreak': return SHORT_BREAK;
      case 'longBreak': return LONG_BREAK;
    }
  };

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
  }, [isRunning]);

  // Timer completo - auto-switch de modo
  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Tocar alarme
    if (audioAlarmRef.current) {
      audioAlarmRef.current.currentTime = 0;
      audioAlarmRef.current.play();
    }

    // Auto-switch de modo
    if (mode === 'focus') {
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);
      
      // A cada 4 ciclos de foco, pausa longa. Caso contrário, pausa curta.
      if (newCycles % 4 === 0) {
        setMode('longBreak');
        setTimer(LONG_BREAK);
      } else {
        setMode('shortBreak');
        setTimer(SHORT_BREAK);
      }
    } else {
      // Após pausa, volta ao foco
      setMode('focus');
      setTimer(FOCUS_DURATION);
    }
  };

  // Mudar modo manualmente
  const changeMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setTimer(getDuration(newMode));
    setIsRunning(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimer(getDuration(mode));
    if (audioAlarmRef.current) {
      audioAlarmRef.current.pause();
      audioAlarmRef.current.currentTime = 0;
    }
  };

  // Controles do rádio
  const nextStation = () => {
    setStationIndex((idx) => (idx + 1) % STATIONS.length);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (!playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setPlaying((p) => !p);
    }
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 50);
  };

  // Atualizar volume do áudio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, playing]);

  // Formatação de tempo
  const minutes = Math.floor(timer / 60).toString().padStart(2, "0");
  const seconds = (timer % 60).toString().padStart(2, "0");

  // Progresso do círculo
  const totalDuration = getDuration(mode);
  const progress = ((totalDuration - timer) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (progress / 100) * circumference;

  // Labels dos modos
  const modeLabels = {
    focus: 'Foco Profundo',
    shortBreak: 'Pausa Curta',
    longBreak: 'Pausa Longa'
  };

  // Cores dos modos
  const modeColors = {
    focus: { bg: '#6366f1', light: '#e0e7ff' },
    shortBreak: { bg: '#10b981', light: '#d1fae5' },
    longBreak: { bg: '#8b5cf6', light: '#ede9fe' }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
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

        {/* CONTEÚDO PRINCIPAL */}
        <section className="flex-1 flex items-center justify-center px-3 sm:px-6 pb-6">
          <div className="w-full max-w-lg">
            {/* Card principal */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-white/20">
              
              {/* Seletor de Modos */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => changeMode('focus')}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    mode === 'focus'
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Foco
                </button>
                <button
                  onClick={() => changeMode('shortBreak')}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    mode === 'shortBreak'
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pausa 5min
                </button>
                <button
                  onClick={() => changeMode('longBreak')}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
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
                  <svg width={200} height={200} viewBox="0 0 200 200" className="transform -rotate-90">
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
                      className="transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                  
                  {/* Tempo no centro */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p 
                      className="text-5xl sm:text-6xl font-bold tabular-nums"
                      style={{ color: modeColors[mode].bg }}
                    >
                      {minutes}:{seconds}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contador de ciclos */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Ciclos completados: <span className="font-bold text-blue-600">{completedCycles}</span>
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
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
                  title="Resetar timer"
                >
                  Reset
                </button>
              </div>

              {/* PLAYER LO-FI */}
              <div className={`bg-gradient-to-br ${STATIONS[stationIndex].color} rounded-2xl shadow-inner p-5 sm:p-6 border border-blue-200/30 backdrop-blur-sm`}>
                <div className="flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${playing ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
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
                  Espaço: Play/Pause Timer • P: Play/Pause Música • M: Mute • ESC: Sair
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
        </section>
      </div>
    </main>
  );
}
