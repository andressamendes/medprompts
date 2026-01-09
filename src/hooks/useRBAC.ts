/**
 * 🔒 useRBAC Hook - React RBAC Helper
 *
 * FASE 4: Hooks para facilitar verificação de permissões em componentes
 *
 * Uso:
 * ```tsx
 * const { hasPermission, requirePermission, canEdit } = useRBAC();
 *
 * if (hasPermission('users:delete')) {
 *   return <DeleteButton />;
 * }
 * ```
 */

import { useMemo } from 'react';
import { authService, UserRole } from '../services/auth.service';
import { rbacService, Permission } from '../services/rbac.service';

export interface RBACContext {
  // Estado atual
  role: UserRole | null;
  userId: string | null;
  isAuthenticated: boolean;

  // Verificações de permissão
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;

  // Verificações de role
  hasRole: (role: UserRole) => boolean;
  hasRoleLevel: (role: UserRole) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;

  // Verificações de recurso
  canAccessResource: (
    targetUserId: string,
    permission: Permission
  ) => boolean;
  isOwnResource: (targetUserId: string) => boolean;

  // Helpers de ação
  canEdit: (targetUserId: string) => boolean;
  canDelete: (targetUserId: string) => boolean;
  canView: (targetUserId: string) => boolean;

  // Lança erro se não tiver permissão
  requirePermission: (permission: Permission) => void;
  requireRole: (role: UserRole) => void;
}

/**
 * Hook principal para RBAC
 */
export function useRBAC(): RBACContext {
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const role = currentUser?.role || null;
  const userId = currentUser?.id || null;

  // Memoiza o contexto para evitar recálculos
  const rbacContext = useMemo<RBACContext>(() => {
    // Se não autenticado, retorna contexto vazio
    if (!isAuthenticated || !role || !userId) {
      return {
        role: null,
        userId: null,
        isAuthenticated: false,
        hasPermission: () => false,
        hasAllPermissions: () => false,
        hasAnyPermission: () => false,
        hasRole: () => false,
        hasRoleLevel: () => false,
        isAdmin: false,
        isModerator: false,
        isUser: false,
        canAccessResource: () => false,
        isOwnResource: () => false,
        canEdit: () => false,
        canDelete: () => false,
        canView: () => false,
        requirePermission: () => {
          throw new Error('⛔ Você precisa estar autenticado para realizar esta ação.');
        },
        requireRole: () => {
          throw new Error('⛔ Você precisa estar autenticado para realizar esta ação.');
        },
      };
    }

    return {
      // Estado
      role,
      userId,
      isAuthenticated: true,

      // Verificações de permissão
      hasPermission: (permission: Permission) => {
        return rbacService.hasPermission(role, permission);
      },

      hasAllPermissions: (permissions: Permission[]) => {
        return rbacService.hasAllPermissions(role, permissions);
      },

      hasAnyPermission: (permissions: Permission[]) => {
        return rbacService.hasAnyPermission(role, permissions);
      },

      // Verificações de role
      hasRole: (targetRole: UserRole) => {
        return role === targetRole;
      },

      hasRoleLevel: (targetRole: UserRole) => {
        return rbacService.hasRoleLevel(role, targetRole);
      },

      isAdmin: role === 'ADMIN',
      isModerator: role === 'MODERATOR' || role === 'ADMIN',
      isUser: role === 'USER',

      // Verificações de recurso
      canAccessResource: (
        targetUserId: string,
        permission: Permission
      ) => {
        return rbacService.canAccessResource(
          role,
          targetUserId,
          userId,
          permission
        );
      },

      isOwnResource: (targetUserId: string) => {
        return targetUserId === userId;
      },

      // Helpers de ação
      canEdit: (targetUserId: string) => {
        if (targetUserId === userId) {
          return rbacService.hasPermission(role, 'profile:edit:own');
        }
        return rbacService.hasPermission(role, 'profile:edit:any');
      },

      canDelete: (targetUserId: string) => {
        if (targetUserId === userId) {
          return rbacService.hasPermission(role, 'profile:delete:own');
        }
        return rbacService.hasPermission(role, 'profile:delete:any');
      },

      canView: (targetUserId: string) => {
        if (targetUserId === userId) {
          return rbacService.hasPermission(role, 'profile:read:own');
        }
        return rbacService.hasPermission(role, 'profile:read:any');
      },

      // Lança erro se não tiver permissão
      requirePermission: (permission: Permission) => {
        rbacService.requirePermission(role, permission);
      },

      requireRole: (targetRole: UserRole) => {
        rbacService.requireRole(role, targetRole);
      },
    };
  }, [isAuthenticated, role, userId]);

  return rbacContext;
}

/**
 * Hook específico para verificar se tem permissão
 * Retorna boolean simples
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = useRBAC();
  return hasPermission(permission);
}

/**
 * Hook específico para verificar role
 */
export function useHasRole(role: UserRole): boolean {
  const { hasRole } = useRBAC();
  return hasRole(role);
}

/**
 * Hook para verificar se é admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useRBAC();
  return isAdmin;
}

/**
 * Hook para verificar se é moderator (ou admin)
 */
export function useIsModerator(): boolean {
  const { isModerator } = useRBAC();
  return isModerator;
}

/**
 * Hook para obter role atual
 */
export function useCurrentRole(): UserRole | null {
  const { role } = useRBAC();
  return role;
}

export default useRBAC;
