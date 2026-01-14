// Servidor Colyseus SIMPLES para testes do Virtual Space
// Usando CommonJS para evitar problemas de importação

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server, Room } = require('colyseus');
const { monitor } = require('@colyseus/monitor');

console.log('🚀 Iniciando servidor Colyseus SIMPLES para Virtual Space...');

const PORT = 2567;
// Permitir conexões do GitHub Pages e localhost
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://localhost:5173',
  'https://andressamendes.github.io',
  'http://andressamendes.github.io',
  'https://medprompts.vercel.app',
  'http://medprompts.vercel.app'
];

// Configurar Express
const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️  Bloqueada origem não permitida: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Criar servidor HTTP
const server = http.createServer(app);

// Criar servidor Colyseus
const gameServer = new Server({ server });

// Sala que o Virtual Space espera
class VirtualSpaceTestRoom extends Room {
  // Aceitar qualquer conexão (para testes)
  async onAuth(client, options, request) {
    console.log(`[${client.sessionId}] Tentativa de conexão:`, {
      name: options.name || 'Anonymous',
      level: options.level || 1
    });
    
    // Para testes, aceitar qualquer conexão
    // Em produção, você deve validar o token JWT aqui
    return true;
  }
  
  onCreate(options) {
    console.log(`[${this.roomId}] Sala criada: ${this.roomName || 'virtualspace'}`);
    
    // Estado inicial que o Virtual Space espera
    this.setState({
      players: new Map(),
      roomType: this.roomName || 'virtualspace',
      maxPlayers: 50
    });
    
    // Configurar handlers de mensagens básicas
    this.onMessage('move', (client, data) => {
      console.log(`[${client.sessionId}] move:`, data);
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
    
    this.onMessage('chat', (client, data) => {
      console.log(`[${client.sessionId}] chat:`, data);
      const chatMessage = {
        sessionId: client.sessionId,
        text: data.text,
        timestamp: Date.now()
      };
      this.broadcast('chat', chatMessage);
    });
    
    // Heartbeat para manter conexão
    this.setSimulationInterval(() => {
      // Nada a fazer aqui, apenas manter a sala ativa
    }, 1000);
  }
  
  onJoin(client, options) {
    console.log(`[${client.sessionId}] Jogador entrou na sala`);
    
    // Criar jogador com dados iniciais
    const playerData = {
      userId: client.sessionId,
      name: options.name || `Player_${client.sessionId.slice(0, 4)}`,
      level: options.level || 1,
      x: options.x || 400,
      y: options.y || 300,
      direction: 'down',
      isMoving: false,
      status: 'active',
      avatar: options.avatar || 'default'
    };
    
    this.state.players.set(client.sessionId, playerData);
    
    // Notificar outros jogadores
    this.broadcast('player_joined', playerData, { except: client });
    
    // Enviar estado atual para o novo jogador
    client.send('stateChange', Array.from(this.state.players.entries()));
  }
  
  onLeave(client, consented) {
    console.log(`[${client.sessionId}] Jogador saiu da sala`);
    
    // Remover jogador
    this.state.players.delete(client.sessionId);
    
    // Notificar outros jogadores
    this.broadcast('player_left', { sessionId: client.sessionId });
  }
  
  onDispose() {
    console.log(`[${this.roomId}] Sala destruída`);
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
    server: 'Colyseus Simple Test Server',
    uptime: process.uptime(),
    rooms: gameServer.rooms ? gameServer.rooms.length : 0,
    clients: gameServer.clients ? gameServer.clients.length : 0,
    timestamp: new Date().toISOString(),
    allowedOrigins: ALLOWED_ORIGINS
  });
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({
    message: 'Colyseus simple test server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      monitor: '/colyseus',
      test: '/test'
    }
  });
});

// Iniciar servidor
gameServer.listen(PORT);
console.log(`✅ Servidor Colyseus SIMPLES rodando na porta ${PORT}`);
console.log(`📊 Monitor: http://localhost:${PORT}/colyseus`);
console.log(`🏥 Health: http://localhost:${PORT}/health`);
console.log(`🧪 Test: http://localhost:${PORT}/test`);
console.log(`🎮 Salas disponíveis: lobby, emergency, ward, icu, surgical, virtualspace`);
console.log(`🌐 Origens permitidas: ${ALLOWED_ORIGINS.join(', ')}`);
console.log('\n⚠️  SERVIDOR DE TESTES - NÃO USE EM PRODUÇÃO ⚠️');
console.log('\nPressione Ctrl+C para parar\n');

// Tratamento de erros
process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada:', reason);
});