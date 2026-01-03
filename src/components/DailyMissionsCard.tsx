import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface Mission {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  points: number;
}

export function DailyMissionsCard() {
  const [loadTime] = useState(Date.now());
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: '1',
      title: 'Revisar 5 prompts de anatomia',
      description: 'Consolidar conhecimento básico',
      completed: false,
      points: 10,
    },
    {
      id: '2',
      title: 'Completar 1 caso clínico',
      description: 'Praticar raciocínio diagnóstico',
      completed: false,
      points: 20,
    },
    {
      id: '3',
      title: 'Estudar por 25 minutos (Pomodoro)',
      description: 'Manter foco e disciplina',
      completed: false,
      points: 15,
    },
  ]);

  // Log inicial quando missões são carregadas
  useEffect(() => {
    const completedCount = missions.filter(m => m.completed).length;
    const totalPoints = missions.reduce((sum, m) => sum + m.points, 0);
    const earnedPoints = missions.filter(m => m.completed).reduce((sum, m) => sum + m.points, 0);

    logger.info('Missões diárias carregadas', {
      component: 'DailyMissionsCard',
      action: 'missions_loaded',
      missionsMetrics: {
        totalMissions: missions.length,
        completedMissions: completedCount,
        pendingMissions: missions.length - completedCount,
        completionRate: (completedCount / missions.length) * 100,
        totalPoints,
        earnedPoints,
        remainingPoints: totalPoints - earnedPoints,
      },
      loadTimestamp: new Date().toISOString(),
    });
  }, []); // Executa apenas uma vez ao montar

  const completedCount = missions.filter(m => m.completed).length;
  const progress = (completedCount / missions.length) * 100;
  const totalPoints = missions.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0);

  const toggleMission = (id: string) => {
    const actionTime = Date.now() - loadTime;
    const mission = missions.find(m => m.id === id);
    
    if (!mission) {
      logger.warn('Tentativa de toggle em missão não encontrada', {
        component: 'DailyMissionsCard',
        action: 'toggle_mission_not_found',
        missionId: id,
        availableMissions: missions.map(m => m.id),
      });
      return;
    }

    const newCompleted = !mission.completed;

    setMissions(missions.map(m =>
      m.id === id ? { ...m, completed: newCompleted } : m
    ));

    // Log da ação de completar/descompletar missão
    logger.info(newCompleted ? 'Missão completada' : 'Missão desmarcada', {
      component: 'DailyMissionsCard',
      action: newCompleted ? 'mission_completed' : 'mission_uncompleted',
      missionId: id,
      missionTitle: mission.title,
      missionPoints: mission.points,
      timeToComplete: actionTime,
      missionsProgress: {
        completedBefore: completedCount,
        completedAfter: newCompleted ? completedCount + 1 : completedCount - 1,
        totalMissions: missions.length,
        progressPercentage: newCompleted 
          ? ((completedCount + 1) / missions.length) * 100
          : ((completedCount - 1) / missions.length) * 100,
      },
      pointsEarned: newCompleted ? mission.points : -mission.points,
      totalPointsNow: newCompleted ? totalPoints + mission.points : totalPoints - mission.points,
      userEngagement: {
        actionTimestamp: new Date().toISOString(),
        sessionDuration: actionTime,
      },
    });

    // Verificar se TODAS as missões foram completadas (conquista especial!)
    const newCompletedCount = newCompleted ? completedCount + 1 : completedCount - 1;
    if (newCompleted && newCompletedCount === missions.length) {
      const allPoints = missions.reduce((sum, m) => sum + m.points, 0);
      
      logger.info('🎉 TODAS AS MISSÕES COMPLETADAS!', {
        component: 'DailyMissionsCard',
        action: 'all_missions_completed',
        achievement: 'daily_missions_100%',
        totalMissions: missions.length,
        totalPoints: allPoints,
        timeToComplete: actionTime,
        completionTimestamp: new Date().toISOString(),
        userMetrics: {
          streak: 1, // Pode ser integrado com sistema de streak no futuro
          efficiency: (actionTime / 1000 / 60).toFixed(2) + ' minutos',
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Missões Diárias</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="font-semibold">{totalPoints} pontos</span>
          </div>
        </div>
        <CardDescription>
          Complete suas missões para ganhar pontos e badges!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {completedCount}/{missions.length} concluídas
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Lista de Missões */}
        <div className="space-y-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={mission.id}
                checked={mission.completed}
                onCheckedChange={() => toggleMission(mission.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={mission.id}
                  className={`text-sm font-medium leading-none cursor-pointer ${
                    mission.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {mission.title}
                </label>
                <p className="text-xs text-muted-foreground">
                  {mission.description}
                </p>
              </div>
              <span className="text-xs font-semibold text-primary">
                +{mission.points}
              </span>
            </div>
          ))}
        </div>

        {/* Mensagem de Conclusão */}
        {completedCount === missions.length && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Parabéns! Você completou todas as missões de hoje! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
