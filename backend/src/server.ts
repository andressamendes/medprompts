import app from './app';
import { sequelize } from './config/database';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Conectar ao banco de dados
    logger.info('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    logger.info('✅ Conexão com PostgreSQL estabelecida com sucesso');

    // Sincronizar modelos (em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      logger.info('🔄 Sincronizando modelos do banco de dados...');
      await sequelize.sync({ alter: true });
      logger.info('✅ Banco de dados sincronizado (alter)');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info('======================================================================');
      logger.info('🚀 MedPrompts API v1 iniciada com sucesso!');
      logger.info(`📡 Servidor rodando em: http://localhost:${PORT}`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API Base: http://localhost:${PORT}/api/v1`);
      logger.info('======================================================================');
    });
  } catch (error: any) {
    logger.error('❌ Erro ao iniciar servidor', { error: error.message });
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason: any) => {
  logger.error('❌ Unhandled Rejection', { reason: reason.message || reason });
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception', { error: error.message });
  process.exit(1);
});

// Iniciar servidor
startServer();
