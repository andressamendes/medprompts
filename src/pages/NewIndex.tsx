import { PublicNavbar } from '@/components/PublicNavbar';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { Stats } from '@/components/sections/Stats';
import { CTA } from '@/components/sections/CTA';

/**
 * Página inicial pública (Landing Page)
 * Exibida para usuários NÃO autenticados
 * Contém:  Navbar pública, Hero, Features, Stats, CTA, Footer
 * Totalmente responsiva para desktop e mobile
 */
export default function NewIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar Pública */}
      <PublicNavbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Stats Section */}
      <Stats />

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <footer className="border-t mt-16" role="contentinfo">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coluna 1 - Sobre */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Sobre o MedPrompts</h3>
              <p className="text-sm text-muted-foreground">
                Plataforma desenvolvida para otimizar os estudos de medicina através de prompts 
                inteligentes e ferramentas de produtividade.
              </p>
            </div>

            {/* Coluna 2 - Links Rápidos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Links Rápidos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/guia-ias" className="hover:text-primary transition-colors">
                    Guia de IAs
                  </a>
                </li>
                <li>
                  <a href="/ferramentas" className="hover:text-primary transition-colors">
                    Ferramentas
                  </a>
                </li>
                <li>
                  <a href="/focus-zone" className="hover:text-primary transition-colors">
                    Focus Zone
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 3 - Desenvolvido por */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Desenvolvido por</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-semibold">Andressa Mendes</p>
                <p>Estudante de Medicina</p>
                <p>Afya - Guanambi/BA</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-8 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              MedPrompts © {new Date().getFullYear()} • Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}