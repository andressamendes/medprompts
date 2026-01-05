import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, BookOpen, ChevronRight } from 'lucide-react';
import { loadProfile, type StudentProfile } from '@/lib/profile';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileCard() {
  const [profile, setProfile] = useState<StudentProfile>(loadProfile());
  const navigate = useNavigate();

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfile(loadProfile());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  if (!profile.isConfigured) {
    return (
      <Card data-tutorial="profile" className="border-2 border-indigo-200">
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="mb-4">Configure seu perfil para personalizar sua experiência!</p>
            <Button onClick={() => navigate('/profile')} variant="default">
              Configurar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-tutorial="profile" className="border-2 border-indigo-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Perfil
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1 text-xs"
          >
            Ver Perfil
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-2xl font-bold">{profile.name}</p>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <GraduationCap className="w-4 h-4" />
          <span className="text-sm">
            {profile.currentYear}º ano - Formatura {profile.graduationYear}
          </span>
        </div>

        {profile.ongoingDisciplines.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Disciplinas Atuais</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.ongoingDisciplines.slice(0, 3).map((discipline) => (
                <span
                  key={discipline}
                  className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                >
                  {discipline}
                </span>
              ))}
              {profile.ongoingDisciplines.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                  +{profile.ongoingDisciplines.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {profile.areaOfInterest.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Áreas de Interesse</p>
            <p className="text-sm">{profile.areaOfInterest.join(', ')}</p>
          </div>
        )}

        <Button 
          onClick={() => navigate('/profile')}
          variant="outline" 
          className="w-full mt-4"
        >
          Editar Perfil Completo
        </Button>
      </CardContent>
    </Card>
  );
}
