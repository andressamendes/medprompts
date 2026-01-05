import React from 'react';
import { TrendingUp, Award, BookOpen, Clock } from 'lucide-react';

const stats = [
  {
    icon: BookOpen,
    value: '100+',
    label: 'Prompts Profissionais',
    description: 'Biblioteca completa e sempre crescente',
  },
  {
    icon: Award,
    value: '50+',
    label: 'Conquistas',
    description: 'Sistema completo de gamificação',
  },
  {
    icon: Clock,
    value: '70%',
    label: 'Economia de Tempo',
    description: 'Aumente sua produtividade nos estudos',
  },
  {
    icon: TrendingUp,
    value: '15+',
    label: 'Categorias',
    description: 'Prompts para cada necessidade',
  },
];

export const Stats: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Impacto em{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Números
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Veja como o MedPrompts está transformando a forma de estudar medicina
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-2xl"
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Value */}
                  <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="mb-1 text-lg font-semibold">{stat.label}</div>

                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
