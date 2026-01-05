import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

// Silenciar logs durante testes
logger.transports.forEach((t) => (t.silent = true));

beforeAll(async () => {
  try {
    // Conectar ao banco de testes
    await sequelize.authenticate();
    
    // Sincronizar modelos (criar tabelas)
    await sequelize.sync({ force: true });
    
    console.log('✅ Banco de testes configurado');
  } catch (error:  any) {
    console.error('❌ Erro ao configurar banco de testes:', error.message);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Limpar banco e fechar conexão
    await sequelize.drop();
    await sequelize.close();
    console.log('✅ Banco de testes limpo');
  } catch (error: any) {
    console.error('❌ Erro ao limpar banco de testes:', error.message);
  }
});

// Limpar tabelas entre testes
afterEach(async () => {
  const models = Object.values(sequelize.models);
  for (const model of models) {
    await model.destroy({ where: {}, truncate: true, cascade: true });
  }
});