# 🛡️ Security Headers & CORS Guide

**FASE 8: Headers de Segurança HTTP e CORS**

---

## 📋 Índice

1. [O que são Security Headers?](#o-que-são-security-headers)
2. [Headers Implementados](#headers-implementados)
3. [CORS (Cross-Origin Resource Sharing)](#cors)
4. [Uso em React](#uso-em-react)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 O que são Security Headers?

**Security Headers** são cabeçalhos HTTP que instruem o navegador a ativar proteções de segurança.

### Previnem:

- ✅ **Clickjacking** (X-Frame-Options)
- ✅ **MIME Sniffing** (X-Content-Type-Options)
- ✅ **XSS** (X-XSS-Protection, CSP)
- ✅ **Man-in-the-Middle** (HSTS)
- ✅ **Information Leakage** (Referrer-Policy)
- ✅ **Feature Abuse** (Permissions-Policy)

**OWASP Mapping:**
- A05:2021 (Security Misconfiguration) - ✅ Resolvido

---

## 📝 Headers Implementados

### 1. X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

**O que faz:** Previne MIME sniffing (navegador "adivinhar" tipo de arquivo).

**Ataque prevenido:**
```html
<!-- Atacante carrega "imagem" que na verdade é JavaScript -->
<img src="malicious.jpg">
<!-- Sem nosniff: navegador pode executar como JS -->
<!-- Com nosniff: navegador força content-type correto -->
```

### 2. X-Frame-Options

```
X-Frame-Options: DENY
```

**O que faz:** Previne que site seja carregado em iframe/frame.

**Ataque prevenido (Clickjacking):**
```html
<!-- Site malicioso -->
<iframe src="https://medprompts.com"></iframe>
<div style="opacity: 0; position: absolute">
  <button>Clique aqui para ganhar iPhone!</button>
</div>
<!-- Usuário clica achando que vai ganhar iPhone, -->
<!-- mas na verdade clica em botão invisível do iframe -->
```

**Valores possíveis:**
- `DENY` - Nunca pode ser carregado em frame
- `SAMEORIGIN` - Só pode ser carregado por mesmo domínio
- `ALLOW-FROM uri` - Permite domínios específicos (deprecated)

### 3. X-XSS-Protection

```
X-XSS-Protection: 1; mode=block
```

**O que faz:** Ativa proteção XSS do navegador (legacy).

**Nota:** Navegadores modernos usam CSP. Mas mantemos para compatibilidade.

### 4. Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

**O que faz:** Controla quanto de informação do Referer é enviado.

**Exemplo:**
```
Usuário em: https://medprompts.com/profile?user=123
Clica link: https://example.com

strict-origin-when-cross-origin:
  Referer enviado: https://medprompts.com (sem /profile?user=123)

no-referrer:
  Referer enviado: (nenhum)

unsafe-url:
  Referer enviado: https://medprompts.com/profile?user=123
```

**Valores comuns:**
- `no-referrer` - Nunca envia referer
- `strict-origin-when-cross-origin` - Envia apenas origin em cross-origin
- `same-origin` - Envia referer apenas para mesmo domínio

### 5. Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**O que faz:** Controla quais features o navegador pode usar.

**Features bloqueadas:**
- `camera=()` - Sem acesso à câmera
- `microphone=()` - Sem acesso ao microfone
- `geolocation=()` - Sem acesso à localização
- `payment=()` - Sem API de pagamento
- `usb=()` - Sem acesso USB

**Features permitidas:**
- `autoplay=(self)` - Autoplay apenas no mesmo domínio
- `fullscreen=(self)` - Fullscreen apenas no mesmo domínio

### 6. Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**O que faz:** Força navegador a usar HTTPS sempre.

**Ataque prevenido (SSL Strip):**
```
1. Usuário digita: medprompts.com (sem https://)
2. Navegador tenta: http://medprompts.com
3. Atacante intercepta e mantém HTTP
4. Usuário usa site em HTTP (inseguro)

COM HSTS:
1. Navegador lembra: medprompts.com sempre usa HTTPS
2. Força: https://medprompts.com
3. Atacante não consegue interceptar
```

**Parâmetros:**
- `max-age=31536000` - Cache por 1 ano
- `includeSubDomains` - Aplica a subdomínios
- `preload` - Adiciona à lista de preload do navegador

**⚠️ Apenas em produção com HTTPS!**

### 7. Content-Security-Policy

```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

**Veja [CSP_GUIDE.md](./CSP_GUIDE.md) para detalhes completos.**

---

## 🌐 CORS (Cross-Origin Resource Sharing)

### O que é CORS?

CORS controla quais domínios podem fazer requisições ao seu backend.

### Configuração Implementada

**Desenvolvimento:**
```typescript
{
  allowedOrigins: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', ...],
  credentials: true,
  maxAge: 86400 // 24 horas
}
```

**Produção:**
```typescript
{
  allowedOrigins: [
    'https://andressamendes.github.io'
  ],
  // ... resto igual
}
```

### Como Funciona

**Preflight Request (OPTIONS):**
```
Browser: OPTIONS /api/users
         Origin: https://example.com
         Access-Control-Request-Method: POST

Server:  Access-Control-Allow-Origin: https://example.com
         Access-Control-Allow-Methods: POST
         Access-Control-Allow-Headers: Content-Type

Browser: ✅ Permitido, faz POST real
```

**Request Simples:**
```
Browser: GET /api/users
         Origin: https://example.com

Server:  Access-Control-Allow-Origin: https://example.com
         Content-Type: application/json
         { "users": [...] }

Browser: ✅ Permite JavaScript acessar resposta
```

---

## 💻 Uso em React

### 1. Hook useSecureFetch

```tsx
import { useSecureFetch } from '@/hooks/useSecureFetch';

function DataFetcher() {
  const { secureFetch, isLoading, error } = useSecureFetch();

  const fetchData = async () => {
    try {
      // Fetch com validação CORS automática
      const data = await secureFetch<User[]>('https://api.example.com/users');
      console.log(data);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <button onClick={fetchData} disabled={isLoading}>
      {isLoading ? 'Carregando...' : 'Buscar Dados'}
    </button>
  );
}
```

### 2. Hook useCORSValidation

```tsx
import { useCORSValidation } from '@/hooks/useSecureFetch';

function ExternalLinkChecker() {
  const { isOriginAllowed, getCORSConfig } = useCORSValidation();

  const handleClick = (url: string) => {
    const urlObj = new URL(url);

    if (!isOriginAllowed(urlObj.origin)) {
      alert('❌ Domínio não permitido pelo CORS');
      return;
    }

    window.open(url);
  };
}
```

### 3. Hook useSecurityHeaders

```tsx
import { useSecurityHeaders } from '@/hooks/useSecureFetch';

function SecurityDebugger() {
  const { getHeaders, logHeaders, validate } = useSecurityHeaders();

  useEffect(() => {
    // Log headers no console
    logHeaders();

    // Valida configuração
    const result = validate();
    if (!result.isValid) {
      console.error('Erros:', result.errors);
    }
  }, []);
}
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Fetch Seguro com Erro Handling

```tsx
import { useSecureFetch } from '@/hooks/useSecureFetch';
import { toast } from '@/components/ui/use-toast';

function UserList() {
  const { secureFetch, isLoading, error, clearError } = useSecureFetch();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const data = await secureFetch<User[]>('/api/users');
      setUsers(data);
      toast({ title: '✅ Usuários carregados' });
    } catch (err) {
      toast({
        title: '❌ Erro ao carregar',
        description: error?.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div>
      <button onClick={loadUsers} disabled={isLoading}>
        Carregar Usuários
      </button>

      {error && (
        <div className="error">
          {error.message}
          <button onClick={clearError}>Limpar</button>
        </div>
      )}

      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

### Exemplo 2: Validação de Link Externo

```tsx
import { useCORSValidation } from '@/hooks/useSecureFetch';

function SafeExternalLink({ href, children }: { href: string, children: React.ReactNode }) {
  const { isOriginAllowed } = useCORSValidation();

  const handleClick = (e: React.MouseEvent) => {
    try {
      const url = new URL(href);

      if (!isOriginAllowed(url.origin)) {
        e.preventDefault();
        const confirmed = confirm(
          `⚠️ Este link vai para ${url.origin}\n` +
          `Não está na whitelist de domínios confiáveis.\n` +
          `Deseja continuar?`
        );

        if (confirmed) {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    } catch {
      // URL inválida, deixa navegador lidar
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
```

### Exemplo 3: Dashboard de Segurança

```tsx
import { useSecurityHeaders } from '@/hooks/useSecureFetch';

function SecurityDashboard() {
  const { getHeaders, validate } = useSecurityHeaders();
  const [validation, setValidation] = useState(validate());

  useEffect(() => {
    setValidation(validate());
  }, [validate]);

  return (
    <div className="security-dashboard">
      <h2>🛡️ Security Status</h2>

      {validation.isValid ? (
        <div className="success">✅ Configuração válida</div>
      ) : (
        <div className="error">
          ❌ Erros encontrados:
          <ul>
            {validation.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="warning">
          ⚠️ Avisos:
          <ul>
            {validation.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      <details>
        <summary>Headers Ativos</summary>
        <pre>{JSON.stringify(getHeaders(), null, 2)}</pre>
      </details>
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Erro: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** Backend não enviou header CORS correto.

**Solução Backend (Express.js):**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://andressamendes.github.io',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

**Solução Temporária (Dev):**
```typescript
// useSecureFetch com skipCORSValidation
const data = await secureFetch(url, { skipCORSValidation: true });
```

### Erro: "Refused to display in a frame" (Clickjacking)

**Causa:** Site tentou carregar sua página em iframe mas X-Frame-Options bloqueia.

**Solução (se iframe é legítimo):**
```typescript
// security-headers.service.ts
'X-Frame-Options': 'SAMEORIGIN'  // Permite mesmo domínio
// ou
'X-Frame-Options': 'ALLOW-FROM https://trusted.com'
```

**⚠️ Cuidado:** Apenas permita iframes de domínios 100% confiáveis!

### Warning: "unsafe-inline in CSP"

**Causa:** CSP permite scripts inline (menos seguro).

**Solução:** Use estilos/scripts externos ou use hashes:
```typescript
// Gerar hash do script
const hash = crypto.subtle.digest('SHA-256', script);

// CSP
'script-src': ["'self'", "'sha256-HASH_AQUI'"]
```

### HSTS não funciona em localhost

**Causa:** HSTS só funciona com HTTPS. Localhost geralmente é HTTP.

**Solução:** É esperado. HSTS é automaticamente desabilitado em desenvolvimento.

### Erro: "Mixed Content blocked"

**Causa:** Página HTTPS tentou carregar recurso HTTP.

**Solução:**
```typescript
// ❌ HTTP (bloqueado)
<script src="http://example.com/script.js"></script>

// ✅ HTTPS (permitido)
<script src="https://example.com/script.js"></script>

// ✅ Protocol-relative (herda protocolo da página)
<script src="//example.com/script.js"></script>
```

---

## 🔒 Boas Práticas

### 1. Sempre use HTTPS em produção

```typescript
// ✅ BOM
if (window.location.protocol !== 'https:' && NODE_ENV === 'production') {
  window.location.href = `https:${window.location.href.substring(window.location.protocol.length)}`;
}
```

### 2. Whitelist apenas domínios necessários

```typescript
// ❌ RUIM (permite tudo)
allowedOrigins: ['*']

// ✅ BOM (específico)
allowedOrigins: ['https://api.medprompts.com', 'https://cdn.medprompts.com']
```

### 3. Use rel="noopener noreferrer" em links externos

```tsx
// ✅ BOM
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Link Externo
</a>

// ❌ RUIM (vulnerável a window.opener)
<a href="https://example.com" target="_blank">
  Link Externo
</a>
```

### 4. Valide headers em produção

```typescript
useEffect(() => {
  if (NODE_ENV === 'production') {
    const validation = securityHeadersService.validateSecurityConfig();
    if (!validation.isValid) {
      // Enviar para sistema de logging
      console.error('Headers inválidos:', validation.errors);
    }
  }
}, []);
```

---

## 🚀 Próximos Passos

1. ✅ **FASE 8:** Security Headers e CORS completos
2. ⏭️ **FASE 9:** Testes de segurança e documentação final

---

**🔒 Sua aplicação agora tem headers de segurança profissionais!**

Para dúvidas, consulte [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
