import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, BookOpen, Zap, Search, Brain, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GuiaIAs = () => {
  const navigate = useNavigate();

  const ias = [
    {
      name: "Claude Opus 4.5",
      description: "Líder em raciocínio lógico e análise detalhada. Melhor para documentação técnica, análises jurídicas e comunicação corporativa.",
      url: "https://claude.ai",
      color: "from-orange-500 to-red-500",
      pros: ["Chat infinito", "Líder em programação", "Modo Projetos", "Raciocínio profundo"],
      ideal: "Casos clínicos complexos, revisão de literatura, análises críticas",
      price: "US$ 20/mês",
      badge: "Atualizado Dez/2025",
      category: "raciocinio"
    },
    {
      name: "ChatGPT o3-mini",
      description: "Modelo de raciocínio agora disponível GRATUITAMENTE. 39% menos erros e 24% mais rápido que o1-mini.",
      url: "https://chat.openai.com",
      color: "from-green-500 to-emerald-500",
      pros: ["GRATUITO", "3 níveis de raciocínio", "Matemática avançada", "Decisões multi-etapas"],
      ideal: "Problemas complexos, questões de provas difíceis, raciocínio passo a passo",
      price: "Gratuito",
      badge: "Lançado Jan/2025",
      category: "raciocinio"
    },
    {
      name: "ChatGPT Plus",
      description: "Versátil e rápido com GPT-4o. Ideal para flashcards, questões de prova e explicações didáticas.",
      url: "https://chat.openai.com",
      color: "from-blue-500 to-cyan-500",
      pros: ["Velocidade", "GPTs personalizados", "DALL-E 3", "Modo canvas"],
      ideal: "Flashcards, questões estilo residência, revisão rápida, imagens",
      price: "US$ 20/mês",
      badge: "Popular",
      category: "estudos"
    },
    {
      name: "Gemini 2.0 Flash",
      description: "Integrado ao Google com janela de contexto de 1 MILHÃO de tokens. Excelente para análise de múltiplos documentos.",
      url: "https://gemini.google.com",
      color: "from-purple-500 to-pink-500",
      pros: ["1M tokens de contexto", "Google Scholar", "148 tokens/seg", "Análise de vídeos"],
      ideal: "Pesquisa bibliográfica, análise de múltiplos artigos, resumos extensos",
      price: "Gratuito / US$ 20/mês Pro",
      badge: "Contexto Gigante",
      category: "pesquisa"
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
      description: "Use NotebookLM para revisar → Perplexity para pesquisar → Claude para analisar"
    },
    {
      icon: "💡",
      title: "Aproveite os planos gratuitos",
      description: "o3-mini, NotebookLM e Gemini são gratuitos e extremamente poderosos"
    }
  ];

  const filteredIAs = (category: string) => ias.filter(ia => ia.category === category);

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
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
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
          <div className="text-center space-y-6 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg">
              <Zap className="h-4 w-4" />
              Atualizado Janeiro 2026
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Guia de IAs para Medicina
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              As melhores ferramentas de Inteligência Artificial atualizadas para estudantes de medicina, 
              com informações sobre funcionalidades, preços e casos de uso específicos.
            </p>
          </div>

          {/* Banner de Destaque */}
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Brain className="h-8 w-8" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h2 className="text-2xl font-bold">🎉 Novidade Game-Changer 2026</h2>
                  <p className="text-lg text-white/90">
                    <strong>ChatGPT o3-mini</strong> agora está <span className="bg-white/20 px-2 py-1 rounded font-bold">GRATUITO</span>! 
                    Modelo de raciocínio avançado com 39% menos erros, ideal para problemas complexos de medicina.
                  </p>
                  <Button
                    variant="secondary"
                    className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
                    onClick={() => openExternalLink("https://chat.openai.com")}
                    aria-label="Experimentar ChatGPT o3-mini"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Experimentar Agora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards por Categoria */}
          {categorias.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${cat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{cat.title}</h2>
                    <p className="text-gray-600">{cat.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredIAs(cat.category).map((ia) => (
                    <Card key={ia.name} className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-gray-200">
                      <CardHeader>
                        <div className={`h-2 w-full rounded-t-lg bg-gradient-to-r ${ia.color} mb-4`} />
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl">{ia.name}</CardTitle>
                          <span className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                            {ia.badge}
                          </span>
                        </div>
                        <CardDescription className="text-sm leading-relaxed">{ia.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-5">
                        <div>
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-900">
                            <Zap className="h-4 w-4 text-indigo-600" />
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
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            Ideal Para:
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{ia.ideal}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
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
                      <span><strong>ChatGPT o3-mini</strong> - Raciocínio gratuito</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">3.</span>
                      <span><strong>Perplexity</strong> - Pesquisa com citações</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">💎 Orçamento US$ 20</h3>
                  <p className="text-sm text-gray-600 mb-4">Melhor investimento único</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">🏆</span>
                      <span><strong>Claude Opus 4.5</strong> - Chat infinito + análise profunda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">+</span>
                      <span>Gratuitos: NotebookLM, o3-mini, Perplexity</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Orçamento US$ 40</h3>
                  <p className="text-sm text-gray-600 mb-4">Stack premium completo</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">1.</span>
                      <span><strong>Claude Opus 4.5</strong> US$ 20</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">2.</span>
                      <span><strong>Perplexity Pro</strong> US$ 20</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">+</span>
                      <span>NotebookLM Plus (quando lançar)</span>
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
                <h3 className="font-bold text-lg">📚 Fluxo de Estudo Ideal:</h3>
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
                      <p className="font-semibold">ChatGPT o3-mini (Gratuito)</p>
                      <p className="text-sm text-white/90">Resolver exercícios complexos com raciocínio passo a passo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="font-semibold">Perplexity AI</p>
                      <p className="text-sm text-white/90">Pesquisar informações atualizadas com citações confiáveis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <p className="font-semibold">Claude Opus 4.5 (se tiver)</p>
                      <p className="text-sm text-white/90">Análise crítica profunda e escrita de trabalhos acadêmicos</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer com informações de atualização */}
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Última atualização:</strong> 06 de Janeiro de 2026
            </p>
            <p className="text-xs text-gray-500">
              Informações verificadas e atualizadas com dados oficiais de Janeiro 2026
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuiaIAs;
