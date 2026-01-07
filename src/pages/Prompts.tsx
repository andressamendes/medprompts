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
 * Página Prompts - Biblioteca Pública de Prompts Médicos v2.3
 * 
 * Novidades v2.3:
 * - Preview mostra objetivo do prompt
 * - Design alinhado com página inicial
 * - Hero section com gradiente
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
    color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  },
  claude: {
    name: 'Claude',
    icon: '🧠',
    url: 'https://claude.ai/',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  },
  gemini: {
    name: 'Gemini',
    icon: '✨',
    url: 'https://gemini.google.com/',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔍',
    url: 'https://www.perplexity.ai/',
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
  },
  notebooklm: {
    name: 'NotebookLM',
    icon: '📔',
    url: 'https://notebooklm.google/',
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  },
  any: {
    name: 'Qualquer IA',
    icon: '🌐',
    url: '',
    color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
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

// Função para extrair objetivo do prompt
const extractObjective = (content: string): string => {
  // Procura por padrões de objetivo
  const patterns = [
    /\*\*OBJETIVO[:\s]*\(RESUMO INICIAL[^)]*\)\*\*\s*([^\n*]+)/i,
    /\*\*OBJETIVO[:\s]*([^\n*]+)/i,
    /OBJETIVO[:\s]*([^\n]+)/i,
    /^([^*\n]{20,150})/m, // Primeira linha com pelo menos 20 caracteres
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback: primeiras 100 caracteres
  return content.substring(0, 100).trim() + '...';
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

  // Limpar formatação Markdown do prompt
  const cleanMarkdown = useCallback((content: string): string => {
    let cleaned = content;
    
    // Remove ** (negrito)
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    // Remove ## (títulos)
    cleaned = cleaned.replace(/^##\s+/gm, '');
    
    // Remove *** (separadores)
    cleaned = cleaned.replace(/^\*\*\*\s*$/gm, '');
    
    // Remove * no início de linhas (listas)
    cleaned = cleaned.replace(/^\*\s+/gm, '• ');
    
    // Remove múltiplas quebras de linha (max 2)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Remove espaços extras no início e fim
    cleaned = cleaned.trim();
    
    return cleaned;
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
      // Limpa o conteúdo antes de copiar
      const contentToCopy = cleanMarkdown(customContent || prompt.content);
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
        description
: 'Prompt copiado para área de transferência (sem formatação)',
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
  }, [loadUsageCounts, saveUsageCounts, loadPrompts, cleanMarkdown]);

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
      toast({
        title: `Abrindo ${ai.name}`,
        description: 'Nova aba aberta com a IA recomendada',
      });
    }
  }, []);

  // Limpar busca
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <AuthenticatedNavbar />
        
        {/* Hero Section - Design igual à página inicial */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-400/[0.05]" />
          <div className="container relative mx-auto px-4 py-16 sm:py-24">
            <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
              {/* Botão Voltar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tools')}
                className="self-start gap-2 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Ferramentas
              </Button>

              {/* Ícone */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <BookOpen className="h-16 w-16 text-primary" />
                </div>
              </div>

              {/* Título */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
                  Biblioteca de Prompts
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                  {filteredPrompts.length} prompts especializados para estudantes de medicina
                  {searchTerm && ` • Buscando: "${searchTerm}"`}
                </p>
              </div>

              {/* Badge informativo */}
              <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Cada prompt é otimizado para uma IA específica • Copie limpo e pronto para usar
                </p>
              </div>

              {/* Tabs */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                  <TabsTrigger value="all" className="gap-2 py-3">
                    <Sparkles className="h-4 w-4" />
                    <span>Todos</span>
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-2 py-3">
                    <Star className="h-4 w-4" />
                    <span>Favoritos</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 sm:py-16 max-w-7xl">
          <div className="space-y-8">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar por título, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-11"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categories.filter((c) => c !== 'all').map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Ordem A-Z</SelectItem>
                  <SelectItem value="usage">Mais usados</SelectItem>
                  <SelectItem value="favorites">Favoritos primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando prompts...</p>
              </div>
            ) : (
              <>
                {/* Grid de Prompts */}
                {filteredPrompts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrompts.map((prompt) => {
                      const aiKey = getAIKey(prompt.recommendedAI);
                      const ai = AI_RECOMMENDATIONS[aiKey] || AI_RECOMMENDATIONS.any;
                      const hasVariables = extractVariables(prompt.content).length > 0;
                      const objective = extractObjective(prompt.content);

                      return (
                        <Card 
                          key={prompt.id} 
                          className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50"
                        >
                          {/* Gradiente de fundo sutil */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <CardHeader className="relative pb-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex-1 space-y-2">
                                <CardTitle className="text-lg sm:text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                  {prompt.title}
                                </CardTitle>
                                <Badge className={`text-xs gap-1 border ${ai.color}`}>
                                  <span>{ai.icon}</span>
                                  <span>{ai.name}</span>
                                </Badge>
                              </div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 h-9 w-9 hover:bg-transparent"
                                    onClick={() => prompt.id && toggleFavorite(prompt.id)}
                                  >
                                    <Star
                                      className={`h-5 w-5 transition-all ${
                                        prompt.isFavorite 
                                          ? 'fill-yellow-500 text-yellow-500 scale-110' 
                                          : 'text-muted-foreground group-hover:text-yellow-500/70'
                                      }`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {prompt.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            {/* Objetivo do prompt */}
                            <CardDescription className="text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                              {objective}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="relative flex-1 flex flex-col gap-4 pt-0">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {prompt.tags.slice(0, 4).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs px-2.5 py-0.5">
                                  {tag}
                                </Badge>
                              ))}
                              {prompt.tags.length > 4 && (
                                <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
                                  +{prompt.tags.length - 4}
                                </Badge>
                              )}
                            </div>

                            {/* Estatísticas */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
                              <span className="flex items-center gap-1.5">
                                <Copy className="h-3.5 w-3.5" />
                                {prompt.usageCount || 0}x usado
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {prompt.category}
                              </Badge>
                            </div>

                            {/* Ações */}
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
                                      <Wand2 className="h-4 w-4" />
                                      <span className="text-xs">Personalizar</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Personalizar variáveis e copiar</TooltipContent>
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
                                          <Check className="h-4 w-4" />
                                          <span className="text-xs">Copiado!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-4 w-4" />
                                          <span className="text-xs">Copiar</span>
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copiar prompt limpo</TooltipContent>
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
                                    <Eye className="h-4 w-4" />
                                    <span className="text-xs">Ver completo</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Visualizar prompt completo</TooltipContent>
                              </Tooltip>
                            </div>

                            {/* Botão Abrir IA */}
                            {ai.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRecommendedAI(aiKey)}
                                className="gap-2 text-xs w-full border border-dashed hover:border-solid hover:bg-primary/5"
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
                  <Card className="border-2 border-dashed bg-gradient-to-br from-muted/50 to-background">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                        <div className="relative rounded-full bg-muted p-6">
                          <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="text-center space-y-3">
                        <p className="text-xl font-semibold">Nenhum prompt encontrado</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {selectedTab === 'favorites' 
                            ? 'Você ainda não tem prompts favoritos. Explore a biblioteca e clique na estrela para adicionar!' 
                            : searchTerm 
                            ? `Não encontramos resultados para "${searchTerm}". Tente outros termos de busca.`
                            : 'Tente ajustar os filtros de busca ou categoria.'
                          }
                        </p>
                        {searchTerm && (
                          <Button onClick={clearSearch} variant="outline" className="gap-2 mt-4">
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
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl pr-8">{viewingPrompt?.title}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-3">
                  {viewingPrompt?.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {viewingPrompt && (() => {
                    const aiKey = getAIKey(viewingPrompt.recommendedAI);
                    const ai = AI_RECOMMENDATIONS[aiKey] || AI_RECOMMENDATIONS.any;
                    return (
                      <Badge className={`text-xs gap-1 border ${ai.color}`}>
                        <span>{ai.icon}</span>
                        <span>Recomendado: {ai.name}</span>
                      </Badge>
                    );
                  })()}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
              {/* Objetivo destacado */}
              {viewingPrompt && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-2">🎯 OBJETIVO</p>
                  <p className="text-sm leading-relaxed">
                    {extractObjective(viewingPrompt.content)}
                  </p>
                </div>
              )}

              {/* Prompt completo limpo */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  PROMPT COMPLETO (formatação removida)
                </p>
                <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90 max-h-[400px] overflow-y-auto">
                  {viewingPrompt && cleanMarkdown(viewingPrompt.content)}
                </div>
              </div>
              
              {/* Metadados */}
              <div className="flex items-center gap-4 pt-2 border-t">
                <Badge variant="outline">
                  {viewingPrompt?.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Copiado {viewingPrompt?.usageCount || 0}x
                </span>
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
                  Copiar Prompt Limpo
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
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl pr-8">Personalizar Prompt</DialogTitle>
              <DialogDescription>
                <div className="space-y-2 mt-2">
                  <p>Preencha os campos abaixo para personalizar seu prompt</p>
                  {customizingPrompt && (() => {
                    const aiKey = getAIKey(customizingPrompt.recommendedAI);
                    const ai = AI_RECOMMENDATIONS[aiKey] || AI_RECOMMENDATIONS.any;
                    return (
                      <Badge className={`text-xs gap-1 border ${ai.color}`}>
                        <span>{ai.icon}</span>
                        <span>Recomendado: {ai.name}</span>
                      </Badge>
                    );
                  })()}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-5">
              {customizingPrompt && extractVariables(customizingPrompt.content).map((variable) => (
                <div key={variable.key} className="space-y-2">
                  <Label htmlFor={variable.key} className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
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

              {/* Preview do resultado */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  Preview do Resultado (formatação limpa)
                </Label>
                <div className="p-4 rounded-lg bg-muted/50 border text-sm whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto">
                  {customizingPrompt && cleanMarkdown(replaceVariables(customizingPrompt.content, variableValues))}
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
                    Copiar e Abrir
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

