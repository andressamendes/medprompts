import { useNavigate, Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
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

// ============================================================================
// TIPOS E CONSTANTES (fora do componente para evitar re-criação)
// ============================================================================

type ColorKey = 'purple' | 'blue' | 'green' | 'orange' | 'indigo' | 'rose';

type LucideIcon = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, "ref"> & React.RefAttributes<SVGSVGElement>
>;

const COLOR_CLASSES: Record<ColorKey, {
    bg: string;
    text: string;
    border: string;
    badge: string;
  }> = {
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-700',
      badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-700',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      border: 'hover:border-green-300 dark:hover:border-green-700',
      badge: 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-200'
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'hover:border-orange-300 dark:hover:border-orange-700',
      badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200'
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
    },
    rose: {
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200'
    }
};

// Hub de Ferramentas - Destaque Principal
const TOOLS_HUB: Array<{
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
const CATEGORIES: Array<{
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
const FEATURES: Array<{
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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function NewIndex() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Recursos de IA para Estudantes de Medicina"
        description="Portal academico com prompts otimizados, guias de IAs e ferramentas para potencializar seus estudos em medicina. ChatGPT, Claude, Perplexity e mais."
        canonical="https://andressamendes.github.io/medprompts/"
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        {/* NAVBAR UNIFICADO */}
        <PublicNavbar />

        {/* Skip link removido - já existe no App.tsx via SkipLinks */}

      {/* HERO DIRETO E EDUCACIONAL */}
      <main id="main-content" className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge Educacional */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Portal Acadêmico de IA para Medicina
          </div>

          {/* Título com ícone de estetoscópio */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            <span className="inline-flex items-center justify-center gap-3">
              <span className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Stethoscope className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" aria-hidden="true" />
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                MEDPROMPTS
              </span>
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
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-300 dark:border-gray-700">
              <Link to="/guia-ias">Ver Recursos</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* HUB DE FERRAMENTAS - DESTAQUE MÁXIMO */}
      <section id="hub-ferramentas" aria-labelledby="hub-ferramentas-heading" className="container mx-auto px-4 sm:px-6 py-12 md:py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header da Seção */}
          <div className="text-center space-y-2">
            <h2 id="hub-ferramentas-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Hub de Ferramentas
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Acesso direto aos recursos de estudo
            </p>
          </div>

          {/* Grid 2x2 de Cards Funcionais */}
          <div className="grid md:grid-cols-2 gap-6">
            {TOOLS_HUB.map((tool, index) => (
              <AccessibleCard
                key={tool.link}
                onClick={() => navigate(tool.link)}
                ariaLabel={`Acessar ${tool.title}: ${tool.description}`}
                className={`group p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 ${COLOR_CLASSES[tool.color].border} animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 ${COLOR_CLASSES[tool.color].bg} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon className={`h-7 w-7 ${COLOR_CLASSES[tool.color].text}`} aria-hidden="true" />
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${COLOR_CLASSES[tool.color].badge}`}>
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
                      {tool.tags.map((tag) => (
                        <span
                          key={`${tool.link}-${tag}`}
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
      <section aria-labelledby="categorias-heading" className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header da Seção */}
          <div className="text-center space-y-2">
            <h2 id="categorias-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Categorias de Prompts
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Organizados por tipo de uso acadêmico
            </p>
          </div>

          {/* Cards Horizontais de Categorias */}
          <div className="grid md:grid-cols-2 gap-6">
            {CATEGORIES.map((category, index) => (
              <AccessibleCard
                key={index}
                onClick={() => navigate(category.link)}
                ariaLabel={`Ver ${category.count} prompts de ${category.title}: ${category.description}`}
                className={`group p-6 cursor-pointer border-2 ${COLOR_CLASSES[category.color].border} hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className={`p-3 ${COLOR_CLASSES[category.color].bg} rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className={`h-6 w-6 ${COLOR_CLASSES[category.color].text}`} aria-hidden="true" />
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {category.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${COLOR_CLASSES[category.color].badge}`}>
                        {category.count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {category.description}
                    </p>
                    <span className={`text-sm font-medium ${COLOR_CLASSES[category.color].text} inline-flex items-center gap-1`}>
                      Ver prompts
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </AccessibleCard>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS EDUCACIONAIS */}
      <section aria-labelledby="recursos-heading" className="container mx-auto px-4 sm:px-6 py-12 md:py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header da Seção */}
          <div className="text-center space-y-2">
            <h2 id="recursos-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Recursos da Plataforma
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ferramentas para otimizar seu aprendizado
            </p>
          </div>

          {/* Grid de Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="text-center space-y-3 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
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


      {/* FOOTER INFORMATIVO */}
      <footer className="border-t bg-gray-50 dark:bg-gray-950" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Coluna 1: Logo e Descrição */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <Brain className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">MedPrompts</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hub de ferramentas de IA para estudantes de medicina
              </p>
            </div>

            {/* Coluna 2: Recursos */}
            <nav aria-label="Links do rodapé" className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/prompts"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Biblioteca de Prompts
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guia-ias"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Guia de IAs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ferramentas"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Ferramentas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/focus-zone"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Focus Zone
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Coluna 3: Desenvolvido por */}
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
    </>
  );
}
