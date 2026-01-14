// Teste de conexão do Virtual Space
import { Client } from 'colyseus.js';

async function testConnection() {
  console.log('🧪 Testando conexão do Virtual Space com Colyseus...');
  
  try {
    // Criar cliente Colyseus
    const client = new Client('ws://localhost:2567');
    console.log('✅ Cliente Colyseus criado');
    
    // Tentar conectar com timeout
    const timeout = setTimeout(() => {
      console.log('❌ Timeout: Servidor não respondeu em 10 segundos');
      process.exit(1);
    }, 10000);
    
    console.log('🔗 Tentando conectar à sala "lobby"...');
    
    try {
      const room = await client.joinOrCreate('lobby', {
        token: 'test-token',
        x: 400,
        y: 300,
        avatar: 'default'
      });
      
      clearTimeout(timeout);
      console.log(`✅ Conectado à sala: ${room.id}`);
      console.log(`📊 Session ID: ${room.sessionId}`);
      
      // Sair da sala
      room.leave();
      console.log('✅ Desconectado da sala');
      
      console.log('🎉 Teste concluído com sucesso!');
      process.exit(0);
      
    } catch (error) {
      clearTimeout(timeout);
      console.log(`❌ Erro ao conectar: ${error.message}`);
      console.log('💡 Possíveis causas:');
      console.log('1. Servidor Colyseus não está rodando');
      console.log('2. Sala "lobby" não está definida no servidor');
      console.log('3. Erro de autenticação (token)');
      console.log('4. Problema de CORS');
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`❌ Erro ao criar cliente: ${error.message}`);
    console.log('💡 Verifique se colyseus.js está instalado');
    process.exit(1);
  }
}

// Executar teste
testConnection();

