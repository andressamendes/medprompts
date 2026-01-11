import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Prompts Especializados',
    description:
      'Biblioteca de prompts desenvolvidos para as principais áreas da medicina: clínica, pesquisa, estudos e prática baseada em evidências.',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Organização de Estudos',
    description:
      'Ferramentas para estruturar cronogramas, criar resumos, mapas mentais e flashcards de forma eficiente.',
    color: 'green',
  },
  {
    icon: Target,
    title: 'Metodologia Validada',
    description:
      'Prompts baseados em metodologias científicas como PICO, EBM e técnicas de estudo ativo comprovadas.',
    color: 'purple',
  },
  {
    icon: TrendingUp,
    title: 'Recursos de Produtividade',
    description:
      'Pomodoro, agenda de estudos, controle de tarefas e ferramentas para otimizar seu tempo.',
    color: 'amber',
  },
  {
    icon: Shield,
    title: 'Conteúdo Curado',
    description:
      'Prompts revisados por estudantes de medicina e atualizados continuamente com base em feedback da comunidade.',
    color: 'blue',
  },
  {
    icon: Users,
    title: 'Colaborativo',
    description:
      'Projeto open-source onde a comunidade acadêmica contribui com melhorias, novos prompts e recursos.',
    color: 'green',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
};

export const Features: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Recursos do{' '}
            <span className="text-blue-600 dark:text-blue-400">
              MedPrompts
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Ferramentas e recursos acadêmicos para apoiar seus estudos em medicina
            e otimizar seu aprendizado com inteligência artificial.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const iconColorClass = colorMap[feature.color] || colorMap.blue;

            return (
              <Card
                key={index}
                variant="outline"
                className="group transition-all duration-200 hover:shadow-md"
              >
                <CardHeader>
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${iconColorClass}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
