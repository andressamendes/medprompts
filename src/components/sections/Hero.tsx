import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Padrão de grid sutil */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.05]" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge Acadêmico */}
          <div className="mb-6 inline-flex items-center space-x-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-4 py-2">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Portal Acadêmico de IA para Medicina
            </span>
          </div>

          {/* Heading - Tom Acadêmico */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
            <span className="text-blue-600 dark:text-blue-400">
              MEDPROMPTS
            </span>
            <br />
            <span className="text-3xl md:text-4xl font-normal text-gray-700 dark:text-gray-300">
              Recursos de IA para estudantes de medicina
            </span>
          </h1>

          {/* Description - Objetiva e Educacional */}
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400 md:text-xl max-w-2xl mx-auto">
            Biblioteca colaborativa de prompts, guias e ferramentas de IA
            para educação médica. 100% gratuito e open-source.
          </p>

          {/* CTA Buttons - Hierarquia Clara */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('/prompts')}
              className="group bg-blue-600 hover:bg-blue-700 text-white"
            >
              Acessar Prompts
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/guia-ias')}
              className="border-gray-300 dark:border-gray-700"
            >
              Ver Recursos
            </Button>
          </div>

          {/* Stats - Estilo Minimalista */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-gray-200 dark:border-gray-800 pt-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                100+
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Prompts Disponíveis
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                15+
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Categorias
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-700 dark:text-gray-300">
                Free
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Acesso Livre
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
