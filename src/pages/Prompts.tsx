import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Prompt } from '@/types/prompt';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, Star, Copy, Filter, Loader2, ArrowUpDown, Check,
  Sparkles, BookOpen, ArrowLeft, X, ExternalLink, Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PromptsService from '@/services/api/promptsService';

// Build: 2026-01-08 09:24 - Integração com backend completa


function renderMarkdown(markdown: string): string {
  let html = markdown;
  html = html.replace(/^\*\*(.+?)\*\*$/gm, '<h3 class="font-bold text-lg mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
  html = html.replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 dark:text-gray-300">');
  html = html.replace(/\n/g, '<br>');
  html = '<p class="mb-3 text-gray-700 dark:text-gray-300">' + html + '</p>';
  return html;
}


/**
 * ✨ Página Prompts v4.0 - Integração com Backend
 * 
 * Novidades:
 * - Integração completa com API do backend
 * - Suporte a prompts do sistema + prompts do usuário
 * - Preenchimento de variáveis personalizadas
 * - Sincronização de favoritos com backend
 * - Design minimalista mantido
 */
export default function Prompts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('a-z');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(true);

  // Carregar prompts da API com fallback para dados estáticos
  useEffect(() => {
  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      
      // Tenta carregar da API primeiro
      try {
        const data = await PromptsService.listPrompts({ includeSystem: true });
        
        if (data && data.length > 0) {
          setPrompts(data);
          
          // Carregar favoritos
          if (!user) {
            const stored = localStorage.getItem('medprompts-favorites');
            if (stored) setFavorites(new Set(JSON.parse(stored)));
          } else {
            const favs = data.filter(p => p.isFavorite).map(p => p.id);
            setFavorites(new Set(favs));
          }
          return; // API funcionou, não precisa do fallback
        }
      } catch (apiError) {
        // API não disponível, continua para o fallback
      }
      
      // Fallback: usar dados estáticos (sempre executa se API falhar ou retornar vazio)
      try {
        const promptsModule = await import('@/data/prompts-data');
        const staticPrompts = promptsModule.prompts || [];
        
        if (staticPrompts.length > 0) {
          setPrompts(staticPrompts);
        }
        
        // Carregar favoritos locais
        const stored = localStorage.getItem('medprompts-favorites');
        if (stored) {
          try {
            setFavorites(new Set(JSON.parse(stored)));
          } catch (e) {
            // Ignora erro ao carregar favoritos
          }
        }
        
        if (staticPrompts.length > 0) {
          toast({ 
            title: 'ℹ️ Modo offline',
            description: `${staticPrompts.length} prompts carregados localmente`,
          });
        }
      } catch (importError) {
        toast({ 
          title: '❌ Erro crítico',
          description: 'Não foi possível carregar os prompts',
          variant: 'destructive'
        });
      }
      
    } catch (error) {
      toast({
        title: '❌ Erro ao carregar prompts',
        description: 'Não foi possível carregar os prompts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  loadPrompts();
}, [user]);


  const toggleFavorite = useCallback(async (promptId: string) => {
    try {
      if (user) {
        // Se logado, usar API
        const updatedPrompt = await PromptsService.toggleFavorite(promptId);
        
        setPrompts(prev => 
          prev.map(p => p.id === promptId ? updatedPrompt : p)
        );
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (updatedPrompt.isFavorite) {
            newFavorites.add(promptId);
            toast({ title: '⭐ Adicionado aos favoritos' });
          } else {
            newFavorites.delete(promptId);
            toast({ title: '✨ Removido dos favoritos' });
          }
          return newFavorites;
        });
      } else {
        // Se não logado, usar localStorage
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (newFavorites.has(promptId)) {
            newFavorites.delete(promptId);
            toast({ title: '✨ Removido dos favoritos' });
          } else {
            newFavorites.add(promptId);
            toast({ title: '⭐ Adicionado aos favoritos' });
          }
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      toast({ 
        title: '❌ Erro ao favoritar',
        variant: 'destructive'
      });
    }
  }, [user]);


const copyPrompt = useCallback(async (prompt: Prompt) => {
  try {
    navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    toast({ title: '✅ Prompt copiado!' });
    
    // Registrar uso (não aguarda para não travar a UI)
    if (user) {
      PromptsService.recordUsage(prompt.id).catch((err) => {
        console.error('Erro ao registrar uso:', err);
      });
    }
    
    setTimeout(() => setCopiedId(null), 2000);
  } catch (error) {
    console.error('Erro ao copiar:', error);
  }
}, [user]);



  const openAI = useCallback((aiName: string) => {
    const urls: Record<string, string> = {
      ChatGPT: 'https://chat.openai.com',
      Claude: 'https://claude.ai',
      Perplexity: 'https://perplexity.ai',
      NotebookLM: 'https://notebooklm.google.com',
      Gemini: 'https://gemini.google.com',
    };
    const url = urls[aiName];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, []);


  // Manage searching state separately from filtering logic
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => setIsSearching(false), 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedTab]);

  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts];

    if (selectedTab === 'favorites') {
      filtered = filtered.filter((p) => favorites.has(p.id));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'a-z': return a.title.localeCompare(b.title);
        case 'z-a': return b.title.localeCompare(a.title);
        default: return 0;
      }
    });

    return filtered;
  }, [prompts, selectedTab, selectedCategory, searchTerm, sortOrder, favorites]);


  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortOrder('a-z');
    toast({ title: 'Filtros limpos' });
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-24 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }


  const getAIName = (prompt: Prompt): string => {
    if (typeof prompt.recommendedAI === 'string') {
      return prompt.recommendedAI;
    }
    if (prompt.recommendedAI && typeof prompt.recommendedAI === 'object') {
      return prompt.recommendedAI.primary;
    }
    return 'IA';
  };


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
        <PublicNavbar />


        {/* ✨ Hero Section Minimalista */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-8 gap-2 hover:gap-3 transition-all duration-300 group"
              aria-label="Voltar para página inicial"
            >
              <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Voltar</span>
            </Button>


            <div className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>Biblioteca de Prompts Especializados</span>
              </div>


              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  Prompts Médicos
                </span>
              </h1>


              <p className="text-lg md:text-xl text-muted-foreground">
                Otimizados para ChatGPT, Claude, Perplexity e NotebookLM
              </p>


              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-5 w-5" />
                <span>{filteredPrompts.length} prompts disponíveis</span>
              </div>
            </div>
          </div>


          {/* Blobs animados */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </section>


        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Banner Login */}
            {!user && favorites.size > 0 && showLoginBanner && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {favorites.size} {favorites.size === 1 ? 'prompt favorito' : 'prompts favoritos'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Crie uma conta para sincronizar em todos os dispositivos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate('/register')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Criar Conta
                    </Button>
                    <button
                      onClick={() => setShowLoginBanner(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Tabs Minimalistas */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Todos</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                  <Star className="h-4 w-4" />
                  <span>Favoritos</span>
                  {favorites.size > 0 && (
                    <Badge className="ml-1 bg-white text-indigo-600 hover:bg-white">
                      {favorites.size}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>


            {/* Filtros Compactos */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Label htmlFor="search" className="sr-only">Buscar prompts</Label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <Input
                  id="search"
                  placeholder="Buscar prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isSearching && (
                  <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-600" />
                )}
              </div>


              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[180px] h-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="estudos">Estudos</SelectItem>
                    <SelectItem value="clinica">Clínica</SelectItem>
                    <SelectItem value="anamnese">Anamnese</SelectItem>
                    <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                    <SelectItem value="tratamento">Tratamento</SelectItem>
                  </SelectContent>
                </Select>


                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full md:w-[140px] h-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a-z">A-Z</SelectItem>
                    <SelectItem value="z-a">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {(searchTerm || selectedCategory !== 'all' || sortOrder !== 'a-z') && (
              <div className="flex justify-center animate-in fade-in duration-300">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              </div>
            )}


            {/* ✨ Grid de Cards Minimalista */}
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-20 animate-in fade-in duration-500">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Nenhum prompt encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedTab === 'favorites' 
                    ? 'Adicione prompts aos favoritos clicando na estrela'
                    : 'Tente ajustar os filtros'}
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPrompts.map((prompt, index) => {
                  const aiName = getAIName(prompt);
                  
                  return (
                    <Card
                      key={prompt.id}
                      className="group relative overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="pb-3 relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex gap-2">
                            <Badge 
                              variant="outline"
                              className="text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                            >
                              {aiName}
                            </Badge>
                            {prompt.isSystemPrompt && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Sistema
                              </Badge>
                            )}
                          </div>
                          
                          <Tooltip>
                            <TooltipTrigger>
                              <button
                                onClick={() => toggleFavorite(prompt.id)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group/star"
                                aria-label={favorites.has(prompt.id) ? 'Remover' : 'Favoritar'}
                              >
                                <Star
                                  className={`w-5 h-5 transition-all duration-300 ${
                                    favorites.has(prompt.id)
                                      ? 'fill-yellow-400 text-yellow-400 scale-110'
                                      : 'text-gray-400 group-hover/star:text-yellow-400 group-hover/star:scale-110'
                                  }`}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {favorites.has(prompt.id) ? 'Remover' : 'Favoritar'}
                            </TooltipContent>
                          </Tooltip>
                        </div>


                        <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          {prompt.title}
                        </CardTitle>


                        <CardDescription className="text-sm mt-2 line-clamp-2">
                          {prompt.description}
                        </CardDescription>
                      </CardHeader>


                      <CardContent className="space-y-3 relative z-10">
                        {/* Tags compactas */}
                        <div className="flex flex-wrap gap-1.5">
                          {prompt.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                          {prompt.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              +{prompt.tags.length - 2}
                            </Badge>
                          )}
                        </div>


                        {/* Ações minimalistas */}
                        <div className="flex gap-2 pt-3 border-t dark:border-gray-800">
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyPrompt(prompt)}
                                className="flex-1 h-9 gap-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                              >
                                {copiedId === prompt.id ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-xs">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span className="text-xs">Copiar</span>
                                  </>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copiar prompt</TooltipContent>
                          </Tooltip>


                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPrompt(prompt)}
                                className="flex-1 h-9 gap-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                              >
                                <BookOpen className="w-4 h-4" />
                                <span className="text-xs">Ver</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                        </div>


                        <Button
                          onClick={() => openAI(aiName)}
                          className="w-full h-9 text-xs gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir {aiName}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>


        {/* Modal */}
        {selectedPrompt && (
          <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-800">
              <DialogHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-3">{selectedPrompt.title}</DialogTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600">
                        {getAIName(selectedPrompt)}
                      </Badge>
                      <Badge variant="outline">{selectedPrompt.category}</Badge>
                      {selectedPrompt.isSystemPrompt && (
                        <Badge variant="outline">
                          <Zap className="w-3 h-3 mr-1" />
                          Sistema
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DialogDescription className="text-base">{selectedPrompt.description}</DialogDescription>
              </DialogHeader>


              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>


                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Prompt Completo
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPrompt(selectedPrompt)}
                      className="gap-2"
                    >
                      {copiedId === selectedPrompt.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div 
                    className="bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30 rounded-xl p-6 border border-gray-200 dark:border-gray-800 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPrompt.content) }}
                  />
                </div>


                <div className="flex gap-3 pt-4 border-t dark:border-gray-800">
                  <Button
                    onClick={() => copyPrompt(selectedPrompt)}
                    variant="outline"
                    className="flex-1 h-11 gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                  <Button
                    onClick={() => toggleFavorite(selectedPrompt.id)}
                    variant="outline"
                    className="flex-1 h-11 gap-2"
                  >
                    <Star className={favorites.has(selectedPrompt.id) ? 'fill-yellow-400 text-yellow-400' : ''} />
                    {favorites.has(selectedPrompt.id) ? 'Favoritado' : 'Favoritar'}
                  </Button>
                  <Button
                    onClick={() => openAI(getAIName(selectedPrompt))}
                    className="flex-1 h-11 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir IA
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}


        {/* Footer */}
        <footer className="border-t dark:border-gray-800 mt-16 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                MedPrompts © 2026 • Desenvolvido para estudantes de Medicina
              </p>
              <p className="text-sm text-muted-foreground">
                Por <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Andressa Mendes</span>
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  {prompts.length} prompts
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="w-3 h-3" />
                  {favorites.size} favoritos
                </Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
