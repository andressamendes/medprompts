import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';

export default function VirtualSpace() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Espaço Virtual</h1>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Em Desenvolvimento
              </h2>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                O Espaço Virtual multiplayer está temporariamente indisponível enquanto implementamos melhorias.
              </p>
            </div>
            <p className="text-center text-muted-foreground mb-6">
              Enquanto isso, explore nossas outras ferramentas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/prompts"
                className="block bg-primary text-primary-foreground p-4 rounded-md hover:bg-primary/90 text-center"
              >
                Biblioteca de Prompts
              </Link>
              <Link
                to="/focus-zone"
                className="block bg-secondary text-secondary-foreground p-4 rounded-md hover:bg-secondary/90 text-center"
              >
                Focus Zone
              </Link>
              <Link
                to="/guia-ias"
                className="block bg-accent text-accent-foreground p-4 rounded-md hover:bg-accent/90 text-center"
              >
                Guia de IAs
              </Link>
              <Link
                to="/ferramentas"
                className="block bg-muted text-muted-foreground p-4 rounded-md hover:bg-muted/90 text-center"
              >
                Ferramentas
              </Link>
            </div>
            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-primary hover:underline"
              >
                Voltar para Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
