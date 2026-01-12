# 🚀 Deploy do Virtual Space no Render.com

Guia passo a passo para fazer o deploy do servidor Colyseus no Render.com.

## ✅ Pré-requisitos

- [x] Código enviado para o GitHub (main branch)
- [x] Arquivo `render.yaml` na raiz do projeto (✅ já criado!)
- [x] Conta no [Render.com](https://render.com) (gratuita)

---

## 📝 Passo a Passo

### 1. Criar Conta no Render.com

1. Acesse https://render.com
2. Clique em **"Get Started"**
3. Faça login com GitHub (recomendado)
4. Autorize o Render a acessar seus repositórios

---

### 2. Criar o Deploy via Blueprint

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Blueprint"**
3. Conecte seu repositório do GitHub:
   - Se não aparecer, clique em "Configure account" e autorize o repositório `medprompts`
4. Selecione o repositório **`medprompts`**
5. Clique em **"Connect"**

O Render detectará automaticamente o arquivo `render.yaml` e criará:
- ✅ **Web Service** (servidor Colyseus)
- ✅ **PostgreSQL Database** (banco de dados)

---

### 3. Configurar Variáveis de Ambiente

Após a criação dos serviços, você precisa configurar manualmente:

#### No serviço `medprompts-colyseus`:

1. Clique no serviço **"medprompts-colyseus"**
2. Vá em **"Environment"** (menu lateral)
3. Adicione a variável:
   ```
   Key: FRONTEND_URL
   Value: https://andressamendes.github.io
   ```
4. Clique em **"Save Changes"**

**Importante:** As outras variáveis já foram configuradas automaticamente:
- ✅ `DATABASE_URL` - Conectado ao PostgreSQL automaticamente
- ✅ `JWT_SECRET` - Gerado automaticamente
- ✅ `NODE_ENV=production`
- ✅ `PORT=2567`

---

### 4. Aguardar o Deploy

O Render vai:
1. ✅ Clonar o repositório
2. ✅ Instalar dependências (`npm install`)
3. ✅ Compilar TypeScript (`npm run build`)
4. ✅ Iniciar o servidor (`npm start`)

Tempo estimado: **3-5 minutos**

Você pode acompanhar os logs em tempo real clicando em **"Logs"**.

---

### 5. Copiar URL do Servidor

Quando o deploy terminar:

1. Vá até a aba **"Settings"**
2. Copie a **URL do serviço**, algo como:
   ```
   https://medprompts-colyseus.onrender.com
   ```

3. **Importante:** Para WebSocket, use `wss://` em vez de `https://`:
   ```
   wss://medprompts-colyseus.onrender.com
   ```

---

### 6. Configurar GitHub Actions

Para que o GitHub Pages use o servidor em produção:

1. Vá no seu repositório GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**
4. Adicione:
   ```
   Name: VITE_COLYSEUS_URL
   Secret: wss://medprompts-colyseus.onrender.com
   ```
   *(Use a URL do seu servidor Render)*

5. Clique em **"Add secret"**

---

### 7. Fazer um Commit para Atualizar

O GitHub Actions já está configurado para usar a variável. Basta fazer um commit:

```bash
git add .
git commit -m "chore: configure Colyseus server URL for production"
git push
```

O GitHub Actions vai rodar automaticamente e fazer o build com a URL correta!

---

### 8. Testar 🎮

1. Aguarde o deploy do GitHub Pages (1-2 minutos)
2. Acesse: https://andressamendes.github.io/medprompts
3. Faça login
4. Navegue para **Virtual Space** na navbar
5. Se tudo estiver certo, você verá:
   - ✅ "Connecting to Virtual Space..."
   - ✅ "Successfully connected!"
   - ✅ O jogo carregando

**Primeira conexão pode demorar 30-60 segundos** (Render free tier tem cold start)

---

## 🔍 Verificações

### Testar se o servidor está online:

```bash
curl https://medprompts-colyseus.onrender.com/health
```

Deve retornar:
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2026-01-12T..."
}
```

### Ver logs do servidor:

1. Dashboard do Render
2. Clique em **"medprompts-colyseus"**
3. Clique em **"Logs"**

---

## ⚠️ Troubleshooting

### Problema: "Connection timeout"

**Causa:** Servidor está "dormindo" (free tier)

**Solução:**
- Primeira conexão demora 30-60 segundos
- Aguarde e tente novamente
- Após "acordar", fica rápido

---

### Problema: "Database connection failed"

**Causa:** PostgreSQL não configurado

**Solução:**
1. Verifique se o serviço `medprompts-db` foi criado
2. Vá em Environment Variables
3. Verifique se `DATABASE_URL` está presente
4. Se não, vá em Render dashboard → medprompts-db → Connection → Copie "Internal Database URL"
5. Adicione como `DATABASE_URL` no serviço web

---

### Problema: "JWT verification failed"

**Causa:** JWT_SECRET diferente

**Solução:**
- O `JWT_SECRET` gerado pelo Render deve ser o mesmo usado no frontend
- Se necessário, gere um secret manualmente:
  ```bash
  openssl rand -base64 64
  ```
- Adicione em ambos: frontend e servidor Colyseus

---

### Problema: Build falha no Render

**Causa:** Dependências ou TypeScript com erro

**Solução:**
1. Verifique os logs do build
2. Teste localmente:
   ```bash
   cd server
   npm install
   npm run build
   ```
3. Corrija erros e faça push

---

## 💰 Custos

**Plano Free (Gratuito):**
- ✅ Web Service: 750 horas/mês (suficiente!)
- ✅ PostgreSQL: 90 dias grátis, depois $7/mês

**Limitações do Free Tier:**
- Servidor dorme após 15 min de inatividade
- Cold start de 30-60s na primeira conexão
- 0.1 CPU / 512MB RAM

**Upgrade (Opcional) - $7/mês:**
- Servidor sempre ativo (0% cold start)
- 0.5 CPU / 512MB RAM

---

## 🎉 Pronto!

Seu servidor Colyseus está em produção!

Agora os usuários podem:
- ✅ Entrar no Virtual Space
- ✅ Ver outros jogadores online
- ✅ Interagir em tempo real
- ✅ Ganhar XP e progredir

---

## 📚 Referências

- [Render Documentation](https://render.com/docs)
- [Colyseus Docs](https://docs.colyseus.io/)
- [Server README](./server/README.md)

---

**Dúvidas?** Abra uma issue no GitHub ou consulte os logs do Render.
