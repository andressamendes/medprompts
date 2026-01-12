import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { initDatabase, closeDatabase } from './db/connection';
import { LobbyRoom } from './rooms/LobbyRoom';
import { EmergencyRoom } from './rooms/EmergencyRoom';
import { WardRoom } from './rooms/WardRoom';
import { ICURoom } from './rooms/ICURoom';
import { SurgicalRoom } from './rooms/SurgicalRoom';

// Load environment variables
dotenv.config();

const port = Number(process.env.PORT) || 2567;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Create Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create Colyseus server
const gameServer = new Server({
  server,
});

// Register room handlers
gameServer.define('lobby', LobbyRoom);
gameServer.define('emergency', EmergencyRoom);
gameServer.define('ward', WardRoom);
gameServer.define('icu', ICURoom);
gameServer.define('surgical', SurgicalRoom);

// Optional: Colyseus monitoring panel (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use('/colyseus', monitor());
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start server
async function start() {
  try {
    // Initialize database connection
    await initDatabase();
    logger.info('Database connected successfully');

    // Start listening
    gameServer.listen(port);
    logger.info(`🎮 Colyseus server listening on http://localhost:${port}`);

    if (process.env.NODE_ENV === 'development') {
      logger.info(`📊 Colyseus monitor: http://localhost:${port}/colyseus`);
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
start();
