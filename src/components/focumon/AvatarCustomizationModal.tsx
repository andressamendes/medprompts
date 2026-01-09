import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AvatarCustomization, AvatarType, ClassYear, AVATAR_CATALOG, CLASS_YEARS, DEFAULT_AVATAR } from '@/types/avatar.types';
import { User, GraduationCap, Sparkles } from 'lucide-react';

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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                🏥 Bem-vindo ao MedFocus
              </DialogTitle>
              <DialogDescription className="text-base mt-1 font-medium">
                Personalize seu avatar e entre na enfermaria virtual
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Seleção de Turma */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-primary/20">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <Label className="text-xl font-bold text-slate-700 dark:text-slate-200">
                Selecione sua Turma
              </Label>
            </div>
            <RadioGroup
              value={customization.classYear}
              onValueChange={(value: string) => setCustomization({ ...customization, classYear: value as ClassYear })}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
            >
              {(Object.entries(CLASS_YEARS) as [ClassYear, typeof CLASS_YEARS[ClassYear]][]).map(([key, info]) => (
                <div
                  key={key}
                  className={`relative flex items-center space-x-2 border-3 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    customization.classYear === key 
                      ? 'bg-white dark:bg-slate-800 shadow-xl ring-2 ring-offset-2' 
                      : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                  style={{
                  borderColor: customization.classYear === key ? info.color : 'transparent'
                  }}
                  onClick={() => setCustomization({ ...customization, classYear: key as ClassYear })}
                >
                  <RadioGroupItem value={key} id={`class-${key}`} className="sr-only" />
                  <Label
                    htmlFor={`class-${key}`}
                    className="flex flex-col items-center gap-2 cursor-pointer flex-1"
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: info.color }}
                    >
                      {key.replace('T', '')}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-lg">{key}</span>
                      <span className="text-xs text-muted-foreground">{info.name}</span>
                    </div>
                  </Label>
                  {customization.classYear === key && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Seleção de Avatar */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b-2 border-primary/20">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <User className="h-5 w-5 text-white" />
              </div>
              <Label className="text-xl font-bold text-slate-700 dark:text-slate-200">
                Escolha seu Avatar
              </Label>
            </div>
            <RadioGroup
              value={customization.avatarType}
              onValueChange={(value: string) => setCustomization({ ...customization, avatarType: value as AvatarType })}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {(Object.values(AVATAR_CATALOG) as typeof AVATAR_CATALOG[AvatarType][]).map((avatar) => (
                <div
                  key={avatar.type}
                  className={`relative flex flex-col space-y-3 border-3 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    customization.avatarType === avatar.type 
                      ? 'bg-white dark:bg-slate-800 border-primary shadow-xl ring-2 ring-primary ring-offset-2' 
                      : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg'
                  }`}
                  onClick={() => setCustomization({ ...customization, avatarType: avatar.type as AvatarType })}
                >
                  <RadioGroupItem value={avatar.type} id={`avatar-${avatar.type}`} className="sr-only" />
                  <Label
                    htmlFor={`avatar-${avatar.type}`}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-6xl transform hover:scale-110 transition-transform">
                        {avatar.emoji}
                      </div>
                      <div className="text-center space-y-1">
                        <div className="font-bold text-base">{avatar.name}</div>
                        <div className="text-xs text-muted-foreground leading-tight">
                          {avatar.description}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {Object.values(avatar.colors).map((color, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </Label>
                  {customization.avatarType === avatar.type && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Preview Premium */}
          <div className="relative border-3 border-primary/30 rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center space-y-4">
                <div className="text-9xl transform hover:scale-110 transition-transform animate-bounce-slow">
                  {selectedAvatar.emoji}
                </div>
                <div
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg"
                  style={{ backgroundColor: selectedClass.color }}
                >
                  <GraduationCap className="h-5 w-5" />
                  {customization.classYear}
                </div>
              </div>
              
              <div className="flex-1 space-y-4 max-w-md">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    {selectedAvatar.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedAvatar.description}
                  </p>
                </div>
                
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">Identificação:</span>
                    <div
                      className="px-3 py-1.5 rounded-lg text-white font-mono text-sm font-bold shadow-md"
                      style={{ backgroundColor: selectedClass.color }}
                    >
                      {customization.classYear} #000
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID único gerado automaticamente ao entrar
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="font-semibold text-sm mb-2">Paleta de Cores</div>
                  <div className="flex gap-2">
                    {Object.entries(selectedAvatar.colors).map(([name, color]) => (
                      <div key={name} className="flex flex-col items-center gap-1">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs capitalize text-muted-foreground">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-6 border-t-2 border-primary/20">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-12 text-base font-semibold"
            size="lg"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg gap-2"
            size="lg"
          >
            <GraduationCap className="h-5 w-5" />
            Entrar na Enfermaria
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
