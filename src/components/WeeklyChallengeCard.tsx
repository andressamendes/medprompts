import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { 
  loadWeeklyChallengeState, 
  getTimeRemaining,
  type WeeklyChallenge 
} from '@/lib/weekly-challenge';

export function WeeklyChallengeCard() {
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    updateChallenge();

    const handleUpdate = () => {
      updateChallenge();
    };

    window.addEventListener('weeklyChallengeUpdated', handleUpdate);

    return () => {
      window.removeEventListener('weeklyChallengeUpdated', handleUpdate);
    };
  }, []);

  // Atualizar tempo restante a cada minuto
  useEffect(() => {
    if (challenge) {
      setTimeRemaining(getTimeRemaining(challenge.endDate));
      
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(challenge.endDate));
      }, 60000); // 1 minuto

      return () => clearInterval(interval);
    }
  }, [challenge]);

  const updateChallenge = () => {
    const state = loadWeeklyChallengeState();
    setChallenge(state.currentChallenge);
  };

  if (!challenge) return null;

  const totalProgress = challenge.tasks.reduce((acc, task) => {
    return acc + (task.current / task.target) * (task.xpReward / challenge.totalXP) * 100;
  }, 0);

  const allTasksComplete = challenge.tasks.every(t => t.current >= t.target);

  return (
    <Card className={allTasksComplete ? 'border-yellow-300 bg-yellow-50/50' : 'border-purple-300'}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Desafio Semanal
          </span>
          <Badge variant={allTasksComplete ? "default" : "secondary"}>
            Semana #{challenge.weekNumber}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações do Desafio */}
        <div>
          <h3 className="font-semibold text-lg">{challenge.title}</h3>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>

        {/* Tempo Restante */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{timeRemaining}</span>
        </div>

        {/* Progresso Geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progresso Total</span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {/* Tarefas */}
        <div className="space-y-3">
          {challenge.tasks.map((task) => {
            const progress = (task.current / task.target) * 100;
            const isComplete = task.current >= task.target;

            return (
              <div
                key={task.id}
                className={`p-3 rounded-lg border transition-all ${
                  isComplete 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <Badge variant="outline" className="text-xs shrink-0">
                      +{task.xpReward} XP
                    </Badge>
                  )}
                </div>

                {!isComplete && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{task.current}/{task.target}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recompensa */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{challenge.badgeReward.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Recompensa Total</p>
              <p className="text-xs text-muted-foreground">
                {challenge.badgeReward.name} + {challenge.totalXP} XP
              </p>
            </div>
          </div>
        </div>

        {allTasksComplete && (
          <div className="text-center py-2">
            <p className="text-sm font-medium text-green-700">
              🎉 Desafio Completo! Recompensas concedidas!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
