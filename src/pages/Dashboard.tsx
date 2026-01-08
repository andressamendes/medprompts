import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { PomodoroTimer } from '@/components/focumon/PomodoroTimer';
import { HospitalCanvas } from '@/components/focumon/HospitalCanvas';
import { TaskStack } from '@/components/focumon/TaskStack';
import { usePomodoro } from '@/hooks/usePomodoro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Timer, Users, Stethoscope, BookOpen } from 'lucide-react';

/**
 * Dashboard Focusmon - Hospital Study Room
 * Sala de estudos colaborativa temática de hospital
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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 flex-wrap">
              <Stethoscope className="h-8 w-8 md:h-10 md:w-10 text-red-500" />
              Focusmon Hospital Study Room
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Sua sala de estudos em ambiente hospitalar com técnica Pomodoro
            </p>
          </div>

          {/* Hospital Canvas - Sala de estudos completa */}
          <section>
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Sala de Estudos Principal
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    Capacidade: 4 estudantes
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <HospitalCanvas mode={mode} />
              </CardContent>
            </Card>
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

          {/* Informações sobre o Hospital Study Room */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Timer className="h-5 w-5 text-green-500" />
                  Técnica Pomodoro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Trabalhe focado por 25 minutos, descanse por 5. A cada 4 sessões completas, faça uma pausa longa de 15 minutos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Ambiente Hospitalar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Estude em um ambiente temático de hospital com 4 mesas de estudo, quadro de anatomia e materiais médicos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Estudo Colaborativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em breve: estude com outros colegas em tempo real, veja o progresso deles e compartilhe conquistas!
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Recursos da Sala */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Recursos Disponíveis na Sala
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      📚
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Biblioteca Médica</h3>
                      <p className="text-xs text-muted-foreground">
                        Estante com livros de anatomia, fisiologia e patologia
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      🩺
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Materiais Práticos</h3>
                      <p className="text-xs text-muted-foreground">
                        Carrinho de emergência e equipamentos médicos decorativos
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      🖼️
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Apoio Visual</h3>
                      <p className="text-xs text-muted-foreground">
                        Quadro branco e pôster de anatomia humana
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      🪑
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">4 Estações de Estudo</h3>
                      <p className="text-xs text-muted-foreground">
                        Mesas individuais com material de estudo disponível
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      🌅
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Iluminação Dinâmica</h3>
                      <p className="text-xs text-muted-foreground">
                        Ambiente muda conforme horário do dia e modo de estudo
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Vista Hospitalar</h3>
                      <p className="text-xs text-muted-foreground">
                        Janela com vista para área externa do hospital
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Guia de Uso */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Como usar a Hospital Study Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs">
                        1
                      </span>
                      Organize suas tarefas
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Use a pilha de tarefas para listar tudo que precisa estudar hoje. Defina o tempo estimado para cada matéria.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs">
                        2
                      </span>
                      Escolha sua mesa
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Você aparece automaticamente na Mesa #1. Observe o ambiente hospitalar ao seu redor enquanto estuda.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs">
                        3
                      </span>
                      Inicie o Pomodoro
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Clique em "Iniciar" e foque totalmente na tarefa. O indicador verde mostra que você está em modo foco.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs">
                        4
                      </span>
                      Respeite as pausas
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Após cada sessão, faça pausas. Levante-se, beba água e descanse os olhos. Seu indicador muda de cor automaticamente.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Em breve: Modo Colaborativo
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Em breve você poderá ver outros estudantes na sala, compartilhar progresso e competir em rankings semanais. 
                    As outras 3 mesas estarão disponíveis para seus colegas!
                  </p>
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
              MedPrompts Focusmon © 2026 • Hospital Study Room
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
