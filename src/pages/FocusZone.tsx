import { useRef, useState, useEffect } from "react";

// Duração do Pomodoro em segundos (25 min padrão, modifique se quiser)
const POMODORO_DURATION = 25 * 60;

// Streams públicos de música - pode expandir para mais rádios depois!
const STATIONS = [
  {
    name: "Lo-fi Café",
    url: "https://streams.ilovemusic.de/iloveradio14.mp3",
    color: "bg-amber-200"
  },
  {
    name: "Chill Study",
    url: "https://uk3.internet-radio.com/proxy/medradio?mp=/stream",
    color: "bg-blue-100"
  },
  {
    name: "Jazz Vibes",
    url: "https://media-ssl.musicradio.com/JazzFM",
    color: "bg-purple-200"
  }
];

// Áudio de alerta. Troque se quiser outro beep.
// Salve beep.mp3 em /public se preferir usar arquivo local.
const ALARM_SOUND = "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

export default function FocusZone() {
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

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800
        bg-[url('/grid-medical-light.svg')] bg-cover bg-fixed bg-no-repeat
        flex flex-col justify-start items-center px-2 pb-10"
      style={{ minHeight: "100dvh" }}
    >
      {/* HEADER */}
      <header className="w-full flex flex-col items-center max-w-2xl pt-6 pb-2 sm:pt-10 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg text-center">
          Focus Zone
        </h1>
        <p className="mt-1 sm:mt-2 text-white/80 text-center text-sm sm:text-base max-w-md">
          Pomodoro com rádio Lo-fi integrado. Totalmente responsivo e pronto para desktop/mobile.
        </p>
      </header>

      <section className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
        <section
          className="flex-1 flex flex-col items-center justify-center gap-6 bg-white/90 rounded-2xl p-6 shadow-md min-w-0 w-full max-w-md transition-all"
        >
          {/* TIMER POMODORO */}
          <div className="w-full flex flex-col items-center pt-2">
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle
                cx={60}
                cy={60}
                r={54}
                stroke={isFinished ? "#f59e42" : "#6366f1"}
                strokeWidth={8}
                fill="#fff"
                opacity={0.3}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy="0.35em"
                fontSize="2.3em"
                fontFamily="monospace"
                fill={isFinished ? "#f59e42" : "#4f46e5"}
              >
                {minutes}:{seconds}
              </text>
            </svg>
            {isFinished && (
              <p className="mt-3 mb-0 text-amber-600 font-bold text-lg text-center animate-pulse">
                TEMPO ESGOTADO! Faça uma pausa e retome para manter o foco.
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-center mt-1">
            <button
              className={`${
                isRunning
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white font-semibold rounded-xl px-4 py-2 transition w-28 sm:w-32 shadow`}
              onClick={() => {
                if (isFinished) {
                  resetPomodoro();
                } else {
                  setIsRunning((v) => !v);
                }
              }}
            >
              {isFinished
                ? "Reiniciar"
                : isRunning
                ? "Pausar"
                : "Iniciar"}
            </button>
            <button
              className="bg-gray-100 hover:bg-gray-200 text-indigo-700 font-semibold rounded-xl px-4 py-2 transition w-20 sm:w-24 shadow"
              onClick={resetPomodoro}
              disabled={timer === POMODORO_DURATION && !isRunning && !isFinished}
              title="Zerar Pomodoro e voltar ao início"
            >
              Reset
            </button>
          </div>

          {/* PLAYER LO-FI */}
          <div className={`mt-6 w-full ${STATIONS[stationIndex].color} rounded-xl shadow-sm p-4 flex flex-col items-center transition-all`}>
            <div className="w-full flex flex-col gap-1 items-center">
              <span className="font-semibold text-indigo-700 uppercase text-xs">
                Rádio: {STATIONS[stationIndex].name}
              </span>
              <div className="flex gap-2 mt-2 w-full justify-center">
                <button
                  onClick={togglePlay}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shadow transition-all"
                  aria-label={playing ? "Pausar Rádio" : "Tocar Rádio"}
                >
                  {playing ? "Pause" : "Play"}
                </button>
                <button
                  onClick={nextStation}
                  className="px-4 py-2 bg-white text-indigo-700 font-semibold border border-indigo-300 rounded-lg shadow hover:bg-indigo-50 transition"
                  aria-label="Próxima Estação"
                >
                  Trocar estação
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
          {/* Audio para o alerta de fim de ciclo */}
          <audio
            ref={audioAlarmRef}
            src={ALARM_SOUND}
            preload="auto"
            className="sr-only"
          />
        </section>
      </section>
    </main>
  );
}