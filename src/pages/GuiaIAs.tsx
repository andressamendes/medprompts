import { PublicNavbar } from "@/components/PublicNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, BookOpen, Zap, Search, Brain, DollarSign, Users, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const GuiaIAs = () => {
  const navigate = useNavigate();

  // Estado dos filtros
  const [filtroPreco, setFiltroPreco] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroNovidade, setFiltroNovidade] = useState<string>("todos");

  const ias = [
    {
      name: "Claude Opus 4.5",
      description: "Líder em raciocínio com Deep Think Mode (41% no Humanity's Last Exam) e 80.9% no SWE-bench. Integração MCP Server.",
      url: "https://claude.ai",
      color: "from-orange-500 to-red-500",
      pros: ["Chat infinito", "Deep Think Mode", "Plan Mode", "80.9% SWE-bench", "MCP Servers"],
      ideal: "Casos clínicos complexos, análise profunda, programação avançada, workflows",
      price: "US$ 20/mês",
      badge: "ATUALIZADO 2026",
      badgeColor: "from-blue-100 to-indigo-100 text-blue-700",
      category: "raciocinio"
    },
    {
      name: "ChatGPT Health",
      description: "NOVO espaço dedicado à saúde lançado em 07/01/2026. Projetado especificamente para estudantes e profissionais de medicina.",
      url: "https://chat.openai.com/health",
      color: "from-rose-500 to-pink-500",
      pros: ["Especializado em saúde", "Interface dedicada", "Recursos médicos", "Integração com literatura"],
      ideal: "Casos clínicos, diagnóstico diferencial, guidelines atualizados, farmacologia",
      price: "US$ 20/mês (incluído no Plus)",
      badge: "NOVO 2026",
      badgeColor: "from-green-100 to-emerald-100 text-green-700",
      category: "saude"
    },
    {
      name: "GPT-4.5",
      description: "Lançado em fev/2025, versão aprimorada do GPT-4. Raciocínio superior e mais eficiente que o antecessor.",
      url: "https://chat.openai.com",
      color: "from-cyan-500 to-blue-500",
      pros: ["Raciocínio avançado", "Maior precisão", "Custom GPTs compatível", "Análise multimodal"],
      ideal: "Análise de dados médicos, interpretação de exames, revisão de literatura",
      price: "US$ 20/mês",
      badge: "NOVO 2026",
      badgeColor: "from-green-100 to-emerald-100 text-green-700",
      category: "raciocinio"
    },
    {
      name: "o4-mini",
      description: "Sucessor do o3-mini. Modelo de raciocínio GRATUITO com melhorias significativas em matemática e lógica.",
      url: "https://chat.openai.com",
      color: "from-green-500 to-emerald-500",
      pros: ["GRATUITO", "3 níveis de raciocínio", "Matemática avançada", "Decisões multi-etapas"],
      ideal: "Problemas complexos, questões de provas difíceis, raciocínio passo a passo",
      price: "Gratuito",
      badge: "NOVO 2026",
      badgeColor: "from-green-100 to-emerald-100 text-green-700",
      category: "raciocinio"
    },
    {
      name: "GPT-5 Thinking mini",
      description: "Modelo de raciocínio avançado disponível para usuários Pro. Combina velocidade com capacidade analítica.",
      url: "https://chat.openai.com",
      color: "from-violet-500 to-purple-500",
      pros: ["Raciocínio avançado", "Thinking steps", "Pro access", "Alta performance"],
      ideal: "Problemas médicos complexos, análise crítica de estudos, decisões clínicas",
      price: "US$ 20/mês (Pro)",
      badge: "NOVO 2026",
      badgeColor: "from-green-100 to-emerald-100 text-green-700",
      category: "raciocinio"
    },
    {
      name: "ChatGPT Plus",
      description: "Versátil com GPT-4o, GPT-4.5, o4-mini. Custom GPTs agora suportam todos modelos. ATENÇÃO: GPT-4o será descontinuado em 16/02/2026.",
      url: "https://chat.openai.com",
      color: "from-blue-500 to-cyan-500",
      pros: ["Múltiplos modelos", "GPTs personalizados", "DALL-E 3", "Modo canvas"],
      ideal: "Flashcards, questões estilo residência, revisão rápida, imagens",
      price: "US$ 20/mês",
      badge: "ATUALIZADO 2026",
      badgeColor: "from-blue-100 to-indigo-100 text-blue-700",
      category: "estudos"
    },
    {
      name: "Gemini 2.5 Pro",
      description: "Lançado mar/2025 com 'adaptive thinking'. Raciocínio avançado comparável ao GPT-4.5 para análise de múltiplos artigos.",
      url: "https://gemini.google.com",
      color: "from-purple-500 to-fuchsia-500",
      pros: ["Adaptive thinking", "1M tokens contexto", "Raciocínio profundo", "Análise multimodal"],
      ideal: "Revisões sistemáticas, análise de múltiplos estudos, meta-análises",
      price: "US$ 20/mês (Advanced)",
      badge: "NOVO 2026",
      badgeColor: "from-green-100 to-emerald-100 text-green-700",
      category: "raciocinio"
    },
    {
      name: "Gemini 2.5 Flash",
      description: "Versão estável e rápida com contexto de 1 MILHÃO de tokens. Excelente custo-benefício para análise de documentos.",
      url: "https://gemini.google.com",
      color: "from-purple-500 to-pink-500",
      pros: ["1M tokens de contexto", "Google Scholar", "148 tokens/seg", "Análise de vídeos"],
      ideal: "Pesquisa bibliográfica, análise de múltiplos artigos, resumos extensos",
      price: "Gratuito / US$ 20/mês Pro",
      badge: "ATUALIZADO 2026",
      badgeColor: "from-blue-100 to-indigo-100 text-blue-700",
      category: "pesquisa"
    },
    {
      name: "Gemini 2.5 Flash-Lite",
      description: "Versão low-cost do Gemini 2.5. Ideal para tarefas que exigem velocidade sem comprometer qualidade.",
      url: "https://gemini.google.com",
      color: "from-indigo-500 to-purple-500",
      pros: ["Baixo custo", "Velocidade alta", "Google integrado", "Contexto expandido"],
      ideal: "Resumos rápidos, consultas simples, revisão de notas, flashcards",
      price: "Gratuito",
      badge: "NOVO 2026",
      badgeColor: "from-green-100 to-emerald-100 text-green-700",
      category: "estudos"
    },
    {
      name: "NotebookLM",
      description: "EXCLUSIVO para estudantes! Trabalha APENAS com fontes carregadas, sem alucinações. Gera podcasts automáticos.",
      url: "https://notebooklm.google.com",
      color: "from-indigo-500 to-purple-500",
      pros: ["Sem alucinações", "Podcasts automáticos", "100 notebooks grátis", "Citações precisas"],
      ideal: "Revisão de material, compreensão profunda, estudo ativo, organização",
      price: "GRATUITO",
      badge: "Melhor para Estudos",
      category: "estudos"
    },
    {
      name: "Perplexity AI",
      description: "Líder em pesquisa com citações de fontes confiáveis. Espaços para organizar documentos por projeto.",
      url: "https://perplexity.ai",
      color: "from-teal-500 to-cyan-500",
      pros: ["Citações confiáveis", "Espaços organizados", "Links para fontes", "Resumos estruturados"],
      ideal: "Pesquisa acadêmica, busca de guidelines, informações atualizadas",
      price: "Gratuito / US$ 20/mês Pro",
      badge: "Pesquisa Confiável",
      category: "pesquisa"
    }
  ];

  const categorias = [
    {
      title: "🏥 Saúde e Medicina",
      icon: Brain,
      description: "IAs especializadas para estudantes e profissionais de medicina",
      color: "from-rose-500 to-pink-500",
      category: "saude"
    },
    {
      title: "Raciocínio e Análise",
      icon: Brain,
      description: "Para problemas complexos e análises profundas",
      color: "from-orange-500 to-red-500",
      category: "raciocinio"
    },
    {
      title: "Estudos e Revisão",
      icon: BookOpen,
      description: "Ferramentas especializadas para aprendizado",
      color: "from-indigo-500 to-purple-500",
      category: "estudos"
    },
    {
      title: "Pesquisa Acadêmica",
      icon: Search,
      description: "Busca de informações e fontes confiáveis",
      color: "from-teal-500 to-cyan-500",
      category: "pesquisa"
    }
  ];

  const dicas = [
    {
      icon: "🎯",
      title: "Seja específico nos prompts",
      description: "Quanto mais contexto e detalhes, melhores as respostas da IA"
    },
    {
      icon: "✅",
      title: "Sempre verifique informações médicas",
      description: "Use as IAs como complemento, não substituto de fontes confiáveis"
    },
    {
      icon: "🔄",
      title: "Combine diferentes IAs",
      description: "Use NotebookLM para revisar → ChatGPT Health para casos clínicos → Claude para análise profunda"
    },
    {
      icon: "💡",
      title: "Aproveite os planos gratuitos",
      description: "o4-mini, NotebookLM, Gemini 2.5 Flash-Lite são gratuitos e extremamente poderosos"
    },
    {
      icon: "🏥",
      title: "ChatGPT Health para medicina",
      description: "Use o novo espaço dedicado à saúde para casos clínicos e questões médicas específicas"
    },
    {
      icon: "⚠️",
      title: "Migre do GPT-4o antes de 16/02/2026",
      description: "GPT-4o será descontinuado. Prefira GPT-4.5, o4-mini ou Claude Opus 4.5"
    }
  ];

  // Função de filtragem aprimorada
  const filteredIAs = (category: string) => {
    return ias.filter(ia => {
      // Filtro de categoria
      if (ia.category !== category) return false;

      // Filtro de preço
      if (filtroPreco !== "todos") {
        if (filtroPreco === "gratuito" && !ia.price.toLowerCase().includes("gratuito")) return false;
        if (filtroPreco === "pago" && ia.price.toLowerCase().includes("gratuito")) return false;
      }

      // Filtro de novidade
      if (filtroNovidade !== "todos") {
        if (filtroNovidade === "novo" && !ia.badge.includes("NOVO 2026")) return false;
        if (filtroNovidade === "atualizado" && !ia.badge.includes("ATUALIZADO")) return false;
      }

      return true;
    });
  };

  // Filtro global (para todas as categorias)
  const getFilteredIAsGlobal = () => {
    return ias.filter(ia => {
      // Filtro de categoria global
      if (filtroCategoria !== "todos" && ia.category !== filtroCategoria) return false;

      // Filtro de preço
      if (filtroPreco !== "todos") {
        if (filtroPreco === "gratuito" && !ia.price.toLowerCase().includes("gratuito")) return false;
        if (filtroPreco === "pago" && ia.price.toLowerCase().includes("gratuito")) return false;
      }

      // Filtro de novidade
      if (filtroNovidade !== "todos") {
        if (filtroNovidade === "novo" && !ia.badge.includes("NOVO 2026")) return false;
        if (filtroNovidade === "atualizado" && !ia.badge.includes("ATUALIZADO")) return false;
      }

      return true;
    });
  };

  // Resetar filtros
  const resetarFiltros = () => {
    setFiltroPreco("todos");
    setFiltroCategoria("todos");
    setFiltroNovidade("todos");
  };

  // Verificar se há filtros ativos
  const hasFiltrosAtivos = filtroPreco !== "todos" || filtroCategoria !== "todos" || filtroNovidade !== "todos";

  // Função segura para abrir links externos
  const openExternalLink = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <PublicNavbar />

      {/* Skip to Content Link (acessibilidade) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Pular para conteúdo principal
      </a>

      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header com botão voltar */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="hover:bg-white/50"
              aria-label="Voltar para página anterior"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Hero Section */}
          <header className="text-center space-y-6 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Atualizado Janeiro 2026
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Guia de IAs para Medicina
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              As melhores ferramentas de Inteligência Artificial atualizadas para estudantes de medicina,
              com informações sobre funcionalidades, preços e casos de uso específicos.
            </p>
          </header>

          {/* Banner de Destaque - ChatGPT Health */}
          <Card className="bg-gradient-to-r from-rose-600 to-pink-600 text-white border-none shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Brain className="h-8 w-8" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h2 className="text-2xl font-bold">🏥 ChatGPT Health - Lançado 07/01/2026</h2>
                  <p className="text-lg text-white/90">
                    OpenAI lançou um <strong>espaço dedicado à saúde</strong>! Interface especializada para
                    estudantes e profissionais de medicina, incluído no plano Plus (US$ 20/mês).
                  </p>
                  <Button
                    variant="secondary"
                    className="bg-white text-rose-600 hover:bg-gray-100 font-semibold"
                    onClick={() => openExternalLink("https://chat.openai.com/health")}
                    aria-label="Acessar ChatGPT Health"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Conhecer ChatGPT Health
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banner Secundário - Avisos Importantes */}
          <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-none shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                <h3 className="text-xl font-bold">⚠️ Avisos Importantes de 2026</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="font-semibold mb-1">🔄 GPT-4o será descontinuado</p>
                    <p className="text-sm text-white/90">Final previsto: 16 de fevereiro de 2026. Migre para GPT-4.5 ou o4-mini.</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="font-semibold mb-1">🚀 Claude Opus 5.0 em breve</p>
                    <p className="text-sm text-white/90">Previsão de lançamento: 15 de abril de 2026. Atualizações em breve.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros Interativos */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Filtrar IAs</CardTitle>
                    <CardDescription>Encontre a ferramenta ideal para suas necessidades</CardDescription>
                  </div>
                </div>
                {hasFiltrosAtivos && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetarFiltros}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro de Preço */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Por Preço</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filtroPreco === "todos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroPreco("todos")}
                      className={filtroPreco === "todos" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filtroPreco === "gratuito" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroPreco("gratuito")}
                      className={filtroPreco === "gratuito" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      Gratuitos
                    </Button>
                    <Button
                      variant={filtroPreco === "pago" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroPreco("pago")}
                      className={filtroPreco === "pago" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Pagos
                    </Button>
                  </div>
                </div>

                {/* Filtro de Categoria */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Por Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filtroCategoria === "todos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroCategoria("todos")}
                      className={filtroCategoria === "todos" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filtroCategoria === "saude" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroCategoria("saude")}
                      className={filtroCategoria === "saude" ? "bg-rose-600 hover:bg-rose-700" : ""}
                    >
                      Saúde
                    </Button>
                    <Button
                      variant={filtroCategoria === "raciocinio" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroCategoria("raciocinio")}
                      className={filtroCategoria === "raciocinio" ? "bg-orange-600 hover:bg-orange-700" : ""}
                    >
                      Raciocínio
                    </Button>
                    <Button
                      variant={filtroCategoria === "estudos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroCategoria("estudos")}
                      className={filtroCategoria === "estudos" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      Estudos
                    </Button>
                    <Button
                      variant={filtroCategoria === "pesquisa" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroCategoria("pesquisa")}
                      className={filtroCategoria === "pesquisa" ? "bg-teal-600 hover:bg-teal-700" : ""}
                    >
                      Pesquisa
                    </Button>
                  </div>
                </div>

                {/* Filtro de Novidade */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Por Lançamento</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filtroNovidade === "todos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroNovidade("todos")}
                      className={filtroNovidade === "todos" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filtroNovidade === "novo" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroNovidade("novo")}
                      className={filtroNovidade === "novo" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      Novos 2026
                    </Button>
                    <Button
                      variant={filtroNovidade === "atualizado" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFiltroNovidade("atualizado")}
                      className={filtroNovidade === "atualizado" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Atualizados
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contador de resultados */}
              {hasFiltrosAtivos && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>{getFilteredIAsGlobal().length}</strong> {getFilteredIAsGlobal().length === 1 ? 'ferramenta encontrada' : 'ferramentas encontradas'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards por Categoria */}
          {categorias.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${cat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{cat.title}</h2>
                    <p className="text-gray-600">{cat.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredIAs(cat.category).map((ia) => (
                    <Card
                      key={ia.name}
                      className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-gray-200"
                      role="article"
                      aria-label={`${ia.name}: ${ia.description}`}
                    >
                      <CardHeader>
                        <div className={`h-2 w-full rounded-t-lg bg-gradient-to-r ${ia.color} mb-4`} />
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl">{ia.name}</CardTitle>
                          <span className={`text-xs bg-gradient-to-r ${ia.badgeColor || 'from-indigo-100 to-purple-100 text-indigo-700'} px-3 py-1 rounded-full font-semibold whitespace-nowrap`}>
                            {ia.badge}
                          </span>
                        </div>
                        <CardDescription className="text-sm leading-relaxed">{ia.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-5">
                        <div>
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-900">
                            <Zap className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                            Pontos Fortes:
                          </h4>
                          <ul className="space-y-2">
                            {ia.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-gray-900">
                            <BookOpen className="h-4 w-4 text-purple-600" aria-hidden="true" />
                            Ideal Para:
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{ia.ideal}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" aria-hidden="true" />
                            <span className="text-sm font-bold text-gray-900">{ia.price}</span>
                          </div>
                        </div>

                        <Button
                          variant="default"
                          className={`w-full bg-gradient-to-r ${ia.color} hover:opacity-90 text-white font-semibold shadow-lg`}
                          onClick={() => openExternalLink(ia.url)}
                          aria-label={`Acessar ${ia.name}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Acessar {ia.name.split(" ")[0]}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Seção de Comparativo de Preços */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Melhores Opções por Orçamento</CardTitle>
                  <CardDescription>Encontre o plano ideal para suas necessidades</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">💚 Orçamento Zero</h3>
                  <p className="text-sm text-gray-600 mb-4">Stack completo sem gastar nada</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">1.</span>
                      <span><strong>NotebookLM</strong> - Revisão de material</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">2.</span>
                      <span><strong>o4-mini</strong> - Raciocínio gratuito (novo!)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">3.</span>
                      <span><strong>Gemini 2.5 Flash-Lite</strong> - Consultas rápidas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">4.</span>
                      <span><strong>Perplexity</strong> - Pesquisa com citações</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">🏥 Orçamento US$ 20 (Medicina)</h3>
                  <p className="text-sm text-gray-600 mb-4">Melhor para estudantes de medicina</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">🏆</span>
                      <span><strong>ChatGPT Plus</strong> - Acesso ao Health + GPT-4.5 + o4-mini</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">+</span>
                      <span>Gratuitos: NotebookLM, Gemini, Perplexity</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Orçamento US$ 40+</h3>
                  <p className="text-sm text-gray-600 mb-4">Stack premium completo</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">1.</span>
                      <span><strong>ChatGPT Plus</strong> US$ 20 (Health incluído)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">2.</span>
                      <span><strong>Claude Opus 4.5</strong> US$ 20 (Deep Think Mode)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">3.</span>
                      <span><strong>Gemini Advanced</strong> US$ 20 (2.5 Pro + Flash)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dicas de Uso */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                💡 Dicas Práticas de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dicas.map((dica, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/80 rounded-xl border border-amber-200">
                    <div className="text-3xl flex-shrink-0">{dica.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{dica.title}</h4>
                      <p className="text-sm text-gray-700">{dica.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estratégia Combinada */}
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-6 w-6" />
                Estratégia de Uso Combinado (Recomendado)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-lg">📚 Fluxo de Estudo Ideal (Atualizado 2026):</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="font-semibold">NotebookLM</p>
                      <p className="text-sm text-white/90">Upload de material → Gerar podcast → Primeira revisão</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="font-semibold">ChatGPT Health (Novo!)</p>
                      <p className="text-sm text-white/90">Casos clínicos, diagnóstico diferencial, farmacologia específica</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="font-semibold">o4-mini (Gratuito)</p>
                      <p className="text-sm text-white/90">Resolver questões complexas com raciocínio passo a passo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <p className="font-semibold">Gemini 2.5 Flash (Gratuito)</p>
                      <p className="text-sm text-white/90">Análise de múltiplos artigos com contexto de 1M tokens</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                    <div>
                      <p className="font-semibold">Claude Opus 4.5 (se tiver)</p>
                      <p className="text-sm text-white/90">Deep Think Mode para análises críticas e trabalhos acadêmicos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                <h3 className="font-bold text-lg">🏥 Workflow Específico para Medicina:</h3>
                <p className="text-sm text-white/90">
                  <strong>1. Estudo de caso clínico:</strong> ChatGPT Health → Claude Deep Think Mode
                  <br/>
                  <strong>2. Revisão de literatura:</strong> Gemini 2.5 Pro → NotebookLM → Perplexity
                  <br/>
                  <strong>3. Questões de prova:</strong> o4-mini (gratuito) → GPT-4.5 para conferir
                  <br/>
                  <strong>4. Trabalho acadêmico:</strong> Perplexity pesquisa → Claude escrita → Gemini revisão final
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ sobre Novos Modelos 2026 */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                💬 Perguntas Frequentes sobre Modelos 2026
              </CardTitle>
              <CardDescription>Dúvidas comuns sobre os novos modelos e atualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-rose-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">O que é o ChatGPT Health e como ele difere do ChatGPT Plus normal?</h3>
                  <p className="text-sm text-gray-700">
                    ChatGPT Health é um espaço dedicado dentro do ChatGPT Plus, lançado em 07/01/2026, com interface e recursos
                    especializados para saúde. Está incluído no plano Plus (US$ 20/mês) sem custo adicional. Ideal para casos clínicos,
                    diagnóstico diferencial e consultas médicas específicas.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Qual a diferença entre o3-mini e o4-mini?</h3>
                  <p className="text-sm text-gray-700">
                    o4-mini é o sucessor do o3-mini, lançado em 2026 com melhorias significativas em matemática e lógica.
                    Ambos são modelos de raciocínio gratuitos, mas o4-mini oferece 3 níveis de raciocínio e performance superior
                    em problemas complexos. Recomendamos migrar para o4-mini.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Vale a pena esperar o Claude Opus 5.0 ou assinar Opus 4.5 agora?</h3>
                  <p className="text-sm text-gray-700">
                    Claude Opus 4.5 já oferece Deep Think Mode (41% no Humanity's Last Exam) e 80.9% no SWE-bench, sendo extremamente
                    poderoso para medicina. O Opus 5.0 está previsto para 15/04/2026. Recomendamos assinar o 4.5 agora se precisar
                    de análises profundas, pois provavelmente haverá upgrade automático.
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">GPT-4o será descontinuado. Para qual modelo devo migrar?</h3>
                  <p className="text-sm text-gray-700">
                    GPT-4o será descontinuado em 16/02/2026. Recomendamos:
                    <br/>• <strong>Para estudantes:</strong> GPT-4.5 ou o4-mini (gratuito)
                    <br/>• <strong>Para medicina:</strong> ChatGPT Health (incluído no Plus)
                    <br/>• <strong>Para análise profunda:</strong> Claude Opus 4.5
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Gemini 2.5 Pro vale o custo de US$ 20/mês?</h3>
                  <p className="text-sm text-gray-700">
                    Gemini 2.5 Pro (lançado mar/2025) oferece "adaptive thinking" e 1M tokens de contexto, sendo excelente para
                    revisões sistemáticas e análise de múltiplos estudos. Se você trabalha com muitos artigos simultaneamente, vale
                    muito a pena. Caso contrário, o Gemini 2.5 Flash gratuito já é muito poderoso.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Posso usar Custom GPTs com os novos modelos de 2026?</h3>
                  <p className="text-sm text-gray-700">
                    Sim! Em 2026, Custom GPTs agora suportam todos os modelos disponíveis no ChatGPT Plus, incluindo GPT-4.5,
                    o4-mini, e acesso ao ChatGPT Health. Você pode criar GPTs personalizados para casos clínicos, farmacologia, etc.
                  </p>
                </div>

                <div className="border-l-4 border-teal-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Qual o melhor stack gratuito para estudantes de medicina em 2026?</h3>
                  <p className="text-sm text-gray-700">
                    Stack gratuito recomendado:
                    <br/>• <strong>NotebookLM:</strong> Revisão de material (podcasts automáticos)
                    <br/>• <strong>o4-mini:</strong> Raciocínio e questões complexas
                    <br/>• <strong>Gemini 2.5 Flash-Lite:</strong> Consultas rápidas
                    <br/>• <strong>Perplexity:</strong> Pesquisa com citações confiáveis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer com informações de atualização */}
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-gray-600">
              <strong>Última atualização:</strong> 11 de Janeiro de 2026
            </p>
            <p className="text-xs text-gray-500">
              Informações verificadas e atualizadas com dados oficiais de Janeiro 2026
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>✅ ChatGPT Health adicionado</span>
              <span>✅ Novos modelos 2026</span>
              <span>✅ Benchmarks atualizados</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuiaIAs;
