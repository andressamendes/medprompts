import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { prompts as staticPrompts } from '@/data/prompts-data';
import { Prompt } from '@/types/prompt';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, Star, Copy, Filter, Loader2, ArrowUpDown, Check,
  Sparkles, BookOpen, ArrowLeft, X, Wand2, ExternalLink
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';


// Interface estendida para campos extras não presentes na interface oficial
interface PromptExtended extends Prompt {
  icon?: string;
  usageCount?: number;
}


/**
 * Função auxiliar para renderizar Markdown básico como HTML
 */
function renderMarkdown(markdown: string): string {
  let html = markdown;
  
  // Títulos (** no início da linha)
  html = html.replace(/^\*\*(.+?)\*\*$/gm, '<h3 class="font-bold text-lg mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>');
  
  // Negrito inline
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
  
  // Quebras de linha duplas = parágrafo
  html = html.replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 dark:text-gray-300">');
  
  // Quebras de linha simples = <br>
  html = html.replace(/\n/g, '<br>');
  
  // Envolver tudo em parágrafo inicial
  html = '<p class="mb-3 text-gray-700 dark:text-gray-300">' + html + '</p>';
  
  return html;
}


/**
 * Página Prompts - Biblioteca Pública de Prompts Médicos v2.5
 *
 * ✅ PÁGINA PÚBLICA - Acessível sem login
 * 
 * Implementa FASE 1 completa + FIX:
 * - ✅ Melhoria 1.1: Responsividade Mobile Completa
 * - ✅ Melhoria 1.2: Acessibilidade WCAG 2.1 AA
 * - ✅ Melhoria 1.3: Estados de Carregamento e Feedback
 * - ✅ FIX: Renderização de Markdown formatado no modal
 */
export default function Prompts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados principais
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('a-z');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExtended | null>(null);
  
  // Estados de loading e feedback (MELHORIA 1.3)
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showLoginBanner, setShowLoginBanner] = useState(true);


  // Carregar favoritos do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('medprompts-favorites');
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      // Simula carregamento inicial (MELHORIA 1.3)
      setTimeout(() => setIsLoading(false), 800);
    }
  }, []);


  // Salvar favoritos no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medprompts-favorites', JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }, [favorites]);


  // Toggle favorito com feedback (MELHORIA 1.3)
  const toggleFavorite = useCallback((promptId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      const isFavorite = newFavorites.has(promptId);
      
      if (isFavorite) {
        newFavorites.delete(promptId);
        toast({
          title: '✨ Removido dos favoritos',
          description: 'O prompt foi removido da sua lista.',
        });
      } else {
        newFavorites.add(promptId);
        toast({
          title: '⭐ Adicionado aos favoritos',
          description: 'O prompt foi salvo na sua lista!',
        });
      }
      
      return newFavorites;
    });
  }, []);


  // Copiar prompt com feedback visual (MELHORIA 1.3)
  const copyPrompt = useCallback((prompt: PromptExtended) => {
    navigator.clipboard.writeText(prompt.content);
    setCopiedId(prompt.id);
    
    const aiName = prompt.recommendedAI?.primary || 'IA recomendada';
    
    toast({
      title: '✅ Prompt copiado!',
      description: `Cole direto no ${aiName} e comece a usar.`,
    });
    
    // Reset do estado de copiado
    setTimeout(() => setCopiedId(null), 2000);
  }, []);


  // Abrir IA recomendada
  const openAI = useCallback((aiName: string) => {
    const urls: Record<string, string> = {
      ChatGPT: 'https://chat.openai.com',
      Claude: 'https://claude.ai',
      Perplexity: 'https://perplexity.ai',
      NotebookLM: 'https://notebooklm.google.com',
      Gemini: 'https://gemini.google.com',
      Anki: 'https://apps.ankiweb.net',
    };
    
    const url = urls[aiName];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);


  // Filtrar e ordenar prompts (com debounce simulado)
  const filteredPrompts = useMemo(() => {
    setIsSearching(true);
    
    // Simula delay de busca para feedback visual
    setTimeout(() => setIsSearching(false), 300);
    
    let filtered = [...(staticPrompts as PromptExtended[])];


    // Filtro por aba (Todos / Favoritos)
    if (selectedTab === 'favorites') {
      filtered = filtered.filter((p) => favorites.has(p.id));
    }


    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }


    // Busca por termo
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.content && p.content.toLowerCase().includes(term)) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }


    // Ordenação
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        case 'most-used':
          return (b.usageCount || 0) - (a.usageCount || 0);
        default:
          return 0;
      }
    });


    return filtered;
  }, [selectedTab, selectedCategory, searchTerm, sortOrder, favorites]);


  // Limpar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortOrder('a-z');
    
    toast({
      title: 'Filtros limpos',
      description: 'Todos os filtros foram removidos.',
    });
  }, []);


  // Loading inicial skeleton (MELHORIA 1.3)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
        {/* ✅ NAVBAR PÚBLICA */}
        <Navbar />


        {/* Hero Section - Responsivo (MELHORIA 1.1) */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            {/* ✅ BOTÃO VOLTAR PARA HOME */}
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6 gap-2 hover:gap-3 transition-all touch-manipulation min-h-[44px]"
              aria-label="Voltar para página inicial"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Voltar para Início</span>
            </Button>


            <div className="text-center max-w-4xl mx-auto space-y-4 md:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>26 Prompts Especializados para Medicina</span>
              </div>


              {/* Título - Responsivo (MELHORIA 1.1) */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Biblioteca de Prompts
                </span>
              </h1>


              {/* Descrição */}
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                ChatGPT, Claude, Perplexity e NotebookLM otimizados para estudos médicos.
              </p>


              {/* Contador */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-5 w-5" />
                <span role="status" aria-live="polite">
                  {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt disponível' : 'prompts disponíveis'}
                </span>
              </div>
            </div>
          </div>


          {/* Blobs animados */}
          <div className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </section>


        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 md:py-12">
          <div className="space-y-6 md:space-y-8">
            {/* ✅ BANNER DE LOGIN (Apenas para usuários não logados com favoritos) */}
            {!user && favorites.size > 0 && showLoginBanner && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-4 md:p-5 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white mb-1">
                        Você tem {favorites.size} {favorites.size === 1 ? 'prompt favorito' : 'prompts favoritos'}!
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Crie uma conta grátis para sincronizar seus favoritos em todos os dispositivos e ter acesso a ferramentas exclusivas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate('/register')}
                      className="whitespace-nowrap bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Criar Conta Grátis
                    </Button>
                    <button
                      onClick={() => setShowLoginBanner(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Fechar banner"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Tabs - Responsivo (MELHORIA 1.1) */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 md:h-14">
                <TabsTrigger 
                  value="all" 
                  className="text-sm md:text-base gap-2"
                  aria-label="Mostrar todos os prompts"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Todos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="text-sm md:text-base gap-2"
                  aria-label="Mostrar apenas prompts favoritos"
                >
                  <Star className="h-4 w-4" />
                  <span>Favoritos</span>
                  {favorites.size > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {favorites.size}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>


            {/* Filtros - Stack vertical no mobile (MELHORIA 1.1) */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Campo de busca - Full width no mobile */}
              <div className="relative flex-1">
                <Label htmlFor="search-prompts" className="sr-only">
                  Buscar prompts por título, conteúdo ou tags
                </Label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
                <Input
                  id="search-prompts"
                  type="search"
                  placeholder="Buscar por título, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 md:pl-12 h-11 md:h-12 text-sm md:text-base w-full"
                  aria-label="Buscar prompts por título, conteúdo ou tags"
                  autoComplete="off"
                />
                
                {/* Botão limpar busca */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-manipulation"
                    aria-label="Limpar busca"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
                
                {/* Indicador de busca ativa (MELHORIA 1.3) */}
                {isSearching && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>


              {/* Filtros lado a lado no mobile (MELHORIA 1.1) */}
              <div className="flex gap-2 md:gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger 
                    className="w-full md:w-[180px] h-11 md:h-12 text-sm md:text-base"
                    aria-label="Filtrar por categoria"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    <SelectItem value="estudos">Estudos</SelectItem>
                    <SelectItem value="clinica">Clínica</SelectItem>
                  </SelectContent>
                </Select>


                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger 
                    className="w-full md:w-[160px] h-11 md:h-12 text-sm md:text-base"
                    aria-label="Ordenar prompts"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a-z">Ordem A-Z</SelectItem>
                    <SelectItem value="z-a">Ordem Z-A</SelectItem>
                    <SelectItem value="most-used">Mais usados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* Botão limpar filtros - visível quando há filtros ativos (MELHORIA 1.3) */}
            {(searchTerm || selectedCategory !== 'all' || sortOrder !== 'a-z') && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-sm"
                  aria-label="Limpar todos os filtros"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              </div>
            )}


            {/* Grid de Cards - Responsivo (MELHORIA 1.1) */}
            {filteredPrompts.length === 0 ? (
              // Estado vazio (MELHORIA 1.3)
              <div 
                className="text-center py-12 md:py-20 px-4" 
                role="status" 
                aria-live="polite"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <Search className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Nenhum prompt encontrado
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {selectedTab === 'favorites' 
                    ? 'Você ainda não tem prompts favoritos. Clique na estrela para adicionar!'
                    : 'Tente ajustar os filtros ou buscar por outros termos.'}
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                role="list"
                aria-label="Lista de prompts médicos"
              >
                {filteredPrompts.map((prompt) => {
                  const aiName = prompt.recommendedAI?.primary || 'IA';
                  const promptIcon = prompt.icon || '📝';
                  
                  return (
                    <Card
                      key={prompt.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border-2 hover:border-indigo-200 dark:hover:border-indigo-800"
                      role="listitem"
                    >
                      <CardHeader className="pb-3 md:pb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <span 
                              className="text-2xl md:text-3xl flex-shrink-0" 
                              role="img" 
                              aria-label="Ícone do prompt"
                            >
                              {promptIcon}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="text-xs md:text-sm whitespace-nowrap"
                            >
                              {aiName}
                            </Badge>
                          </div>
                          
                          {/* Botão favoritar com área de toque adequada (MELHORIA 1.1 + 1.2) */}
                          <Tooltip>
                            <TooltipTrigger>
                              <button
                                onClick={() => toggleFavorite(prompt.id)}
                                className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label={
                                  favorites.has(prompt.id)
                                    ? `Remover ${prompt.title} dos favoritos`
                                    : `Adicionar ${prompt.title} aos favoritos`
                                }
                                aria-pressed={favorites.has(prompt.id)}
                              >
                                <Star
                                  className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${
                                    favorites.has(prompt.id)
                                      ? 'fill-yellow-400 text-yellow-400 scale-110'
                                      : 'text-gray-400 group-hover:text-yellow-400/50'
                                  }`}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {favorites.has(prompt.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            </TooltipContent>
                          </Tooltip>
                        </div>


                        <CardTitle className="text-lg md:text-xl leading-tight line-clamp-2 mb-2">
                          {prompt.title}
                        </CardTitle>


                        <CardDescription className="text-sm md:text-base mt-2 line-clamp-3">
                          {prompt.description}
                        </CardDescription>
                      </CardHeader>


                      <CardContent className="space-y-3 md:space-y-4 flex-grow flex flex-col">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {prompt.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {prompt.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              +{prompt.tags.length - 3}
                            </Badge>
                          )}
                        </div>


                        {/* Metadados */}
                        <div className="flex items-center justify-between pt-2 border-t dark:border-gray-800">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Wand2 className="w-4 h-4" />
                            <span className="text-xs md:text-sm font-medium">
                              {prompt.usageCount || 0}x usado
                            </span>
                          </div>
                          <Badge 
                            className="text-xs capitalize"
                            variant={prompt.category === 'clinica' ? 'default' : 'secondary'}
                          >
                            {prompt.category}
                          </Badge>
                        </div>


                        {/* Ações - Botões com área de toque adequada (MELHORIA 1.1 + 1.2) */}
                        <div className="flex flex-col gap-2 mt-auto pt-4 border-t dark:border-gray-800">
                          <div className="grid grid-cols-2 gap-2">
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyPrompt(prompt)}
                                  className="text-xs md:text-sm h-10 md:h-11 touch-manipulation gap-2 w-full"
                                  aria-label={`Copiar prompt ${prompt.title}`}
                                >
                                  {copiedId === prompt.id ? (
                                    <>
                                      <Check className="w-4 h-4 text-green-600" />
                                      <span className="text-green-600">Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copiar prompt completo</TooltipContent>
                            </Tooltip>


                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPrompt(prompt)}
                                  className="text-xs md:text-sm h-10 md:h-11 touch-manipulation gap-2 w-full"
                                  aria-label={`Ver detalhes de ${prompt.title}`}
                                >
                                  <BookOpen className="w-4 h-4" />
                                  <span>Ver mais</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver prompt completo</TooltipContent>
                            </Tooltip>
                          </div>


                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                onClick={() => openAI(aiName)}
                                className="w-full text-xs md:text-sm h-10 md:h-11 touch-manipulation gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                aria-label={`Abrir ${aiName} em nova aba`}
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>Abrir {aiName}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Abre {aiName} em nova aba</TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>


        {/* ✅ MODAL COM MARKDOWN RENDERIZADO */}
        {selectedPrompt && (
          <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
            <DialogContent 
              className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto"
              aria-describedby="prompt-description"
            >
              <DialogHeader>
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <span 
                    className="text-3xl md:text-4xl flex-shrink-0" 
                    role="img" 
                    aria-label="Ícone do prompt"
                  >
                    {selectedPrompt.icon || '📝'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl md:text-2xl mb-3 leading-tight">
                      {selectedPrompt.title}
                    </DialogTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-sm">
                        {selectedPrompt.recommendedAI?.primary || 'IA'}
                      </Badge>
                      <Badge className="text-sm capitalize">
                        {selectedPrompt.category}
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        {selectedPrompt.usageCount || 0}x usado
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogDescription 
                  id="prompt-description" 
                  className="text-base md:text-lg"
                >
                  {selectedPrompt.description}
                </DialogDescription>
              </DialogHeader>


              <div className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                {/* Tags do prompt */}
                <div>
                  <h4 className="font-semibold text-sm md:text-base mb-3 text-gray-700 dark:text-gray-300">
                    Tags relacionadas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>


                {/* ✅ PROMPT COMPLETO COM MARKDOWN RENDERIZADO */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base md:text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      Prompt Completo
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPrompt(selectedPrompt)}
                      className="gap-2"
                      aria-label="Copiar prompt completo"
                    >
                      {copiedId === selectedPrompt.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* ✅ DIV COM HTML RENDERIZADO */}
                  <div 
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-200 dark:border-gray-800 prose prose-sm md:prose-base dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPrompt.content) }}
                    aria-label="Conteúdo completo do prompt"
                  />
                </div>


                {/* Instruções de uso */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm md:text-base font-semibold text-blue-900 dark:text-blue-100">
                        Como usar este prompt:
                      </p>
                      <ol className="text-xs md:text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                        <li>Copie o prompt completo acima</li>
                        <li>Abra o {selectedPrompt.recommendedAI?.primary || 'IA recomendada'} (botão abaixo)</li>
                        <li>Cole o prompt e adapte conforme necessário</li>
                        <li>Obtenha resultados otimizados para medicina!</li>
                      </ol>
                    </div>
                  </div>
                </div>


                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-gray-800">
                  <Button
                    onClick={() => copyPrompt(selectedPrompt)}
                    variant="outline"
                    className="flex-1 h-11 md:h-12 gap-2 touch-manipulation"
                    aria-label="Copiar prompt completo"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar Prompt
                  </Button>
                  <Button
                    onClick={() => toggleFavorite(selectedPrompt.id)}
                    variant="outline"
                    className="flex-1 h-11 md:h-12 gap-2 touch-manipulation"
                    aria-label={
                      favorites.has(selectedPrompt.id)
                        ? 'Remover dos favoritos'
                        : 'Adicionar aos favoritos'
                    }
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favorites.has(selectedPrompt.id)
                          ? 'fill-yellow-400 text-yellow-400'
                          : ''
                      }`}
                    />
                    {favorites.has(selectedPrompt.id) ? 'Favoritado' : 'Favoritar'}
                  </Button>
                  <Button
                    onClick={() => openAI(selectedPrompt.recommendedAI?.primary || 'ChatGPT')}
                    className="flex-1 h-11 md:h-12 gap-2 touch-manipulation bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    aria-label={`Abrir ${selectedPrompt.recommendedAI?.primary || 'IA'} em nova aba`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir {selectedPrompt.recommendedAI?.primary || 'IA'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}


        {/* Footer */}
        <footer className="border-t dark:border-gray-800 mt-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center space-y-3">
              <p className="text-sm md:text-base text-muted-foreground">
                MedPrompts © 2026 • Desenvolvido para estudantes de Medicina
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Desenvolvido por <span className="font-semibold text-indigo-600">Andressa Mendes</span> • Estudante de Medicina
              </p>
              <p className="text-xs text-muted-foreground">
                Afya - Guanambi/BA
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {staticPrompts.length} prompts
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
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
