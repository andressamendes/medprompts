import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle2, Settings } from 'lucide-react';
import { loadProfile, type StudentProfile } from '@/lib/profile';
import { ProfileSetup } from './ProfileSetup';

export function ProfileCard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const userProfile = loadProfile();
    setProfile(userProfile);

    // Se não configurou, mostrar setup na primeira vez
    if (!userProfile.isConfigured) {
      setShowSetup(true);
    }

    const handleUpdate = () => {
      const updatedProfile = loadProfile();
      setProfile(updatedProfile);
    };

    window.addEventListener('profileUpdated', handleUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleUpdate);
    };
  }, []);

  const handleProfileComplete = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    setShowSetup(false);
  };

  if (!profile?.isConfigured) {
    return (
      <>
        <Card className="border-dashed border-2 border-primary/50">
          <CardContent className="pt-6 text-center space-y-3">
            <UserCircle2 className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">Configure seu perfil</p>
              <p className="text-sm text-muted-foreground">
                Personalize sua experiência
              </p>
            </div>
            <Button onClick={() => setShowSetup(true)}>
              Começar
            </Button>
          </CardContent>
        </Card>

        <ProfileSetup
          open={showSetup}
          onComplete={handleProfileComplete}
          initialProfile={profile || undefined}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle2 className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">{profile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.currentYear}º ano • Medicina
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.ongoingDisciplines.slice(0, 3).map(discipline => (
                    <Badge key={discipline} variant="secondary" className="text-xs">
                      {discipline}
                    </Badge>
                  ))}
                  {profile.ongoingDisciplines.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{profile.ongoingDisciplines.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSetup(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileSetup
        open={showSetup}
        onComplete={handleProfileComplete}
        initialProfile={profile || undefined}
      />
    </>
  );
}
