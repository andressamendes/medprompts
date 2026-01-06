import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

// Duração do Pomodoro em segundos (25 min padrão)
const POMODORO_DURATION = 25 * 60;

// Streams públicos de música Lo-fi
const STATIONS = [
  {
    name: "Lo-fi Café",
    url: "https://streams.ilovemusic.de/iloveradio14.mp3",
    color: "from-amber-400/20 to-orange-400/20"
  },
  {
    name: "Chill Study",
    url: "https://uk3.internet-radio.com/proxy/medradio?mp=/stream",
    color: "from-blue-400/20 to-cyan-400/20"
  },
  {
    name: "Jazz Vibes",
    url: "https://media-ssl.musicradio.com/JazzFM",
    color: "from-purple-400/20 to-pink-400/20"
  }
];

// Áudio de alerta
const ALARM_SOUND = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

export default function FocusZone() {
  const navigate = useNavigate();
  
  // ---- Pomodoro States ----
  const [timer, setTimer] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioAlarmRef = useRef<HTMLAudioElement>(null);

  // ---- Player Lofi ----
  const [stationIndex, setStationIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Pomodoro decrementar
  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            setIsRunning(false);
            setIsFinished(true);
            if (audioAlarmRef.current) {
              audioAlarmRef.current.currentTime = 0;
              audioAlarmRef.current.play();
            }
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
  }, [isRunning, isFinished]);

  // Reset Pomodoro
  function resetPomodoro() {
    setIsRunning(false);
    setIsFinished(false);
    setTimer(POMODORO_DURATION);
    if (audioAlarmRef.current) {
      audioAlarmRef.current.pause();
      audioAlarmRef.current.currentTime = 0;
    }
  }

  // ---- Rádio ----
  function nextStation() {
    setStationIndex((idx) => (idx + 1) % STATIONS.length);
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  function togglePlay() {
    if (audioRef.current) {
      if (!playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setPlaying((p) => !p);
    }
  }

  // Exibição do tempo
  const minutes = Math.floor(timer / 60).toString().padStart(2, "0");
  const seconds = (timer % 60).toString().padStart(2, "0");

  // Cálculo do progresso para o círculo
  const progress = ((POMODORO_DURATION - timer) / POMODORO_DURATION) * 100;
  const circumference = 2 * Math.PI * 90; // raio 90
  const offset = circumference - (progress / 100) * circumference;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Fundo gradiente médico profissional */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      
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

      {/* Gradiente de overlay para melhor contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* HEADER com botão Sair */}
        <header className="w-full p-3 sm:p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">
              Focus Zone
            </h1>
            <p className="mt-1 text-white/70 text-xs sm:text-sm max-w-md">
              Pomodoro com rádio Lo-fi integrado
            </p>
          </div>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
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
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 border border-white/20">
              
              {/* TIMER POMODORO */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <svg width={200} height={200} viewBox="0 0 200 200" className="transform -rotate-90">
                    {/* Círculo de fundo */}
                    <circle
                      cx={100}
                      cy={100}
                      r={90}
                      stroke={isFinished ? "#fbbf24" : "#e0e7ff"}
                      strokeWidth={8}
                      fill="transparent"
                    />
                    {/* Círculo de progresso */}
                    <circle
                      cx={100}
                      cy={100}
                      r={90}
                      stroke={isFinished ? "#f59e0b" : "#6366f1"}
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
                    <p className={`text-5xl sm:text-6xl font-bold tabular-nums ${
                      isFinished ? "text-amber-600" : "text-indigo-600"
                    }`}>
                      {minutes}:{seconds}
                    </p>
                  </div>
                </div>

                {/* Mensagem de conclusão */}
                {isFinished && (
                  <div className="mt-6 text-center">
                    <p className="text-amber-600 font-bold text-base sm:text-lg animate-pulse">
                      🎉 Tempo esgotado!
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Faça uma pausa e retome para manter o foco
                    </p>
                  </div>
                )}
              </div>

              {/* CONTROLES DO POMODORO */}
              <div className="flex gap-2 sm:gap-3 justify-center">
                <button
                  className={`${
                    isRunning
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white font-semibold rounded-xl px-6 py-3 sm:px-8 sm:py-3 transition-all shadow-lg hover:scale-105 flex-1 max-w-[160px]`}
                  onClick={() => {
                    if (isFinished) {
                      resetPomodoro();
                    } else {
                      setIsRunning((v) => !v);
                    }
                  }}
                >
                  {isFinished ? "Reiniciar" : isRunning ? "Pausar" : "Iniciar"}
                </button>
                
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-indigo-700 font-semibold rounded-xl px-5 py-3 sm:px-6 sm:py-3 transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={resetPomodoro}
                  disabled={timer === POMODORO_DURATION && !isRunning && !isFinished}
                  title="Zerar Pomodoro e voltar ao início"
                >
                  Reset
                </button>
              </div>

              {/* PLAYER LO-FI */}
              <div className={`bg-gradient-to-br ${STATIONS[stationIndex].color} rounded-2xl shadow-inner p-5 sm:p-6 border border-indigo-200/30 backdrop-blur-sm`}>
                <div className="flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-indigo-900 text-sm sm:text-base">
                      {STATIONS[stationIndex].name}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 sm:gap-3 w-full">
                    <button
                      onClick={togglePlay}
                      className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                      aria-label={playing ? "Pausar Rádio" : "Tocar Rádio"}
                    >
                      {playing ? "⏸ Pausar" : "▶ Play"}
                    </button>
                    
                    <button
                      onClick={nextStation}
                      className="px-4 py-2.5 sm:px-5 sm:py-3 bg-white hover:bg-gray-50 text-indigo-700 font-semibold border-2 border-indigo-300 rounded-xl shadow-lg transition-all hover:scale-105"
                      aria-label="Próxima Estação"
                    >
                      Trocar
                    </button>
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
                  ESC: Sair • Espaço: Play/Pause
                </p>
              </div>

              {/* Audio para o alerta de fim de ciclo */}
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
