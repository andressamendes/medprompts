import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Calendar } from 'lucide-react';
import { loadWeeklyChallengeState, type WeeklyChallengeState } from '@/lib/weekly-challenge';

export function WeeklyChallengeCard() {
  const [challengeState, setChallengeState] = useState<WeeklyChallengeState>(
    loadWeeklyChallengeState()
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setChallengeState(loadWeeklyChallengeState());
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!challengeState.currentChallenge) {
    return null;
  }

  const challenge = challengeState.currentChallenge;
  const totalTasks = challenge.tasks.length;
  const progressPercentage = 0;

  return (
    <Card data-tutorial="weekly-challenge" className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-500" />
            Desafio Semanal
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Desafio ativo</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">{challenge.title}</h3>
            <span className="text-sm font-medium text-purple-600">
              +50 XP
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {challenge.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              0 / {totalTasks} tarefas
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {challenge.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-300" />
              <span className="text-sm font-medium">{task.description}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-900">
            💡 <strong>Dica:</strong> Complete todas as tarefas para ganhar XP extra!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
