import { useState, useMemo } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { PromptDialog } from '@/components/PromptDialog';
import { prompts } from '@/data/prompts-data';
import { Prompt, PromptCategory, StudyLevel } from '@/types/prompt';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

function App() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<StudyLevel | 'all'>('all');
  const [selectedAI, setSelectedAI] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || prompt.academicLevel === selectedLevel;
      const matchesAI = selectedAI === 'all' || prompt.recommendedAI?.primary === selectedAI;
      const matchesSearch =
        searchQuery === '' ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesLevel && matchesAI && matchesSearch;
    });
  }, [selectedCategory, selectedLevel, selectedAI, searchQuery]);

  // Obter lista única de IAs disponíveis
  const availableAIs = useMemo(() => {
    const aiSet = new Set<string>();
    prompts.forEach((prompt) => {
      if (prompt.recommendedAI?.primary) {
        aiSet.add(prompt.recommendedAI.primary);
      }
    });
    return Array.from(aiSet).sort();
  }, []);

  // Contar prompts por IA
  const aiCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach((prompt) => {
      if (prompt.recommendedAI?.primary) {
        const ai = prompt.recommendedAI.primary;
        counts[ai] = (counts[ai] || 0) + 1;
      }
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header simples */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">MedPrompts</h1>
          <p className="text-muted-foreground mt-2">Biblioteca de prompts para estudantes de medicina</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Barra de busca e filtros */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Buscar prompts..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-4">
            {/* Filtro de Categoria */}
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as PromptCategory | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="estudos">Estudos</SelectItem>
                <SelectItem value="clinica">Clínica</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Nível Acadêmico */}
            <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as StudyLevel | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="1º-2º ano">1º-2º ano</SelectItem>
                <SelectItem value="3º-4º ano">3º-4º ano</SelectItem>
                <SelectItem value="5º-6º ano">5º-6º ano</SelectItem>
                <SelectItem value="Residência">Residência</SelectItem>
                <SelectItem value="Todos os níveis">Todos os níveis</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de IA Recomendada - CORRIGIDO */}
            <Select value={selectedAI} onValueChange={setSelectedAI}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="IA Recomendada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as IAs</SelectItem>
                {availableAIs.map((ai) => (
                  <SelectItem key={ai} value={ai}>
                    {ai} ({aiCounts[ai]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chips de filtros ativos */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('all')}>
                {selectedCategory} ✕
              </Badge>
            )}
            {selectedLevel !== 'all' && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedLevel('all')}>
                {selectedLevel} ✕
              </Badge>
            )}
            {selectedAI !== 'all' && (
              <Badge variant="default" className="cursor-pointer flex items-center gap-1" onClick={() => setSelectedAI('all')}>
                <Sparkles className="w-3 h-3" />
                {selectedAI} ✕
              </Badge>
            )}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt encontrado' : 'prompts encontrados'}
        </div>

        {/* Grid de prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onClick={() => setSelectedPrompt(prompt)}
            />
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum prompt encontrado com os filtros selecionados.</p>
          </div>
        )}
      </main>

      {/* Dialog de visualização do prompt */}
      <PromptDialog
        prompt={selectedPrompt}
        open={!!selectedPrompt}
        onOpenChange={(open) => !open && setSelectedPrompt(null)}
      />
    </div>
  );
}

export default App;
