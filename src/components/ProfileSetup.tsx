import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  StudentProfile,
  GRADUATION_YEARS,
  MEDICAL_DISCIPLINES,
  AREAS_OF_INTEREST,
  updateProfile,
} from '@/lib/profile';
import { UserCircle2, GraduationCap, BookOpen, Stethoscope } from 'lucide-react';

interface ProfileSetupProps {
  open: boolean;
  onComplete: (profile: StudentProfile) => void;
  initialProfile?: StudentProfile;
}

export function ProfileSetup({ open, onComplete, initialProfile }: ProfileSetupProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    currentYear: initialProfile?.currentYear || 1,
    ongoingDisciplines: initialProfile?.ongoingDisciplines || [],
    areaOfInterest: initialProfile?.areaOfInterest || [],
  });

  const handleSubmit = () => {
    if (formData.name.trim().length === 0) {
      toast({
        title: '❌ Campo obrigatório',
        description: 'Por favor, preencha seu nome',
      });
      return;
    }

    if (formData.ongoingDisciplines.length === 0) {
      toast({
        title: '❌ Selecione ao menos uma disciplina',
        description: 'Isso nos ajuda a personalizar sua experiência',
      });
      return;
    }

    const profile = updateProfile({
      name: formData.name,
      currentYear: formData.currentYear,
      graduationYear: new Date().getFullYear() + (7 - formData.currentYear),
      ongoingDisciplines: formData.ongoingDisciplines,
      areaOfInterest: formData.areaOfInterest,
      isConfigured: true,
    });

    toast({
      title: '🎉 Perfil configurado!',
      description: `Bem-vindo(a), ${formData.name}!`,
    });

    onComplete(profile);
  };

  const toggleDiscipline = (discipline: string) => {
    setFormData(prev => ({
      ...prev,
      ongoingDisciplines: prev.ongoingDisciplines.includes(discipline)
        ? prev.ongoingDisciplines.filter(d => d !== discipline)
        : [...prev.ongoingDisciplines, discipline],
    }));
  };

  const toggleArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areaOfInterest: prev.areaOfInterest.includes(area)
        ? prev.areaOfInterest.filter(a => a !== area)
        : [...prev.areaOfInterest, area],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <UserCircle2 className="w-6 h-6" />
            Configure seu Perfil
          </DialogTitle>
          <DialogDescription>
            Personalize sua experiência no MedPrompts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Como você gostaria de ser chamado(a)?</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">
                  <GraduationCap className="w-4 h-4 inline mr-2" />
                  Ano da Graduação
                </Label>
                <NativeSelect
                  id="year"
                  value={formData.currentYear}
                  onChange={e => setFormData(prev => ({ ...prev, currentYear: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 }))}
                >
                  {GRADUATION_YEARS.map(year => (
                    <option key={year} value={year}>
                      {year}º ano
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                Próximo
              </Button>
            </div>
          )}

          {/* Step 2: Disciplinas */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Disciplinas em Andamento
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione as disciplinas que você está cursando
                </p>
                
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                  {MEDICAL_DISCIPLINES.map(discipline => (
                    <div key={discipline} className="flex items-center space-x-2">
                      <Checkbox
                        id={discipline}
                        checked={formData.ongoingDisciplines.includes(discipline)}
                        onCheckedChange={() => toggleDiscipline(discipline)}
                      />
                      <label
                        htmlFor={discipline}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {discipline}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Áreas de Interesse */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base">
                  <Stethoscope className="w-4 h-4 inline mr-2" />
                  Áreas de Interesse (Opcional)
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione especialidades que te interessam
                </p>
                
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                  {AREAS_OF_INTEREST.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={formData.areaOfInterest.includes(area)}
                        onCheckedChange={() => toggleArea(area)}
                      />
                      <label
                        htmlFor={area}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Concluir
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
