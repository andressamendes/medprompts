import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  BookOpen,
  Sparkles,
  Target,
  Trophy,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Rocket,
  GraduationCap,
  MessageSquare,
  BarChart3,
  Shield
} from 'lucide-react';

/**
 * ✨ Home v3.0 - Landing Page Minimalista
 * 
 * Design System:
 * - Paleta: Gradientes indigo/purple
 * - Animações suaves em todos elementos
 * - Cards translúcidos com backdrop-blur
 * - Responsividade mobile-first
 * - CTAs fortes para conversão
 * 
 * Números Reais:
 * - 26 prompts especializados
 * - 4 IAs recomendadas
 * - 2 categorias principais
 * - Gamificação na área logada
 */
export default function NewIndex() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: '26 Prompts Especializados',
      description: 'Otimizados para estudos médicos com IAs como ChatGPT, Claude e Perplexity',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Estudo Direcionado',
      description: 'Prompts categorizados para estudos e prática clínica',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Pronto para Usar',
      description: 'Copie e cole direto nas suas IAs favoritas',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Trophy,
      title: 'Sistema de Gamificação',
      description: 'Ganhe XP, níveis e conquistas ao usar a plataforma (após login)',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const tools = [
    {
      icon: BookOpen,
      title: 'Guia de IAs',
      description: 'Compare ChatGPT, Claude, Perplexity e mais',
      link: '/medprompts/guia-ias'
    },
    {
      icon: Rocket,
      title: 'Focus Zone',
      description: 'Técnica Pomodoro para estudos concentrados',
      link: '/medprompts/focus-zone'
    },
    {
      icon: GraduationCap,
      title: 'Biblioteca de Prompts',
      description: 'Acesse todos os 26 prompts especializados',
      link: '/medprompts/prompts'
    },
    {
      icon: BarChart3,
      title: 'Ferramentas',
      description: 'Recursos para otimizar seu aprendizado',
      link: '/medprompts/ferramentas'
    }
  ];

  const stats = [
    { value: '26', label: 'Prompts Especializados', icon: Sparkles },
    { value: '4', label: 'IAs Recomendadas', icon: MessageSquare },
    { value: '2', label: 'Categorias', icon: Target },
    { value: '100%', label: 'Gratuito', icon: Shield }
  ];

  const benefits = [
    'Prompts validados e testados',
    'Atualizações constantes',
    'Suporte para múltiplas IAs',
    'Sistema de favoritos',
    'Gamificação (área logada)',
    'Categorização inteligente'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
      {/* ==================== NAVBAR ==================== */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => navigate('/medprompts/')}
              className="flex items-center gap-2 font-bold text-xl group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MedPrompts
              </span>
            </button>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/medprompts/prompts')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Prompts
              </button>
              <button
                onClick={() => navigate('/medprompts/guia-ias')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Guia de IAs
              </button>
              <button
                onClick={() => navigate('/medprompts/ferramentas')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Ferramentas
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/medprompts/login')}
                className="text-sm"
              >
                Entrar
              </Button>
              <Button
                onClick={() => navigate('/medprompts/register')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>


      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Plataforma de Estudos Médicos com IA</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Estude Medicina com{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Inteligência Artificial
              </span>
            </h1>

            {/* Descrição */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              26 prompts especializados para ChatGPT, Claude e Perplexity. 
              Otimize seus estudos, crie flashcards, simule casos clínicos e muito mais.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/medprompts/register')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 group"
              >
                <span>Criar Conta Grátis</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/medprompts/prompts')}
                className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                <span>Ver Prompts</span>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-6">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-background" />
                ))}
              </div>
              <span>Usado por estudantes de medicina em todo o Brasil</span>
            </div>
          </div>
        </div>

        {/* Animated Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </section>


      {/* ==================== FEATURES SECTION ==================== */}
      <section className="py-20 md:py-28 bg-white/30 dark:bg-gray-950/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border-0">
              Recursos Principais
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Tudo que você precisa para{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                estudar melhor
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas e prompts desenvolvidos especificamente para estudantes de medicina
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* ==================== STATS SECTION ==================== */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ==================== TOOLS SECTION ==================== */}
      <section className="py-20 md:py-28 bg-white/30 dark:bg-gray-950/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border-0">
              Ferramentas
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Explore nossos{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                recursos
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Card
                key={index}
                onClick={() => navigate(tool.link)}
                className="group cursor-pointer relative overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* ==================== BENEFITS SECTION ==================== */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Por que escolher{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  MedPrompts
                </span>
                ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              <Star className="h-4 w-4" />
              <span>100% Gratuito</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold">
              Pronto para revolucionar seus estudos?
            </h2>

            <p className="text-xl text-indigo-100">
              Junte-se a centenas de estudantes que já estão usando o MedPrompts para estudar de forma mais inteligente
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/medprompts/register')}
                className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl hover:shadow-white/20 transition-all duration-300 group"
              >
                <span>Começar Gratuitamente</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/medprompts/prompts')}
                className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                <span>Explorar Prompts</span>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* ==================== FOOTER ==================== */}
      <footer className="border-t bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Coluna 1 - Sobre */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg">MedPrompts</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma de estudos médicos com inteligência artificial
              </p>
            </div>

            {/* Coluna 2 - Links */}
            <div className="space-y-4">
              <h3 className="font-semibold">Recursos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate('/medprompts/prompts')} className="hover:text-foreground transition-colors">
                    Biblioteca de Prompts
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/medprompts/guia-ias')} className="hover:text-foreground transition-colors">
                    Guia de IAs
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/medprompts/ferramentas')} className="hover:text-foreground transition-colors">
                    Ferramentas
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/medprompts/focus-zone')} className="hover:text-foreground transition-colors">
                    Focus Zone
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 3 - Conta */}
            <div className="space-y-4">
              <h3 className="font-semibold">Conta</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate('/medprompts/register')} className="hover:text-foreground transition-colors">
                    Criar Conta
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/medprompts/login')} className="hover:text-foreground transition-colors">
                    Fazer Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 4 - Desenvolvido por */}
            <div className="space-y-4">
              <h3 className="font-semibold">Desenvolvido por</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Andressa Mendes</p>
                <p>Estudante de Medicina</p>
                <p>Afya - Guanambi/BA</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-8 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              MedPrompts © {new Date().getFullYear()} • Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
