import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

// Silenciar logs durante testes
logger.transports.forEach((t) => (t.silent = true));

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ Banco de testes configurado');
  } catch (error:  any) {
    console.error('❌ Erro ao configurar banco de testes:', error.message);
    throw error;
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Banco de testes limpo');
  } catch (error: any) {
    console.error('❌ Erro ao limpar banco de testes:', error.message);
  }
});

// Limpar tabelas entre testes NA ORDEM CORRETA
afterEach(async () => {
  if (sequelize) {
    try {
      // ORDEM IMPORTANTE: deletar tabelas dependentes ANTES das principais
      await sequelize.query('DELETE FROM user_progress CASCADE');
      await sequelize.query('DELETE FROM user_badges CASCADE');
      await sequelize. query('DELETE FROM user_missions CASCADE');
      await sequelize. query('DELETE FROM prompts CASCADE');
      await sequelize.query('DELETE FROM study_sessions CASCADE');
      await sequelize. query('DELETE FROM badges CASCADE');
      await sequelize. query('DELETE FROM daily_missions CASCADE');
      // Users por último (é referenciado por outras tabelas)
      await sequelize.query('DELETE FROM users CASCADE');
    } catch (error) {
      // Ignorar erros de cleanup
    }
  }
});