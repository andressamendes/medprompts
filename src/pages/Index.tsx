import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { prompts } from '@/data/prompts-data';
import { BookOpen, Sparkles, Download } from 'lucide-react';

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
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
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">MedPrompts</h1>
                <p className="text-sm text-muted-foreground">
                  Prompts de IA para Estudantes de Medicina
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(true)}
                className="hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Backup
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium hidden md:inline">Sistema de Gamificação Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Perfil do Estudante */}
          <ProfileCard />

          {/* Gamificação Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <XPBar />
            </div>
            <div>
              <StreakCounter />
            </div>
          </div>

          {/* Desafio Semanal */}
          <WeeklyChallengeCard />

          {/* Timer Pomodoro */}
          <PomodoroTimer />

          {/* Dashboard de Estatísticas */}
          <StatsSection />

          {/* Missões e Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DailyMissionsCard />
            <BadgesDisplay />
          </div>

          {/* Casos Clínicos */}
          <ClinicalCasesSection />

          {/* Mnemônicos */}
          <MnemonicsSection />

          {/* Histórico */}
          <HistorySection />

          {/* Biblioteca de Prompts */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Biblioteca de Prompts
              </h2>
              <p className="text-muted-foreground">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt disponível' : 'prompts disponíveis'}
              </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum prompt encontrado com os filtros aplicados.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              MedPrompts © 2026 • Desenvolvido para estudantes de medicina
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
        onOpenChange={setShowExportModal}
      />

      {/* PWA Install Prompt */}
      <InstallPWA />
    </div>
  );
}
