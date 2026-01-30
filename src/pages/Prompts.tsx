import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Prompt } from '@/types/prompt';
import { PublicNavbar } from '@/components/PublicNavbar';
import { SEOHead } from '@/components/SEOHead';
import { prompts as systemPrompts } from '@/data/prompts-data';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getAIName, formatCategoryName, AI_URLS } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Search, Star, Copy, Check, Sparkles,
  Eye, ArrowLeft, X, ExternalLink,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Build: 2026-01-23 - Versão com UX melhorada

// Configurar marked para parsing otimizado
marked.setOptions({
  breaks: true,
  gfm: true
});

// Cache para markdown renderizado (memoização)
const markdownCache = new Map<string, string>();

/**
 * Renderiza markdown para HTML com sanitização XSS
 * Usa marked (mais rápido que regex) + cache para performance
 */
function renderMarkdown(markdown: string): string {
  // Verificar cache primeiro
  const cached = markdownCache.get(markdown);
  if (cached) return cached;

  // Renderizar com marked
  const html = marked.parse(markdown, { async: false }) as string;

  // Sanitizar e cachear
  const sanitized = DOMPurify.sanitize(html);
  markdownCache.set(markdown, sanitized);

  // Limitar tamanho do cache (máx 100 entradas)
  if (markdownCache.size > 100) {
    const firstKey = markdownCache.keys().next().value;
    if (firstKey) markdownCache.delete(firstKey);
  }

  return sanitized;
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

  const { toggleFavorite: contextToggleFavorite, isFavorite, count: favoritesCount } = useFavorites();

  // Estado sincronizado com URL
  const searchTerm = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('cat') || 'all';
  const selectedTab = searchParams.get('tab') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado local para input de busca (feedback imediato)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Sincronizar estado local com URL
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handlers para filtros (com debounce na busca)
  const handleSearchChange = useCallback((value: string) => {
    // Atualiza estado local imediatamente (feedback visual)
    setLocalSearchTerm(value);

    // Debounce a atualização da URL (300ms)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateParams({ q: value, page: '1' });
    }, 300);
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
  }, [prompts, selectedTab, selectedCategory, searchTerm, isFavorite]);

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
    setLocalSearchTerm(''); // Limpar estado local imediatamente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchParams({});
    toast({ title: '🔄 Filtros limpos' });
  }, [setSearchParams]);

  const hasActiveFilters = localSearchTerm || selectedCategory !== 'all';

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
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 min-w-0">
        <Label htmlFor="search" className="sr-only">Buscar prompts</Label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" aria-hidden="true" />
        <Input
          id="search"
          placeholder="Buscar prompts..."
          value={localSearchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 pr-9 h-11 sm:h-10 text-base sm:text-sm rounded-lg"
        />
        {localSearchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </button>
        )}
      </div>

      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-44 lg:w-48 h-11 sm:h-10 text-base sm:text-sm rounded-lg shrink-0" aria-label="Filtrar por categoria">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PublicNavbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 sm:h-16 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 sm:w-64" />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 h-10 sm:h-11 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="w-full sm:w-44 h-10 sm:h-11 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border bg-white dark:bg-gray-900 p-4 sm:p-5 space-y-3 min-h-[180px]">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg mt-auto" />
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
      <SEOHead
        title="Prompts Medicos"
        description={`Explore ${filteredPrompts.length} prompts otimizados para ChatGPT, Claude, Perplexity e NotebookLM. Prompts para estudos, clinica e pesquisa medica.`}
        canonical="https://andressamendes.github.io/medprompts/prompts"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PublicNavbar />

        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-950 border-b py-6 sm:py-8 lg:py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mb-4 sm:mb-6 gap-1.5 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              aria-label="Voltar para página inicial"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">Voltar</span>
            </Button>

            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">
                Prompts Médicos
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {filteredPrompts.length} prompts para ChatGPT, Claude, Perplexity e NotebookLM
              </p>
            </div>
          </div>
        </section>

        {/* Live Region para Acessibilidade - Anuncia resultados para leitores de tela */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {filteredPrompts.length === 0
            ? 'Nenhum prompt encontrado com os filtros selecionados'
            : `${filteredPrompts.length} ${filteredPrompts.length === 1 ? 'prompt encontrado' : 'prompts encontrados'}`
          }
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8" id="main-content">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
              <TabsList
                className="grid w-full max-w-[280px] sm:max-w-xs grid-cols-2 h-11 sm:h-10"
                aria-label="Filtrar por tipo de prompt"
              >
                <TabsTrigger value="all" className="gap-1.5 text-sm data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300">
                  <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Todos</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-1.5 text-sm data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300">
                  <Star className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">Favoritos</span>
                  {favoritesCount > 0 && (
                    <span className="ml-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full shrink-0">
                      {favoritesCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filtros */}
            <FiltersContent />

            {/* Limpar filtros */}
            {hasActiveFilters && (
              <div className="flex justify-start">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-gray-500">
                  <X className="h-4 w-4" aria-hidden="true" />
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Grid de Cards */}
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20" role="status">
                <Search className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">Nenhum prompt encontrado</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                  {selectedTab === 'favorites'
                    ? 'Clique na estrela para favoritar prompts'
                    : 'Ajuste os filtros para encontrar prompts'}
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="h-10">
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6" role="list">
                {paginatedPrompts.map((prompt) => {
                  const aiName = getAIName(prompt);

                  return (
                    <Card
                      key={prompt.id}
                      role="listitem"
                      className="flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all rounded-xl"
                    >
                      <CardHeader className="pb-3 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {aiName}
                          </Badge>

                          <button
                            onClick={() => toggleFavorite(prompt.id)}
                            className="p-1.5 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0"
                            aria-label={isFavorite(prompt.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            aria-pressed={isFavorite(prompt.id)}
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                isFavorite(prompt.id)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-400 hover:text-yellow-400'
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>

                        <CardTitle className="text-base sm:text-[15px] leading-snug line-clamp-2 text-gray-900 dark:text-white">
                          {prompt.title}
                        </CardTitle>

                        <CardDescription className="text-sm mt-1.5 line-clamp-2 text-gray-600 dark:text-gray-400">
                          {prompt.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0 pb-4 sm:pb-5">
                        <div className="flex gap-2">
                          {/* Botão principal - Copiar Prompt */}
                          <Button
                            onClick={() => copyPrompt(prompt)}
                            aria-label={`Copiar "${prompt.title}"`}
                            className="flex-1 h-11 sm:h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-medium rounded-lg"
                          >
                            {copiedId === prompt.id ? (
                              <>
                                <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span className="truncate">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span className="truncate">Copiar</span>
                              </>
                            )}
                          </Button>

                          {/* Ver detalhes */}
                          <Button
                            variant="outline"
                            onClick={() => setSelectedPrompt(prompt)}
                            aria-label={`Ver detalhes de "${prompt.title}"`}
                            className="h-11 sm:h-10 px-3 sm:px-4 gap-2 shrink-0 rounded-lg border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 dark:hover:border-indigo-700"
                          >
                            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span className="hidden sm:inline text-sm font-medium">Ver</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Paginação */}
            {filteredPrompts.length > ITEMS_PER_PAGE && (
              <nav
                className="flex items-center justify-center gap-1 sm:gap-1.5 mt-6 sm:mt-8 lg:mt-10 px-2"
                aria-label="Navegação de páginas"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                  aria-label="Ir para página anterior"
                  className="h-11 sm:h-10 px-3 sm:px-4 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline sm:ml-1">Anterior</span>
                </Button>

                <div className="flex items-center gap-1" role="group" aria-label="Páginas">
                  {getPaginationItems().map((item, index) => {
                    if (item === 'ellipsis') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-1.5 sm:px-2 text-gray-400" aria-hidden="true">
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
                        className="h-11 w-11 sm:h-10 sm:w-10 rounded-lg text-sm"
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
                  className="h-11 sm:h-10 px-3 sm:px-4 rounded-lg"
                >
                  <span className="hidden sm:inline sm:mr-1">Próxima</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </nav>
            )}
          </div>
        </main>

        {/* Modal de Detalhes */}
        {selectedPrompt && (
          <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
            <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-xl sm:rounded-lg p-4 sm:p-6">
              <DialogHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{getAIName(selectedPrompt)}</Badge>
                  <Badge variant="outline" className="text-xs">{formatCategoryName(selectedPrompt.category)}</Badge>
                </div>
                <DialogTitle className="text-lg sm:text-xl leading-snug">{selectedPrompt.title}</DialogTitle>
                <DialogDescription className="text-sm">{selectedPrompt.description}</DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <div
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4 border text-sm prose prose-sm dark:prose-invert max-w-none overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPrompt.content) }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4 pt-4 border-t">
                <Button
                  onClick={() => copyPrompt(selectedPrompt)}
                  variant="outline"
                  className="flex-1 h-11 sm:h-10 gap-2 rounded-lg order-2 sm:order-1"
                >
                  {copiedId === selectedPrompt.id ? (
                    <>
                      <Check className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => toggleFavorite(selectedPrompt.id)}
                  variant="outline"
                  className="h-11 w-11 sm:h-10 sm:w-10 gap-2 rounded-lg shrink-0 order-3 sm:order-2 self-end sm:self-auto"
                >
                  <Star className={`w-4 h-4 ${isFavorite(selectedPrompt.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} aria-hidden="true" />
                </Button>
                <Button
                  onClick={() => {
                    copyPrompt(selectedPrompt, false);
                    openAI(getAIName(selectedPrompt));
                  }}
                  className="flex-1 h-11 sm:h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg order-1 sm:order-3"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Usar Prompt</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Footer */}
        <footer className="border-t mt-12 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            <p>MedPrompts © 2026 • Por Andressa Mendes</p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
