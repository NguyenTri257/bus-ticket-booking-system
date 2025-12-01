const { Pool } = require('pg');
require('dotenv').config();

let pool = null;

/**
 * Get PostgreSQL connection pool instance (singleton pattern)
 * @returns {Pool|null} PostgreSQL pool instance or null if not configured
 */
function getPool() {
  if (pool) {
    return pool;
  }

  try {
    const poolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'bus_ticket_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      
      // Connection pool settings
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      
      // Connection timeout settings
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      
      // Statement timeout (30 seconds)
      statement_timeout: 30000,
      
      // Query timeout
      query_timeout: 30000,
      
      // Keep alive settings
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

    pool = new Pool(poolConfig);

    // Event handlers
    pool.on('connect', (client) => {
      console.log('✅ New database client connected to pool');
    });

    pool.on('acquire', (client) => {
      console.log('🔓 Client acquired from pool');
    });

    pool.on('remove', (client) => {
      console.log('🔒 Client removed from pool');
    });

    pool.on('error', (err, client) => {
      console.error('❌ Unexpected database pool error:', err.message);
    });

    console.log(`🏊 Database connection pool created (min: ${poolConfig.min}, max: ${poolConfig.max})`);

    return pool;
  } catch (error) {
    console.error('❌ Failed to create database pool:', error.message);
    return null;
  }
}

/**
 * Execute a query with connection from pool
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database pool not initialized');
  }

  const start = Date.now();
  try {
    const result = await currentPool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database pool not initialized');
  }
  return await currentPool.connect();
}

/**
 * Close the database pool gracefully
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database pool closed gracefully');
  }
}

/**
 * Get pool statistics
 * @returns {Object} Pool statistics
 */
function getPoolStats() {
  if (!pool) {
    return {
      connected: false,
      error: 'Pool not initialized'
    };
  }

  return {
    connected: true,
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const currentPool = getPool();
    if (!currentPool) return false;

    const result = await currentPool.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  getPool,
  query,
  getClient,
  closePool,
  getPoolStats,
  testConnection
};
