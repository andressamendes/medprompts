/**
 * 🔒 ProtectedRoute - Componente de Rota Protegida
 *
 * FASE 4: Proteção de rotas baseada em autenticação e RBAC
 *
 * Uso:
 * ```tsx
 * <ProtectedRoute requiredRole="ADMIN">
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, UserRole } from '../../services/auth.service';
import { rbacService, Permission } from '../../services/rbac.service';

interface ProtectedRouteProps {
  children: React.ReactNode;

  // Autenticação
  requireAuth?: boolean; // Padrão: true

  // RBAC - Role
  requiredRole?: UserRole; // Requer role específica ou superior
  allowedRoles?: UserRole[]; // Lista de roles permitidas

  // RBAC - Permissão
  requiredPermission?: Permission; // Requer permissão específica
  requiredPermissions?: Permission[]; // Requer TODAS as permissões
  anyPermission?: Permission[]; // Requer PELO MENOS UMA permissão

  // Redirecionamento
  redirectTo?: string; // Padrão: '/login'
  redirectToOnForbidden?: string; // Padrão: '/dashboard'

  // Callback customizado
  onAccessDenied?: () => void;

  // UI de carregamento
  fallback?: React.ReactNode;
}

/**
 * Componente de Rota Protegida
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  allowedRoles,
  requiredPermission,
  requiredPermissions,
  anyPermission,
  redirectTo = '/login',
  redirectToOnForbidden = '/dashboard',
  onAccessDenied,
}) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // Verifica autenticação
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se não autenticado e não requer auth, permite
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Daqui pra frente, usuário está autenticado
  const userRole = currentUser!.role;

  // Verifica role específica (e hierarquia)
  if (requiredRole && !rbacService.hasRoleLevel(userRole, requiredRole)) {
    if (onAccessDenied) {
      onAccessDenied();
    }
    return <Navigate to={redirectToOnForbidden} replace />;
  }

  // Verifica lista de roles permitidas
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (onAccessDenied) {
      onAccessDenied();
    }
    return <Navigate to={redirectToOnForbidden} replace />;
  }

  // Verifica permissão única
  if (requiredPermission && !rbacService.hasPermission(userRole, requiredPermission)) {
    if (onAccessDenied) {
      onAccessDenied();
    }
    return <Navigate to={redirectToOnForbidden} replace />;
  }

  // Verifica múltiplas permissões (TODAS)
  if (requiredPermissions && !rbacService.hasAllPermissions(userRole, requiredPermissions)) {
    if (onAccessDenied) {
      onAccessDenied();
    }
    return <Navigate to={redirectToOnForbidden} replace />;
  }

  // Verifica permissões alternativas (ALGUMA)
  if (anyPermission && !rbacService.hasAnyPermission(userRole, anyPermission)) {
    if (onAccessDenied) {
      onAccessDenied();
    }
    return <Navigate to={redirectToOnForbidden} replace />;
  }

  // Todas as verificações passaram - renderiza children
  return <>{children}</>;
};

/**
 * Componente para mostrar conteúdo apenas se usuário tiver permissão
 */
interface IfAuthorizedProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[]; // TODAS
  anyPermission?: Permission[]; // ALGUMA
  role?: UserRole;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export const IfAuthorized: React.FC<IfAuthorizedProps> = ({
  children,
  permission,
  permissions,
  anyPermission,
  role,
  roles,
  fallback = null,
  onUnauthorized,
}) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuthenticated || !currentUser) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  const userRole = currentUser.role;

  // Verifica role específica
  if (role && !rbacService.hasRoleLevel(userRole, role)) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // Verifica lista de roles
  if (roles && !roles.includes(userRole)) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // Verifica permissão única
  if (permission && !rbacService.hasPermission(userRole, permission)) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // Verifica múltiplas permissões (TODAS)
  if (permissions && !rbacService.hasAllPermissions(userRole, permissions)) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // Verifica permissões alternativas (ALGUMA)
  if (anyPermission && !rbacService.hasAnyPermission(userRole, anyPermission)) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // Autorizado - renderiza children
  return <>{children}</>;
};

/**
 * Componente para mostrar badge de role
 */
interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const roleColors = {
    USER: 'bg-gray-100 text-gray-700 border-gray-300',
    MODERATOR: 'bg-blue-100 text-blue-700 border-blue-300',
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  const roleIcons = {
    USER: '👤',
    MODERATOR: '🛡️',
    ADMIN: '👑',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-semibold
        ${sizeClasses[size]}
        ${roleColors[role]}
        ${className}
      `}
    >
      <span>{roleIcons[role]}</span>
      <span>{role}</span>
    </span>
  );
};

export default ProtectedRoute;
