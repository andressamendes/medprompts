import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Prompt } from '@/types/prompt';
import { PublicNavbar } from '@/components/PublicNavbar';
import { prompts as systemPrompts } from '@/data/prompts-data';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getAIName, formatCategoryName, AI_URLS } from '@/lib/utils';
import { extractVariables } from '@/lib/promptVariables';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, Star, Copy, Filter, Check,
  Sparkles, BookOpen, ArrowLeft, X, ExternalLink, Zap,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { PromptCustomizer } from '@/components/PromptCustomizer';

// Build: 2026-01-23 - Versão com UX melhorada

/**
 * Renderiza markdown básico para HTML com sanitização XSS
 */
function renderMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-semibold text-base mt-3 mb-1 text-gray-900 dark:text-white">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-bold text-lg mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="font-bold text-xl mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>');

  // Bold (standalone line and inline)
  html = html.replace(/^\*\*(.+?)\*\*$/gm, '<h3 class="font-bold text-lg mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">$1</code>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-700 dark:text-gray-300">$1</li>');
  html = html.replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc text-gray-700 dark:text-gray-300">$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-700 dark:text-gray-300">$2</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300">$1</a>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 dark:text-gray-300">');
  html = html.replace(/\n/g, '<br>');
  html = '<p class="mb-3 text-gray-700 dark:text-gray-300">' + html + '</p>';

  return DOMPurify.sanitize(html);
}

/**
 * Página de Prompts Médicos v5.0
 *
 * Features:
 * - Filtros persistidos na URL
 * - Acessibilidade WCAG AA
 * - Mobile-first design
 * - Performance otimizada
 */
export default function Prompts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { favorites, toggleFavorite: contextToggleFavorite, isFavorite, count: favoritesCount } = useFavorites();

  // Estado sincronizado com URL
  const searchTerm = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('cat') || 'all';
  const selectedTab = searchParams.get('tab') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customizerPrompt, setCustomizerPrompt] = useState<Prompt | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Atualizar URL params
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || (key === 'page' && value === '1')) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Handlers para filtros
  const handleSearchChange = useCallback((value: string) => {
    updateParams({ q: value, page: '1' });
  }, [updateParams]);

  const handleCategoryChange = useCallback((value: string) => {
    updateParams({ cat: value, page: '1' });
  }, [updateParams]);

  const handleTabChange = useCallback((value: string) => {
    updateParams({ tab: value, page: '1' });
  }, [updateParams]);

  const handlePageChange = useCallback((page: number) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateParams]);

  // Carregar prompts
  useEffect(() => {
    try {
      if (systemPrompts.length > 0) {
        setPrompts(systemPrompts);
      }
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
      toast({
        title: 'Erro ao carregar prompts',
        description: 'Não foi possível carregar os prompts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (promptId: string) => {
    const wasAlreadyFavorite = isFavorite(promptId);
    await contextToggleFavorite(promptId);
    toast({
      title: wasAlreadyFavorite ? '⭐ Removido dos favoritos' : '⭐ Adicionado aos favoritos'
    });
  }, [contextToggleFavorite, isFavorite]);

  const copyPrompt = useCallback((prompt: Prompt, showFeedback = true) => {
    try {
      navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);

      if (showFeedback) {
        toast({
          title: '📋 Prompt copiado!',
          description: 'Cole com Ctrl+V na sua IA preferida'
        });
      }

      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: '❌ Erro ao copiar',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    }
  }, []);

  const openAI = useCallback((aiName: string, promptContent?: string) => {
    if (promptContent) {
      navigator.clipboard.writeText(promptContent).then(() => {
        toast({
          title: '📋 Prompt copiado!',
          description: `Abrindo ${aiName}... Cole com Ctrl+V`,
        });
      }).catch(() => {
        toast({
          title: '⚠️ Não foi possível copiar',
          description: 'Copie o prompt manualmente',
          variant: 'destructive',
        });
      });
    }

    const url = AI_URLS[aiName] || AI_URLS.ChatGPT;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // Memoizar contagem de variáveis por prompt
  const variablesCountMap = useMemo(() => {
    const map = new Map<string, number>();
    prompts.forEach(p => {
      map.set(p.id, extractVariables(p.content).length);
    });
    return map;
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts];

    if (selectedTab === 'favorites') {
      filtered = filtered.filter((p) => isFavorite(p.id));
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
          p.category.toLowerCase().includes(term)
      );
    }

    // Ordenar A-Z por padrão
    filtered.sort((a, b) => a.title.localeCompare(b.title));

    return filtered;
  }, [prompts, selectedTab, selectedCategory, searchTerm, favorites, isFavorite]);

  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);

  // Garantir página válida
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const paginatedPrompts = useMemo(() => {
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredPrompts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPrompts, validPage]);

  // Categorias com contagem
  const categoriesWithCount = useMemo(() => {
    const categoryMap = new Map<string, number>();
    prompts.forEach((prompt) => {
      const cat = prompt.category || 'outros';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [prompts]);

  const clearFilters = useCallback(() => {
    setSearchParams({});
    toast({ title: '🔄 Filtros limpos' });
  }, [setSearchParams]);

  const hasActiveFilters = searchTerm || selectedCategory !== 'all';

  // Paginação com ellipsis melhorada
  const getPaginationItems = useCallback(() => {
    const items: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);

      if (validPage > 3) items.push('ellipsis');

      const start = Math.max(2, validPage - 1);
      const end = Math.min(totalPages - 1, validPage + 1);

      for (let i = start; i <= end; i++) {
        if (!items.includes(i)) items.push(i);
      }

      if (validPage < totalPages - 2) items.push('ellipsis');

      if (!items.includes(totalPages)) items.push(totalPages);
    }

    return items;
  }, [totalPages, validPage]);

  // Componente de filtros (reutilizado em desktop e mobile)
  const FiltersContent = () => (
    <div className="space-y-4">
      <div className="relative">
        <Label htmlFor="search" className="sr-only">Buscar prompts</Label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
        <Input
          id="search"
          placeholder="Buscar prompts..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800"
          aria-describedby="search-description"
        />
        <span id="search-description" className="sr-only">
          Digite para filtrar prompts por título, descrição ou categoria
        </span>
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger
          className="w-full h-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800"
          aria-label="Filtrar por categoria"
        >
          <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas ({prompts.length})</SelectItem>
          {categoriesWithCount.map(({ name, count }) => (
            <SelectItem key={name} value={name}>
              {formatCategoryName(name)} ({count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-24 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl" />

            {/* Skeleton dos filtros */}
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="w-48 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>

            {/* Skeleton dos cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border bg-white/50 dark:bg-gray-900/50 p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex gap-2 pt-4 border-t">
                    <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
        <PublicNavbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-8 gap-2 hover:gap-3 transition-all duration-300 group"
              aria-label="Voltar para página inicial"
            >
              <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span>Voltar</span>
            </Button>

            <div className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Biblioteca de Prompts Especializados</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-blue-600 dark:text-blue-400">Prompts Médicos</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground">
                Otimizados para ChatGPT, Claude, Perplexity e NotebookLM
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
                <span>{filteredPrompts.length} prompts disponíveis</span>
              </div>
            </div>
          </div>

          {/* Blobs animados */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" aria-hidden="true" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" aria-hidden="true" />
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12" id="main-content">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
              <TabsList
                className="grid w-full max-w-md mx-auto grid-cols-2 h-14 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800"
                aria-label="Filtrar por tipo de prompt"
              >
                <TabsTrigger
                  value="all"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Todos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
                >
                  <Star className="h-4 w-4" aria-hidden="true" />
                  <span>Favoritos</span>
                  {favoritesCount > 0 && (
                    <Badge className="ml-1 bg-white text-indigo-600 hover:bg-white">
                      {favoritesCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filtros Desktop */}
            <div className="hidden md:flex gap-3">
              <div className="flex-1">
                <FiltersContent />
              </div>
            </div>

            {/* Filtros Mobile (Sheet) */}
            <div className="md:hidden flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-12"
                  aria-label="Buscar prompts"
                />
              </div>

              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 px-4"
                    aria-label="Abrir filtros"
                  >
                    <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                    Filtros
                    {hasActiveFilters && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-indigo-600">
                        !
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <FiltersContent />
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={() => {
                          clearFilters();
                          setMobileFiltersOpen(false);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" aria-hidden="true" />
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Botão limpar filtros desktop */}
            {hasActiveFilters && (
              <div className="hidden md:flex justify-center animate-in fade-in duration-300">
                <Button variant="ghost" size="sm" onClick={clearFilters} aria-label="Limpar todos os filtros aplicados" className="gap-2">
                  <X className="h-4 w-4" aria-hidden="true" />
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Grid de Cards */}
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-20 animate-in fade-in duration-500" role="status">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" aria-hidden="true" />
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
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                role="list"
                aria-label="Lista de prompts"
              >
                {paginatedPrompts.map((prompt, index) => {
                  const aiName = getAIName(prompt);
                  const variablesCount = variablesCountMap.get(prompt.id) || 0;

                  return (
                    <Card
                      key={prompt.id}
                      role="listitem"
                      className="group relative overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

                      <CardHeader className="pb-3 relative z-10">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200"
                            >
                              {aiName}
                            </Badge>
                            {variablesCount > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-200"
                              >
                                <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                                {variablesCount} {variablesCount === 1 ? 'variável' : 'variáveis'}
                              </Badge>
                            )}
                            {prompt.isSystemPrompt && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" aria-hidden="true" />
                                Sistema
                              </Badge>
                            )}
                          </div>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleFavorite(prompt.id)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 group/star"
                                aria-label={isFavorite(prompt.id) ? `Remover "${prompt.title}" dos favoritos` : `Adicionar "${prompt.title}" aos favoritos`}
                                aria-pressed={isFavorite(prompt.id)}
                              >
                                <Star
                                  className={`w-5 h-5 transition-all duration-300 ${
                                    isFavorite(prompt.id)
                                      ? 'fill-yellow-400 text-yellow-400 scale-110'
                                      : 'text-gray-400 group-hover/star:text-yellow-400 group-hover/star:scale-110'
                                  }`}
                                  aria-hidden="true"
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isFavorite(prompt.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
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
                        <div className="flex gap-2 pt-3 border-t dark:border-gray-800">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setCustomizerPrompt(prompt)}
                                aria-label={`Personalizar prompt "${prompt.title}"`}
                                className="flex-1 h-9 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                              >
                                <Sparkles className="w-4 h-4" aria-hidden="true" />
                                <span className="text-xs">Personalizar</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {variablesCount > 0
                                ? 'Preencher variáveis do prompt'
                                : 'Adicionar contexto personalizado'}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyPrompt(prompt)}
                                aria-label={copiedId === prompt.id ? 'Prompt copiado!' : `Copiar prompt "${prompt.title}"`}
                                className="h-9 gap-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                              >
                                {copiedId === prompt.id ? (
                                  <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                                ) : (
                                  <Copy className="w-4 h-4" aria-hidden="true" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {copiedId === prompt.id ? 'Copiado!' : 'Copiar prompt'}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPrompt(prompt)}
                                aria-label={`Ver detalhes do prompt "${prompt.title}"`}
                                className="h-9 gap-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                              >
                                <BookOpen className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                        </div>

                        <Button
                          onClick={() => {
                            if (variablesCount > 0) {
                              toast({
                                title: '✏️ Personalize o prompt',
                                description: `Preencha ${variablesCount} ${variablesCount === 1 ? 'campo' : 'campos'} antes de usar`,
                              });
                              setCustomizerPrompt(prompt);
                            } else {
                              openAI(aiName, prompt.content);
                            }
                          }}
                          aria-label={variablesCount > 0 ? `Personalizar e abrir "${prompt.title}" no ${aiName}` : `Abrir "${prompt.title}" no ${aiName}`}
                          className="w-full h-9 text-xs gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                        >
                          <ExternalLink className="w-4 h-4" aria-hidden="true" />
                          {variablesCount > 0 ? 'Personalizar e Abrir' : `Abrir ${aiName}`}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Paginação */}
            {filteredPrompts.length > ITEMS_PER_PAGE && (
              <nav
                className="flex items-center justify-center gap-1 mt-8"
                aria-label="Navegação de páginas"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                  aria-label="Ir para página anterior"
                  className="h-10 px-3"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only md:not-sr-only md:ml-1">Anterior</span>
                </Button>

                <div className="flex items-center gap-1" role="group" aria-label="Páginas">
                  {getPaginationItems().map((item, index) => {
                    if (item === 'ellipsis') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400" aria-hidden="true">
                          ...
                        </span>
                      );
                    }
                    return (
                      <Button
                        key={item}
                        variant={item === validPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(item)}
                        aria-label={`Ir para página ${item}`}
                        aria-current={item === validPage ? "page" : undefined}
                        className="h-10 w-10"
                      >
                        {item}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage === totalPages}
                  aria-label="Ir para próxima página"
                  className="h-10 px-3"
                >
                  <span className="sr-only md:not-sr-only md:mr-1">Próxima</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </nav>
            )}
          </div>
        </main>

        {/* Modal de Detalhes */}
        {selectedPrompt && (
          <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-800">
              <DialogHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-3">{selectedPrompt.title}</DialogTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-600 text-white font-semibold">
                        {getAIName(selectedPrompt)}
                      </Badge>
                      <Badge variant="outline" className="font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                        {formatCategoryName(selectedPrompt.category)}
                      </Badge>
                      {selectedPrompt.isSystemPrompt && (
                        <Badge variant="outline">
                          <Zap className="w-3 h-3 mr-1" aria-hidden="true" />
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
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                      Prompt Completo
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPrompt(selectedPrompt)}
                      className="gap-2"
                      aria-label={copiedId === selectedPrompt.id ? 'Prompt copiado!' : 'Copiar prompt'}
                    >
                      {copiedId === selectedPrompt.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" aria-hidden="true" />
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
                    aria-label="Copiar prompt"
                  >
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    Copiar
                  </Button>
                  <Button
                    onClick={() => toggleFavorite(selectedPrompt.id)}
                    variant="outline"
                    className="flex-1 h-11 gap-2"
                    aria-label={isFavorite(selectedPrompt.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Star className={isFavorite(selectedPrompt.id) ? 'fill-yellow-400 text-yellow-400' : ''} aria-hidden="true" />
                    {isFavorite(selectedPrompt.id) ? 'Favoritado' : 'Favoritar'}
                  </Button>
                  <Button
                    onClick={() => {
                      const varsCount = variablesCountMap.get(selectedPrompt.id) || 0;
                      if (varsCount > 0) {
                        toast({
                          title: '✏️ Personalize o prompt',
                          description: `Preencha ${varsCount} ${varsCount === 1 ? 'campo' : 'campos'} antes de usar`,
                        });
                        setSelectedPrompt(null);
                        setCustomizerPrompt(selectedPrompt);
                      } else {
                        openAI(getAIName(selectedPrompt), selectedPrompt.content);
                      }
                    }}
                    className="flex-1 h-11 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    aria-label={(variablesCountMap.get(selectedPrompt.id) || 0) > 0 ? 'Personalizar e abrir na IA' : 'Abrir na IA'}
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    {(variablesCountMap.get(selectedPrompt.id) || 0) > 0 ? 'Personalizar e Abrir' : 'Abrir IA'}
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
                Por <span className="font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Andressa Mendes</span>
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  {prompts.length} prompts
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="w-3 h-3" aria-hidden="true" />
                  {favoritesCount} favoritos
                </Badge>
              </div>
            </div>
          </div>
        </footer>

        {/* Customizer Modal */}
        {customizerPrompt && (
          <PromptCustomizer
            prompt={customizerPrompt}
            open={!!customizerPrompt}
            onOpenChange={(open) => !open && setCustomizerPrompt(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
