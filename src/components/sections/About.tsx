import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Heart, Code, AlertCircle } from 'lucide-react';

/**
 * Componente de Sobre o Projeto
 * Apresentação acadêmica e profissional do MedPrompts
 */
export const About: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sobre o Projeto
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Um projeto acadêmico open-source dedicado à democratização do acesso
              a recursos de IA para educação médica
            </p>
          </div>

          {/* Missão */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Nossa Missão
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Democratizar o acesso a ferramentas de inteligência artificial para
                    estudantes de medicina, fornecendo recursos educacionais gratuitos,
                    colaborativos e de alta qualidade que auxiliem no aprendizado e
                    desenvolvimento profissional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipe */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Projeto Acadêmico
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Desenvolvido por <strong>Andressa Mendes</strong>, estudante de medicina
                    da Afya Guanambi/BA, como parte de um projeto de inovação educacional
                    voltado para a integração de tecnologias emergentes no ensino médico.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Afya Faculdade de Ciências Médicas • Guanambi, Bahia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Source */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    100% Open-Source
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Todos os recursos são disponibilizados gratuitamente sob a licença{' '}
                    <strong>Creative Commons BY-NC-SA 4.0</strong>. Você pode usar,
                    modificar e compartilhar, desde que mantenha os créditos e não utilize
                    para fins comerciais.
                  </p>
                  <div className="flex gap-2 text-sm">
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      Gratuito
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      Colaborativo
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      Educacional
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer Educacional */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Aviso Educacional
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <p>
                      ⚠️ <strong>Este é um recurso educacional complementar.</strong> Os prompts
                      e ferramentas aqui disponibilizados não substituem:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Orientação de professores e preceptores</li>
                      <li>Literatura médica oficial e baseada em evidências</li>
                      <li>Consultas a profissionais de saúde qualificados</li>
                      <li>Protocolos clínicos institucionais</li>
                    </ul>
                    <p className="mt-3">
                      As ferramentas de IA devem ser utilizadas como apoio ao estudo e
                      organização, sempre com validação de fontes acadêmicas confiáveis e
                      supervisão adequada.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato/Contribuição */}
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              Quer contribuir com prompts, sugestões ou melhorias?
            </p>
            <p className="text-sm">
              Este é um projeto colaborativo e sua participação é bem-vinda!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
