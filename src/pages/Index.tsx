import { useState, useMemo, useEffect } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { XPBar } from '@/components/XPBar';
import { HistorySection } from '@/components/HistorySection';
import { StreakCounter } from '@/components/StreakCounter';
import { ProfileCard } from '@/components/ProfileCard';
import { BadgesDisplay } from '@/components/BadgesDisplay';
import { DailyMissionsCard } from '@/components/DailyMissionsCard';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { ExportImportModal } from '@/components/ExportImportModal';
import { ClinicalCasesSection } from '@/components/ClinicalCasesSection';
import { MnemonicsSection } from '@/components/MnemonicsSection';
import { WeeklyChallengeCard } from '@/components/WeeklyChallengeCard';
import { StatsSection } from '@/components/StatsSection';
import { InstallPWA } from '@/components/InstallPWA';
import { TutorialButton } from '@/components/TutorialButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { prompts } from '@/data/prompts-data';
import { BookOpen, Sparkles, Download } from 'lucide-react';
import { useLogger } from '@/utils/logger';

export default function Index() {
  const logger = useLogger();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Log quando a página é montada
  useEffect(() => {
    logger.info('Página Index montada', {
      totalPrompts: prompts.length,
      userAgent: navigator.userAgent,
    });

    return () => {
      logger.debug('Página Index desmontada');
    };
  }, [logger]);

  // Log quando categoria muda
  useEffect(() => {
    if (selectedCategory !== 'all') {
      logger.debug('Categoria alterada', {
        category: selectedCategory,
        timestamp: new Date().toISOString(),
      });
    }
  }, [selectedCategory, logger]);

  // Log quando busca é realizada
  useEffect(() => {
    if (searchQuery) {
      logger.debug('Busca realizada', {
        query: searchQuery,
        queryLength: searchQuery.length,
      });
    }
  }, [searchQuery, logger]);

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

    // Log resultado da filtragem
    if (searchQuery || selectedCategory !== 'all') {
      logger.debug('Prompts filtrados', {
        totalPrompts: prompts.length,
        filteredCount: filtered.length,
        category: selectedCategory,
        hasSearchQuery: !!searchQuery,
      });
    }

    return filtered;
  }, [selectedCategory, searchQuery, logger]);

  const handleExportModalOpen = () => {
    logger.info('Modal de export/backup aberto');
    setShowExportModal(true);
  };

  const handleExportModalClose = () => {
    logger.info('Modal de export/backup fechado');
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header 
        id="navigation"
        role="banner"
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">MedPrompts</h1>
                <p className="text-sm text-muted-foreground">
                  Prompts de IA para Estudantes de Medicina
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Botão de alternância de tema */}
              <ThemeToggle />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportModalOpen}
                className="hidden sm:flex"
                aria-label="Fazer backup dos dados"
              >
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Backup
              </Button>
              
              <div className="flex items-center gap-2" role="status" aria-label="Status do sistema">
                <Sparkles className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                <span className="text-sm font-medium hidden md:inline">Sistema de Gamificação Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        id="main-content"
        role="main"
        className="container mx-auto px-4 py-8"
        tabIndex={-1}
      >
        <div className="space-y-8">
          {/* Perfil do Estudante */}
          <section aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="sr-only">Perfil do Estudante</h2>
            <ProfileCard />
          </section>

          {/* Gamificação Section */}
          <section aria-labelledby="gamification-heading">
            <h2 id="gamification-heading" className="sr-only">Sistema de Gamificação</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <XPBar />
              </div>
              <div>
                <StreakCounter />
              </div>
            </div>
          </section>

          {/* Desafio Semanal */}
          <section aria-labelledby="challenge-heading">
            <h2 id="challenge-heading" className="sr-only">Desafio Semanal</h2>
            <WeeklyChallengeCard />
          </section>

          {/* Timer Pomodoro */}
          <section aria-labelledby="timer-heading">
            <h2 id="timer-heading" className="sr-only">Timer Pomodoro</h2>
            <PomodoroTimer />
          </section>

          {/* Dashboard de Estatísticas */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Estatísticas de Estudo</h2>
            <StatsSection />
          </section>

          {/* Missões e Badges */}
          <section aria-labelledby="missions-heading">
            <h2 id="missions-heading" className="sr-only">Missões e Conquistas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DailyMissionsCard />
              <BadgesDisplay />
            </div>
          </section>

          {/* Casos Clínicos */}
          <section aria-labelledby="cases-heading">
            <h2 id="cases-heading" className="sr-only">Casos Clínicos</h2>
            <ClinicalCasesSection />
          </section>

          {/* Mnemônicos */}
          <section aria-labelledby="mnemonics-heading">
            <h2 id="mnemonics-heading" className="sr-only">Mnemônicos Médicos</h2>
            <MnemonicsSection />
          </section>

          {/* Histórico */}
          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="sr-only">Histórico de Estudos</h2>
            <HistorySection />
          </section>

          {/* Biblioteca de Prompts */}
          <section 
            aria-labelledby="prompts-heading" 
            className="space-y-6" 
            data-tutorial="prompts"
          >
            <div>
              <h2 id="prompts-heading" className="text-3xl font-bold tracking-tight mb-2">
                Biblioteca de Prompts
              </h2>
              <p className="text-muted-foreground" role="status">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt disponível' : 'prompts disponíveis'}
              </p>
            </div>

            {/* Filtros */}
            <div id="search" className="flex flex-col sm:flex-row gap-4" role="search">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Grid de Cards */}
            {filteredPrompts.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
                aria-label="Lista de prompts disponíveis"
              >
                {filteredPrompts.map((prompt) => (
                  <div key={prompt.id} role="listitem">
                    <PromptCard prompt={prompt} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" role="status">
                <p className="text-muted-foreground">
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

      {/* Modal de Export/Import */}
      <ExportImportModal
        open={showExportModal}
        onOpenChange={handleExportModalClose}
      />

      {/* PWA Install Prompt */}
      <InstallPWA />

      {/* Tutorial Interativo */}
      <TutorialButton />
    </div>
  );
}
