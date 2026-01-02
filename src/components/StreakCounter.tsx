import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { loadProgress, type UserProgress } from '@/lib/gamification';

export function StreakCounter() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress());

  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(loadProgress());
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Card data-tutorial="streak">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Sequência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500">
            {progress.streak}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {progress.streak === 1 ? 'dia consecutivo' : 'dias consecutivos'}
          </p>
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-900">
              🔥 Continue assim! Mantenha o streak ativo estudando todos os dias.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
