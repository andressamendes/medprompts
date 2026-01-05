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
    title: 'IA Especializada',
    description:
      'Prompts desenvolvidos especificamente para estudantes de medicina, otimizados para cada fase do curso.',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Aumente Produtividade',
    description:
      'Economize horas de estudo com prompts que aceleram pesquisas, resumos e revisões de conteúdo.',
    gradient: 'from-pink-600 to-cyan-600',
  },
  {
    icon: Target,
    title: 'Focado em Resultados',
    description:
      'Cada prompt é testado e refinado para gerar os melhores resultados acadêmicos e práticos.',
    gradient: 'from-cyan-600 to-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Gamificação',
    description:
      'Sistema de XP, níveis, conquistas e desafios semanais para manter você motivado nos estudos.',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    icon: Shield,
    title: 'Confiável',
    description:
      'Biblioteca curada por estudantes de medicina, com prompts validados e atualizados regularmente.',
    gradient: 'from-pink-600 to-cyan-600',
  },
  {
    icon: Users,
    title: 'Comunidade',
    description:
      'Faça parte de uma comunidade de estudantes que utilizam IA para potencializar seus estudos.',
    gradient: 'from-cyan-600 to-purple-600',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Por que escolher{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MedPrompts
            </span>
            ?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A plataforma mais completa de prompts de IA para estudantes de medicina,
            com recursos exclusivos de gamificação e produtividade.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                variant="elevated"
                className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                />
                
                <CardHeader>
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
