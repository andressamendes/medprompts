import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

// Formato customizado para logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Configuração do logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { 
    service: 'medprompts-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      ),
    }),
    // Arquivo de erro
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Arquivo geral
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// Em produção, não loga para console
if (process.env.NODE_ENV === 'production') {
  logger.remove(logger.transports[0]);
}
