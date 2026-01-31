/* eslint-disable no-console */
/**
 * RBAC Service - Role-Based Access Control
 *
 * Sistema completo de controle de acesso baseado em roles
 * Implementa OWASP A01:2021 (Broken Access Control)
 *
 * @note Console statements são usados para debug de permissões em desenvolvimento
 */

import { UserRole } from './auth.service';

// ==========================================
// TIPOS DE PERMISSÕES
// ==========================================

export type Permission =
  // Perfil de usuário
  | 'profile:read:own'
  | 'profile:edit:own'
  | 'profile:delete:own'
  | 'profile:read:any'
  | 'profile:edit:any'
  | 'profile:delete:any'
  // Prompts
  | 'prompts:read'
  | 'prompts:create'
  | 'prompts:edit:own'
  | 'prompts:delete:own'
  | 'prompts:edit:any'
  | 'prompts:delete:any'
  // Ferramentas
  | 'tools:read'
  | 'tools:use'
  | 'tools:manage'
  // Estudo
  | 'study:read:own'
  | 'study:create'
  | 'study:edit:own'
  | 'study:delete:own'
  | 'study:read:any'
  // Usuários (admin)
  | 'users:read'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'users:ban'
  // Sistema (admin)
  | 'system:settings'
  | 'system:logs'
  | 'system:backup'
  // Moderação
  | 'moderation:reports'
  | 'moderation:content'
  | 'moderation:users';

// ==========================================
// MAPEAMENTO DE PERMISSÕES POR ROLE
// ==========================================

// Primeiro define permissões base do USER
const USER_PERMISSIONS: Permission[] = [
  // Perfil próprio
  'profile:read:own',
  'profile:edit:own',
  'profile:delete:own',
  // Prompts
  'prompts:read',
  'prompts:create',
  'prompts:edit:own',
  'prompts:delete:own',
  // Ferramentas
  'tools:read',
  'tools:use',
  // Estudo
  'study:read:own',
  'study:create',
  'study:edit:own',
  'study:delete:own',
];

// Depois adiciona permissões de MODERATOR
const MODERATOR_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  // Moderação
  'moderation:reports',
  'moderation:content',
  'moderation:users',
  // Visualização de dados
  'profile:read:any',
  'study:read:any',
  'users:read',
  // Edição de conteúdo (moderação)
  'prompts:edit:any',
  'prompts:delete:any',
];

// Por fim, permissões de ADMIN
const ADMIN_PERMISSIONS: Permission[] = [
  ...MODERATOR_PERMISSIONS,
  // Perfil de qualquer usuário
  'profile:edit:any',
  'profile:delete:any',
  // Gestão de usuários
  'users:create',
  'users:edit',
  'users:delete',
  'users:ban',
  // Sistema
  'system:settings',
  'system:logs',
  'system:backup',
  // Ferramentas admin
  'tools:manage',
];

// Mapeamento final
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  /**
   * USER: Permissões básicas
   * - Acesso aos próprios dados
   * - Leitura de recursos públicos
   * - Uso de ferramentas básicas
   */
  USER: USER_PERMISSIONS,

  /**
   * MODERATOR: Permissões de moderação
   * - Todas as permissões de USER
   * - Moderação de conteúdo
   * - Leitura de dados de outros usuários
   */
  MODERATOR: MODERATOR_PERMISSIONS,

  /**
   * ADMIN: Permissões administrativas completas
   * - Todas as permissões de MODERATOR
   * - Gestão de usuários
   * - Configurações de sistema
   */
  ADMIN: ADMIN_PERMISSIONS,
};

// ==========================================
// HIERARCHIA DE ROLES
// ==========================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

// ==========================================
// RBAC SERVICE
// ==========================================

class RBACService {
  /**
   * Verifica se role tem permissão específica
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes(permission);
  }

  /**
   * Verifica se role tem TODAS as permissões especificadas
   */
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission));
  }

  /**
   * Verifica se role tem ALGUMA das permissões especificadas
   */
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission));
  }

  /**
   * Obtém todas as permissões de uma role
   */
  getPermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role];
  }

  /**
   * Verifica se role A tem hierarquia maior ou igual a role B
   */
  hasRoleLevel(roleA: UserRole, roleB: UserRole): boolean {
    return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
  }

  /**
   * Verifica se role A tem hierarquia estritamente maior que role B
   */
  isRoleHigherThan(roleA: UserRole, roleB: UserRole): boolean {
    return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
  }

  /**
   * Verifica se usuário pode acessar recurso de outro usuário
   * @param userRole Role do usuário que está tentando acessar
   * @param targetUserId ID do usuário dono do recurso
   * @param currentUserId ID do usuário atual
   * @param permission Permissão necessária
   */
  canAccessResource(
    userRole: UserRole,
    targetUserId: string,
    currentUserId: string,
    permission: Permission
  ): boolean {
    // Se é o próprio recurso
    if (targetUserId === currentUserId) {
      const ownPermission = permission.replace(':any', ':own') as Permission;
      return this.hasPermission(userRole, ownPermission);
    }

    // Se é recurso de outro usuário
    const anyPermission = permission.replace(':own', ':any') as Permission;
    return this.hasPermission(userRole, anyPermission);
  }

  /**
   * Lança erro se usuário não tiver permissão
   * @throws Error com mensagem de acesso negado
   */
  requirePermission(role: UserRole, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new Error(
        `⛔ Acesso negado: Você não tem permissão para realizar esta ação.\n` +
        `Permissão necessária: ${permission}\n` +
        `Sua role: ${role}`
      );
    }
  }

  /**
   * Lança erro se usuário não tiver TODAS as permissões
   */
  requireAllPermissions(role: UserRole, permissions: Permission[]): void {
    const missingPermissions = permissions.filter(
      permission => !this.hasPermission(role, permission)
    );

    if (missingPermissions.length > 0) {
      throw new Error(
        `⛔ Acesso negado: Você não tem todas as permissões necessárias.\n` +
        `Permissões faltantes: ${missingPermissions.join(', ')}\n` +
        `Sua role: ${role}`
      );
    }
  }

  /**
   * Lança erro se usuário não tiver NENHUMA das permissões
   */
  requireAnyPermission(role: UserRole, permissions: Permission[]): void {
    if (!this.hasAnyPermission(role, permissions)) {
      throw new Error(
        `⛔ Acesso negado: Você precisa de pelo menos uma das seguintes permissões:\n` +
        `${permissions.join(', ')}\n` +
        `Sua role: ${role}`
      );
    }
  }

  /**
   * Lança erro se role não tiver nível mínimo
   */
  requireRole(currentRole: UserRole, requiredRole: UserRole): void {
    if (!this.hasRoleLevel(currentRole, requiredRole)) {
      throw new Error(
        `⛔ Acesso negado: Esta ação requer role ${requiredRole} ou superior.\n` +
        `Sua role: ${currentRole}`
      );
    }
  }

  /**
   * Verifica se usuário pode modificar role de outro usuário
   * Regra: Apenas admins podem alterar roles, e não podem se auto-promover
   */
  canChangeUserRole(
    adminRole: UserRole,
    adminId: string,
    targetUserId: string,
    _newRole: UserRole
  ): boolean {
    // Apenas admins podem alterar roles
    if (adminRole !== 'ADMIN') {
      return false;
    }

    // Admin não pode alterar própria role (previne auto-promoção/demotion acidental)
    if (adminId === targetUserId) {
      return false;
    }

    return true;
  }

  /**
   * Formata mensagem de erro de acesso negado
   */
  formatAccessDeniedError(
    action: string,
    requiredPermission?: Permission,
    currentRole?: UserRole
  ): string {
    let message = `⛔ ACESSO NEGADO\n\nVocê não tem permissão para: ${action}`;

    if (requiredPermission) {
      message += `\n\nPermissão necessária: ${requiredPermission}`;
    }

    if (currentRole) {
      message += `\nSua role atual: ${currentRole}`;
      message += `\n\nPara acessar esta funcionalidade, entre em contato com um administrador.`;
    }

    return message;
  }

  /**
   * Debug: Lista todas as permissões de uma role (desenvolvimento)
   */
  debugPermissions(role: UserRole): void {
    console.log(`\n🔒 Permissões da role ${role}:`);
    const permissions = this.getPermissions(role);
    permissions.forEach((permission, index) => {
      console.log(`  ${index + 1}. ${permission}`);
    });
    console.log(`\nTotal: ${permissions.length} permissões\n`);
  }

  /**
   * Debug: Compara permissões entre duas roles
   */
  debugRoleComparison(roleA: UserRole, roleB: UserRole): void {
    const permissionsA = new Set(this.getPermissions(roleA));
    const permissionsB = new Set(this.getPermissions(roleB));

    const onlyInA = [...permissionsA].filter(p => !permissionsB.has(p));
    const onlyInB = [...permissionsB].filter(p => !permissionsA.has(p));
    const shared = [...permissionsA].filter(p => permissionsB.has(p));

    console.log(`\n🔒 Comparação de Roles: ${roleA} vs ${roleB}`);
    console.log(`\nApenas em ${roleA}: ${onlyInA.length}`);
    onlyInA.forEach(p => console.log(`  - ${p}`));
    console.log(`\nApenas em ${roleB}: ${onlyInB.length}`);
    onlyInB.forEach(p => console.log(`  - ${p}`));
    console.log(`\nCompartilhadas: ${shared.length}\n`);
  }
}

export const rbacService = new RBACService();
export default rbacService;
