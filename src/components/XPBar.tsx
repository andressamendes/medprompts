import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { loadProgress, type UserProgress } from '@/lib/gamification';

export function XPBar() {
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

  const xpForNextLevel = progress.level * 100;
  const xpProgress = (progress.xp / xpForNextLevel) * 100;

  return (
    <Card data-tutorial="xp-bar">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Nível {progress.level}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">XP</span>
            <span className="font-medium">
              {progress.xp} / {xpForNextLevel}
            </span>
          </div>
          <Progress value={xpProgress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            Faltam {xpForNextLevel - progress.xp} XP para o próximo nível!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
