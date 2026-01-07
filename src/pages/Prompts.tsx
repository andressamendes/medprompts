import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { prompts as staticPrompts } from '@/data/prompts-data';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, Star, Copy, Filter, Loader2, ArrowUpDown, Check, 
  Sparkles, BookOpen, ArrowLeft, X, Eye, Wand2, ExternalLink
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { PromptData } from '@/services/api/prompts';

/**
 * Página Prompts - Biblioteca Pública de Prompts Médicos v2.1
 * 
 * Novidades v2.1:
 * - Recomendação de IA ideal para cada prompt
 * - Sistema de personalização com variáveis
 * - Prompt final pronto para usar direto na IA
 * - Links diretos para abrir cada IA
 */

const FAVORITES_STORAGE_KEY = 'medprompts_favorites';
const USAGE_STORAGE_KEY = 'medprompts_usage';


// Interface estendida para incluir recommendedAI
interface ExtendedPromptData extends PromptData {
  recommendedAI?: string | {
    primary?: string;
    reason?: string;
    alternatives?: string[];
  };
}

// Mapeamento de IAs recomendadas
const AI_RECOMMENDATIONS: Record<string, { name: string; icon: string; url: string; color: string }> = {
  chatgpt: {
    name: 'ChatGPT',
    icon: '🤖',
    url: 'https://chat.openai.com/',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400',
  },
  claude: {
    name: 'Claude',
    icon: '🧠',
    url: 'https://claude.ai/',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  },
  gemini: {
    name: 'Gemini',
    icon: '✨',
    url: 'https://gemini.google.com/',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔍',
    url: 'https://www.perplexity.ai/',
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  },
  notebooklm: {
    name: 'NotebookLM',
    icon: '📔',
    url: 'https://notebooklm.google/',
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  },
  any: {
    name: 'Qualquer IA',
    icon: '🌐',
    url: '',
    color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  },
};

// Função auxiliar para extrair a IA primária
const getAIKey = (recommendedAI: ExtendedPromptData['recommendedAI']): string => {
  if (!recommendedAI) return 'any';
  if (typeof recommendedAI === 'string') return recommendedAI.toLowerCase().replace(/\s+/g, '');
  if (typeof recommendedAI === 'object' && recommendedAI.primary) {
    return recommendedAI.primary.toLowerCase().replace(/\s+/g, '');
  }
  return 'any';
};

interface PromptVariable {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

export default function Prompts() {
  const navigate = useNavigate();
  
  const [prompts, setPrompts] = useState<ExtendedPromptData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'favorites'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<ExtendedPromptData | null>(null);
  const [customizingPrompt, setCustomizingPrompt] = useState<ExtendedPromptData | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const categories = ['all', 'anatomia', 'fisiologia', 'farmacologia', 'clinica', 'cirurgia', 'pediatria', 'estudos', 'geral'];

  // Extrair variáveis do prompt (formato: {VARIAVEL})
  const extractVariables = useCallback((content: string): PromptVariable[] => {
    const regex = /\{([A-Z_]+)\}/g;
    const matches = [...content.matchAll(regex)];
    const uniqueKeys = [...new Set(matches.map(m => m[1]))];
    
    return uniqueKeys.map(key => ({
      key,
      label: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      placeholder: `Digite ${key.replace(/_/g, ' ').toLowerCase()}...`,
      type: key.includes('TEXTO') || key.includes('DESCRICAO') ? 'textarea' : 'text',
    }));
  }, []);

  // Substituir variáveis no prompt
  const replaceVariables = useCallback((content: string, values: Record<string, string>): string => {
    let result = content;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`);
    });
    return result;
  }, []);

  // Carregar favoritos do localStorage
  const loadFavorites = useCallback((): Set<string> => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = useCallback((favorites: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }, []);

  // Carregar contadores de uso do localStorage
  const loadUsageCounts = useCallback((): Record<string, number> => {
    try {
      const stored = localStorage.getItem(USAGE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  // Salvar contadores de uso no localStorage
  const saveUsageCounts = useCallback((counts: Record<string, number>) => {
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(counts));
    } catch (error) {
      console.error('Erro ao salvar contadores:', error);
    }
  }, []);

  // Carregar prompts dos dados estáticos com informações do localStorage
  const loadPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const favorites = loadFavorites();
      const usageCounts = loadUsageCounts();

      const data: ExtendedPromptData[] = staticPrompts.map((p, index) => ({
        id: p.id || `prompt-${index}`,
        title: p.title,
        content: p.content,
        category: p.category,
        tags: p.tags,
        usageCount: usageCounts[p.id || `prompt-${index}`] || 0,
        isFavorite: favorites.has(p.id || `prompt-${index}`),
        isSystem: true,
        recommendedAI: (p as ExtendedPromptData).recommendedAI,
      }));

      setPrompts(data);
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
  }, [loadFavorites, loadUsageCounts]);

  // Carregar prompts ao montar
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Filtrar e ordenar prompts usando useMemo para performance
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    if (selectedTab === 'favorites') {
      filtered = filtered.filter((p) => p.isFavorite);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term)),
      );
    }

    const sorted = [...filtered];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'usage') {
      sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    } else if (sortBy === 'favorites') {
      sorted.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }

    return sorted;
  }, [prompts, selectedCategory, selectedTab, searchTerm, sortBy]);

  // Alternar favorito
  const toggleFavorite = useCallback((id: string) => {
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
  }, [loadFavorites, saveFavorites, loadPrompts]);

  // Copiar prompt e incrementar contador
  const handleCopy = useCallback(async (prompt: ExtendedPromptData, customContent?: string) => {
    try {
      const contentToCopy = customContent || prompt.content;
      await navigator.clipboard.writeText(contentToCopy);
      
      if (prompt.id) {
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);

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
  }, [loadUsageCounts, saveUsageCounts, loadPrompts]);

  // Visualizar prompt completo
  const handleView = useCallback((prompt: ExtendedPromptData) => {
    setViewingPrompt(prompt);
  }, []);

  // Personalizar prompt
  const handleCustomize = useCallback((prompt: ExtendedPromptData) => {
    setCustomizingPrompt(prompt);
    setVariableValues({});
  }, []);

  // Copiar prompt personalizado
  const handleCopyCustomized = useCallback(() => {
    if (!customizingPrompt) return;
    
    const customContent = replaceVariables(customizingPrompt.content, variableValues);
    handleCopy(customizingPrompt, customContent);
    setCustomizingPrompt(null);
    setVariableValues({});
  }, [customizingPrompt, variableValues, replaceVariables, handleCopy]);

  // Abrir IA recomendada
  const openRecommendedAI = useCallback((aiKey: string) => {
    const ai = AI_RECOMMENDATIONS[aiKey];
    if (ai && ai.url) {
      window.open(ai.url, '_blank');
    }
  }, []);

  // Limpar busca
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AuthenticatedNavbar />
        
        <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tools')}
                className="w-fit gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Ferramentas
              </Button>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      Biblioteca de Prompts
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                      {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt disponível' : 'prompts disponíveis'}
                      {searchTerm && ` para "${searchTerm}"`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 border">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Prompts personalizáveis para estudantes de medicina</p>
                    <p>Cada prompt é recomendado para uma IA específica. Personalize com seus dados e copie pronto para usar!</p>
                  </div>
                </div>
              </div>

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

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar por título, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

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

            {/* Loading */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando prompts...</p>
              </div>
            ) : (
              <>
                {/* Grid de Prompts */}
                {filteredPrompts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredPrompts.map((prompt) => {
                      const aiKey = getAIKey(prompt.recommendedAI);
                      const ai = AI_RECOMMENDATIONS[aiKey] || AI_RECOMMENDATIONS.any;
                      const hasVariables = extractVariables(prompt.content).length > 0;

                      return (
                        <Card 
                          key={prompt.id} 
                          className="group flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border hover:border-primary/50"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 space-y-2">
                                <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">
                                  {prompt.title}
                                </CardTitle>
                                <Badge className={`text-xs gap-1 ${ai.color}`}>
                                  <span>{ai.icon}</span>
                                  <span>{ai.name}</span>
                                </Badge>
                              </div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 h-8 w-8 hover:bg-transparent"
                                    onClick={() => prompt.id && toggleFavorite(prompt.id)}
                                  >
                                    <Star
                                      className={`h-5 w-5 transition-all ${
                                        prompt.isFavorite 
                                          ? 'fill-yellow-500 text-yellow-500 scale-110' 
                                          : 'text-muted-foreground group-hover:text-yellow-500/50'
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
                            <div className="flex flex-wrap gap-1.5">
                              {prompt.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  +{prompt.tags.length - 3}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
                              <span className="flex items-center gap-1">
                                <Copy className="h-3 w-3" />
                                {prompt.usageCount || 0}x
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {prompt.category}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {hasVariables ? (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleCustomize(prompt)}
                                      className="gap-1.5 w-full"
                                    >
                                      <Wand2 className="h-3.5 w-3.5" />
                                      <span className="text-xs">Personalizar</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Personalizar e copiar</TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      variant={copiedId === prompt.id ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleCopy(prompt)}
                                      className="gap-1.5 w-full"
                                    >
                                      {copiedId === prompt.id ? (
                                        <>
                                          <Check className="h-3.5 w-3.5" />
                                          <span className="text-xs">Copiado!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3.5 w-3.5" />
                                          <span className="text-xs">Copiar</span>
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copiar prompt</TooltipContent>
                                </Tooltip>
                              )}
                              
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleView(prompt)}
                                    className="gap-1.5 w-full"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="text-xs">Ver</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Visualizar completo</TooltipContent>
                              </Tooltip>
                            </div>

                            {ai.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRecommendedAI(aiKey)}
                                className="gap-2 text-xs w-full"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Abrir {ai.name}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
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
                            : searchTerm 
                            ? `Nenhum resultado para "${searchTerm}". Tente outros termos.`
                            : 'Tente ajustar os filtros de busca'
                          }
                        </p>
                        {searchTerm && (
                          <Button onClick={clearSearch} variant="outline" className="gap-2">
                            <X className="h-4 w-4" />
                            Limpar busca
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>

        {/* Modal de Visualização */}
        <Dialog open={!!viewingPrompt} onOpenChange={() => setViewingPrompt(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl pr-8">{viewingPrompt?.title}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {viewingPrompt?.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {viewingPrompt && (() => {
                    const aiKey = getAIKey(viewingPrompt.recommendedAI);
                    const ai = AI_RECOMMENDATIONS[aiKey] || AI_RECOMMENDATIONS.any;
                    return (
                      <Badge className={`text-xs gap-1 ${ai.color}`}>
                        <span>{ai.icon}</span>
                        <span>{ai.name}</span>
                      </Badge>
                    );
                  })()}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <div className="space-y-4">
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {viewingPrompt?.content}
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Badge variant="secondary">
                    {viewingPrompt?.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    {viewingPrompt?.usageCount || 0}x copiado
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {viewingPrompt && extractVariables(viewingPrompt.content).length > 0 ? (
                <Button
                  variant="default"
                  className="flex-1 gap-2"
                  onClick={() => {
                    handleCustomize(viewingPrompt);
                    setViewingPrompt(null);
                  }}
                >
                  <Wand2 className="h-4 w-4" />
                  Personalizar Prompt
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="flex-1 gap-2"
                  onClick={() => viewingPrompt && handleCopy(viewingPrompt)}
                >
                  <Copy className="h-4 w-4" />
                  Copiar Prompt
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setViewingPrompt(null)}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Personalização */}
        <Dialog open={!!customizingPrompt} onOpenChange={() => setCustomizingPrompt(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl pr-8">Personalizar Prompt</DialogTitle>
              <DialogDescription>
                <div className="space-y-2">
                  <p>Preencha os campos abaixo para personalizar seu prompt</p>
                  {customizingPrompt && (() => {
                    const aiKey = getAIKey(customizingPrompt.recommendedAI);
                    const ai = AI_RECOMMENDATIONS[aiKey] || AI_RECOMMENDATIONS.any;
                    return (
                      <Badge className={`text-xs gap-1 ${ai.color}`}>
                        <span>{ai.icon}</span>
                        <span>Recomendado: {ai.name}</span>
                      </Badge>
                    );
                  })()}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
              {customizingPrompt && extractVariables(customizingPrompt.content).map((variable) => (
                <div key={variable.key} className="space-y-2">
                  <Label htmlFor={variable.key} className="text-sm font-medium">
                    {variable.label}
                  </Label>
                  {variable.type === 'textarea' ? (
                    <Textarea
                      id={variable.key}
                      value={variableValues[variable.key] || ''}
                      onChange={(e) => setVariableValues(prev => ({ ...prev, [variable.key]: e.target.value }))}
                      placeholder={variable.placeholder}
                      rows={3}
                      className="resize-none"
                    />
                  ) : (
                    <Input
                      id={variable.key}
                      value={variableValues[variable.key] || ''}
                      onChange={(e) => setVariableValues(prev => ({ ...prev, [variable.key]: e.target.value }))}
                      placeholder={variable.placeholder}
                    />
                  )}
                </div>
              ))}

              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm font-medium">Preview do Prompt</Label>
                <div className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                  {customizingPrompt && replaceVariables(customizingPrompt.content, variableValues)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={handleCopyCustomized}
              >
                <Copy className="h-4 w-4" />
                Copiar Prompt Personalizado
              </Button>
              {customizingPrompt && (() => {
                const aiKey = getAIKey(customizingPrompt.recommendedAI);
                const ai = AI_RECOMMENDATIONS[aiKey];
                return ai?.url ? (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      handleCopyCustomized();
                      openRecommendedAI(aiKey);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Copiar e Abrir IA
                  </Button>
                ) : null;
              })()}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
