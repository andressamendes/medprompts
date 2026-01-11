import { useNavigate, Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AccessibleCard } from '@/components/AccessibleCard';
import { About } from '@/components/sections/About';
import {
  Brain,
  BookOpen,
  Target,
  Trophy,
  Zap,
  ArrowRight,
  Timer,
  Library,
  Stethoscope,
  Heart
} from 'lucide-react';

/**
 * ✨ Home v4.0 - Plataforma Educacional (FOCO EM APRENDIZADO)
 * 
 * MUDANÇAS v4.0:
 * - ✅ Tom educacional, não comercial
 * - ✅ Hub de ferramentas em destaque
 * - ✅ Remoção de linguagem de marketing exagerada
 * - ✅ Estatísticas integradas nos cards
 * - ✅ Layout funcional tipo documentação
 * - ✅ Foco em produtividade e aprendizado
 * - ✅ Navbar compartilhado (PublicNavbar)
 */

export default function NewIndex() {
  const navigate = useNavigate();

  // Tipagem correta para evitar erro TypeScript
  type ColorKey = 'purple' | 'blue' | 'green' | 'orange' | 'indigo' | 'rose';
  
  // Tipo para ícones Lucide
  type LucideIcon = React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & React.RefAttributes<SVGSVGElement>
  >;

  const colorClasses: Record<ColorKey, {
    bg: string;
    text: string;
    border: string;
    badge: string;
  }> = {
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-700',
      badge: 'bg-purple-50 text-purple-600'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-700',
      badge: 'bg-blue-50 text-blue-600'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      border: 'hover:border-green-300 dark:hover:border-green-700',
      badge: 'bg-green-50 text-green-600'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'hover:border-orange-300 dark:hover:border-orange-700',
      badge: 'bg-orange-50 text-orange-600'
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      badge: 'bg-indigo-50 text-indigo-600'
    },
    rose: {
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
      badge: 'bg-rose-50 text-rose-600'
    }
  };

  // Hub de Ferramentas - Destaque Principal
  const toolsHub: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    badge: string;
    tags: string[];
    color: ColorKey;
    link: string;
  }> = [
    {
      icon: Brain,
      title: 'Biblioteca de Prompts',
      description: 'Flashcards, resumos, mapas mentais, casos clínicos e questões prontas para usar',
      badge: '26 prompts',
      tags: ['Estudos', 'Prática', 'Revisão'],
      color: 'purple',
      link: '/prompts'
    },
    {
      icon: Zap,
      title: 'Guia de IAs',
      description: 'Compare ChatGPT, Claude, Perplexity e Gemini para escolher a melhor ferramenta',
      badge: '4 IAs',
      tags: ['Comparativo', 'Funcionalidades'],
      color: 'blue',
      link: '/guia-ias'
    },
    {
      icon: Timer,
      title: 'Focus Zone',
      description: 'Timer Pomodoro para sessões de estudo focadas com tracking de progresso',
      badge: 'Pomodoro',
      tags: ['Produtividade', 'XP'],
      color: 'green',
      link: '/focus-zone'
    },
    {
      icon: Library,
      title: 'Hub de Recursos',
      description: 'Mnemônicos, desafios semanais, casos clínicos e sistema de gamificação',
      badge: '+ ferramentas',
      tags: ['Conquistas', 'Comunidade'],
      color: 'orange',
      link: '/ferramentas'
    }
  ];

  // Categorias de Prompts
  const categories: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    count: string;
    color: ColorKey;
    link: string;
  }> = [
    {
      icon: BookOpen,
      title: 'Estudos',
      description: 'Flashcards, resumos, mapas mentais, questões e simulados',
      count: '12 prompts',
      color: 'indigo',
      link: '/prompts'
    },
    {
      icon: Stethoscope,
      title: 'Prática Clínica',
      description: 'Casos clínicos, diagnóstico diferencial, conduta e prescrição médica',
      count: '14 prompts',
      color: 'rose',
      link: '/prompts'
    }
  ];

  // Recursos educacionais (não benefícios comerciais)
  const features: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
  }> = [
    {
      icon: Target,
      title: 'Estudo Direcionado',
      description: 'Prompts organizados por categoria e tipo de uso acadêmico'
    },
    {
      icon: BookOpen,
      title: 'Copiar e Usar',
      description: 'Todos os prompts prontos para copiar direto nas IAs'
    },
    {
      icon: Trophy,
      title: 'Acompanhe Progresso',
      description: 'Sistema de XP, níveis e conquistas (área logada)'
    },
    {
      icon: Heart,
      title: 'Organização Pessoal',
      description: 'Sistema de favoritos e tags personalizadas'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* NAVBAR UNIFICADO */}
      <PublicNavbar />

      {/* Skip to Content Link (acessibilidade) */}
      <a
        href="#main-content"
        className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Pular para conteúdo principal
      </a>

      {/* HERO DIRETO E EDUCACIONAL */}
      <section id="main-content" className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge Educacional */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
            <BookOpen className="h-4 w-4" />
            Portal Acadêmico de IA para Medicina
          </div>

          {/* Título Direto */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            <span className="text-blue-600 dark:text-blue-400">
              MEDPROMPTS
            </span>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-normal text-gray-700 dark:text-gray-300 mt-2">
              Recursos de IA para estudantes de medicina
            </span>
          </h1>

          {/* Descrição Funcional */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Biblioteca colaborativa com 26+ prompts para ChatGPT, Claude e Perplexity,
            guia comparativo de IAs e ferramentas de produtividade acadêmica.
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to="/prompts" className="gap-2">
                Acessar Prompts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-300 dark:border-gray-700">
              <Link to="/guia-ias">Ver Recursos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* HUB DE FERRAMENTAS - DESTAQUE MÁXIMO */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header da Seção */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Hub de Ferramentas
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Acesso direto aos recursos de estudo
            </p>
          </div>

          {/* Grid 2x2 de Cards Funcionais */}
          <div className="grid md:grid-cols-2 gap-6">
            {toolsHub.map((tool, index) => (
              <AccessibleCard
                key={index}
                onClick={() => navigate(tool.link)}
                ariaLabel={`Acessar ${tool.title}: ${tool.description}`}
                className={`group p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${colorClasses[tool.color].border} animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 ${colorClasses[tool.color].bg} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon className={`h-7 w-7 ${colorClasses[tool.color].text}`} />
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colorClasses[tool.color].badge}`}>
                      {tool.badge}
                    </span>
                  </div>

                  {/* Conteúdo do Card */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {tool.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <Button variant="outline" className="w-full group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:border-purple-300 dark:group-hover:border-purple-700 transition-colors">
                    Acessar
                  </Button>
                </div>
              </AccessibleCard>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIAS DE PROMPTS */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header da Seção */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Categorias de Prompts
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Organizados por tipo de uso acadêmico
            </p>
          </div>

          {/* Cards Horizontais de Categorias */}
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <AccessibleCard
                key={index}
                onClick={() => navigate(category.link)}
                ariaLabel={`Ver ${category.count} prompts de ${category.title}: ${category.description}`}
                className={`group p-6 cursor-pointer border-2 ${colorClasses[category.color].border} hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className={`p-3 ${colorClasses[category.color].bg} rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className={`h-6 w-6 ${colorClasses[category.color].text}`} />
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {category.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClasses[category.color].badge}`}>
                        {category.count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {category.description}
                    </p>
                    <Link 
                      to={category.link} 
                      className={`text-sm font-medium ${colorClasses[category.color].text} hover:underline inline-flex items-center gap-1`}
                    >
                      Ver prompts
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </AccessibleCard>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS EDUCACIONAIS */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header da Seção */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Recursos da Plataforma
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ferramentas para otimizar seu aprendizado
            </p>
          </div>

          {/* Grid de Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center space-y-3 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO SOBRE O PROJETO */}
      <About />

      {/* CTA EDUCACIONAL (opcional) */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800">
          <div className="text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Recursos Adicionais (Opcional)
            </div>

            {/* Título */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Crie uma conta para recursos extras
            </h2>

            {/* Descrição */}
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Salve seus prompts favoritos, use o timer Pomodoro, acompanhe estatísticas
              de estudo e organize recursos com tags personalizadas.
            </p>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link to="/register">Criar Conta</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gray-300 dark:border-gray-700">
                <Link to="/prompts">Continuar sem conta</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* FOOTER INFORMATIVO */}
      <footer className="border-t bg-gray-50 dark:bg-gray-950" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Coluna 1: Logo e Descrição */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">MedPrompts</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hub de ferramentas de IA para estudantes de medicina
              </p>
            </div>

            {/* Coluna 2: Recursos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('/prompts')} 
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Biblioteca de Prompts
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/guia-ias')} 
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Guia de IAs
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/ferramentas')} 
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Ferramentas
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/focus-zone')} 
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Focus Zone
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Conta */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Conta</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('/register')} 
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Criar Conta
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Fazer Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Desenvolvido por */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Desenvolvido por</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-semibold text-gray-900 dark:text-white">Andressa Mendes</p>
                <p>Estudante de Medicina</p>
                <p>Afya - Guanambi/BA</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            MedPrompts © {new Date().getFullYear()} • Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}
