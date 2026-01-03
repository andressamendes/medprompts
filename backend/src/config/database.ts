import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'medprompts',
  DB_USER = 'postgres',
  DB_PASSWORD = '',
  DB_POOL_MAX = '20',
  DB_POOL_MIN = '5',
  NODE_ENV = 'development'
} = process.env;

// Configuração da conexão PostgreSQL com pool otimizado
const sequelize = new Sequelize({
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  dialect: 'postgres',
  
  // Pool de conexões para performance
  pool: {
    max: parseInt(DB_POOL_MAX, 10),
    min: parseInt(DB_POOL_MIN, 10),
    acquire: 30000, // Timeout para adquirir conexão (30s)
    idle: 10000     // Tempo que conexão pode ficar idle (10s)
  },

  // Logging condicional baseado no ambiente
  logging: NODE_ENV === 'development' 
    ? (msg) => logger.debug(msg)
    : false,

  // Configurações de segurança e performance
  define: {
    timestamps: true,           // createdAt e updatedAt automáticos
    underscored: true,          // snake_case para nomes de colunas
    freezeTableName: true,      // Não pluraliza nomes de tabelas
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },

  // Retry automático em caso de falha
  retry: {
    max: 3,
    timeout: 3000,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNREFUSED/,
      /ENOTFOUND/
    ]
  }
});

// Função para testar conexão com o banco
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexão com PostgreSQL estabelecida com sucesso');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao conectar com PostgreSQL:', error);
    return false;
  }
};

// Função para sincronizar modelos com o banco (apenas em desenvolvimento)
export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    if (NODE_ENV === 'production' && force) {
      logger.warn('⚠️ Sync com force=true bloqueado em produção para evitar perda de dados');
      return;
    }

    await sequelize.sync({ force, alter: NODE_ENV === 'development' });
    logger.info(`✅ Banco de dados sincronizado ${force ? '(force)' : '(alter)'}`);
  } catch (error) {
    logger.error('❌ Erro ao sincronizar banco de dados:', error);
    throw error;
  }
};

// Função para fechar conexão (usado no graceful shutdown)
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('✅ Conexão com banco de dados fechada');
  } catch (error) {
    logger.error('❌ Erro ao fechar conexão:', error);
    throw error;
  }
};

export default sequelize;
