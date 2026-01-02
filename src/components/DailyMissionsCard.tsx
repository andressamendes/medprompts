import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar } from 'lucide-react';
import { loadDailyMissions, type DailyMissionsState } from '@/lib/daily-missions';

export function DailyMissionsCard() {
  const [missionsState, setMissionsState] = useState<DailyMissionsState>(
    loadDailyMissions()
  );

  useEffect(() => {
    const handleMissionsUpdate = () => {
      setMissionsState(loadDailyMissions());
    };

    window.addEventListener('missionsUpdated', handleMissionsUpdate);
    const interval = setInterval(handleMissionsUpdate, 5000);

    return () => {
      window.removeEventListener('missionsUpdated', handleMissionsUpdate);
      clearInterval(interval);
    };
  }, []);

  const completionRate = missionsState.missions.length > 0
    ? (missionsState.completedCount / missionsState.missions.length) * 100
    : 0;

  const allCompleted = missionsState.missions.every((m) => m.completed);

  return (
    <Card data-tutorial="daily-missions" className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Missões Diárias
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Hoje</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {missionsState.completedCount} / {missionsState.missions.length} completas
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        <div className="space-y-3">
          {missionsState.missions.map((mission) => (
            <div
              key={mission.id}
              className={`p-4 rounded-lg border transition-all ${
                mission.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{mission.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{mission.title}</h4>
                    <span className="text-xs font-medium text-green-600">
                      +{mission.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {mission.description}
                  </p>
                  <div className="space-y-1">
                    <Progress
                      value={(mission.progress / mission.requirement.value) * 100}
                      className="h-1.5"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {mission.progress} / {mission.requirement.value}
                      </span>
                      {mission.completed && (
                        <span className="text-green-600 font-medium">✓ Completa</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {allCompleted && (
          <div className="p-4 bg-green-100 border-2 border-green-300 rounded-lg text-center">
            <p className="font-semibold text-green-900">
              🎉 Todas as Missões Completas!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Volte amanhã para novas missões e mais XP!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
