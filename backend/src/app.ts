import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

// Importar rotas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import promptRoutes from './routes/prompt.routes';
import studySessionRoutes from './routes/studySessionRoutes';

// Carregar variáveis de ambiente
dotenv.config();

// Criar aplicação Express
const app = express();

// ======================================
// MIDDLEWARES GLOBAIS
// ======================================

// Segurança HTTP headers
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://andressamendes.github.io',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (Postman, mobile apps, etc)
      if (!origin) {
        return callback(null, true);
      }
      
      // Verificar se origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Em desenvolvimento, permitir localhost em qualquer porta
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode}`, {
      method: req.method,
      url: req.path,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      userId: (req as any).userId || 'anonymous',
    });
  });
  
  next();
});

// ======================================
// ROTAS
// ======================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'MedPrompts API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Rotas da API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/prompts', promptRoutes);
app.use('/api/v1/study-sessions', studySessionRoutes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
  });
});

export default app;
