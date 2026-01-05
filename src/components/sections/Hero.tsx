import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-cyan-600/10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Plataforma de IA para Medicina
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
              Revolucione
            </span>
            <br />
            seus estudos de medicina
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Biblioteca completa de prompts de IA otimizados para estudantes de medicina.
            Aumente sua produtividade, aprenda mais rápido e conquiste seus objetivos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="xl"
              variant="primary"
              onClick={() => navigate('/prompts')}
              className="group"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explorar Prompts
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/guia-ias')}
            >
              Guia de IAs
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                100+
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Prompts Disponíveis
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
                15+
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Categorias
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Acesso Livre
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
