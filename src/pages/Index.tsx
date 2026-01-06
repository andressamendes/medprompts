import { useEffect } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { useLogger } from '@/utils/logger';

/**
 * Landing page principal do MedPrompts
 * Plataforma 100% gratuita de recursos de IA para estudantes de medicina
 */
export default function Index() {
  const logger = useLogger();

  useEffect(() => {
    logger.info('page_view', { page: 'home' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <AuthenticatedNavbar />
      
      {/* Hero Section - Proposta Clara */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-blue-100/50" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-8">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-medium text-purple-700">100% Gratuito e Open Source</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            Seus recursos de IA para medicina em um único lugar
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Acesse prompts prontos para ChatGPT, Claude e Gemini, organize suas IAs favoritas e estude com foco usando o Focus Zone.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/medprompts/prompts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              <span>📚</span>
              Explorar Biblioteca
              <span className="ml-1">→</span>
            </a>
            <a 
              href="/medprompts/focus-zone"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-lg font-medium hover:shadow-md transition-all border-2 border-gray-200"
            >
              <span>🎯</span>
              Acessar Focus Zone
            </a>
          </div>
        </div>
      </section>

      {/* O Que Você Encontra Aqui */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            O que você encontra aqui
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Ferramentas práticas e gratuitas para potencializar seus estudos de medicina com inteligência artificial
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-3">Biblioteca de 100+ Prompts</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Modelos prontos para usar com ChatGPT, Claude e Gemini, organizados por disciplina: anatomia, fisiologia, patologia, farmacologia, clínica médica e mais.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Copie e cole diretamente na sua IA favorita</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Personalize para suas necessidades específicas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Exemplos práticos de uso em cada prompt</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3">Focus Zone</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Ambiente de estudo focado com timer Pomodoro integrado, música lo-fi ambiente e controle de pausas.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Timer Pomodoro configurável (25/5 ou personalizado)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Música lo-fi para manter o foco</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Controle de volume e pausas</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3">Guia Completo de IAs</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Compare as principais ferramentas de IA: ChatGPT, Claude, Gemini, Perplexity e mais. Veja preços, funcionalidades e qual usar para cada situação.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Comparativo detalhado de features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Tabela de preços atualizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Recomendações por tipo de uso</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold mb-3">Ferramentas Organizadas</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Acesso rápido e organizado às melhores ferramentas de IA para estudantes de medicina, todas em um só lugar.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Links diretos para cada ferramenta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Categorização por tipo de uso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Dicas de uso para cada ferramenta</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Para Quem é o MedPrompts */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Para quem é o <span className="text-purple-600">MedPrompts</span>
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Recursos adaptados para cada fase da sua jornada na medicina
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-purple-100 hover:border-purple-300">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-xl font-bold mb-2">Ciclo Básico</h3>
              <p className="text-gray-600 text-sm">
                Anatomia, fisiologia, bioquímica. Prompts para criar resumos, mapas mentais e flashcards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-pink-100 hover:border-pink-300">
              <div className="text-4xl mb-3">🩺</div>
              <h3 className="text-xl font-bold mb-2">Ciclo Clínico</h3>
              <p className="text-gray-600 text-sm">
                Patologia, farmacologia, propeudêutica. Organize estudos de doenças e medicamentos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100 hover:border-blue-300">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-xl font-bold mb-2">Internato</h3>
              <p className="text-gray-600 text-sm">
                Casos clínicos, OSCE, discussões. Prompts para simular atendimentos e revisar protocolos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-green-100 hover:border-green-300">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-xl font-bold mb-2">Pré-Residência</h3>
              <p className="text-gray-600 text-sm">
                Preparação para provas. Questões comentadas, revisões rápidas e estratégias de estudo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Começar */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Como começar
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Simples e direto. Em 4 passos você já está usando
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Navegue pela biblioteca</h3>
              <p className="text-gray-600">
                Explore os 100+ prompts organizados por disciplina e tipo de uso
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Copie o prompt</h3>
              <p className="text-gray-600">
                Clique no prompt desejado e copie o modelo pronto para usar
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Cole na sua IA</h3>
              <p className="text-gray-600">
                Abra ChatGPT, Claude ou Gemini e cole o prompt personalizado
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Estude com foco</h3>
              <p className="text-gray-600">
                Use o Focus Zone para manter a concentração durante os estudos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para estudar de forma mais <span className="text-yellow-300">inteligente</span>?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Acesse agora a biblioteca completa de prompts e ferramentas. 100% gratuito, sem cadastro necessário.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a 
              href="/medprompts/prompts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              Começar Agora →
            </a>
            <a 
              href="/medprompts/guia-ias"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-all border-2 border-purple-500"
            >
              Ver Guia de IAs
            </a>
          </div>
          <p className="text-sm text-purple-200">
            ✓ Acesso instantâneo  •  ✓ Sem necessidade de cadastro  •  ✓ Totalmente gratuito
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
                Plataforma 100% gratuita e open source desenvolvida para estudantes de medicina. Acesse prompts de IA, organize suas ferramentas e estude com foco.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Recursos Disponíveis</h3>
              <ul className="space-y-2">
                <li><a href="/medprompts/prompts" className="text-purple-200 hover:text-white transition-colors">📚 Biblioteca de Prompts</a></li>
                <li><a href="/medprompts/guia-ias" className="text-purple-200 hover:text-white transition-colors">🤖 Guia de IAs</a></li>
                <li><a href="/medprompts/ferramentas" className="text-purple-200 hover:text-white transition-colors">🔧 Ferramentas</a></li>
                <li><a href="/medprompts/focus-zone" className="text-purple-200 hover:text-white transition-colors">🎯 Focus Zone</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Desenvolvido por</h3>
              <div className="text-purple-200">
                <p className="font-semibold">Andressa Mendes</p>
                <p>Estudante de Medicina</p>
                <p>Afya - Guanambi/BA</p>
                <p className="mt-4 text-sm">
                  💜 Projeto open source para a comunidade médica
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-purple-700 pt-8 text-center text-purple-300">
            <p>MedPrompts © 2026 • Todos os direitos reservados • 100% Gratuito</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
