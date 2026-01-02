import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock } from 'lucide-react';
import { getUserBadgeProgress, getTierColor, type Badge } from '@/lib/badges';
import { loadProgress } from '@/lib/gamification';

export function BadgesDisplay() {
  const [badgeProgress, setBadgeProgress] = useState<Array<{ badge: Badge; earned: boolean; progress: number }>>([]);

  useEffect(() => {
    updateBadges();

    const handleUpdate = () => {
      updateBadges();
    };

    window.addEventListener('progressUpdated', handleUpdate);
    window.addEventListener('badgesUpdated', handleUpdate);

    return () => {
      window.removeEventListener('progressUpdated', handleUpdate);
      window.removeEventListener('badgesUpdated', handleUpdate);
    };
  }, []);

  const updateBadges = () => {
    const userProgress = loadProgress();
    const progress = getUserBadgeProgress(userProgress);
    setBadgeProgress(progress);
  };

  const earnedCount = badgeProgress.filter(b => b.earned).length;
  const totalCount = badgeProgress.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Conquistas
          </span>
          <BadgeUI variant="secondary">
            {earnedCount}/{totalCount}
          </BadgeUI>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {badgeProgress.map(({ badge, earned, progress }) => (
            <div
              key={badge.id}
              className={`relative p-3 rounded-lg border-2 transition-all ${
                earned
                  ? getTierColor(badge.tier) + ' shadow-sm'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">{earned ? badge.icon : <Lock className="w-8 h-8 mx-auto text-gray-400" />}</div>
                <div>
                  <p className="font-semibold text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {!earned && progress > 0 && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-1" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(progress)}%
                    </p>
                  </div>
                )}

                {earned && (
                  <BadgeUI variant="secondary" className="text-xs">
                    +{badge.xpReward} XP
                  </BadgeUI>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
