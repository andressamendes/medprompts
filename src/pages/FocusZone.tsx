import { useState } from "react";
// Importe outros hooks/contextos se necessário

export default function FocusZone() {
  // Estados e funções aqui
  // Exemplo didático; ajuste conforme sua lógica real
  const [timer, setTimer] = useState(1500); // 25 minutos?
  const [isRunning, setIsRunning] = useState(false);

  // Exemplo visual e estrutura: TUDO 100% responsivo e sem fixed/absolute desnecessário
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800
        bg-[url('/grid-medical-light.svg')] bg-cover bg-fixed bg-no-repeat
        flex flex-col justify-start items-center px-2 pb-10"
      style={{ minHeight: "100dvh" }}
    >
      {/* HEADER */}
      <header
        className="w-full flex flex-col items-center max-w-2xl pt-6 pb-2
          sm:pt-10 sm:pb-4
          "
      >
        <h1
          className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg text-center"
        >
          Focus Zone
        </h1>
        <p className="mt-1 sm:mt-2 text-white/80 text-center text-sm sm:text-base max-w-md">
          Modo profundo de estudo com Pomodoro, música e ferramentas médicas. Totalmente responsivo.
        </p>
      </header>

      {/* CONTAINER CENTRAL */}
      <section
        className="flex flex-1 w-full max-w-2xl
          flex-col sm:flex-row gap-4 md:gap-6 items-stretch justify-center"
      >
        {/* TIMER POMODORO */}
        <section
          className="
            flex-1 flex flex-col items-center justify-center gap-4
            bg-white/90 rounded-2xl p-4 shadow-md
            min-w-0
          "
        >
          <div className="w-full flex flex-col items-center">
            {/* Círculo Pomodoro ou Timer */}
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle
                cx={60}
                cy={60}
                r={54}
                stroke="#6366f1"
                strokeWidth={8}
                fill="#fff"
                opacity={0.3}
              />
              {/* Exemplo visual: */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy="0.35em"
                fontSize="2.3em"
                fontFamily="monospace"
                fill="#4f46e5"
              >
                {Math.floor(timer / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {(timer % 60).toString().padStart(2, "0")}
              </text>
            </svg>
          </div>
          {/* Botões do Pomodoro */}
          <div className="flex gap-2 justify-center mt-2">
            <button
              className="
                bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-4 py-2
                transition-colors w-28 sm:w-32
                shadow
              "
              onClick={() => setIsRunning((v) => !v)}
            >
              {isRunning ? "Pausar" : "Iniciar"}
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl px-4 py-2 transition-colors w-20 sm:w-24 shadow"
              onClick={() => setTimer(1500)}
            >
              Reset
            </button>
          </div>
        </section>

        {/* FERRAMENTAS */}
        <section
          className="
            flex-1 flex flex-col items-center justify-between gap-4
            bg-white/90 rounded-2xl p-4 shadow-md
            min-w-0
          "
        >
          <h2 className="text-lg sm:text-xl text-indigo-700 font-bold mb-2 text-center">
            Ferramentas rápidas
          </h2>
          <div className="flex flex-col gap-3 w-full">
            <button
              className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium px-4 py-2 rounded-md shadow"
            >
              Abrir calculadora médica
            </button>
            <button
              className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium px-4 py-2 rounded-md shadow"
            >
              Ver tabela de medicamentos
            </button>
          </div>
          <div className="w-full flex flex-col gap-1 pt-6">
            <label
              htmlFor="music"
              className="block text-xs uppercase font-semibold text-indigo-600"
            >
              Música para concentração
            </label>
            <select
              id="music"
              className="
                w-full mt-1 px-3 py-2 border border-indigo-200 rounded-md
                text-indigo-900 bg-indigo-50 focus:outline-none focus:border-indigo-400
              "
            >
              <option>Lo-fi instrumental</option>
              <option>Sons da natureza</option>
              <option>Ambiente hospitalar</option>
            </select>
          </div>
        </section>
      </section>
    </main>
  );
}