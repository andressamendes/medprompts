import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AvatarCustomization, AvatarType, ClassYear, AVATAR_CATALOG, CLASS_YEARS, DEFAULT_AVATAR } from '@/types/avatar.types';
import { User, GraduationCap } from 'lucide-react';

interface AvatarCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCustomization?: AvatarCustomization;
  onSave: (customization: AvatarCustomization) => void;
}

export const AvatarCustomizationModal = ({
  open,
  onOpenChange,
  initialCustomization = DEFAULT_AVATAR,
  onSave
}: AvatarCustomizationModalProps) => {
  const [customization, setCustomization] = useState<AvatarCustomization>(initialCustomization);

  const handleSave = () => {
    onSave(customization);
    onOpenChange(false);
  };

  const selectedAvatar = AVATAR_CATALOG[customization.avatarType];
  const selectedClass = CLASS_YEARS[customization.classYear];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            Crie seu Personagem
          </DialogTitle>
          <DialogDescription>
            Escolha sua turma e avatar para começar a estudar na enfermaria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Turma */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <Label className="text-lg font-semibold">Selecione sua Turma</Label>
            </div>
            <RadioGroup
              value={customization.classYear}
              onValueChange={(value: string) => setCustomization({ ...customization, classYear: value as ClassYear })}
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              {(Object.entries(CLASS_YEARS) as [ClassYear, typeof CLASS_YEARS[ClassYear]][]).map(([key, info]) => (
                <div
                  key={key}
                  className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-secondary/50 transition-colors"
                  style={{
                    borderColor: customization.classYear === key ? info.color : 'transparent'
                  }}
                >
                  <RadioGroupItem value={key} id={`class-${key}`} />
                  <Label
                    htmlFor={`class-${key}`}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: info.color as string }}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{key}</span>
                      <span className="text-xs text-muted-foreground">{info.name}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Seleção de Avatar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <Label className="text-lg font-semibold">Escolha seu Avatar</Label>
            </div>
            <RadioGroup
              value={customization.avatarType}
              onValueChange={(value: string) => setCustomization({ ...customization, avatarType: value as AvatarType })}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {(Object.values(AVATAR_CATALOG) as typeof AVATAR_CATALOG[AvatarType][]).map((avatar) => (
                <div
                  key={avatar.type}
                  className={`flex items-start space-x-3 border-2 rounded-lg p-4 hover:bg-secondary/50 transition-colors ${
                    customization.avatarType === avatar.type ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <RadioGroupItem value={avatar.type} id={`avatar-${avatar.type}`} className="mt-1" />
                  <Label
                    htmlFor={`avatar-${avatar.type}`}
                    className="cursor-pointer flex-1"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-4xl">{avatar.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-base">{avatar.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {avatar.description}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {Object.values(avatar.colors).map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Preview */}
          <div className="border-2 border-primary/30 rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-8xl mb-3">{selectedAvatar.emoji}</div>
                <div
                  className="inline-block px-4 py-2 rounded-full text-white font-bold text-sm mb-2"
                  style={{ backgroundColor: selectedClass.color }}
                >
                  {customization.classYear}
                </div>
                <h3 className="font-bold text-lg">{selectedAvatar.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedClass.name}</p>
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Descrição:</span>
                  <span className="text-muted-foreground">{selectedAvatar.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Identificação:</span>
                  <span
                    className="px-2 py-1 rounded text-white font-mono text-xs"
                    style={{ backgroundColor: selectedClass.color }}
                  >
                    {customization.classYear} #000
                  </span>
                  <span className="text-xs text-muted-foreground">(ID gerado automaticamente)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 gap-2">
            <GraduationCap className="h-4 w-4" />
            Entrar na Enfermaria
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
