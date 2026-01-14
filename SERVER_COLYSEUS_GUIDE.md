"# Guia do Servidor Colyseus para Virtual Space

Este guia explica como configurar e executar o servidor Colyseus para o Virtual Space do MedPrompts.

## 🎯 Objetivo

O servidor Colyseus fornece funcionalidade multiplayer em tempo real para o Virtual Space, permitindo que múltiplos usuários interajam no mesmo ambiente virtual.

## 📁 Arquivos Disponíveis

### 1. `server/colyseus-simple.js` (RECOMENDADO)
- **Tipo:** CommonJS (sem problemas de importação)
- **Status:** Estável e testado
- **Porta:** 2567
- **Características:**
  - Configuração CORS para GitHub Pages e Vercel
  - Validação de token desabilitada (para testes)
  - Endpoints de health check
  - Painel de monitoramento

### 2. `server/colyseus-test.js`
- **Tipo:** ES Module (pode ter problemas de importação)
- **Status:** Experimental
- **Porta:** 2567
- **Observação:** Pode apresentar erros de importação dependendo da versão do Node.js

## 🚀 Como Executar

### Opção 1: Servidor Simplificado (Recomendado)

```bash
cd server
node colyseus-simple.js
```

### Opção 2: Servidor de Teste

```bash
cd server
node colyseus-test.js
```

## 🔧 Pré-requisitos

1. **Node.js** versão 16 ou superior
2. **Dependências instaladas:**
   ```bash
   cd server
   npm install
   ```

## 🌐 Configuração de CORS

O servidor permite conexões das seguintes origens:
- `http://localhost:5173` (Vite dev server)
- `https://localhost:5173` (Vite com HTTPS)
- `https://andressamendes.github.io` (GitHub Pages)
- `http://andressamendes.github.io` (GitHub Pages HTTP)
- `https://medprompts.vercel.app` (Vercel deployment)
- `http://medprompts.vercel.app` (Vercel HTTP)

## 📊 Endpoints Disponíveis

### 1. Health Check
```
GET http://localhost:2567/health
```
**Resposta:**
```json
{
  "status": "ok",
  "server": "Colyseus Simple Test Server",
  "uptime": 123.45,
  "rooms": 2,
  "clients": 5,
  "timestamp": "2024-01-14T09:39:39.962Z"
}
```

### 2. Painel de Monitoramento
```
GET http://localhost:2567/colyseus
```
Interface web para monitorar salas e clientes conectados.

### 3. Teste Simples
```
GET http://localhost:2567/test
```
Verificação básica do servidor.

## 🎮 Salas Disponíveis

O servidor oferece as seguintes salas (todas usam a mesma lógica):
- `lobby` - Sala principal
- `emergency` - Sala de emergência
- `ward` - Ala hospitalar
- `icu` - UTI
- `surgical` - Sala cirúrgica
- `virtualspace` - Sala padrão

## 🔒 Segurança (Para Testes)

⚠️ **ATENÇÃO:** Este servidor é apenas para testes e desenvolvimento.

### Validação de Token:
- **Produção:** Deve validar tokens JWT
- **Testes:** Validação desabilitada (aceita qualquer conexão)

Para habilitar validação em produção, modifique o método `onAuth` no arquivo do servidor.

## 🐛 Solução de Problemas

### Problema 1: Erro de Importação
```
SyntaxError: Named export 'Room' not found
```
**Solução:** Use `colyseus-simple.js` (CommonJS) em vez de `colyseus-test.js` (ES Module).

### Problema 2: Erro de CORS
```
Access to fetch at 'http://localhost:2567' from origin 'https://andressamendes.github.io' has been blocked by CORS policy
```
**Solução:** Verifique se a origem está na lista `ALLOWED_ORIGINS` no servidor.

### Problema 3: Conexão Recusada
```
WebSocket connection to 'ws://localhost:2567/' failed
```
**Solução:**
1. Verifique se o servidor está rodando
2. Confirme a porta (2567)
3. Verifique firewalls/antivírus

### Problema 4: Token Inválido
```
(4216) Invalid token
```
**Solução:** O servidor de testes ignora tokens. Se estiver usando um servidor com validação, certifique-se de enviar um token JWT válido.

## 📝 Logs do Servidor

O servidor exibe logs no console com informações sobre:
- Conexões de clientes
- Criação/destruição de salas
- Mensagens trocadas
- Erros e exceções

## 🛠️ Personalização

### Adicionar Novas Salas
```javascript
gameServer.define('nova-sala', VirtualSpaceTestRoom);
```

### Modificar Lógica da Sala
Edite a classe `VirtualSpaceTestRoom` para:
- Adicionar novos handlers de mensagem
- Modificar estado inicial
- Implementar lógica personalizada

### Habilitar Validação de Token
```javascript
async onAuth(client, options, request) {
  // Validar token JWT
  const token = options.token;
  if (!isValidToken(token)) {
    throw new Error('Invalid token');
  }
  return getUserFromToken(token);
}
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do servidor
2. Confira a [documentação do Colyseus](https://docs.colyseus.io/)
3. Consulte os arquivos de exemplo no diretório `server/`

## ⚠️ Avisos Importantes

1. **Não use em produção** sem implementar validação de segurança
2. **Monitore o uso** de recursos (CPU, memória, rede)
3. **Faça backup** de dados importantes
4. **Mantenha dependências atualizadas**

---

**Última atualização:** 14 de Janeiro de 2026
**Versão do servidor:** 1.0.0
**Compatível com:** Virtual Space v2.0.0"