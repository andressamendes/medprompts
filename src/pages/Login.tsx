import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { rateLimiter } from '@/utils/rateLimiter';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    // RATE LIMITING: Previne brute force de login
    const limitCheck = rateLimiter.checkLimit('login', formData.email);

    if (!limitCheck.allowed) {
      toast({
        title: 'Muitas tentativas de login',
        description: rateLimiter.formatErrorMessage('login', limitCheck.resetIn),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Aguarda login completar e atualizar estado
      await login(formData.email, formData.password);

      // Registra tentativa bem-sucedida
      rateLimiter.recordAttempt('login', formData.email);

      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta!',
      });

      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error: any) {
      // Registra tentativa falha
      rateLimiter.recordAttempt('login', formData.email);

      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Verifique suas credenciais',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md" role="region" aria-label="Formulário de login">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold" id="login-title">Login</CardTitle>
          <CardDescription id="login-description">
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} aria-labelledby="login-title" aria-describedby="login-description" noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="email"
                aria-label="Digite seu endereço de email"
                aria-required="true"
                aria-invalid={false}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="#"
                  className="text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: 'Em desenvolvimento',
                      description: 'A funcionalidade de recuperação de senha estará disponível em breve.',
                    });
                  }}
                >
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                autoComplete="current-password"
                showPasswordToggle={true}
                aria-label="Digite sua senha"
                aria-required="true"
                aria-invalid={false}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-label={isLoading ? "Processando login..." : "Entrar na conta"}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                aria-label="Ir para página de registro"
              >
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
