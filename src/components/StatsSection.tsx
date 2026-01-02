import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';
import { XPChart } from '@/components/XPChart';
import { StreakHeatmap } from '@/components/StreakHeatmap';
import { CategoryStats } from '@/components/CategoryStats';
import { MetricsCards } from '@/components/MetricsCards';
import { loadProgress } from '@/lib/gamification';
import { loadUserBadges } from '@/lib/badges';
import { loadPomodoroState } from '@/lib/pomodoro';

export function StatsSection() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const progress = loadProgress();
  const badges = loadUserBadges();
  const pomodoro = loadPomodoroState();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Dashboard de Estatísticas
          </CardTitle>
          
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === '7d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              7 dias
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === '30d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Tudo
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Cards de Métricas */}
        <MetricsCards />

        {/* Tabs de Visualizações */}
        <Tabs defaultValue="xp" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="xp">
              <TrendingUp className="w-4 h-4 mr-2" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="streak">
              <Calendar className="w-4 h-4 mr-2" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Award className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="mt-6">
            <XPChart timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="streak" className="mt-6">
            <StreakHeatmap />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryStats />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
