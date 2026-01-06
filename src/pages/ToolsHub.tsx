import { useNavigate } from 'react-router-dom';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Library, Calculator, Clock, FileText, Brain, Sparkles, ArrowRight, Calendar } from 'lucide-react';

export default function ToolsHub() {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'library',
      title: 'Biblioteca Médica',
      description: 'Acesse milhares de livros médicos de referência. Busque por especialidade, autor ou tema específico.',
      icon: Library,
      path: '/library',
      color: 'from-indigo-500 to-purple-600',
      available: true,
    },
    {
      id: 'study-schedule',
      title: 'Cronograma de Estudos',
      description: 'Integre com Google Calendar e crie sessões de estudo com revisão espaçada automática.',
      icon: Calendar,
      path: '/study-schedule',
      color: 'from-blue-500 to-cyan-600',
      available: true,
    },
    {
      id: 'calculator',
      title: 'Calculadoras Médicas',
      description: 'Calculadoras de dosagem, IMC, clearance, scores clínicos e muito mais.',
      icon: Calculator,
      path: '/calculators',
      color: 'from-green-500 to-emerald-600',
      available: false,
    },
    {
      id: 'flashcards',
      title: 'Gerador de Flashcards',
      description: 'Crie flashcards automáticos para Anki a partir de seus resumos e anotações.',
      icon: Brain,
      path: '/flashcards',
      color: 'from-orange-500 to-red-600',
      available: false,
    },
    {
      id: 'study-timer',
      title: 'Timer Pomodoro',
      description: 'Técnica Pomodoro personalizada para otimizar suas sessões de estudo.',
      icon: Clock,
      path: '/timer',
      color: 'from-pink-500 to-rose-600',
      available: false,
    },
    {
      id: 'summary',
      title: 'Resumidor de Textos',
      description: 'Resuma artigos científicos e capítulos de livros automaticamente.',
      icon: FileText,
      path: '/summary',
      color: 'from-purple-500 to-violet-600',
      available: false,
    },
  ];

  const handleToolClick = (path: string, available: boolean) => {
    if (available) {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Ferramentas para Potencializar seus Estudos</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ferramentas Úteis
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Conjunto de ferramentas desenvolvidas especialmente para estudantes de medicina
            </p>
          </div>
        </div>
        
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </section>

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.id}
                className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 cursor-pointer"
                onClick={() => handleToolClick(tool.path, tool.available)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {tool.available ? (
                    <Button className="w-full gap-2 group-hover:gap-3 transition-all" onClick={(e) => {
                      e.stopPropagation();
                      navigate(tool.path);
                    }}>
                      Acessar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Em Breve
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              MedPrompts © 2026 • Desenvolvido para estudantes de Medicina
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
