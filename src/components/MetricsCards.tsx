import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, Zap, Trophy, Clock, BookOpen } from 'lucide-react';
import { loadProgress } from '@/lib/gamification';
import { loadUserBadges } from '@/lib/badges';
import { loadPomodoroState } from '@/lib/pomodoro';

export function MetricsCards() {
  const progress = loadProgress();
  const badges = loadUserBadges();
  const pomodoro = loadPomodoroState();

  // Calcular sessões completas do histórico
  const completedSessions = pomodoro.history?.filter(
    (session) => session.completed
  ).length || 0;

  const metrics = [
    {
      icon: TrendingUp,
      label: 'XP Total',
      value: progress.xp.toLocaleString(),
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Target,
      label: 'Nível',
      value: progress.level,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      icon: Zap,
      label: 'Streak',
      value: `${progress.streak} dias`,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: Trophy,
      label: 'Badges',
      value: badges.earned.length,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      icon: Clock,
      label: 'Pomodoros',
      value: completedSessions,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      icon: BookOpen,
      label: 'Prompts',
      value: progress.totalPromptsUsed,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className={`w-10 h-10 rounded-lg ${metric.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
