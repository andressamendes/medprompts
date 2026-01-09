# 🔒 RBAC Guide - MedPrompts

**Role-Based Access Control** - Guia completo de uso

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Roles e Hierarquia](#roles-e-hierarquia)
3. [Permissões](#permissões)
4. [Uso em Componentes React](#uso-em-componentes-react)
5. [Proteção de Rotas](#proteção-de-rotas)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

O sistema RBAC do MedPrompts implementa controle de acesso baseado em 3 roles:

- **USER**: Usuário comum (padrão)
- **MODERATOR**: Moderador de conteúdo
- **ADMIN**: Administrador do sistema

### Hierarquia

```
ADMIN (nível 3)
  ↓ herda todas as permissões de
MODERATOR (nível 2)
  ↓ herda todas as permissões de
USER (nível 1)
```

---

## 👥 Roles e Hierarquia

### USER (Nível 1)

**Quem é**: Usuário comum do sistema

**Permissões**:
- ✅ Gerenciar próprio perfil (ler, editar, deletar)
- ✅ Criar e gerenciar próprios prompts
- ✅ Usar todas as ferramentas básicas
- ✅ Gerenciar próprias sessões de estudo
- ❌ Ver dados de outros usuários
- ❌ Moderar conteúdo
- ❌ Acessar configurações de sistema

**Exemplo de uso**:
```typescript
// Estudante de medicina usando o app para estudo
const role: UserRole = 'USER';
```

---

### MODERATOR (Nível 2)

**Quem é**: Moderador de conteúdo e comunidade

**Permissões** (herda todas de USER +):
- ✅ Visualizar perfis de outros usuários
- ✅ Moderar relatórios
- ✅ Editar/deletar conteúdo inadequado (prompts)
- ✅ Visualizar sessões de estudo de outros usuários
- ❌ Deletar usuários
- ❌ Alterar configurações de sistema
- ❌ Gerenciar outros moderadores/admins

**Exemplo de uso**:
```typescript
// Usuário confiável que ajuda a moderar o conteúdo
const role: UserRole = 'MODERATOR';
```

---

### ADMIN (Nível 3)

**Quem é**: Administrador do sistema

**Permissões** (herda todas de MODERATOR +):
- ✅ Gerenciar qualquer perfil de usuário
- ✅ Criar, editar, deletar usuários
- ✅ Banir usuários
- ✅ Acessar configurações de sistema
- ✅ Visualizar logs
- ✅ Fazer backup do sistema
- ✅ Gerenciar ferramentas

**Exemplo de uso**:
```typescript
// Desenvolvedor ou gestor do sistema
const role: UserRole = 'ADMIN';
```

---

## 🔐 Permissões

### Categorias de Permissões

#### 1. Perfil (`profile:*`)
- `profile:read:own` - Ler próprio perfil
- `profile:edit:own` - Editar próprio perfil
- `profile:delete:own` - Deletar própria conta
- `profile:read:any` - Ler perfil de outros (MOD+)
- `profile:edit:any` - Editar perfil de outros (ADMIN)
- `profile:delete:any` - Deletar conta de outros (ADMIN)

#### 2. Prompts (`prompts:*`)
- `prompts:read` - Ler prompts públicos
- `prompts:create` - Criar novos prompts
- `prompts:edit:own` - Editar próprios prompts
- `prompts:delete:own` - Deletar próprios prompts
- `prompts:edit:any` - Editar prompts de outros (MOD+)
- `prompts:delete:any` - Deletar prompts de outros (MOD+)

#### 3. Ferramentas (`tools:*`)
- `tools:read` - Ver ferramentas disponíveis
- `tools:use` - Usar ferramentas
- `tools:manage` - Gerenciar ferramentas (ADMIN)

#### 4. Estudo (`study:*`)
- `study:read:own` - Ver próprias sessões
- `study:create` - Criar sessões
- `study:edit:own` - Editar próprias sessões
- `study:delete:own` - Deletar próprias sessões
- `study:read:any` - Ver sessões de outros (MOD+)

#### 5. Usuários (`users:*`)
- `users:read` - Listar usuários (MOD+)
- `users:create` - Criar usuários (ADMIN)
- `users:edit` - Editar usuários (ADMIN)
- `users:delete` - Deletar usuários (ADMIN)
- `users:ban` - Banir usuários (ADMIN)

#### 6. Sistema (`system:*`)
- `system:settings` - Acessar configurações (ADMIN)
- `system:logs` - Visualizar logs (ADMIN)
- `system:backup` - Fazer backup (ADMIN)

#### 7. Moderação (`moderation:*`)
- `moderation:reports` - Ver relatórios (MOD+)
- `moderation:content` - Moderar conteúdo (MOD+)
- `moderation:users` - Moderar usuários (MOD+)

---

## ⚛️ Uso em Componentes React

### 1. Hook `useRBAC()`

```tsx
import { useRBAC } from '../hooks/useRBAC';

function MyComponent() {
  const {
    role,
    hasPermission,
    hasRole,
    isAdmin,
    isModerator,
    canEdit,
    requirePermission
  } = useRBAC();

  // Verificar permissão
  if (hasPermission('users:delete')) {
    return <DeleteUserButton />;
  }

  // Verificar role
  if (isAdmin) {
    return <AdminPanel />;
  }

  // Lançar erro se não tiver permissão
  const handleDelete = () => {
    try {
      requirePermission('users:delete');
      // Deletar usuário...
    } catch (error) {
      alert(error.message); // "⛔ Acesso negado..."
    }
  };
}
```

### 2. Hooks Específicos

```tsx
import { useIsAdmin, useHasPermission } from '../hooks/useRBAC';

function AdminButton() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  return <button>Admin Panel</button>;
}

function DeleteButton() {
  const canDelete = useHasPermission('users:delete');

  return (
    <button disabled={!canDelete}>
      Delete
    </button>
  );
}
```

### 3. Componente `<IfAuthorized>`

```tsx
import { IfAuthorized } from '../components/auth/ProtectedRoute';

function UserProfile({ userId }) {
  return (
    <div>
      <h1>Perfil do Usuário</h1>

      {/* Apenas se tiver permissão */}
      <IfAuthorized permission="profile:edit:any">
        <button>Editar Perfil</button>
      </IfAuthorized>

      {/* Apenas para admins */}
      <IfAuthorized role="ADMIN">
        <button>Deletar Usuário</button>
      </IfAuthorized>

      {/* Com fallback */}
      <IfAuthorized
        permission="users:read"
        fallback={<p>Você não tem permissão para ver isso.</p>}
      >
        <UserDetails />
      </IfAuthorized>
    </div>
  );
}
```

### 4. Badge de Role

```tsx
import { RoleBadge } from '../components/auth/ProtectedRoute';

function UserCard({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <RoleBadge role={user.role} size="md" />
    </div>
  );
}
```

---

## 🛡️ Proteção de Rotas

### 1. Rota que Requer Autenticação

```tsx
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Dashboard } from '../pages/Dashboard';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 2. Rota que Requer Role Específica

```tsx
// Apenas admins podem acessar
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPanel />
    </ProtectedRoute>
  }
/>

// Moderadores ou admins podem acessar
<Route
  path="/moderation"
  element={
    <ProtectedRoute requiredRole="MODERATOR">
      <ModerationPanel />
    </ProtectedRoute>
  }
/>
```

### 3. Rota que Requer Permissão

```tsx
<Route
  path="/users/manage"
  element={
    <ProtectedRoute requiredPermission="users:edit">
      <UserManagement />
    </ProtectedRoute>
  }
/>
```

### 4. Rota com Múltiplas Permissões

```tsx
// Requer TODAS as permissões
<Route
  path="/admin/settings"
  element={
    <ProtectedRoute
      requiredPermissions={['system:settings', 'system:backup']}
    >
      <SystemSettings />
    </ProtectedRoute>
  }
/>

// Requer PELO MENOS UMA permissão
<Route
  path="/content/moderate"
  element={
    <ProtectedRoute
      anyPermission={['moderation:content', 'moderation:reports']}
    >
      <ContentModeration />
    </ProtectedRoute>
  }
/>
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Botão de Deletar Usuário

```tsx
import { useRBAC } from '../hooks/useRBAC';

function DeleteUserButton({ userId }) {
  const { hasPermission, userId: currentUserId } = useRBAC();

  // Apenas admins podem deletar
  if (!hasPermission('users:delete')) {
    return null;
  }

  // Admin não pode se auto-deletar
  if (userId === currentUserId) {
    return null;
  }

  return (
    <button
      onClick={() => deleteUser(userId)}
      className="btn-danger"
    >
      🗑️ Deletar Usuário
    </button>
  );
}
```

### Exemplo 2: Editar Prompt

```tsx
function PromptCard({ prompt }) {
  const { canEdit, userId } = useRBAC();

  const isOwnPrompt = prompt.authorId === userId;
  const canEditThisPrompt = canEdit(prompt.authorId);

  return (
    <div>
      <h3>{prompt.title}</h3>
      <p>{prompt.content}</p>

      {/* Usuário pode editar próprio prompt */}
      {isOwnPrompt && <button>Editar</button>}

      {/* Moderador/Admin pode editar qualquer prompt */}
      {!isOwnPrompt && canEditThisPrompt && (
        <button className="btn-warning">
          Editar (Moderação)
        </button>
      )}
    </div>
  );
}
```

### Exemplo 3: Navbar com Itens Condicionais

```tsx
import { IfAuthorized } from '../components/auth/ProtectedRoute';

function Navbar() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/prompts">Prompts</a>
      <a href="/tools">Ferramentas</a>

      <IfAuthorized permission="users:read">
        <a href="/users">Usuários</a>
      </IfAuthorized>

      <IfAuthorized role="MODERATOR">
        <a href="/moderation">Moderação</a>
      </IfAuthorized>

      <IfAuthorized role="ADMIN">
        <a href="/admin">Admin</a>
      </IfAuthorized>
    </nav>
  );
}
```

---

## ✅ Boas Práticas

### 1. Sempre Verificar Permissões no Backend

⚠️ **IMPORTANTE**: RBAC no frontend é apenas para UX. **SEMPRE** valide permissões no backend também.

```typescript
// ❌ ERRADO - Apenas frontend
function deleteUser(userId: string) {
  // Direto no banco
  database.deleteUser(userId);
}

// ✅ CORRETO - Validação no backend
async function deleteUser(userId: string) {
  const response = await fetch('/api/users/' + userId, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 403) {
    throw new Error('Acesso negado');
  }

  return response.json();
}
```

### 2. Use Hooks para Lógica de Permissão

```tsx
// ❌ Evitar lógica inline
{currentUser.role === 'ADMIN' && <DeleteButton />}

// ✅ Usar hooks/componentes
import { IfAuthorized } from './ProtectedRoute';

<IfAuthorized role="ADMIN">
  <DeleteButton />
</IfAuthorized>
```

### 3. Falhe de Forma Segura (Fail-Safe)

```tsx
// ❌ Mostrar se NÃO tiver permissão (inseguro)
{!hasPermission('admin') && <PublicContent />}

// ✅ Mostrar apenas se TIVER permissão
{hasPermission('user:read') && <UserContent />}
```

### 4. Forneça Feedback ao Usuário

```tsx
function AdminButton() {
  const { isAdmin } = useRBAC();

  if (!isAdmin) {
    return (
      <button disabled title="Apenas administradores">
        Admin Panel
      </button>
    );
  }

  return <button>Admin Panel</button>;
}
```

### 5. Teste Diferentes Roles

```typescript
// Em desenvolvimento
import { rbacService } from './rbac.service';

// Debug de permissões
rbacService.debugPermissions('USER');
rbacService.debugPermissions('MODERATOR');
rbacService.debugPermissions('ADMIN');

// Comparação
rbacService.debugRoleComparison('USER', 'MODERATOR');
```

---

## 🚨 Migração OWASP A01:2021

Este sistema RBAC mitiga a vulnerabilidade **OWASP A01:2021 (Broken Access Control)** através de:

1. ✅ **Controle de acesso baseado em roles** (RBAC)
2. ✅ **Verificação de permissões granulares**
3. ✅ **Hierarchia de roles clara**
4. ✅ **Proteção de rotas no frontend**
5. ✅ **Helpers e hooks para facilitar uso correto**
6. ⚠️ **Backend ainda precisa implementar** (FASE futura)

---

## 📚 Referências

- [OWASP A01:2021 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [RBAC - Role-Based Access Control](https://en.wikipedia.org/wiki/Role-based_access_control)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Criado em**: FASE 4 - Security Hardening
**Última atualização**: 2026-01-09
