import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-cyan-600/10 p-8 md:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          {/* Glow Effects */}
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-pink-600/30 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            {/* Icon */}
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            {/* Heading */}
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Pronto para{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                transformar
              </span>{' '}
              seus estudos?
            </h2>

            {/* Description */}
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Junte-se a centenas de estudantes de medicina que já estão usando IA
              para estudar de forma mais inteligente e eficiente.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="xl"
                variant="primary"
                onClick={() => navigate('/')}
                className="group"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate('/guia-ias')}
              >
                Ver Guia de IAs
              </Button>
            </div>

            {/* Additional Info */}
            <p className="mt-8 text-sm text-muted-foreground">
              100% gratuito • Sem necessidade de cadastro • Acesso imediato
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
