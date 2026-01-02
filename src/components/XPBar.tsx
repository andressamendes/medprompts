import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp } from 'lucide-react';
import {
  loadProgress,
  calculateLevel,
  calculateLevelProgress,
  getXPToNextLevel,
  type UserProgress,
} from '@/lib/gamification';

export function XPBar() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const userProgress = loadProgress();
    setProgress(userProgress);

    // Atualizar quando houver mudanças no localStorage
    const handleStorageChange = () => {
      const updatedProgress = loadProgress();
      setProgress(updatedProgress);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event para mudanças locais
    window.addEventListener('progressUpdated', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('progressUpdated', handleStorageChange as EventListener);
    };
  }, []);

  if (!progress) return null;

  const level = calculateLevel(progress.xp);
  const levelProgress = calculateLevelProgress(progress.xp);
  const xpToNext = getXPToNextLevel(progress.xp);

  return (
    <div className="w-full bg-card border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">
              Nível {level.level} - {level.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {progress.xp} XP
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{progress.totalPromptsUsed}</span>
          </div>
          
          {progress.streak > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xl">🔥</span>
              <span className="font-medium">{progress.streak} dias</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={levelProgress} className="h-2" />
        
        {xpToNext > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {levelProgress}% completo
            </span>
            <span>Faltam {xpToNext} XP para próximo nível</span>
          </div>
        )}
        
        {xpToNext === 0 && (
          <p className="text-xs text-center text-yellow-600 font-medium">
            🎉 Nível Máximo Alcançado!
          </p>
        )}
      </div>
    </div>
  );
}
