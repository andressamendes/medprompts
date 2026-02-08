import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, BookOpen, GraduationCap, Target, Clock, Brain, CheckCircle2, Lightbulb, Play, Star, StickyNote, RotateCcw, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
// PROGRESSO E TRACKING
// ============================================================================

const PROGRESS_KEY = 'simulados_progress';

type SimuladoStatus = 'pending' | 'in_progress' | 'completed';
type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

interface SimuladoProgress {
  status: SimuladoStatus;
  confidence: number; // 0-5 (0 = não avaliado)
  note: string;
  lastReviewedAt: number | null;
}

type ProgressMap = Record<string, SimuladoProgress>;

const DEFAULT_PROGRESS: SimuladoProgress = {
  status: 'pending',
  confidence: 0,
  note: '',
  lastReviewedAt: null,
};

const ALL_SIMULADO_IDS = PERIODOS.flatMap(p => p.simulados.map(s => s.id));

function daysAgo(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

function daysAgoLabel(timestamp: number): string {
  const d = daysAgo(timestamp);
  if (d === 0) return 'Hoje';
  if (d === 1) return 'Ontem';
  return `${d} dias atrás`;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Simulados = () => {
  // ========== Estado de Progresso ==========
  const [progress, setProgress] = useState<ProgressMap>(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return {};
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  // Persistência
  useEffect(() => {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch { /* ignore */ }
  }, [progress]);

  // ========== Helpers ==========
  const getProgress = useCallback((id: string): SimuladoProgress => {
    return progress[id] || DEFAULT_PROGRESS;
  }, [progress]);

  const cycleStatus = useCallback((id: string) => {
    setProgress(prev => {
      const current = prev[id] || DEFAULT_PROGRESS;
      const order: SimuladoStatus[] = ['pending', 'in_progress', 'completed'];
      const nextIdx = (order.indexOf(current.status) + 1) % order.length;
      const nextStatus = order[nextIdx];
      const labels: Record<SimuladoStatus, string> = {
        pending: 'Pendente',
        in_progress: 'Em andamento',
        completed: 'Concluído',
      };
      toast({ title: labels[nextStatus], description: `Status atualizado` });
      return {
        ...prev,
        [id]: {
          ...current,
          status: nextStatus,
          lastReviewedAt: nextStatus === 'completed' ? Date.now() : current.lastReviewedAt,
        }
      };
    });
  }, []);

  const setConfidence = useCallback((id: string, value: number) => {
    setProgress(prev => ({
      ...prev,
      [id]: { ...(prev[id] || DEFAULT_PROGRESS), confidence: value }
    }));
  }, []);

  const saveNote = useCallback((id: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      [id]: { ...(prev[id] || DEFAULT_PROGRESS), note }
    }));
  }, []);

  // ========== Estatísticas Computadas ==========
  const stats = (() => {
    let completed = 0, inProgress = 0, pending = 0, totalConfidence = 0, ratedCount = 0;
    for (const id of ALL_SIMULADO_IDS) {
      const p = progress[id];
      if (!p || p.status === 'pending') pending++;
      else if (p.status === 'in_progress') inProgress++;
      else completed++;
      if (p && p.confidence > 0) { totalConfidence += p.confidence; ratedCount++; }
    }
    return {
      completed, inProgress, pending,
      total: ALL_SIMULADO_IDS.length,
      avgConfidence: ratedCount > 0 ? (totalConfidence / ratedCount).toFixed(1) : '—',
      progressPercent: Math.round((completed / ALL_SIMULADO_IDS.length) * 100),
    };
  })();

  const periodoStats = (periodo: Periodo) => {
    let completed = 0;
    for (const s of periodo.simulados) {
      if (progress[s.id]?.status === 'completed') completed++;
    }
    return { completed, total: periodo.simulados.length, percent: Math.round((completed / periodo.simulados.length) * 100) };
  };

  const filteredSimulados = (simulados: Simulado[]) => {
    if (filter === 'all') return simulados;
    return simulados.filter(s => getProgress(s.id).status === filter);
  };

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

              {/* Estatísticas dinâmicas */}
              <dl className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4" aria-label="Estatísticas dos simulados">
                <div className="text-center">
                  <dd className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}<span className="text-sm text-gray-400">/{stats.total}</span></dd>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Concluídos</dt>
                </div>
                <div className="text-center">
                  <dd className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</dd>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Em andamento</dt>
                </div>
                <div className="text-center">
                  <dd className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.avgConfidence}</dd>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Confiança média</dt>
                </div>
              </dl>

              {/* Barra de progresso geral */}
              {stats.completed > 0 && (
                <div className="max-w-xs mx-auto pt-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.progressPercent}% concluído</p>
                </div>
              )}
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

            {/* Destaques por Período com progresso */}
            <section aria-labelledby="destaques-heading" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <h2 id="destaques-heading" className="sr-only">Simulados disponíveis por período</h2>
              {PERIODOS.map(periodo => {
                const ps = periodoStats(periodo);
                const colors = periodo.numero === 1
                  ? { from: 'from-blue-500', to: 'to-blue-600', light: 'text-blue-100', bar: 'bg-blue-200', fill: 'bg-white/80' }
                  : { from: 'from-purple-500', to: 'to-purple-600', light: 'text-purple-100', bar: 'bg-purple-200', fill: 'bg-white/80' };
                return (
                  <div key={periodo.numero} className={`bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl p-5 text-white shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${colors.light} text-sm font-medium`}>{periodo.titulo}</p>
                        <p className="text-3xl font-bold mt-1">{ps.completed}<span className="text-lg opacity-70">/{ps.total}</span></p>
                        <p className={`${colors.light} text-xs mt-1`}>
                          {ps.completed === ps.total ? 'Todos concluídos!' : `${ps.total - ps.completed} restantes`}
                        </p>
                      </div>
                      <div className="text-5xl opacity-80" aria-hidden="true">{periodo.numero === 1 ? '📘' : '📗'}</div>
                    </div>
                    {/* Barra de progresso do período */}
                    <div className={`mt-3 h-1.5 ${colors.bar} rounded-full overflow-hidden`}>
                      <div className={`h-full ${colors.fill} rounded-full transition-all duration-500`} style={{ width: `${ps.percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Filtros por Status */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" aria-hidden="true" />
              {([
                { key: 'all' as FilterType, label: 'Todos', count: stats.total },
                { key: 'pending' as FilterType, label: 'Pendentes', count: stats.pending },
                { key: 'in_progress' as FilterType, label: 'Em andamento', count: stats.inProgress },
                { key: 'completed' as FilterType, label: 'Concluídos', count: stats.completed },
              ]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                  aria-pressed={filter === f.key}
                >
                  {f.label} {f.count > 0 && <span className="ml-1 opacity-70">({f.count})</span>}
                </button>
              ))}
            </div>

            {/* Seções dos Períodos */}
            {PERIODOS.map((periodo) => {
              const filtered = filteredSimulados(periodo.simulados);
              if (filter !== 'all' && filtered.length === 0) return null;
              const ps = periodoStats(periodo);
              return (
              <section key={periodo.numero} aria-labelledby={`periodo-${periodo.numero}`}>
                {/* Header da Seção */}
                <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${periodo.bgIcon}`}>
                    {periodo.numero === 1 ? "📘" : "📗"}
                  </div>
                  <div className="flex-1">
                    <h2 id={`periodo-${periodo.numero}`} className="text-2xl font-bold text-gray-900 dark:text-white">
                      {periodo.titulo}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ps.completed}/{ps.total} concluídos
                    </p>
                  </div>
                </div>

                {/* Lista de Simulados */}
                <ul className="space-y-3 list-none" role="list" aria-label={`Simulados do ${periodo.titulo}`}>
                  {filtered.map((simulado) => {
                    const prog = getProgress(simulado.id);
                    const needsReview = prog.lastReviewedAt && daysAgo(prog.lastReviewedAt) >= 5;
                    return (
                    <li key={simulado.id} className="space-y-0">
                      <div className={`
                        p-3 sm:p-4
                        bg-white dark:bg-gray-800/50
                        border-2 rounded-xl shadow-sm
                        transition-all duration-200
                        ${prog.status === 'completed' ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20' :
                          prog.status === 'in_progress' ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20' :
                          'border-gray-200 dark:border-gray-700'}
                        ${needsReview ? 'ring-2 ring-amber-300 dark:ring-amber-600' : ''}
                      `}>
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Botão de Status */}
                          <button
                            onClick={() => cycleStatus(simulado.id)}
                            className={`
                              w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${prog.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                                prog.status === 'in_progress' ? 'bg-blue-500 border-blue-500 text-white' :
                                'border-gray-300 dark:border-gray-600 hover:border-blue-400'}
                            `}
                            aria-label={
                              prog.status === 'pending' ? 'Marcar como em andamento' :
                              prog.status === 'in_progress' ? 'Marcar como concluído' :
                              'Marcar como pendente'
                            }
                            title={
                              prog.status === 'pending' ? 'Pendente - clique para iniciar' :
                              prog.status === 'in_progress' ? 'Em andamento - clique para concluir' :
                              'Concluído - clique para reabrir'
                            }
                          >
                            {prog.status === 'completed' && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {prog.status === 'in_progress' && <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </button>

                          {/* Conteúdo + Link */}
                          <a
                            href={simulado.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                              flex-1 min-w-0 flex items-center gap-3
                              hover:opacity-80 transition-opacity
                              focus:outline-none focus:ring-2 focus:ring-offset-2 ${periodo.focusRing} rounded-lg
                            `}
                            aria-label={`Abrir ${simulado.titulo} em nova aba`}
                          >
                            <div
                              className={`
                                w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                                text-lg flex-shrink-0 ${periodo.bgIcon}
                              `}
                              aria-hidden="true"
                            >
                              {simulado.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold text-sm sm:text-base truncate ${
                                prog.status === 'completed' ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'
                              }`}>
                                {simulado.titulo}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {simulado.subtitulo}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                          </a>

                          {/* Botão de Notas */}
                          <button
                            onClick={() => setExpandedNote(expandedNote === simulado.id ? null : simulado.id)}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                              prog.note ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            aria-label={prog.note ? 'Ver nota' : 'Adicionar nota'}
                            title={prog.note ? 'Tem nota - clique para ver' : 'Adicionar nota'}
                          >
                            <StickyNote className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Linha de meta-info: estrelas de confiança + data de revisão */}
                        {prog.status === 'completed' && (
                          <div className="flex items-center gap-3 mt-2 ml-12 sm:ml-14 flex-wrap">
                            {/* Estrelas de confiança */}
                            <div className="flex items-center gap-0.5" aria-label={`Confiança: ${prog.confidence} de 5`}>
                              {[1, 2, 3, 4, 5].map(n => (
                                <button
                                  key={n}
                                  onClick={() => setConfidence(simulado.id, prog.confidence === n ? 0 : n)}
                                  className="p-0 transition-transform hover:scale-125"
                                  aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                                >
                                  <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                    n <= prog.confidence ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                                  }`} />
                                </button>
                              ))}
                              <span className="text-[10px] text-gray-500 ml-1">Confiança</span>
                            </div>

                            {/* Data de revisão */}
                            {prog.lastReviewedAt && (
                              <span className={`flex items-center gap-1 text-[10px] ${
                                needsReview ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-500'
                              }`}>
                                <RotateCcw className="w-3 h-3" />
                                {daysAgoLabel(prog.lastReviewedAt)}
                                {needsReview && ' - Hora de revisar!'}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Nota expansível */}
                        {expandedNote === simulado.id && (
                          <div className="mt-3 ml-12 sm:ml-14">
                            <textarea
                              value={prog.note}
                              onChange={(e) => saveNote(simulado.id, e.target.value)}
                              placeholder="Anotações sobre este simulado..."
                              rows={3}
                              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Suas notas são salvas automaticamente</p>
                          </div>
                        )}
                      </div>
                    </li>
                    );
                  })}
                </ul>
              </section>
              );
            })}

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
