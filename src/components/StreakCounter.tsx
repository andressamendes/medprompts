import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { loadProgress } from '@/lib/gamification';
import { Flame } from 'lucide-react';

export function StreakCounter() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const progress = loadProgress();
    setStreak(progress.streak);

    const handleUpdate = () => {
      const updatedProgress = loadProgress();
      setStreak(updatedProgress.streak);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('progressUpdated', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('progressUpdated', handleUpdate as EventListener);
    };
  }, []);

  if (streak === 0) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Flame className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm font-medium">Inicie seu Streak!</p>
            <p className="text-xs text-muted-foreground">
              Use um prompt hoje para começar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
      <CardContent className="pt-6">
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              {streak}
            </span>
          </div>
          
          <div>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {streak} {streak === 1 ? 'Dia' : 'Dias'} de Streak!
            </p>
            <p className="text-xs text-muted-foreground">
              Continue usando todos os dias
            </p>
          </div>

          {streak >= 7 && (
            <div className="pt-2">
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                🏆 Incrível! Continue assim!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
