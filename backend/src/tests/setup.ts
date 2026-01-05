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

// Limpar apenas tabelas dependentes, MANTER users
afterEach(async () => {
  if (sequelize) {
    try {
      // NÃO deletar users - deixar para o próximo teste reusar
      await sequelize.query('DELETE FROM user_progress');
      await sequelize.query('DELETE FROM user_badges');
      await sequelize.query('DELETE FROM user_missions');
      await sequelize.query('DELETE FROM prompts');
      await sequelize. query('DELETE FROM study_sessions');
      await sequelize.query('DELETE FROM badges');
      await sequelize.query('DELETE FROM daily_missions');
    } catch (error) {
      // Ignorar erros de cleanup
    }
  }
});