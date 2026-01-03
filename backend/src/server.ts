import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { testConnection, syncDatabase, closeConnection } from './config/database';
import { logger, logHTTP } from './utils/logger';
import { generalLimiter } from './middleware/rateLimiter';

// Importa rotas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Carrega variáveis de ambiente
dotenv.config();

const {
  PORT = 3001,
  NODE_ENV = 'development',
  FRONTEND_URL = 'http://localhost:5173',
  ALLOWED_ORIGINS = 'http://localhost:5173,https://andressamendes.github.io',
  API_VERSION = 'v1'
} = process.env;

// Cria aplicação Express
const app = express();

// ============================================================================
// MIDDLEWARES DE SEGURANÇA
// ============================================================================

// Helmet: protege contra vulnerabilidades conhecidas
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

// CORS: controla quais domínios podem acessar a API
const allowedOrigins = ALLOWED_ORIGINS.split(',').map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('Origem bloqueada por CORS', { origin });
      callback(new Error('Origem não permitida por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
}));

// Compressão de respostas (reduz tamanho de JSON)
app.use(compression());

// ============================================================================
// MIDDLEWARES DE PARSING
// ============================================================================

// Parse de JSON (limite de 10MB para uploads futuros)
app.use(express.json({ limit: '10mb' }));

// Parse de URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse de cookies
app.use(cookieParser());

// ============================================================================
// LOGGING DE REQUISIÇÕES HTTP
// ============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Hook no evento de finalização da resposta
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const userId = (req as any).user?.userId;
    
    logHTTP(req.method, req.path, res.statusCode, responseTime, userId);
  });
  
  next();
});

// ============================================================================
// RATE LIMITING GLOBAL
// ============================================================================

app.use(generalLimiter);

// ============================================================================
// ROTAS DA API
// ============================================================================

// Health check da API (sem versionamento)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'MedPrompts API está funcionando',
    version: API_VERSION,
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas versionadas
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);

// Monta rotas com versionamento
app.use(`/api/${API_VERSION}`, apiRouter);

// ============================================================================
// TRATAMENTO DE ROTAS NÃO ENCONTRADAS
// ============================================================================

app.use((req: Request, res: Response) => {
  logger.warn('Rota não encontrada', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path
  });
});

// ============================================================================
// TRATAMENTO GLOBAL DE ERROS
// ============================================================================

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Erro não tratado:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: NODE_ENV === 'development' ? error.message : undefined
  });
});

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

const startServer = async () => {
  try {
    // Testa conexão com banco de dados
    logger.info('🔄 Conectando ao banco de dados...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      logger.error('❌ Falha ao conectar ao banco de dados. Abortando inicialização.');
      process.exit(1);
    }
    
    // Sincroniza modelos com banco (apenas em desenvolvimento)
    if (NODE_ENV === 'development') {
      logger.info('🔄 Sincronizando modelos do banco de dados...');
      await syncDatabase(false);
    }
    
    // Inicia servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info('='.repeat(70));
      logger.info(`🚀 MedPrompts API v${API_VERSION} iniciada com sucesso!`);
      logger.info(`📡 Servidor rodando em: http://localhost:${PORT}`);
      logger.info(`🌍 Ambiente: ${NODE_ENV}`);
      logger.info(`🔐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API Base: http://localhost:${PORT}/api/${API_VERSION}`);
      logger.info('='.repeat(70));
    });
    
    // ============================================================================
    // GRACEFUL SHUTDOWN
    // ============================================================================
    
    const shutdown = async (signal: string) => {
      logger.info(`\n🛑 Sinal ${signal} recebido. Encerrando servidor gracefully...`);
      
      server.close(async () => {
        logger.info('✅ Servidor HTTP encerrado');
        
        try {
          await closeConnection();
          logger.info('✅ Conexão com banco de dados encerrada');
          logger.info('👋 Servidor encerrado com sucesso');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Erro ao encerrar conexão com banco:', error);
          process.exit(1);
        }
      });
      
      // Força encerramento após 10 segundos
      setTimeout(() => {
        logger.error('⚠️ Forçando encerramento após timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Escuta sinais de encerramento
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Trata erros não capturados
    process.on('uncaughtException', (error) => {
      logger.error('❌ Exceção não capturada:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Promise rejeitada não tratada:', { reason, promise });
      shutdown('UNHANDLED_REJECTION');
    });
    
  } catch (error) {
    logger.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Inicia o servidor
startServer();

export default app;
