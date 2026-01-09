import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = await authService.isAuthenticated();
      const hasUser = authService.getCurrentUser() !== null;
      setIsAuthenticated(hasToken && hasUser);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  // Aguarda verificação assíncrona
  if (isChecking) {
    return null; // ou um loading spinner
  }

  // Se autenticado, permitir acesso
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Se não autenticado, redirecionar para login
  return <Navigate to="/login" replace />;
}
