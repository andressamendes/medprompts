import { useEffect } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { useLogger } from '@/utils/logger';

/**
 * Landing page principal do MedPrompts
 * Página inicial com apresentação da plataforma
 */
export default function Index() {
  const logger = useLogger();

  // Log page view
  useEffect(() => {
    logger('page_view', { page: 'home' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <AuthenticatedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-blue-100/50" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-8">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-medium text-purple-700">Plataforma de IA para Medicina</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            Revolucione seus estudos de medicina
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Biblioteca completa de prompts de IA otimizados para estudantes de medicina. Aumente sua produtividade, aprenda mais rápido e conquiste seus objetivos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/medprompts/prompts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              <span>📚</span>
              Explorar Prompts
              <span className="ml-1">→</span>
            </a>
            <a 
              href="/medprompts/guia-ias"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-lg font-medium hover:shadow-md transition-all border-2 border-gray-200"
            >
              Guia de IAs
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-sm text-gray-600">Prompts Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">15+</div>
              <div className="text-sm text-gray-600">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Acesso Livre</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Por que escolher <span className="text-purple-600">MedPrompts</span>?
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            A plataforma mais completa de prompts de IA para estudantes de medicina, com recursos exclusivos de gamificação e produtividade.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'IA Especializada',
                description: 'Prompts desenvolvidos especificamente para estudantes de medicina, otimizados para cada fase do curso.'
              },
              {
                icon: '⚡',
                title: 'Aumente Produtividade',
                description: 'Economize horas de estudo com prompts que aceleram pesquisas, resumos e revisões de conteúdo.'
              },
              {
                icon: '🎯',
                title: 'Focado em Resultados',
                description: 'Cada prompt é testado e refinado para gerar os melhores resultados acadêmicos e práticos.'
              },
              {
                icon: '📈',
                title: 'Gamificação',
                description: 'Sistema de XP, níveis, conquistas e desafios semanais para manter você motivado nos estudos.'
              },
              {
                icon: '🛡️',
                title: 'Confiável',
                description: 'Biblioteca curada por estudantes de medicina, com prompts validados e atualizados regularmente.'
              },
              {
                icon: '👥',
                title: 'Comunidade',
                description: 'Faça parte de uma comunidade de estudantes que utilizam IA para potencializar seus estudos.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Impacto em <span className="text-yellow-300">Números</span>
          </h2>
          <p className="text-center text-purple-100 mb-16 max-w-3xl mx-auto">
            Veja como o MedPrompts está transformando a forma de estudar medicina
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '100+', label: 'Prompts Profissionais', desc: 'Biblioteca completa e sempre crescente' },
              { number: '50+', label: 'Conquistas', desc: 'Sistema completo de gamificação' },
              { number: '70%', label: 'Economia de Tempo', desc: 'Aumente sua produtividade nos estudos' },
              { number: '15+', label: 'Categorias', desc: 'Prompts para cada necessidade' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-3">{stat.number}</div>
                <div className="text-xl font-semibold mb-2">{stat.label}</div>
                <div className="text-purple-100">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para <span className="text-purple-600">transformar</span> seus estudos?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Junte-se a centenas de estudantes de medicina que já estão usando IA para estudar de forma mais inteligente e eficiente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a 
              href="/medprompts/prompts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              Começar Agora
            </a>
            <a 
              href="/medprompts/guia-ias"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-lg font-medium hover:shadow-md transition-all border-2 border-gray-200"
            >
              Ver Guia de IAs
            </a>
          </div>
          <p className="text-sm text-gray-500">
            100% gratuito • Sem necessidade de cadastro • Acesso imediato
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Sobre o MedPrompts</h3>
              <p className="text-purple-200 leading-relaxed">
                Plataforma desenvolvida para otimizar os estudos de medicina através de prompts inteligentes e ferramentas de produtividade.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="/medprompts/guia-ias" className="text-purple-200 hover:text-white transition-colors">Guia de IAs</a></li>
                <li><a href="/medprompts/ferramentas" className="text-purple-200 hover:text-white transition-colors">Ferramentas</a></li>
                <li><a href="/medprompts/focus-zone" className="text-purple-200 hover:text-white transition-colors">Focus Zone</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Desenvolvido por</h3>
              <div className="text-purple-200">
                <p className="font-semibold">Andressa Mendes</p>
                <p>Estudante de Medicina</p>
                <p>Afya - Guanambi/BA</p>
              </div>
            </div>
          </div>
          <div className="border-t border-purple-700 pt-8 text-center text-purple-300">
            <p>MedPrompts © 2026 • Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
