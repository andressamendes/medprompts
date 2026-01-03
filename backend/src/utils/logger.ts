import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const {
  LOG_LEVEL = 'info',
  LOG_FILE_PATH = 'logs/',
  NODE_ENV = 'development'
} = process.env;

// Formato customizado para logs legíveis
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  
  // Adiciona metadata se existir
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Configuração de cores para console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Transport para console (desenvolvimento)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  )
});

// Transport para arquivo de erros com rotação diária
const errorFileTransport = new DailyRotateFile({
  filename: path.join(LOG_FILE_PATH, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',        // Máximo 20MB por arquivo
  maxFiles: '30d',       // Mantém logs por 30 dias
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  zippedArchive: true    // Comprime arquivos antigos
});

// Transport para todos os logs com rotação diária
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(LOG_FILE_PATH, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  zippedArchive: true
});

// Transport para logs de auditoria (ações críticas)
const auditFileTransport = new DailyRotateFile({
  filename: path.join(LOG_FILE_PATH, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',       // Auditoria mantida por 90 dias
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  zippedArchive: true
});

// Configuração dos transports baseado no ambiente
const transports: winston.transport[] = [
  errorFileTransport,
  combinedFileTransport
];

// Em desenvolvimento, adiciona console
if (NODE_ENV === 'development') {
  transports.push(consoleTransport);
}

// Criação do logger principal
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'medprompts-api',
    environment: NODE_ENV 
  },
  transports,
  // Previne crash em caso de erro no próprio logger
  exitOnError: false
});

// Logger específico para auditoria
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'medprompts-audit',
    environment: NODE_ENV 
  },
  transports: [auditFileTransport],
  exitOnError: false
});

/**
 * Log de ações de auditoria (login, alteração de dados sensíveis, etc)
 * @param action - Ação realizada
 * @param userId - ID do usuário
 * @param metadata - Dados adicionais
 */
export const logAudit = (
  action: string, 
  userId: string | undefined, 
  metadata?: any
): void => {
  auditLogger.info(action, {
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Log de requisições HTTP
 * @param method - Método HTTP
 * @param url - URL da requisição
 * @param statusCode - Código de status HTTP
 * @param responseTime - Tempo de resposta em ms
 * @param userId - ID do usuário (opcional)
 */
export const logHTTP = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  userId?: string
): void => {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';
  
  logger.log(level, `${method} ${url} ${statusCode}`, {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userId: userId || 'anonymous'
  });
};

/**
 * Log de erros de banco de dados
 * @param operation - Operação sendo realizada
 * @param error - Erro capturado
 */
export const logDatabaseError = (operation: string, error: any): void => {
  logger.error(`Database error during ${operation}`, {
    operation,
    error: error.message,
    stack: error.stack,
    code: error.code
  });
};

/**
 * Log de tentativas de autenticação
 * @param email - Email do usuário
 * @param success - Se autenticação foi bem-sucedida
 * @param ip - IP da requisição
 */
export const logAuthAttempt = (
  email: string, 
  success: boolean, 
  ip?: string
): void => {
  const message = success 
    ? `Login bem-sucedido: ${email}` 
    : `Tentativa de login falhou: ${email}`;
  
  logAudit(message, email, { success, ip });
};

// Stream para integração com Morgan (HTTP logger)
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Log de inicialização
logger.info('🚀 Sistema de logging inicializado', {
  level: LOG_LEVEL,
  environment: NODE_ENV,
  logPath: LOG_FILE_PATH
});

export default logger;
