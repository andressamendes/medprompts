import { Link } from "react-router-dom";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, BookOpen, GraduationCap } from "lucide-react";

// ============================================================================
// DADOS DOS SIMULADOS
// ============================================================================

interface Simulado {
  id: string;
  titulo: string;
  subtitulo: string;
  url: string;
  emoji: string;
}

interface Periodo {
  numero: number;
  titulo: string;
  cor: string;
  corHover: string;
  focusRing: string;
  bgIcon: string;
  simulados: Simulado[];
}

const PERIODOS: Periodo[] = [
  {
    numero: 1,
    titulo: "1º Período",
    cor: "blue",
    corHover: "hover:border-blue-400",
    focusRing: "focus:ring-blue-500",
    bgIcon: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    simulados: [
      {
        id: "soi-1",
        titulo: "N1 - SOI I (SIMULADO)",
        subtitulo: "Sistemas Orgânicos Integrados I",
        url: "https://www.perplexity.ai/spaces/n1-soi-i-simulado-G67QN_wmRZylRakl81zDFQ",
        emoji: "🔬"
      },
      {
        id: "ham-1",
        titulo: "N1 - HAM I (SIMULADO)",
        subtitulo: "Habilidades e Atitudes Médicas I",
        url: "https://www.perplexity.ai/spaces/n1-ham-i-simulado-_yrEnui7RjGH2gLPzve2PQ",
        emoji: "🦴"
      },
      {
        id: "iesc-1",
        titulo: "N1 - IESC I (SIMULADO)",
        subtitulo: "Interação Ensino-Serviço-Comunidade I",
        url: "https://www.perplexity.ai/spaces/n1-iesc-i-simulado-_Z.iex1PTQa_1hWC5zJgeA",
        emoji: "🏥"
      },
      {
        id: "mcm-1",
        titulo: "N1 - MCM I (SIMULADO)",
        subtitulo: "Métodos Científicos em Medicina I",
        url: "https://www.perplexity.ai/spaces/n1-mcm-i-simulado-L7CHpXr_RmSB1NgBEv1Qbw",
        emoji: "🧬"
      },
      {
        id: "integradora-1",
        titulo: "INTEGRADORA I (SIMULADO)",
        subtitulo: "Avaliação Integradora do 1º Período",
        url: "https://www.perplexity.ai/spaces/integradora-i-simulado-azjHrHD3RTS722X50QKY3A",
        emoji: "🎯"
      }
    ]
  },
  {
    numero: 2,
    titulo: "2º Período",
    cor: "purple",
    corHover: "hover:border-purple-400",
    focusRing: "focus:ring-purple-500",
    bgIcon: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    simulados: [
      {
        id: "soi-2",
        titulo: "N1 - SOI II (SIMULADO)",
        subtitulo: "Sistemas Orgânicos Integrados II",
        url: "https://www.perplexity.ai/spaces/n1-soi-ii-simulado-T7x20s0USzG_c6Hfff7mRw",
        emoji: "🔬"
      },
      {
        id: "ham-2",
        titulo: "N1 - HAM II (SIMULADO)",
        subtitulo: "Habilidades e Atitudes Médicas II",
        url: "https://www.perplexity.ai/spaces/n1-ham-ii-simulado-vvK1vHU_SN6bs3mj2aHnRg",
        emoji: "🦴"
      },
      {
        id: "iesc-2",
        titulo: "N1 - IESC II (SIMULADO)",
        subtitulo: "Interação Ensino-Serviço-Comunidade II",
        url: "https://www.perplexity.ai/spaces/n1-iesc-ii-simulado-RKADyMtATQGTluUJvwKQJQ",
        emoji: "🏥"
      },
      {
        id: "mcm-2",
        titulo: "N1 - MCM II (SIMULADO)",
        subtitulo: "Métodos Científicos em Medicina II",
        url: "https://www.perplexity.ai/spaces/n1-mcm-ii-simulado-u0KWMtFxQd.cisF6rFknxw",
        emoji: "🧬"
      },
      {
        id: "integradora-2",
        titulo: "INTEGRADORA II (SIMULADO)",
        subtitulo: "Avaliação Integradora do 2º Período",
        url: "https://www.perplexity.ai/spaces/integradora-ii-simulado-EfdIkHnMTsu9HdOw7LNItw",
        emoji: "🎯"
      }
    ]
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Simulados = () => {
  return (
    <>
      <SEOHead
        title="Simulados - 1º e 2º Período"
        description="Simulados de Medicina para 1º e 2º período. Links para espaços Perplexity com questões de SOI, HAM, IESC, MCM e Integradora."
        canonical="https://andressamendes.github.io/medprompts/simulados"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <PublicNavbar />

        <main id="main-content" className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-10">

            {/* Header com botão voltar */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-white/50 dark:hover:bg-gray-800/50"
              >
                <Link to="/" aria-label="Voltar para página inicial">
                  <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                  Voltar
                </Link>
              </Button>
            </div>

            {/* Hero Section */}
            <header className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-semibold">Simulados N1</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Simulados - 1º e 2º Período
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Links para os espaços Perplexity com questões das disciplinas. Clique para acessar cada simulado.
              </p>

              {/* Estatísticas */}
              <div className="flex items-center justify-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Simulados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Períodos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">4</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Disciplinas</div>
                </div>
              </div>
            </header>

            {/* Seções dos Períodos */}
            {PERIODOS.map((periodo) => (
              <section key={periodo.numero} aria-labelledby={`periodo-${periodo.numero}`}>
                {/* Header da Seção */}
                <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${periodo.bgIcon}`}>
                    {periodo.numero === 1 ? "📘" : "📗"}
                  </div>
                  <div>
                    <h2 id={`periodo-${periodo.numero}`} className="text-2xl font-bold text-gray-900 dark:text-white">
                      {periodo.titulo}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {periodo.simulados.length} simulados disponíveis
                    </p>
                  </div>
                </div>

                {/* Lista de Simulados */}
                <div className="space-y-3">
                  {periodo.simulados.map((simulado) => (
                    <a
                      key={simulado.id}
                      href={simulado.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        flex items-center gap-4 p-4
                        bg-white dark:bg-gray-800/50
                        border-2 border-gray-200 dark:border-gray-700
                        rounded-xl shadow-sm
                        transition-all duration-200
                        hover:shadow-md hover:-translate-y-0.5
                        ${periodo.corHover} dark:${periodo.corHover}
                        focus:outline-none focus:ring-2 focus:ring-offset-2 ${periodo.focusRing}
                      `}
                      aria-label={`Abrir ${simulado.titulo} em nova aba`}
                    >
                      {/* Ícone */}
                      <div className={`
                        w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                        ${periodo.bgIcon}
                      `}>
                        {simulado.emoji}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {simulado.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {simulado.subtitulo}
                        </p>
                      </div>

                      {/* Seta */}
                      <ExternalLink
                        className="h-5 w-5 text-gray-400 flex-shrink-0 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              </section>
            ))}

            {/* Dica */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Dica de Estudo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Os simulados são gerados pelo Perplexity AI. Após responder, peça explicações detalhadas das questões que errou para consolidar o aprendizado.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center pt-8 pb-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Simulados criados com{" "}
                <a
                  href="https://perplexity.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Perplexity AI
                </a>
              </p>
            </footer>

          </div>
        </main>
      </div>
    </>
  );
};

export default Simulados;
