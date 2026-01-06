import { useState, useEffect } from 'react';
// import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { prompts as staticPrompts } from '@/data/prompts-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Search, Star, Trash2, Edit, Copy, Filter, Loader2, Lock, ArrowUpDown, Check, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import promptsService, { PromptData } from '@/services/api/prompts';

/**
 * Página Prompts - Biblioteca de Prompts Médicos
 * Design moderno com melhorias de usabilidade e responsividade
 */
export default function Prompts() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'favorites'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'geral',
    tags: '',
  });

  const categories = ['all', 'anatomia', 'fisiologia', 'farmacologia', 'clinica', 'cirurgia', 'pediatria', 'estudos', 'geral'];

  // Carregar prompts ao montar
  useEffect(() => {
    loadPrompts();
  }, []);

  // Filtrar e ordenar prompts
  useEffect(() => {
    let filtered = prompts;

    // Filtro por tab
    if (selectedTab === 'favorites') {
      filtered = filtered.filter((p) => p.isFavorite);
    } else if (selectedTab === 'system') {
      filtered = filtered.filter((p) => p.isSystem);
    } else if (selectedTab === 'custom') {
      filtered = filtered.filter((p) => !p.isSystem);
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

  // Carregar prompts dos dados estáticos
  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const data: PromptData[] = staticPrompts.map((p, index) => ({
        id: p.id || `prompt-${index}`,
        title: p.title,
        content: p.content,
        category: p.category,
        tags: p.tags,
        usageCount: 0,
        isFavorite: false,
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
  };

  const handleCreate = () => {
    setEditingPrompt(null);
    setFormData({ title: '', content: '', category: 'geral', tags: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (prompt: PromptData) => {
    if (prompt.isSystem) {
      toast({
        title: 'Ação não permitida',
        description: 'Prompts do sistema não podem ser editados',
        variant: 'destructive',
      });
      return;
    }

    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título e conteúdo',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      const promptData: PromptData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags,
        isSystem: false,
      };

      if (editingPrompt && editingPrompt.id) {
        await promptsService.update(editingPrompt.id, promptData);
        toast({
          title: 'Prompt atualizado',
          description: 'Suas alterações foram salvas',
        });
      } else {
        await promptsService.create(promptData);
        toast({
          title: 'Prompt criado',
          description: 'Seu novo prompt foi salvo',
        });
      }

      setIsModalOpen(false);
      loadPrompts();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao salvar';
      toast({
        title: 'Erro ao salvar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, isSystem?: boolean) => {
    if (isSystem) {
      toast({
        title: 'Ação não permitida',
        description: 'Prompts do sistema não podem ser excluídos',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;

    try {
      await promptsService.delete(id);
      toast({
        title: 'Prompt excluído',
        description: 'O prompt foi removido',
      });
      loadPrompts();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao excluir';
      toast({
        title: 'Erro ao excluir',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      await promptsService.toggleFavorite(id);
      loadPrompts();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao favoritar';
      toast({
        title: 'Erro ao favoritar',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async (prompt: PromptData) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      
      if (prompt.id) {
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);
        await promptsService.incrementUsage(prompt.id);
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Biblioteca de Prompts
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt disponível' : 'prompts disponíveis'}
                  </p>
                </div>
                <Button onClick={handleCreate} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Novo Prompt</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>

              {/* Tabs de Filtro Rápido */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto">
                  <TabsTrigger value="all" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Todos</span>
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-2">
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Favoritos</span>
                  </TabsTrigger>
                  <TabsTrigger value="system" className="gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">Sistema</span>
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="gap-2">
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Meus</span>
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
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">
                                {prompt.title}
                              </CardTitle>
                              {prompt.isSystem && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="shrink-0 gap-1">
                                      <Lock className="h-3 w-3" />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Prompt do sistema</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
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
                              {prompt.usageCount || 0}x
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {prompt.category}
                            </Badge>
                          </div>

                          {/* Ações */}
                          <div className="grid grid-cols-3 gap-2">
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
                                      <span className="hidden sm:inline">Ok</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span className="hidden sm:inline">Copiar</span>
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
                                  onClick={() => handleEdit(prompt)}
                                  disabled={prompt.isSystem}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {prompt.isSystem ? 'Prompts do sistema não podem ser editados' : 'Editar prompt'}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => prompt.id && handleDelete(prompt.id, prompt.isSystem)}
                                  disabled={prompt.isSystem}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {prompt.isSystem ? 'Prompts do sistema não podem ser excluídos' : 'Excluir prompt'}
                              </TooltipContent>
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
                          Tente ajustar os filtros ou criar um novo prompt
                        </p>
                      </div>
                      <Button onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar primeiro prompt
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>

        {/* Modal de Criar/Editar */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingPrompt ? 'Editar Prompt' : 'Novo Prompt'}
              </DialogTitle>
              <DialogDescription>
                {editingPrompt ? 'Atualize as informações do seu prompt' : 'Crie um novo prompt personalizado para sua biblioteca'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Flashcards Otimizados para Anki"
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length} caracteres
                </p>
              </div>

              {/* Conteúdo */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Conteúdo do Prompt <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Descreva o prompt que você deseja usar com a IA. Seja específico sobre o papel da IA, objetivo, processo e formato de saída esperado..."
                  rows={10}
                  className="text-sm font-mono resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.length} caracteres
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter((c) => c !== 'all').map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="anki, memorização, flashcards"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe com vírgulas
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    {editingPrompt ? 'Salvar Alterações' : 'Criar Prompt'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
