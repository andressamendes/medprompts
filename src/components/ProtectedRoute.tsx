import { Navigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // ÚNICA VERIFICAÇÃO: localStorage direto
  const hasToken = authService.isAuthenticated();
  const hasUser = authService.getCurrentUser() !== null;
  
  // Se localStorage tem autenticação, permitir acesso IMEDIATAMENTE
  if (hasToken && hasUser) {
    return <>{children}</>;
  }

  // Se não tem autenticação, redirecionar para login
  return <Navigate to="/login" replace />;
}
