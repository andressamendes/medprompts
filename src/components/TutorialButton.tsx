import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, X, Play } from 'lucide-react';
import { startTutorial, hasTutorialCompleted } from '@/lib/tutorial';

export function TutorialButton() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(true);

  useEffect(() => {
    const completed = hasTutorialCompleted();
    setTutorialCompleted(completed);
    
    // Mostrar welcome card apenas para novos usuários
    if (!completed) {
      setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
    }
  }, []);

  const handleStartTutorial = () => {
    setShowWelcome(false);
    startTutorial();
    setTutorialCompleted(true);
  };

  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <>
      {/* Botão flutuante para refazer tutorial */}
      {tutorialCompleted && (
        <button
          onClick={handleStartTutorial}
          className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          title="Refazer tutorial"
        >
          <GraduationCap className="w-6 h-6" />
        </button>
      )}

      {/* Card de boas-vindas para novos usuários */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <Card className="max-w-md w-full shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Bem-vindo! 👋</h2>
                    <p className="text-sm text-muted-foreground">
                      Primeira vez aqui?
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissWelcome}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm mb-6 text-muted-foreground">
                Vamos fazer um tour rápido de <strong>2 minutos</strong> para você conhecer todas as funcionalidades da plataforma e começar a estudar com tudo!
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={handleStartTutorial}
                  className="flex-1"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Tour
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismissWelcome}
                  size="lg"
                >
                  Pular
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                💡 Você pode refazer o tour a qualquer momento
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
