import { useState, useEffect } from 'react';
// import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { prompts } from '@/data/prompts-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Star, Trash2, Edit, Copy, Filter, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import promptsService, { PromptData } from '@/services/api/prompts';

/**
 * Página Prompts - CRUD de prompts personalizados
 * Integrada com API real do backend
 */
export default function Prompts() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'geral',
    tags: '',
  });

  const categories = ['all', 'anatomia', 'fisiologia', 'farmacologia', 'clinica', 'cirurgia', 'pediatria', 'geral'];

  // 🔗 Carregar prompts da API ao montar o componente
  useEffect(() => {
    loadPrompts();
  }, []);

  // Filtrar prompts
  useEffect(() => {
    let filtered = prompts;

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered. filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPrompts(filtered);
  }, [prompts, selectedCategory, searchTerm]);

  // 🔗 Carregar prompts da API
  // 🔗 Carregar prompts dos dados estáticos (sem autenticação necessária)
const loadPrompts = async () => {
    setIsLoading(true);
    try {
      // Usar dados estáticos importados ao invés de API
      const data = prompts.map((p, index) => ({
        ...p,
        id: p.id || `prompt-${index}`,
        usageCount: 0,
        isFavorite: false
      }));
      setPrompts(data as any);
      setFilteredPrompts(data as any);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar prompts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  // Abrir modal para criar
  const handleCreate = () => {
    setEditingPrompt(null);
    setFormData({ title: '', content: '', category:  'geral', tags: '' });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (prompt: PromptData) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags. join(', '),
    });
    setIsModalOpen(true);
  };

  // 🔗 Salvar prompt (criar ou editar) via API
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
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const promptData:  PromptData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags,
      };

      if (editingPrompt && editingPrompt.id) {
        // Editar existente
        await promptsService. update(editingPrompt.id, promptData);
        toast({
          title: 'Prompt atualizado',
          description: 'Suas alterações foram salvas',
        });
      } else {
        // Criar novo
        await promptsService.create(promptData);
        toast({
          title:  'Prompt criado',
          description: 'Seu novo prompt foi salvo',
        });
      }

      setIsModalOpen(false);
      loadPrompts(); // Recarregar lista
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 🔗 Excluir prompt via API
  const handleDelete = async (id: string) => {
    if (! confirm('Tem certeza que deseja excluir este prompt?')) return;

    try {
      await promptsService. delete(id);
      toast({
        title: 'Prompt excluído',
        description:  'O prompt foi removido',
      });
      loadPrompts(); // Recarregar lista
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // 🔗 Favoritar/desfavoritar via API
  const toggleFavorite = async (id:  string) => {
    try {
      await promptsService.toggleFavorite(id);
      loadPrompts(); // Recarregar lista
    } catch (error: any) {
      toast({
        title: 'Erro ao favoritar',
        description:  error.message,
        variant: 'destructive',
      });
    }
  };

  // 🔗 Copiar prompt e incrementar contador de uso
  const handleCopy = async (prompt: PromptData) => {
    try {
      await navigator.clipboard.writeText(prompt. content);
      
      // Incrementar contador de uso na API
      if (prompt.id) {
        await promptsService.incrementUsage(prompt.id);
      }
      
      toast({
        title: 'Copiado!',
        description:  'Prompt copiado para área de transferência',
      });
      
      loadPrompts(); // Recarregar para atualizar contador
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o prompt',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar Autenticada */}
      {/* <AuthenticatedNavbar /> - Removido para acesso público */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Meus Prompts</h1>
              <p className="text-muted-foreground">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' :  'prompts'}
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Prompt
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories. filter(c => c !== 'all').map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading ?  (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Grid de Prompts */}
              {filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrompts.map((prompt) => (
                    <Card key={prompt.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => prompt.id && toggleFavorite(prompt.id)}
                            className="shrink-0"
                          >
                            <Star
                              className={`h-4 w-4 ${prompt.isFavorite ? 'fill-yellow-500 text-yellow-500' :  ''}`}
                            />
                          </Button>
                        </div>
                        <CardDescription className="line-clamp-3">
                          {prompt.content}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {prompt.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Estatísticas */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Usado {prompt.usageCount || 0}x</span>
                          <Badge variant="outline">{prompt.category}</Badge>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(prompt)}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(prompt)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => prompt.id && handleDelete(prompt. id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Nenhum prompt encontrado
                    </p>
                    <Button onClick={handleCreate}>
                      <Plus className="h-4 w-4 mr-2" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? 'Editar Prompt' : 'Novo Prompt'}
            </DialogTitle>
            <DialogDescription>
              {editingPrompt ? 'Atualize as informações do prompt' : 'Crie um novo prompt personalizado'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e. target.value })}
                placeholder="Ex: Resumo de Anatomia Cardiovascular"
              />
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Prompt *</Label>
              <Textarea
                id="content"
                value={formData. content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Descreva o prompt que você deseja usar com a IA..."
                rows={6}
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'all').map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Ex: cardiovascular, coração, anatomia"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando... 
                </>
              ) : (
                editingPrompt ? 'Salvar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
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
  );
}
