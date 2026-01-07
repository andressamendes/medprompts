import { useState, useEffect, useCallback } from 'react';
import { prompts as staticPrompts } from '@/data/prompts-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Star, Copy, Filter, Loader2, ArrowUpDown, Check, Sparkles, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { PromptData } from '@/services/api/prompts';

/**
 * Página Prompts - Biblioteca Pública de Prompts Médicos
 * Refatorada para funcionar como biblioteca de consulta (somente leitura)
 * Sistema de favoritos gerenciado via localStorage
 */

const FAVORITES_STORAGE_KEY = 'medprompts_favorites';
const USAGE_STORAGE_KEY = 'medprompts_usage';

export default function Prompts() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'favorites'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', 'anatomia', 'fisiologia', 'farmacologia', 'clinica', 'cirurgia', 'pediatria', 'estudos', 'geral'];

  // Carregar favoritos do localStorage
  const loadFavorites = (): Set<string> => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  // Salvar favoritos no localStorage
  const saveFavorites = (favorites: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  // Carregar contadores de uso do localStorage
  const loadUsageCounts = (): Record<string, number> => {
    try {
      const stored = localStorage.getItem(USAGE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  // Salvar contadores de uso no localStorage
  const saveUsageCounts = (counts: Record<string, number>) => {
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(counts));
    } catch (error) {
      console.error('Erro ao salvar contadores:', error);
    }
  };

  // Carregar prompts dos dados estáticos com informações do localStorage
  const loadPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const favorites = loadFavorites();
      const usageCounts = loadUsageCounts();

      const data: PromptData[] = staticPrompts.map((p, index) => ({
        id: p.id || `prompt-${index}`,
        title: p.title,
        content: p.content,
        category: p.category,
        tags: p.tags,
        usageCount: usageCounts[p.id || `prompt-${index}`] || 0,
        isFavorite: favorites.has(p.id || `prompt-${index}`),
        isSystem: true,
      }));

      setPrompts(data);
      setFilteredPrompts(data);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao carregar prompts';
      toast({
        title: 'Erro ao carregar prompts',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar prompts ao montar
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Filtrar e ordenar prompts
  useEffect(() => {
    let filtered = prompts;

    // Filtro por tab
    if (selectedTab === 'favorites') {
      filtered = filtered.filter((p) => p.isFavorite);
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term)),
      );
    }

    // Ordenação
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'usage') {
      filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    } else if (sortBy === 'favorites') {
      filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }

    setFilteredPrompts(filtered);
  }, [prompts, selectedCategory, selectedTab, searchTerm, sortBy]);

  // Alternar favorito
  const toggleFavorite = (id: string) => {
    const favorites = loadFavorites();
    
    if (favorites.has(id)) {
      favorites.delete(id);
      toast({
        title: 'Removido dos favoritos',
        description: 'O prompt foi removido da sua lista de favoritos',
      });
    } else {
      favorites.add(id);
      toast({
        title: 'Adicionado aos favoritos',
        description: 'O prompt foi adicionado à sua lista de favoritos',
      });
    }

    saveFavorites(favorites);
    loadPrompts();
  };

  // Copiar prompt e incrementar contador
  const handleCopy = async (prompt: PromptData) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      
      if (prompt.id) {
        // Feedback visual
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);

        // Incrementar contador de uso
        const usageCounts = loadUsageCounts();
        usageCounts[prompt.id] = (usageCounts[prompt.id] || 0) + 1;
        saveUsageCounts(usageCounts);
      }
      
      toast({
        title: 'Copiado!',
        description: 'Prompt copiado para área de transferência',
      });
      
      loadPrompts();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao copiar';
      toast({
        title: 'Erro ao copiar',
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Visualizar prompt completo
  const handleView = (prompt: PromptData) => {
    toast({
      title: prompt.title,
      description: (
        <div className="mt-2 space-y-2">
          <p className="text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
            {prompt.content}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {prompt.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ),
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                      Biblioteca de Prompts
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                      {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt disponível' : 'prompts disponíveis'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 border border-muted">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Biblioteca pública de prompts médicos</p>
                    <p>Explore, copie e favorite os prompts mais úteis para seus estudos. Todos os prompts são de uso livre.</p>
                  </div>
                </div>
              </div>

              {/* Tabs de Filtro Rápido */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                  <TabsTrigger value="all" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Todos</span>
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-2">
                    <Star className="h-4 w-4" />
                    <span>Favoritos</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Filtros e Ordenação */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar por título, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Categoria */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.filter((c) => c !== 'all').map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Ordenação */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">A-Z</SelectItem>
                  <SelectItem value="usage">Mais usados</SelectItem>
                  <SelectItem value="favorites">Favoritos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando prompts...</p>
              </div>
            ) : (
              <>
                {/* Grid de Prompts */}
                {filteredPrompts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredPrompts.map((prompt, index) => (
                      <Card 
                        key={prompt.id} 
                        className="group flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight flex-1">
                              {prompt.title}
                            </CardTitle>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0 h-8 w-8"
                                  onClick={() => prompt.id && toggleFavorite(prompt.id)}
                                >
                                  <Star
                                    className={`h-4 w-4 transition-all ${
                                      prompt.isFavorite 
                                        ? 'fill-yellow-500 text-yellow-500 scale-110' 
                                        : 'group-hover:text-yellow-500/50'
                                    }`}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {prompt.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <CardDescription className="line-clamp-3 text-xs sm:text-sm">
                            {prompt.content}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 flex flex-col gap-3 pt-0">
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {prompt.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {prompt.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                +{prompt.tags.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Estatísticas */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
                            <span className="flex items-center gap-1">
                              <Copy className="h-3 w-3" />
                              {prompt.usageCount || 0}x copiado
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {prompt.category}
                            </Badge>
                          </div>

                          {/* Ações */}
                          <div className="grid grid-cols-2 gap-2">
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant={copiedId === prompt.id ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleCopy(prompt)}
                                  className="gap-1.5"
                                >
                                  {copiedId === prompt.id ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      <span>Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copiar prompt para área de transferência</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleView(prompt)}
                                  className="gap-1.5"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  <span>Ver</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Visualizar prompt completo</TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4">
                      <div className="rounded-full bg-muted p-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-medium">Nenhum prompt encontrado</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedTab === 'favorites' 
                            ? 'Você ainda não tem prompts favoritos. Clique na estrela para adicionar!' 
                            : 'Tente ajustar os filtros de busca'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                MedPrompts © 2026 • Desenvolvido para estudantes de Medicina
              </p>
              <p className="text-xs text-muted-foreground">
                Desenvolvido por <span className="font-semibold">Andressa Mendes</span> • Estudante de Medicina
              </p>
              <p className="text-xs text-muted-foreground">
                Afya - Guanambi/BA
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
