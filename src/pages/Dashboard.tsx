import { useState, useEffect } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { XPBar } from '@/components/XPBar';
import { StreakCounter } from '@/components/StreakCounter';
import { BadgesDisplay } from '@/components/BadgesDisplay';
import { DailyMissionsCard } from '@/components/DailyMissionsCard';
import { WeeklyChallengeCard } from '@/components/WeeklyChallengeCard';
import { StatsSection } from '@/components/StatsSection';
import { ProfileCard } from '@/components/ProfileCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import gamificationService, { GamificationData } from '@/services/api/gamification';
import studySessionsService, { StudyStats } from '@/services/api/studySessions';

/**
 * Página Dashboard - Visão geral do progresso do usuário
 * Integrada com API real de gamificação
 */
export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔗 Carregar dados da API ao montar o componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // 🔗 Carregar dados de gamificação e estatísticas
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Carregar dados em paralelo
      const [gamification, stats] = await Promise.all([
        gamificationService.getAll(),
        studySessionsService.getStats(),
      ]);
      
      setGamificationData(gamification);
      setStudyStats(stats);
    } catch (error: any) {
      // ✅ Usar dados mock quando API não estiver disponível
      console.warn('API não disponível, usando dados mock:', error.message);
      
      // Dados mock para evitar tela em branco
      setGamificationData({
        xp: { currentXP: 0, level: 1, xpToNextLevel: 100, totalXP: 0 },
        streak: { currentStreak: 0, longestStreak: 0, lastActivity: new Date().toISOString() },
        badges: [],
        weeklyChallenge: null,
        dailyMissions: []
      } as any);
      
      setStudyStats({
        totalSessions: 0,
        totalMinutes: 0,
        totalXP: 0,
        averageDuration: 0,
        sessionsThisWeek: 0,
        minutesThisWeek: 0
      } as any);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar tempo em horas e minutos
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar Autenticada */}
      <AuthenticatedNavbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e conquistas
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Perfil do Estudante */}
              <section>
                <ProfileCard />
              </section>

              {/* Gamificação - XP e Streak */}
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <XPBar />
                  </div>
                  <div>
                    <StreakCounter />
                  </div>
                </div>
              </section>

              {/* Estatísticas de Estudo */}
              {studyStats && (
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total de Sessões
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{studyStats.totalSessions}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sessões registradas
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Tempo Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {formatTime(studyStats.totalMinutes)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tempo estudado
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          XP Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{studyStats.totalXP}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Experiência ganha
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Média por Sessão
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {formatTime(studyStats.averageDuration)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Duração média
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              )}

              {/* Gráfico de Progresso */}
              <section>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle>Progresso de XP</CardTitle>
                      </div>
                      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                        <TabsList>
                          <TabsTrigger value="7d">7 dias</TabsTrigger>
                          <TabsTrigger value="30d">30 dias</TabsTrigger>
                          <TabsTrigger value="all">Tudo</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <p>Gráfico de XP - Implementação com dados reais em breve</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Estatísticas Gerais */}
              <section>
                <StatsSection />
              </section>

              {/* Desafio Semanal */}
              <section>
                <WeeklyChallengeCard />
              </section>

              {/* Missões e Badges */}
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DailyMissionsCard />
                  <BadgesDisplay />
                </div>
              </section>

              {/* Seção de Atividades Recentes */}
              <section>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle>Atividades Recentes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {gamificationData?.badges.filter(b => b.isUnlocked).slice(0, 3).map((badge) => (
                        <div key={badge.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                          <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Conquista desbloqueada</p>
                            <p className="text-xs text-muted-foreground">{badge.name} - {badge.description}</p>
                            {badge.unlockedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(badge.unlockedAt).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      {gamificationData?.xp && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                          <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Nível {gamificationData.xp.level}</p>
                            <p className="text-xs text-muted-foreground">
                              {gamificationData.xp.currentXP} / {gamificationData.xp.xpToNextLevel} XP
                            </p>
                          </div>
                        </div>
                      )}

                      {studyStats && studyStats.sessionsThisWeek > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                          <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {studyStats.sessionsThisWeek} sessões esta semana
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Continue assim para manter sua sequência!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </>
          )}
        </div>
      </main>

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
