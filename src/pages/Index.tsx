import { useState, useMemo, useEffect } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { PromptCard } from '@/components/PromptCard';
import { PromptDialog } from '@/components/PromptDialog';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { prompts } from '@/data/prompts-data';
import { useLogger } from '@/utils/logger';
import type { Prompt } from '@/types/prompt';

/**
 * Página da Biblioteca de Prompts (rota /prompts)
 * APENAS a biblioteca de prompts - limpa e focada
 * Exibida APENAS para usuários autenticados
 */
export default function Index() {
  const logger = useLogger();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    logger.info('Biblioteca de Prompts acessada', {
      totalPrompts: prompts.length,
    });
  }, [logger]);

  const filteredPrompts = useMemo(() => {
    const filtered = prompts.filter((prompt) => {
      const matchesCategory =
        selectedCategory === 'all' || prompt.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });

    return filtered;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar Autenticada */}
      <AuthenticatedNavbar />

      {/* Main Content */}
      <main 
        id="main-content"
        role="main"
        className="container mx-auto px-4 py-8"
        tabIndex={-1}
      >
        <div className="space-y-8">
          {/* Header */}
          <section aria-labelledby="prompts-heading">
            <div className="space-y-4">
              <div>
                <h1 id="prompts-heading" className="text-4xl font-bold tracking-tight mb-2">
                  Biblioteca de Prompts
                </h1>
                <p className="text-lg text-muted-foreground">
                  Mais de 130 prompts especializados para estudantes de medicina
                </p>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-muted-foreground" role="status">
                  {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt disponível' : 'prompts disponíveis'}
                </p>
              </div>
            </div>
          </section>

          {/* Filtros */}
          <section aria-label="Filtros de pesquisa">
            <div id="search" className="flex flex-col sm:flex-row gap-4" role="search">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </section>

          {/* Grid de Prompts */}
          <section aria-label="Lista de prompts">
            {filteredPrompts.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
                aria-label="Lista de prompts disponíveis"
              >
                {filteredPrompts.map((prompt) => (
                  <div key={prompt.id} role="listitem">
                    <PromptCard 
                      prompt={prompt}
                      onClick={() => setSelectedPrompt(prompt)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" role="status">
                <p className="text-muted-foreground text-lg">
                  Nenhum prompt encontrado com os filtros aplicados.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16" role="contentinfo">
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

      {/* Dialog do Prompt Selecionado */}
      {selectedPrompt && (
        <PromptDialog
          prompt={selectedPrompt}
          open={!!selectedPrompt}
          onOpenChange={(open) => !open && setSelectedPrompt(null)}
        />
      )}
    </div>
  );
}
