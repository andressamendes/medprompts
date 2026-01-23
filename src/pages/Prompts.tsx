import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Prompt } from '@/types/prompt';
import { PublicNavbar } from '@/components/PublicNavbar';
import { prompts as systemPrompts } from '@/data/prompts-data';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getAIName, formatCategoryName, AI_URLS } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, Star, Copy, Check, Sparkles,
  BookOpen, ArrowLeft, X, ExternalLink,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

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
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Label htmlFor="search" className="sr-only">Buscar prompts</Label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
        <Input
          id="search"
          placeholder="Buscar prompts..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-48 h-10" aria-label="Filtrar por categoria">
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
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg w-64" />
            <div className="flex gap-3">
              <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="w-48 h-10 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-white dark:bg-gray-900 p-4 space-y-3">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PublicNavbar />

        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-950 border-b py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mb-6 gap-1"
              aria-label="Voltar para página inicial"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar
            </Button>

            <div className="max-w-2xl">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Prompts Médicos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredPrompts.length} prompts para ChatGPT, Claude, Perplexity e NotebookLM
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6" id="main-content">
          <div className="space-y-5">
            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={handleTabChange}>
              <TabsList
                className="grid w-full max-w-xs grid-cols-2 h-10"
                aria-label="Filtrar por tipo de prompt"
              >
                <TabsTrigger value="all" className="gap-1.5 text-sm">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-1.5 text-sm">
                  <Star className="h-4 w-4" aria-hidden="true" />
                  Favoritos
                  {favoritesCount > 0 && (
                    <span className="ml-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">
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
              <div className="text-center py-16" role="status">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                <h2 className="text-lg font-semibold mb-2">Nenhum prompt encontrado</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {selectedTab === 'favorites'
                    ? 'Clique na estrela para favoritar prompts'
                    : 'Ajuste os filtros para encontrar prompts'}
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
                {paginatedPrompts.map((prompt) => {
                  const aiName = getAIName(prompt);

                  return (
                    <Card
                      key={prompt.id}
                      role="listitem"
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all"
                    >

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {aiName}
                          </Badge>

                          <button
                            onClick={() => toggleFavorite(prompt.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                            aria-label={isFavorite(prompt.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            aria-pressed={isFavorite(prompt.id)}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                isFavorite(prompt.id)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-400'
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>

                        <CardTitle className="text-base leading-tight line-clamp-2">
                          {prompt.title}
                        </CardTitle>

                        <CardDescription className="text-sm mt-1.5 line-clamp-2">
                          {prompt.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-3 relative z-10">
                        <div className="flex gap-2">
                          {/* Botão principal - Copiar Prompt */}
                          <Button
                            onClick={() => copyPrompt(prompt)}
                            aria-label={`Copiar "${prompt.title}"`}
                            className="flex-1 h-10 gap-2 bg-indigo-600 hover:bg-indigo-700"
                          >
                            {copiedId === prompt.id ? (
                              <>
                                <Check className="w-4 h-4" aria-hidden="true" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" aria-hidden="true" />
                                Copiar
                              </>
                            )}
                          </Button>

                          {/* Ver detalhes */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedPrompt(prompt)}
                                aria-label={`Ver detalhes de "${prompt.title}"`}
                                className="h-10 w-10"
                              >
                                <BookOpen className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver prompt completo</TooltipContent>
                          </Tooltip>
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
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{getAIName(selectedPrompt)}</Badge>
                  <Badge variant="outline">{formatCategoryName(selectedPrompt.category)}</Badge>
                </div>
                <DialogTitle className="text-xl">{selectedPrompt.title}</DialogTitle>
                <DialogDescription>{selectedPrompt.description}</DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <div
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border text-sm prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPrompt.content) }}
                />
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  onClick={() => copyPrompt(selectedPrompt)}
                  variant="outline"
                  className="flex-1 gap-2"
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
                <Button
                  onClick={() => toggleFavorite(selectedPrompt.id)}
                  variant="outline"
                  className="gap-2"
                >
                  <Star className={`w-4 h-4 ${isFavorite(selectedPrompt.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} aria-hidden="true" />
                </Button>
                <Button
                  onClick={() => {
                    copyPrompt(selectedPrompt, false);
                    openAI(getAIName(selectedPrompt));
                  }}
                  className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  Usar Prompt
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
