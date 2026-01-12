# 🧪 Guia de Teste - Virtual Space

Guia rápido para testar o Virtual Space multiplayer localmente.

## ⚡ Início Rápido

### 1. Configure o Banco de Dados

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco (se não existir)
CREATE DATABASE medprompts;

# Conecte ao banco
\c medprompts

# Execute a migração
\i backend/src/migrations/006_create_virtual_space_tables.sql

# Verifique as tabelas
\dt
```

Você deve ver: `room_sessions`, `user_presence`, `collaboration_events`, `users`

### 2. Configure o Servidor Colyseus

```bash
cd server

# Copie o .env de exemplo (se ainda não fez)
cp .env.example .env

# Edite server/.env e configure:
# - JWT_SECRET (DEVE ser igual ao do app principal)
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Instale dependências (se ainda não fez)
npm install

# Inicie o servidor
npm run dev
```

✅ Servidor rodando em `http://localhost:2567`
✅ Monitor em `http://localhost:2567/colyseus`

### 3. Inicie a Aplicação Principal

```bash
# Em outro terminal, na raiz do projeto
npm run dev
```

✅ App rodando em `http://localhost:5173/medprompts`

## 🎮 Teste Solo

1. Acesse `http://localhost:5173/medprompts`
2. Faça login ou crie uma conta
3. Clique no card "Virtual Space" ou vá para `/virtual-space`
4. Você deve ver:
   - ✅ Canvas do Phaser carregando
   - ✅ Seu player (círculo verde com jaleco)
   - ✅ Contador "1 jogador online"
   - ✅ Chat (canto inferior esquerdo)
   - ✅ Lista de jogadores (canto superior direito)
   - ✅ Seletor de salas (topo central)

5. Teste os controles:
   - **WASD ou Setas**: Mover
   - **Chat**: Digite uma mensagem
   - **Salas**: Clique em outras salas

## 👥 Teste Multiplayer (2+ Jogadores)

### Método 1: Múltiplos Navegadores

1. **Chrome normal**:
   - Login com usuário A
   - Entre no Virtual Space

2. **Chrome (modo anônimo)**:
   - Login com usuário B (diferente!)
   - Entre no Virtual Space

3. **Verifique**:
   - ✅ Você vê 2 players na tela
   - ✅ Player remoto (azul)
   - ✅ Movimentos sincronizam
   - ✅ Chat funciona entre os dois
   - ✅ Contador mostra "2 jogadores"

### Método 2: Múltiplos Dispositivos

1. **Computador principal**: Login e entre
2. **Celular/Tablet**: Acesse `http://[SEU_IP]:5173/medprompts`
   - Descubra seu IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
   - Exemplo: `http://192.168.1.100:5173/medprompts`
3. Login com conta diferente
4. Teste interação multiplayer

## ✅ Checklist de Testes

### Teste Básico
- [ ] Servidor Colyseus inicia sem erros
- [ ] App frontend carrega
- [ ] Login funciona
- [ ] Virtual Space carrega
- [ ] Player aparece na tela
- [ ] Movimentação funciona (WASD/setas)
- [ ] Câmera segue o player

### Teste de UI
- [ ] Chat: enviar e receber mensagens
- [ ] Player List: mostra todos conectados
- [ ] Online Counter: conta correta
- [ ] Room Selector: muda de sala
- [ ] XP Notifications: aparecem ao interagir

### Teste Multiplayer
- [ ] 2+ players conectam simultaneamente
- [ ] Players remotos aparecem (círculos azuis)
- [ ] Posições sincronizam em tempo real
- [ ] Chat broadcast funciona
- [ ] Mudança de sala funciona
- [ ] Desconexão remove player da lista

### Teste de Database
```sql
-- Verifique sessões ativas
SELECT * FROM user_presence;

-- Verifique sessões recentes
SELECT * FROM room_sessions ORDER BY joined_at DESC LIMIT 5;

-- Verifique eventos
SELECT * FROM collaboration_events ORDER BY created_at DESC LIMIT 10;
```

## 🐛 Problemas Comuns

### "Failed to connect to game server"

**Causa**: Servidor Colyseus não está rodando

**Solução**:
```bash
cd server
npm run dev
```

### "No authentication token available"

**Causa**: Não está logado ou JWT expirou

**Solução**:
1. Faça logout
2. Faça login novamente
3. Tente acessar Virtual Space

### "Database connection failed"

**Causa**: PostgreSQL não está rodando ou credenciais incorretas

**Solução**:
1. Inicie PostgreSQL: `pg_ctl start` ou `brew services start postgresql`
2. Verifique credenciais em `server/.env`
3. Teste conexão: `psql -U postgres -d medprompts -c "SELECT 1;"`

### Players não aparecem

**Causa**: WebSocket não conectou ou estado não sincronizou

**Solução**:
1. Abra DevTools (F12)
2. Verifique aba Network > WS (WebSocket)
3. Deve ter conexão ativa para `ws://localhost:2567`
4. Recarregue a página

### Chat não funciona

**Causa**: Usuários em salas diferentes

**Solução**:
- Chat funciona apenas para usuários na **mesma sala**
- Verifique que ambos estão na mesma sala (Lobby, Emergência, etc)

## 📊 Monitor do Servidor

Acesse `http://localhost:2567/colyseus` para ver:

- **Rooms**: Salas ativas e player count
- **State**: Estado interno das salas
- **Clients**: Conexões ativas
- **Messages**: Mensagens trocadas

## 🎯 Teste de Performance

### Teste de Carga (10+ players)

1. Abra o monitor: `http://localhost:2567/colyseus`
2. Abra 10 abas anônimas
3. Login com contas diferentes em cada
4. Entre no Virtual Space em todas
5. Observe:
   - Latência das mensagens
   - FPS do jogo (deve estar ~60)
   - Uso de CPU/memória

### Teste de Stress (100 mensagens)

```javascript
// No console do browser (F12)
for (let i = 0; i < 100; i++) {
  setTimeout(() => {
    document.querySelector('input[type="text"]').value = `Teste ${i}`;
    document.querySelector('button[type="submit"]').click();
  }, i * 100);
}
```

## 📝 Reportando Bugs

Se encontrar bugs, anote:

1. **Steps to reproduce**: Como reproduzir
2. **Expected**: O que deveria acontecer
3. **Actual**: O que aconteceu
4. **Browser**: Chrome/Firefox/Safari + versão
5. **Console errors**: Erros no DevTools (F12)
6. **Server logs**: Logs do terminal onde rodou `npm run dev`

Exemplo:
```
Bug: Players não sincronizam posição

Steps:
1. Abra 2 navegadores
2. Entre com users diferentes
3. Mova um player

Expected: Player remoto deve se mover também
Actual: Player remoto fica parado

Browser: Chrome 120
Console: TypeError: player.updatePosition is not a function
Server: [error] Room state not found
```

## 🎉 Teste Bem-Sucedido

Se tudo funcionar, você verá:

✅ Servidor rodando sem erros
✅ App carrega normalmente
✅ Players conectam e aparecem
✅ Movimentação sincroniza
✅ Chat funciona
✅ Troca de sala funciona
✅ XP é salvo no banco
✅ Leaderboard atualiza

**Parabéns! O Virtual Space está funcionando perfeitamente!** 🎮✨

## 🚀 Próximos Passos

Depois de validar localmente:

1. **Deploy do servidor**: Heroku, Railway, DigitalOcean
2. **Deploy do frontend**: Vercel, Netlify, GitHub Pages
3. **WSS (WebSocket seguro)**: Configure SSL/TLS
4. **Domínio**: Configure DNS
5. **Monitoring**: Configure logs e alertas
6. **Backup**: Configure backup do banco

---

**Happy Testing!** 🧪

Para dúvidas, consulte:
- `VIRTUAL_SPACE_COMPLETE.md` - Documentação completa
- `server/README.md` - Documentação do servidor
- Logs do servidor em `server/logs/` (produção)
