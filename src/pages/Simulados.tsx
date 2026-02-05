import { Link } from "react-router-dom";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, BookOpen, GraduationCap, Target, Clock, Brain, CheckCircle2, Lightbulb } from "lucide-react";

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
  hoverBorder: string;
  focusRing: string;
  bgIcon: string;
  simulados: Simulado[];
}

const PERIODOS: Periodo[] = [
  {
    numero: 1,
    titulo: "1º Período",
    cor: "blue",
    hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500",
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
    hoverBorder: "hover:border-purple-400 dark:hover:border-purple-500",
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
        breadcrumbs={[
          { name: 'Home', url: 'https://andressamendes.github.io/medprompts/' },
          { name: 'Simulados', url: 'https://andressamendes.github.io/medprompts/simulados' }
        ]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Skip link para acessibilidade */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Pular para o conteúdo principal
        </a>

        <PublicNavbar />

        <main id="main-content" className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">

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
              <dl className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4" aria-label="Estatísticas dos simulados">
                <div className="text-center">
                  <dd className="text-2xl font-bold text-blue-600 dark:text-blue-400">10</dd>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Simulados</dt>
                </div>
                <div className="text-center">
                  <dd className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</dd>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Períodos</dt>
                </div>
                <div className="text-center">
                  <dd className="text-2xl font-bold text-green-600 dark:text-green-400">4</dd>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Disciplinas</dt>
                </div>
              </dl>
            </header>

            {/* Seção de Objetivos */}
            <section aria-labelledby="objetivos-heading" className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
              <h2 id="objetivos-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                Objetivos dos Simulados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Fixação do Conteúdo</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Reforce conceitos-chave através de questões práticas baseadas no conteúdo das disciplinas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Preparação para Provas</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Simule condições de prova e identifique pontos que precisam de mais revisão.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Autoavaliação</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Identifique lacunas no conhecimento e acompanhe seu progresso ao longo do período.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Aprendizado Ativo</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Use a IA para explicar respostas e aprofundar o entendimento dos temas.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Destaques por Período */}
            <section aria-labelledby="destaques-heading" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <h2 id="destaques-heading" className="sr-only">Simulados disponíveis por período</h2>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">1º Período</p>
                    <p className="text-3xl font-bold mt-1">5 simulados</p>
                    <p className="text-blue-100 text-xs mt-2">SOI, HAM, IESC, MCM + Integradora</p>
                  </div>
                  <div className="text-5xl opacity-80" aria-hidden="true">📘</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">2º Período</p>
                    <p className="text-3xl font-bold mt-1">5 simulados</p>
                    <p className="text-purple-100 text-xs mt-2">SOI, HAM, IESC, MCM + Integradora</p>
                  </div>
                  <div className="text-5xl opacity-80" aria-hidden="true">📗</div>
                </div>
              </div>
            </section>

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
                <ul className="space-y-3 list-none" role="list" aria-label={`Simulados do ${periodo.titulo}`}>
                  {periodo.simulados.map((simulado) => (
                    <li key={simulado.id}>
                      <a
                        href={simulado.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        flex items-center gap-3 sm:gap-4 p-3 sm:p-4
                        bg-white dark:bg-gray-800/50
                        border-2 border-gray-200 dark:border-gray-700
                        rounded-xl shadow-sm
                        transition-all duration-200
                        hover:shadow-md hover:-translate-y-0.5
                        ${periodo.hoverBorder}
                        focus:outline-none focus:ring-2 focus:ring-offset-2 ${periodo.focusRing}
                      `}
                      aria-label={`Abrir ${simulado.titulo} em nova aba`}
                    >
                      {/* Ícone */}
                      <div
                        className={`
                          w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center
                          text-lg sm:text-xl flex-shrink-0 ${periodo.bgIcon}
                        `}
                        aria-hidden="true"
                      >
                        {simulado.emoji}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {simulado.titulo}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {simulado.subtitulo}
                        </p>
                      </div>

                      {/* Ícone de link externo */}
                      <ExternalLink
                        className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Seção de Orientações Práticas */}
            <section aria-labelledby="orientacoes-heading" className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800/80 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm">
              <h2 id="orientacoes-heading" className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                Orientações Práticas de Estudo
              </h2>

              <div className="space-y-4">
                {/* Passo 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Escolha o simulado da disciplina</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Selecione o módulo que deseja revisar. Comece pelas disciplinas com maior dificuldade ou próximas da prova.</p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Responda sem consultar material</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Simule condições reais de prova. Marque as questões que teve dúvida para revisão posterior.</p>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Peça explicações detalhadas à IA</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Após finalizar, solicite ao Perplexity explicações das questões erradas. Pergunte: "Explique por que a alternativa X está correta".</p>
                  </div>
                </div>

                {/* Passo 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Refaça após alguns dias</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">A repetição espaçada consolida a memória. Refaça os simulados após 3-5 dias para verificar a retenção.</p>
                  </div>
                </div>
              </div>

              {/* Dica extra */}
              <div className="mt-5 p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Dica Pro</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Combine os simulados com a <Link to="/focus-zone" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Focus Zone</Link> para sessões de estudo mais produtivas.
                      Use também os <Link to="/prompts" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">prompts da biblioteca</Link> para aprofundar temas específicos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="text-center pt-6 sm:pt-8 pb-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Simulados criados com{" "}
                <a
                  href="https://perplexity.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline focus:underline focus:outline-none font-medium"
                  aria-label="Perplexity AI (abre em nova aba)"
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
