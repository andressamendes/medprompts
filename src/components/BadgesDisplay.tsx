import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { 
  loadUserBadges, 
  BADGES, 
  getTierColor,
  type UserBadges,
  type Badge 
} from '@/lib/badges';

export function BadgesDisplay() {
  const [userBadges, setUserBadges] = useState<UserBadges>(loadUserBadges());

  useEffect(() => {
    const handleBadgesUpdate = () => {
      setUserBadges(loadUserBadges());
    };

    window.addEventListener('badgesUpdated', handleBadgesUpdate);
    return () => {
      window.removeEventListener('badgesUpdated', handleBadgesUpdate);
    };
  }, []);

  const earnedBadges = BADGES.filter((badge) => 
    userBadges.earned.includes(badge.id)
  );
  
  const availableBadges = BADGES.filter((badge) => 
    !userBadges.earned.includes(badge.id)
  );

  return (
    <Card className="border-2 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Badges ({earnedBadges.length}/{BADGES.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {earnedBadges.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">Nenhum badge conquistado ainda</p>
            <p className="text-sm">Continue estudando para desbloquear badges!</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Conquistados
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <BadgeItem key={badge.id} badge={badge} earned={true} />
                ))}
              </div>
            </div>
          </>
        )}

        {availableBadges.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              Disponíveis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableBadges.slice(0, 6).map((badge) => (
                <BadgeItem key={badge.id} badge={badge} earned={false} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BadgeItem({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <div
      className={`p-3 rounded-lg border text-center transition-all ${
        earned
          ? getTierColor(badge.tier)
          : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
      }`}
    >
      <div className="text-3xl mb-2">{earned ? badge.icon : '🔒'}</div>
      <p className="text-xs font-semibold mb-1 leading-tight">
        {badge.name}
      </p>
      <p className="text-xs opacity-75 leading-tight">
        {badge.description}
      </p>
    </div>
  );
}
