import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { FullscreenStudyRoom } from '@/components/focumon/FullscreenStudyRoom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Timer, Users, Stethoscope, BookOpen, Maximize2 } from 'lucide-react';

/**
 * Dashboard Focusmon - Hospital Conference Room
 * Sala de estudos colaborativa para até 50 estudantes
 * Sistema Pomodoro + Pixel Art + Gestão de Tarefas + Modo Tela Cheia
 */
export default function Dashboard() {
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
              Hospital Conference Room
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Sala de estudos colaborativa para até 50 estudantes com técnica Pomodoro
            </p>
          </div>

          {/* Alert - Modo Tela Cheia */}
          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Maximize2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">
                  💡 Dica: Use o Modo Tela Cheia!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clique no botão <strong>"Modo Tela Cheia"</strong> para uma experiência imersiva. 
                  O timer e suas tarefas aparecerão como overlays flutuantes enquanto você estuda com até 50 colegas.
                </p>
              </div>
            </div>
          </div>

          {/* Sala de Conferências com Modo Fullscreen */}
          <section>
            <FullscreenStudyRoom />
          </section>

          {/* Informações sobre a Sala */}
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
                  25 min de foco intenso + 5 min de pausa. A cada 4 ciclos, descanse 15 minutos. 
                  O timer fica visível no canto da tela em modo fullscreen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  50 Estudantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Estude com até 50 colegas simultaneamente. Veja em tempo real quem está focando, 
                  em pausa ou offline através dos indicadores coloridos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Gestão de Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Organize suas tarefas no painel lateral (visível em fullscreen). 
                  Adicione, complete e gerencie tudo sem sair da sala.
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
                  Recursos da Conference Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      🎮
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Modo Imersivo</h3>
                      <p className="text-xs text-muted-foreground">
                        Tela cheia com HUD flutuante para foco total
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Ambiente Hospitalar</h3>
                      <p className="text-xs text-muted-foreground">
                        Sala de conferências temática com palco e tela
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      👥
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">50 Posições</h3>
                      <p className="text-xs text-muted-foreground">
                        Grid 10x5 com assentos numerados e identificados
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      📊
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Stats em Tempo Real</h3>
                      <p className="text-xs text-muted-foreground">
                        Veja quantos estão focando, em pausa ou offline
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      ⌨️
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Atalhos de Teclado</h3>
                      <p className="text-xs text-muted-foreground">
                        ESC para sair, SPACE para play/pause
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
                        Ambiente muda conforme o horário do dia
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
                <CardTitle className="text-lg md:text-xl">Como usar a Conference Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs">
                        1
                      </span>
                      Entre em Modo Tela Cheia
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Clique no botão "Modo Tela Cheia" para ativar a experiência imersiva. 
                      O timer e tarefas aparecerão como overlays flutuantes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs">
                        2
                      </span>
                      Adicione suas Tarefas
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Use o painel de tarefas no canto inferior esquerdo para organizar seus estudos. 
                      Clique na seta para expandir ou recolher.
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
                      Use o timer no canto superior direito para iniciar, pausar ou pular sessões. 
                      Atalho: SPACE para play/pause.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs">
                        4
                      </span>
                      Estude com Colegas
                    </h3>
                    <p className="text-muted-foreground pl-8">
                      Veja outros estudantes na sala com indicadores de status coloridos. 
                      Você aparece marcado com "VOCÊ" na posição #1.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Dicas para Máximo Foco
                  </h3>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Minimize todas as outras janelas antes de entrar em tela cheia</li>
                    <li>Silencie notificações do celular e computador</li>
                    <li>Use o modo escuro para reduzir fadiga visual</li>
                    <li>Respeite as pausas - levante-se e beba água!</li>
                    <li>Complete pelo menos 2 pomodoros antes de verificar mensagens</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Status da Implementação */}
          <section>
            <Card className="border-2 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Status de Implementação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-green-600 dark:text-green-400">
                        Implementado: Sala para 50 usuários
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Layout em grid 10x5, timer Pomodoro, gestão de tarefas e modo tela cheia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-green-600 dark:text-green-400">
                        Implementado: HUD Flutuante
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Timer e tarefas como overlays minimizáveis no modo tela cheia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">
                      ⏳
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-yellow-600 dark:text-yellow-400">
                        Em breve: Sistema Multiplayer Real
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Backend com WebSocket/Firebase para sincronização em tempo real de usuários
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">
                      ⏳
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-yellow-600 dark:text-yellow-400">
                        Em breve: Avatares Customizáveis
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Personalize tom de pele, cabelo, uniforme e acessórios médicos
                      </p>
                    </div>
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
              MedPrompts Focusmon © 2026 • Hospital Conference Room
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
