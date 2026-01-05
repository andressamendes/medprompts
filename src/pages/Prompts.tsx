import { useState, useEffect } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Star, Trash2, Edit, Copy, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Interface para Prompt personalizado
 */
interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
}

/**
 * Página Prompts - CRUD de prompts personalizados
 * Permite:  Criar, editar, excluir, favoritar, copiar prompts
 * Integrada com AuthenticatedNavbar
 */
export default function Prompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category:  'geral',
    tags: '',
  });

  const categories = ['all', 'anatomia', 'fisiologia', 'farmacologia', 'clinica', 'cirurgia', 'pediatria', 'geral'];

  // 🎭 MOCK:  Carrega prompts simulados
  useEffect(() => {
    const mockPrompts:  Prompt[] = [
      {
        id: '1',
        title: 'Resumo de Anatomia Cardiovascular',
        content: 'Explique de forma detalhada o sistema cardiovascular humano, incluindo estrutura do coração, circulação sanguínea e principais vasos.',
        category: 'anatomia',
        tags: ['cardiovascular', 'coração', 'vasos'],
        isFavorite: true,
        usageCount: 15,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title:  'Farmacologia - Anti-hipertensivos',
        content:  'Liste os principais grupos de medicamentos anti-hipertensivos, seus mecanismos de ação, indicações e contraindicações.',
        category: 'farmacologia',
        tags: ['hipertensão', 'medicamentos'],
        isFavorite: false,
        usageCount: 8,
        createdAt:  new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Diagnóstico diferencial - Dor torácica',
        content: 'Faça um diagnóstico diferencial completo de dor torácica em paciente de 55 anos, considerando principais causas e exames complementares.',
        category: 'clinica',
        tags: ['diagnóstico', 'emergência', 'dor torácica'],
        isFavorite: true,
        usageCount: 23,
        createdAt: new Date().toISOString(),
      },
    ];
    setPrompts(mockPrompts);
    setFilteredPrompts(mockPrompts);
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

  // Abrir modal para criar
  const handleCreate = () => {
    setEditingPrompt(null);
    setFormData({ title: '', content: '', category:  'geral', tags: '' });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags. join(', '),
    });
    setIsModalOpen(true);
  };

  // Salvar prompt (criar ou editar)
  const handleSave = () => {
    const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);

    if (editingPrompt) {
      // Editar existente
      setPrompts(prompts.map(p =>
        p.id === editingPrompt.id
          ? { ...p, ... formData, tags }
          :  p
      ));
    } else {
      // Criar novo
      const newPrompt:  Prompt = {
        id: Date.now().toString(),
        ...formData,
        tags,
        isFavorite: false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };
      setPrompts([newPrompt, ...prompts]);
    }

    setIsModalOpen(false);
  };

  // Excluir prompt
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prompt?')) {
      setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  // Favoritar/desfavoritar
  const toggleFavorite = (id: string) => {
    setPrompts(prompts.map(p =>
      p.id === id ?  { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // Copiar prompt para clipboard
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Prompt copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar Autenticada */}
      <AuthenticatedNavbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
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
                        onClick={() => toggleFavorite(prompt.id)}
                        className="shrink-0"
                      >
                        <Star
                          className={`h-4 w-4 ${prompt.isFavorite ?  'fill-yellow-500 text-yellow-500' :  ''}`}
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
                      <span>Usado {prompt.usageCount}x</span>
                      <Badge variant="outline">{prompt.category}</Badge>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(prompt.content)}
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
                        onClick={() => handleDelete(prompt.id)}
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
        </div>
      </main>

      {/* Modal de Criar/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ?  'Editar Prompt' : 'Novo Prompt'}
            </DialogTitle>
            <DialogDescription>
              {editingPrompt ? 'Atualize as informações do prompt' : 'Crie um novo prompt personalizado'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e. target.value })}
                placeholder="Ex: Resumo de Anatomia Cardiovascular"
              />
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Prompt</Label>
              <Textarea
                id="content"
                value={formData.content}
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingPrompt ? 'Salvar' : 'Criar'}
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