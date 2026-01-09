# 🛡️ Rate Limiting Guide - MedPrompts

**FASE 7: Proteção contra Brute Force e Abuse**

---

## 📋 Índice

1. [O que é Rate Limiting?](#o-que-é-rate-limiting)
2. [Como Funciona](#como-funciona)
3. [Configurações Padrão](#configurações-padrão)
4. [Uso em React](#uso-em-react)
5. [Integração com Auth](#integração-com-auth)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 O que é Rate Limiting?

**Rate Limiting** limita o número de ações que um usuário pode executar em um período de tempo.

### Previne:

- ✅ **Brute Force Attacks** (tentativas de senha)
- ✅ **Credential Stuffing** (teste de credenciais vazadas)
- ✅ **API Abuse** (uso excessivo de recursos)
- ✅ **DoS (Denial of Service)** (sobrecarga do sistema)
- ✅ **Spam** (criação massiva de contas)

**OWASP Mapping:**
- A07:2021 (Identification and Authentication Failures) - ✅ Mitigado

---

## 🔧 Como Funciona

Rate limiting usa **janelas deslizantes** (sliding windows):

```
Exemplo: Login (5 tentativas em 15 minutos)

Tentativa 1 (00:00): ✅ Permitida (4 restantes)
Tentativa 2 (00:02): ✅ Permitida (3 restantes)
Tentativa 3 (00:05): ✅ Permitida (2 restantes)
Tentativa 4 (00:08): ✅ Permitida (1 restante)
Tentativa 5 (00:10): ✅ Permitida (0 restantes)
Tentativa 6 (00:12): ❌ BLOQUEADO (bloqueio de 30 minutos)
```

### Janela Deslizante

A janela reseta após o período definido:

```
Login: 5 tentativas em 15 minutos
Janela: 00:00 - 00:15

00:00: Tentativa 1 ✅
00:16: Janela resetou ✅ (pode tentar novamente)
```

---

## ⚙️ Configurações Padrão

### 1. Login

```typescript
{
  maxAttempts: 5,           // 5 tentativas
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000 // 30 min de bloqueio
}
```

**Uso:** Previne brute force em senhas.

### 2. Register

```typescript
{
  maxAttempts: 3,            // 3 contas
  windowMs: 60 * 60 * 1000,  // 1 hora
  blockDurationMs: 2 * 60 * 60 * 1000 // 2h de bloqueio
}
```

**Uso:** Previne criação massiva de contas fake.

### 3. API Calls

```typescript
{
  maxAttempts: 100,          // 100 requisições
  windowMs: 60 * 1000,       // 1 minuto
  blockDurationMs: 5 * 60 * 1000 // 5 min de bloqueio
}
```

**Uso:** Previne abuse de APIs.

### 4. Password Reset

```typescript
{
  maxAttempts: 3,             // 3 tentativas
  windowMs: 60 * 60 * 1000,   // 1 hora
  blockDurationMs: 24 * 60 * 60 * 1000 // 24h de bloqueio
}
```

**Uso:** Previne spam de recuperação de senha.

### 5. Search

```typescript
{
  maxAttempts: 30,           // 30 buscas
  windowMs: 60 * 1000,       // 1 minuto
  blockDurationMs: 60 * 1000 // 1 min de bloqueio
}
```

**Uso:** Previne scraping de dados.

### 6. Export

```typescript
{
  maxAttempts: 5,            // 5 exports
  windowMs: 60 * 60 * 1000,  // 1 hora
  blockDurationMs: 60 * 60 * 1000 // 1h de bloqueio
}
```

**Uso:** Previne extração massiva de dados.

---

## 💻 Uso em React

### 1. Hook Básico

```tsx
import { useRateLimit } from '@/hooks/useRateLimit';

function SearchComponent() {
  const { checkLimit } = useRateLimit();

  const handleSearch = async (query: string) => {
    // Verifica rate limit
    const result = checkLimit('search');

    if (!result.allowed) {
      alert(result.error); // "Muitas tentativas. Tente em X minutos."
      return;
    }

    // Executa busca
    const results = await searchAPI(query);
    // ...
  };

  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

### 2. Hook com Feedback Visual

```tsx
import { useRateLimitFeedback } from '@/hooks/useRateLimit';

function ExportButton() {
  const feedback = useRateLimitFeedback('export');

  return (
    <div>
      <button disabled={feedback.blocked}>
        Exportar Dados
      </button>

      {feedback.message && (
        <p className="text-yellow-600">{feedback.message}</p>
      )}

      {feedback.blocked && (
        <p className="text-red-600">
          Bloqueado até {feedback.blockedUntil?.toLocaleString()}
        </p>
      )}
    </div>
  );
}
```

### 3. Verificação Preventiva

```tsx
import { useRateLimit } from '@/hooks/useRateLimit';

function LoginForm() {
  const { isBlocked, getRemainingAttempts } = useRateLimit();

  useEffect(() => {
    if (isBlocked('login')) {
      alert('Você está temporariamente bloqueado.');
    }
  }, [isBlocked]);

  const remaining = getRemainingAttempts('login');

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}

      {remaining !== null && remaining <= 2 && (
        <div className="warning">
          ⚠️ {remaining} tentativa(s) restante(s)
        </div>
      )}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 🔐 Integração com Auth

O auth service já integra rate limiting automaticamente:

### Login

```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Rate limiting automático
  const identifier = getRateLimitIdentifier();
  const rateLimitResult = rateLimitService.checkLimit(identifier, 'login');

  if (!rateLimitResult.allowed) {
    throw new Error(formatRateLimitError(rateLimitResult));
  }

  // ... resto do código de login

  // Reset após login bem-sucedido
  rateLimitService.reset(identifier, 'login');
}
```

### Register

```typescript
async register(data: RegisterData): Promise<AuthResponse> {
  // Rate limiting automático
  const identifier = getRateLimitIdentifier();
  const rateLimitResult = rateLimitService.checkLimit(identifier, 'register');

  if (!rateLimitResult.allowed) {
    throw new Error(formatRateLimitError(rateLimitResult));
  }

  // ... resto do código de registro
}
```

**Você não precisa adicionar nada!** O rate limiting está integrado.

---

## 📚 Exemplos Práticos

### Exemplo 1: Busca com Debounce + Rate Limit

```tsx
import { useState, useCallback } from 'react';
import { useRateLimit } from '@/hooks/useRateLimit';
import { debounce } from 'lodash';

function SmartSearch() {
  const { checkLimit } = useRateLimit();
  const [results, setResults] = useState([]);

  const search = useCallback(
    debounce(async (query: string) => {
      // Rate limit
      const result = checkLimit('search');
      if (!result.allowed) {
        console.warn(result.error);
        return;
      }

      // Busca
      const data = await fetch(`/api/search?q=${query}`);
      setResults(await data.json());
    }, 300),
    [checkLimit]
  );

  return (
    <input
      type="search"
      onChange={(e) => search(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

### Exemplo 2: Formulário com Limite de Envio

```tsx
import { useState } from 'react';
import { useRateLimit } from '@/hooks/useRateLimit';

function ContactForm() {
  const { checkLimit, getRemainingAttempts } = useRateLimit();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica rate limit
    const result = checkLimit('api');
    if (!result.allowed) {
      alert(result.error);
      return;
    }

    // Envia formulário
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    setSubmitted(true);
  };

  const remaining = getRemainingAttempts('api');

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      {submitted && <p className="success">✅ Enviado!</p>}

      {remaining !== null && remaining < 10 && (
        <p className="warning">
          ⚠️ {remaining} envios restantes neste minuto
        </p>
      )}

      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Exemplo 3: API Call com Retry Automático

```tsx
import { useRateLimit } from '@/hooks/useRateLimit';

function useAPIWithRetry() {
  const { checkLimit } = useRateLimit();

  const callAPI = async (endpoint: string, retries = 3): Promise<any> => {
    const result = checkLimit('api');

    if (!result.allowed) {
      if (retries > 0 && result.retryAfter) {
        // Aguarda e tenta novamente
        await new Promise((resolve) =>
          setTimeout(resolve, result.retryAfter! * 1000)
        );
        return callAPI(endpoint, retries - 1);
      }

      throw new Error(result.error);
    }

    return fetch(endpoint).then((r) => r.json());
  };

  return { callAPI };
}
```

---

## 🐛 Troubleshooting

### Erro: "Muitas tentativas. Tente novamente em X minutos."

**Causa:** Excedeu o limite de tentativas para a ação.

**Solução:**
1. Aguarde o tempo especificado
2. Em dev, limpe o localStorage:
   ```javascript
   localStorage.removeItem('rate-limit-session-id');
   ```
3. Ou use o método `reset()`:
   ```typescript
   rateLimitService.reset(identifier, 'login');
   ```

### Rate Limit Muito Restritivo

**Problema:** Usuários legítimos sendo bloqueados.

**Solução:** Ajuste a configuração:

```typescript
// rate-limit.service.ts
const RATE_LIMIT_PRESETS = {
  login: {
    maxAttempts: 10,  // Aumenta de 5 para 10
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000  // Reduz de 30 para 15 min
  }
};
```

### Rate Limit por IP em Produção

**Problema:** Múltiplos usuários atrás do mesmo IP (NAT corporativo).

**Solução Backend (necessário):**
```typescript
// Backend Express.js
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requisições
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas. Tente novamente mais tarde.'
    });
  }
});

app.post('/api/auth/login', loginLimiter, loginHandler);
```

### Cleanup não funcionando

**Causa:** Service não inicializado corretamente.

**Solução:** O service é singleton e auto-inicializa. Verifique:
```typescript
// App.tsx
import { rateLimitService } from '@/services/rate-limit.service';

useEffect(() => {
  console.log('Rate limit stats:', rateLimitService.getStats());
}, []);
```

### Storage crescendo muito

**Solução:** Cleanup automático roda a cada 5 minutos. Para forçar:
```typescript
rateLimitService.clearAll(); // Limpa tudo (use apenas em dev)
```

---

## 📊 Monitoramento

### Obter Estatísticas

```typescript
import { rateLimitService } from '@/services/rate-limit.service';

const stats = rateLimitService.getStats();
console.log(stats);
// {
//   totalEntries: 15,
//   blockedEntries: 2,
//   byAction: {
//     login: 5,
//     search: 8,
//     export: 2
//   }
// }
```

### Dashboard Simples

```tsx
function RateLimitDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = rateLimitService.getStats();
      setStats(data);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="dashboard">
      <h3>Rate Limit Stats</h3>
      <p>Total: {stats.totalEntries}</p>
      <p>Bloqueados: {stats.blockedEntries}</p>
      <ul>
        {Object.entries(stats.byAction).map(([action, count]) => (
          <li key={action}>
            {action}: {count}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔒 Boas Práticas

### 1. Use rate limiting em todas as ações críticas

```typescript
// ✅ BOM
const handlePasswordReset = async () => {
  const result = checkLimit('passwordReset');
  if (!result.allowed) return;
  // ...
};

// ❌ RUIM (sem proteção)
const handlePasswordReset = async () => {
  // Direto sem rate limit
};
```

### 2. Mostre feedback ao usuário

```typescript
// ✅ BOM
if (!result.allowed) {
  toast.error(result.error);
  return;
}

// ❌ RUIM (usuário não sabe por que falhou)
if (!result.allowed) return;
```

### 3. Reset após ações bem-sucedidas

```typescript
// ✅ BOM
if (loginSuccess) {
  rateLimitService.reset(identifier, 'login');
}

// ❌ RUIM (penaliza usuários legítimos)
// Não reseta após sucesso
```

### 4. Backend DEVE ter rate limiting também

```
Frontend rate limiting = UX (melhor experiência)
Backend rate limiting = SEGURANÇA REAL
```

**Frontend pode ser burlado!** Backend é essencial.

---

## 🚀 Próximos Passos

Após rate limiting implementado:

1. ✅ **FASE 7:** Rate limiting completo
2. ⏭️ **FASE 8:** CORS e headers de segurança
3. ⏭️ **FASE 9:** Testes e documentação final

---

**🔒 Sua aplicação agora está protegida contra brute force!**

Para dúvidas ou problemas, consulte o [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
