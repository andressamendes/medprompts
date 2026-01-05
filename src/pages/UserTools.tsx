import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { XPBar } from '@/components/XPBar';
import { HistorySection } from '@/components/HistorySection';
import { StreakCounter } from '@/components/StreakCounter';
import { ProfileCard } from '@/components/ProfileCard';
import { BadgesDisplay } from '@/components/BadgesDisplay';
import { DailyMissionsCard } from '@/components/DailyMissionsCard';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { StudyScheduleGenerator } from '@/components/StudyScheduleGenerator';
import { RecentPromptsSection } from '@/components/RecentPromptsSection';
import { ExportImportModal } from '@/components/ExportImportModal';
import { ClinicalCasesSection } from '@/components/ClinicalCasesSection';
import { MnemonicsSection } from '@/components/MnemonicsSection';
import { WeeklyChallengeCard } from '@/components/WeeklyChallengeCard';
import { StatsSection } from '@/components/StatsSection';
import { InstallPWA } from '@/components/InstallPWA';
import { TutorialButton } from '@/components/TutorialButton';
import { Button } from '@/components/ui/button';
import { Headphones } from 'lucide-react';
import { useLogger } from '@/utils/logger';

/**
 * Página de Ferramentas do Usuário (rota /minhas-ferramentas)
 * Contém TODAS as ferramentas de gamificação, estudo e produtividade
 * Exibida APENAS para usuários autenticados
 */
export default function UserTools() {
  const logger = useLogger();
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportModalOpen = () => {
    logger.info('Modal de export/backup aberto');
    setShowExportModal(true);
  };

  const handleExportModalClose = () => {
    logger.info('Modal de export/backup fechado');
    setShowExportModal(false);
  };

  const handleFocusZone = () => {
    logger.info('Botão Focus Zone clicado');
    navigate('/focus-zone');
  };

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
          <section aria-labelledby="tools-heading">
            <div className="space-y-2">
              <h1 id="tools-heading" className="text-4xl font-bold tracking-tight">
                Minhas Ferramentas
              </h1>
              <p className="text-lg text-muted-foreground">
                Gerencie seu estudo, acompanhe seu progresso e alcance seus objetivos
              </p>
            </div>
          </section>

          {/* Perfil do Estudante */}
          <section aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="sr-only">Perfil do Estudante</h2>
            <ProfileCard />
          </section>

          {/* Gamificação Section */}
          <section aria-labelledby="gamification-heading">
            <h2 id="gamification-heading" className="text-2xl font-bold mb-4">Sistema de Gamificação</h2>
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
            <h2 id="timer-heading" className="text-2xl font-bold mb-4">Timer Pomodoro</h2>
            <PomodoroTimer />
          </section>

          {/* Dashboard de Estatísticas */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-2xl font-bold mb-4">Estatísticas de Estudo</h2>
            <StatsSection />
          </section>

          {/* Missões e Badges */}
          <section aria-labelledby="missions-heading">
            <h2 id="missions-heading" className="text-2xl font-bold mb-4">Missões e Conquistas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DailyMissionsCard />
              <BadgesDisplay />
            </div>
          </section>

          {/* Cronograma Inteligente */}
          <section aria-labelledby="schedule-heading">
            <h2 id="schedule-heading" className="text-2xl font-bold mb-4">Gerador de Cronograma Inteligente</h2>
            <StudyScheduleGenerator />
          </section>

          {/* Prompts Recentes */}
          <section aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="text-2xl font-bold mb-4">Prompts Visualizados Recentemente</h2>
            <RecentPromptsSection />
          </section>

          {/* Casos Clínicos */}
          <section aria-labelledby="cases-heading">
            <h2 id="cases-heading" className="text-2xl font-bold mb-4">Casos Clínicos</h2>
            <ClinicalCasesSection />
          </section>

          {/* Mnemônicos */}
          <section aria-labelledby="mnemonics-heading">
            <h2 id="mnemonics-heading" className="text-2xl font-bold mb-4">Mnemônicos Médicos</h2>
            <MnemonicsSection />
          </section>

          {/* Histórico */}
          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="text-2xl font-bold mb-4">Histórico de Estudos</h2>
            <HistorySection />
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

      {/* Botão Flutuante Focus Zone */}
      <Button
        onClick={handleFocusZone}
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        aria-label="Ativar modo de concentração"
      >
        <Headphones className="w-6 h-6" />
      </Button>

      {/* Botão Flutuante Backup */}
      <Button
        onClick={handleExportModalOpen}
        size="lg"
        variant="outline"
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 sm:hidden"
        aria-label="Fazer backup dos dados"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </Button>

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
