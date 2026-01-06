import { useEffect } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { useLogger } from '@/utils/logger';

/**
 * Landing page principal do MedPrompts
 * Plataforma gratuita de recursos de IA para estudantes de medicina
 */
export default function Index() {
  const logger = useLogger();

  useEffect(() => {
    logger.info('page_view', { page: 'home' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <AuthenticatedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-blue-100/50" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-8">
            <span className="text-2xl">📚</span>
            <span className="text-sm font-medium text-purple-700">Recursos de IA para estudantes de medicina</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            MedPrompts
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Acesse modelos prontos para ChatGPT, Claude e Gemini, consulte ferramentas organizadas e use o timer de estudo focado.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/medprompts/prompts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              <span>📚</span>
              Ver biblioteca
              <span className="ml-1">→</span>
            </a>
            <a 
              href="/medprompts/focus-zone"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-lg font-medium hover:shadow-md transition-all border-2 border-gray-200"
            >
              <span>🎯</span>
              Focus Zone
            </a>
          </div>
        </div>
      </section>

      {/* O Que Está Disponível */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            O que está disponível
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Ferramentas e recursos organizados em uma plataforma gratuita e open source
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-3">Biblioteca de Prompts</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Mais de 100 modelos prontos para usar com ChatGPT, Claude e Gemini. Organizados por disciplina: anatomia, fisiologia, patologia, farmacologia, clínica médica.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Copie e cole diretamente na sua IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Personalize conforme necessário</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Exemplos de uso incluídos</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3">Focus Zone</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Timer de estudo com método Pomodoro (25 minutos de foco + 5 de pausa) e música lo-fi ambiente.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Timer configurável (padrão ou personalizado)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Música de fundo opcional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Controle de volume e pausas</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3">Guia de IAs</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Comparação entre ChatGPT, Claude, Gemini, Perplexity e outras IAs. Tabela de preços, recursos e casos de uso.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Comparativo de funcionalidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Informações de preços</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Indicações de uso</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold mb-3">Lista de Ferramentas</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Acesso organizado a ferramentas de IA, pesquisa acadêmica, calculadoras médicas e recursos de anatomia.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Links diretos para cada ferramenta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Organizado por categoria</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Indicação de acesso gratuito ou pago</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Para Quem Serve */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Para quem serve
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Recursos adaptados para diferentes fases da graduação em medicina
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-purple-100">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-xl font-bold mb-2">Ciclo Básico</h3>
              <p className="text-gray-600 text-sm">
                Anatomia, fisiologia, bioquímica. Modelos para resumos, mapas mentais e flashcards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-pink-100">
              <div className="text-4xl mb-3">🩺</div>
              <h3 className="text-xl font-bold mb-2">Ciclo Clínico</h3>
              <p className="text-gray-600 text-sm">
                Patologia, farmacologia, propeudêutica. Organização de estudos sobre doenças e medicamentos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-xl font-bold mb-2">Internato</h3>
              <p className="text-gray-600 text-sm">
                Casos clínicos, OSCE, discussões. Modelos para simular atendimentos e revisar protocolos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-green-100">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-xl font-bold mb-2">Pré-Residência</h3>
              <p className="text-gray-600 text-sm">
                Preparação para provas. Questões comentadas, revisões rápidas e organização de estudos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Usar */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Como usar
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Não é necessário cadastro. Acesse, copie e use
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Navegue pela biblioteca</h3>
              <p className="text-gray-600">
                Escolha o prompt que você precisa, organizado por disciplina
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Copie o modelo</h3>
              <p className="text-gray-600">
                Clique e copie o prompt pronto
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Cole na sua IA</h3>
              <p className="text-gray-600">
                Abra ChatGPT, Claude ou Gemini e cole o modelo
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Personalize se quiser</h3>
              <p className="text-gray-600">
                Adapte o prompt para seu caso específico
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comece a usar agora
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Acesse a biblioteca de prompts ou explore as ferramentas disponíveis
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a 
              href="/medprompts/prompts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              Acessar biblioteca →
            </a>
            <a 
              href="/medprompts/guia-ias"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-all border-2 border-purple-500"
            >
              Ver guia de IAs
            </a>
          </div>
          <p className="text-sm text-purple-200">
            Acesso gratuito • Sem necessidade de cadastro • Open source
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
                Plataforma gratuita e open source para estudantes de medicina. Desenvolvida para centralizar recursos de IA e facilitar o acesso a ferramentas de estudo.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Recursos</h3>
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
                  Projeto open source para a comunidade médica
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-purple-700 pt-8 text-center text-purple-300">
            <p>MedPrompts © 2026 • Gratuito e open source</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
