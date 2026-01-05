import { useState } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { XPBar } from '@/components/XPBar';
import { StreakCounter } from '@/components/StreakCounter';
import { BadgesDisplay } from '@/components/BadgesDisplay';
import { DailyMissionsCard } from '@/components/DailyMissionsCard';
import { WeeklyChallengeCard } from '@/components/WeeklyChallengeCard';
import { StatsSection } from '@/components/StatsSection';
import { ProfileCard } from '@/components/ProfileCard';
import { XPChart } from '@/components/XPChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Trophy, TrendingUp } from 'lucide-react';

/**
 * Página Dashboard - Visão geral do progresso do usuário
 * Contém:  XP, Stats, Conquistas, Missões, Gráficos
 * Integrada com AuthenticatedNavbar
 */
export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

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
                <XPChart timeRange={timeRange} />
              </CardContent>
            </Card>
          </section>

          {/* Estatísticas */}
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
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Conquista desbloqueada</p>
                      <p className="text-xs text-muted-foreground">Primeira Semana - 7 dias consecutivos de estudos</p>
                      <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Nível aumentado</p>
                      <p className="text-xs text-muted-foreground">Você alcançou o nível 5!</p>
                      <p className="text-xs text-muted-foreground mt-1">Ontem</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Sessão de estudo concluída</p>
                      <p className="text-xs text-muted-foreground">Farmacologia - 90 minutos (+45 XP)</p>
                      <p className="text-xs text-muted-foreground mt-1">Há 5 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
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