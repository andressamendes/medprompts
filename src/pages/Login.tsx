import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/components/PublicNavbar';

export default function Login() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                O sistema de autenticação está temporariamente indisponível.
              </p>
            </div>
            <p className="text-center text-muted-foreground mb-4">
              Você pode acessar a <Link to="/prompts" className="text-primary hover:underline">biblioteca de prompts</Link> e outras ferramentas sem fazer login.
            </p>
            <div className="text-center">
              <Link
                to="/"
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
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
