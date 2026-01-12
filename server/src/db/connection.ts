import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

export async function initDatabase(): Promise<void> {
  if (pool) {
    logger.warn('Database pool already initialized');
    return;
  }

  // Support both DATABASE_URL (Render.com) and individual env vars (local dev)
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false // Required for Render.com
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    logger.info('Database pool initialized with DATABASE_URL');
  } else {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    logger.info('Database pool initialized with individual env vars');
  }

  // Test connection
  try {
    const client = await pool.connect();
    logger.info('Database connection test successful');
    client.release();
  } catch (error) {
    logger.error('Database connection test failed:', error);
    throw error;
  }

  // Handle pool errors
  pool.on('error', (err) => {
    logger.error('Unexpected database pool error:', err);
  });
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows;
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
