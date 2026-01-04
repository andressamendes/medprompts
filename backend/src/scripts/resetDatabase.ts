import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

const resetDatabase = async () => {
  try {
    logger.info('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    logger.info('✅ Conexão estabelecida');

    logger.info('🗑️ Dropando tabela users manualmente...');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
    logger.info('✅ Tabela users removida');

    logger.info('🔄 Sincronizando modelos (force: true)...');
    await sequelize.sync({ force: true });
    logger.info('✅ Tabelas recriadas com sucesso!');

    logger.info('🎉 Banco de dados resetado!');
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Erro ao resetar banco', { error: error.message });
    process.exit(1);
  }
};

resetDatabase();
