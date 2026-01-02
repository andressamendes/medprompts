import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target } from 'lucide-react';
import { loadDailyMissions, getMissionsCompletionRate, type DailyMission } from '@/lib/daily-missions';

export function DailyMissionsCard() {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    updateMissions();

    const handleUpdate = () => {
      updateMissions();
    };

    window.addEventListener('missionsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('missionsUpdated', handleUpdate);
    };
  }, []);

  const updateMissions = () => {
    const state = loadDailyMissions();
    setMissions(state.missions);
    setCompletionRate(getMissionsCompletionRate());
  };

  const allCompleted = missions.every(m => m.completed);

  return (
    <Card className={allCompleted ? 'border-green-300 bg-green-50/50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Missões Diárias
          </span>
          <Badge variant="secondary">
            {Math.round(completionRate)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`p-3 rounded-lg border transition-all ${
                mission.completed
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{mission.icon}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{mission.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {mission.description}
                      </p>
                    </div>
                    {mission.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                      <Badge variant="outline" className="text-xs shrink-0">
                        +{mission.xpReward} XP
                      </Badge>
                    )}
                  </div>

                  {!mission.completed && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progresso</span>
                        <span>
                          {mission.progress}/{mission.requirement.value}
                        </span>
                      </div>
                      <Progress
                        value={(mission.progress / mission.requirement.value) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {allCompleted && (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-green-700">
                🎉 Todas as missões concluídas hoje!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
