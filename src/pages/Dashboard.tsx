import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { PomodoroTimer } from '@/components/focumon/PomodoroTimer';
import { PixelCanvas } from '@/components/focumon/PixelCanvas';
import { TaskStack } from '@/components/focumon/TaskStack';
import { usePomodoro } from '@/hooks/usePomodoro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Timer } from 'lucide-react';

/**
 * Dashboard Focusmon - Versão simplificada focada em produtividade
 * Sistema Pomodoro + Pixel Art + Gestão de Tarefas
 */
export default function Dashboard() {
  const { mode } = usePomodoro();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar Autenticada */}
      <AuthenticatedNavbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
              <Brain className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              Focusmon
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Seu companheiro de estudos com técnica Pomodoro
            </p>
          </div>

          {/* Pixel Canvas - Personagem animado */}
          <section>
            <PixelCanvas mode={mode} />
          </section>

          {/* Timer e Tarefas - Layout Responsivo */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Pomodoro Timer */}
            <div className="w-full">
              <PomodoroTimer />
            </div>

            {/* Task Stack */}
            <div className="w-full">
              <TaskStack />
            </div>
          </section>

          {/* Informações e Dicas */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Timer className="h-5 w-5 text-green-500" />
                  Técnica Pomodoro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Trabalhe por 25 minutos, descanse por 5. A cada 4 sessões, faça uma pausa longa de 15 minutos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Foco Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Durante o foco, elimine distrações. Silencie notificações e concentre-se apenas na tarefa atual.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Descanso Ativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nas pausas, levante-se, beba água, alongue-se. Seu cérebro precisa desses momentos para processar.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Seção de Estatísticas Simples */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Como usar o Focusmon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                        1
                      </span>
                      Adicione suas tarefas
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Use a pilha de tarefas para organizar o que precisa fazer. Defina o tempo estimado para cada uma.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                        2
                      </span>
                      Inicie o timer
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Clique em "Iniciar" e foque totalmente na tarefa por 25 minutos sem interrupções.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                        3
                      </span>
                      Faça pausas
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Após cada sessão de foco, faça uma pausa curta. Seu personagem pixel muda de cenário!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                        4
                      </span>
                      Complete o ciclo
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      A cada 4 pomodoros completados, faça uma pausa longa de 15 minutos para recarregar as energias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 md:mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              MedPrompts Focusmon © 2026 • Produtividade com técnica Pomodoro
            </p>
            <p className="text-xs text-muted-foreground">
              Desenvolvido por <span className="font-semibold">Andressa Mendes</span> • Estudante de Medicina
            </p>
            <p className="text-xs text-muted-foreground">
              Afya - Guanambi/BA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
