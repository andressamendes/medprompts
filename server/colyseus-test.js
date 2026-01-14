// Servidor Colyseus de teste para o Virtual Space
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server, Room } from 'colyseus';
import { monitor } from '@colyseus/monitor';

console.warn('🚀 Iniciando servidor Colyseus de teste para Virtual Space...');

const PORT = 2567;
const FRONTEND_URL = 'http://localhost:5173';

// Configurar Express
const app = express();
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Criar servidor HTTP
const server = http.createServer(app);

// Criar servidor Colyseus
const gameServer = new Server({ server });

// Sala que o Virtual Space espera
class VirtualSpaceTestRoom extends Room {
  onCreate(_options) {
    console.warn(`[${this.roomId}] Sala criada: ${this.roomName || 'virtualspace'}`);
    
    // Estado inicial que o Virtual Space espera
    this.setState({
      players: new Map(),
      roomType: this.roomName || 'virtualspace',
      maxPlayers: 50
    });
    
    // Configurar handlers de mensagens que o Virtual Space envia
    this.onMessage('move', (client, data) => {
      console.warn(`[${client.sessionId}] move:`, data);
      // Atualizar posição do jogador
      if (this.state.players.has(client.sessionId)) {
        const player = this.state.players.get(client.sessionId);
        player.x = data.x || player.x;
        player.y = data.y || player.y;
        player.direction = data.direction || player.direction;
        player.isMoving = data.isMoving !== undefined ? data.isMoving : player.isMoving;
        
        // Broadcast para outros jogadores
        this.broadcast('player_moved', {
          sessionId: client.sessionId,
          ...data
        }, { except: client });
      }
    });
    
    this.onMessage('stop', (client, data) => {
      console.warn(`[${client.sessionId}] stop:`, data);
      if (this.state.players.has(client.sessionId)) {
        const player = this.state.players.get(client.sessionId);
        player.isMoving = false;
        this.broadcast('player_stopped', { sessionId: client.sessionId });
      }
    });
    
    this.onMessage('chat', (client, data) => {
      console.warn(`[${client.sessionId}] chat:`, data);
      const chatMessage = {
        sessionId: client.sessionId,
        text: data.text,
        timestamp: Date.now()
      };
      this.broadcast('chat', chatMessage);
    });
    
    this.onMessage('interact', (client, data) => {
      console.warn(`[${client.sessionId}] interact:`, data);
      this.broadcast('interaction', {
        sessionId: client.sessionId,
        ...data
      });
    });
    
    this.onMessage('status', (client, data) => {
      console.warn(`[${client.sessionId}] status:`, data);
      // Atualizar status do jogador
      if (this.state.players.has(client.sessionId)) {
        this.state.players.get(client.sessionId).status = data.status;
      }
    });
    
    // Heartbeat para manter conexão
    this.setSimulationInterval(() => {
      // Nada a fazer aqui, apenas manter a sala ativa
    }, 1000);
  }
  
  onJoin(client, _options) {
    console.warn(`[${client.sessionId}] Jogador entrou na sala`);
    
    // Criar jogador com dados iniciais
    const playerData = {
      userId: client.sessionId,
      name: _options.name || `Player_${client.sessionId.slice(0, 4)}`,
      level: _options.level || 1,
      x: _options.x || 400,
      y: _options.y || 300,
      direction: 'down',
      isMoving: false,
      status: 'active',
      avatar: _options.avatar || 'default'
    };
    
    this.state.players.set(client.sessionId, playerData);
    
    // Notificar outros jogadores
    this.broadcast('player_joined', playerData, { except: client });
    
    // Enviar estado atual para o novo jogador
    client.send('stateChange', Array.from(this.state.players.entries()));
  }
  
  onLeave(client, _consented) {
    console.warn(`[${client.sessionId}] Jogador saiu da sala`);
    
    // Remover jogador
    this.state.players.delete(client.sessionId);
    
    // Notificar outros jogadores
    this.broadcast('player_left', { sessionId: client.sessionId });
  }
  
  onDispose() {
    console.warn(`[${this.roomId}] Sala destruída`);
  }
}

// Registrar salas que o Virtual Space tenta acessar
gameServer.define('lobby', VirtualSpaceTestRoom);
gameServer.define('emergency', VirtualSpaceTestRoom);
gameServer.define('ward', VirtualSpaceTestRoom);
gameServer.define('icu', VirtualSpaceTestRoom);
gameServer.define('surgical', VirtualSpaceTestRoom);
gameServer.define('virtualspace', VirtualSpaceTestRoom); // Sala padrão

// Painel de monitoramento
app.use('/colyseus', monitor());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Colyseus Test Server for Virtual Space',
    uptime: process.uptime(),
    rooms: gameServer.rooms ? gameServer.rooms.length : 0,
    clients: gameServer.clients ? gameServer.clients.length : 0,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
gameServer.listen(PORT);
console.warn(`✅ Servidor Colyseus rodando na porta ${PORT}`);
console.warn(`📊 Monitor: http://localhost:${PORT}/colyseus`);
console.warn(`🏥 Health: http://localhost:${PORT}/health`);
console.warn(`🎮 Salas disponíveis: lobby, emergency, ward, icu, surgical, virtualspace`);
console.warn('\nPressione Ctrl+C para parar\n');

// Tratamento de erros
process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
});

process.on('unhandledRejection', (_reason, _promise) => {
  console.error('Promise rejeitada:', _reason);
});