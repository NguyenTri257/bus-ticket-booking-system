const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const tripRoutes = require('./tripRoutes');
const { getRedisClient, closeRedisConnection, isRedisAvailable } = require('./redis');
const { testConnection, closePool, getPoolStats } = require('./database');
const { getCacheStats, clearCache } = require('./cacheMiddleware');

const app = express();
const PORT = process.env.PORT || 3005;

// Initialize Redis connection
const initializeRedis = async () => {
  try {
    const redisAvailable = await isRedisAvailable();
    if (redisAvailable) {
      console.log('✅ Redis initialized successfully');
    } else {
      console.warn('⚠️ Redis not available, running without cache');
    }
  } catch (error) {
    console.warn('⚠️ Redis initialization failed:', error.message);
  }
};

// Initialize Database connection pool
const initializeDatabase = async () => {
  try {
    // Note: Database connection will be used when migrating from mock data
    // For now, this is prepared for future use
    console.log('📦 Database connection pool ready (not yet in use - using mock data)');
  } catch (error) {
    console.warn('⚠️ Database initialization warning:', error.message);
  }
};

// Initialize connections
initializeRedis();
initializeDatabase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  const redisStatus = await isRedisAvailable();
  const poolStats = getPoolStats();

  res.json({
    service: 'trip-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    dependencies: {
      redis: redisStatus ? 'connected' : 'unavailable',
      database: poolStats.connected ? 'ready' : 'not configured'
    }
  });
});

// Cache statistics endpoint (for monitoring)
app.get('/cache/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'CACHE_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
});

// Clear cache endpoint (for admin use)
app.delete('/cache/clear', async (req, res) => {
  try {
    const pattern = req.query.pattern || 'trip:search:*';
    const deleted = await clearCache(pattern);
    res.json({
      success: true,
      data: { deleted, pattern },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'CACHE_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
});

// Database pool statistics endpoint
app.get('/db/stats', (req, res) => {
  try {
    const stats = getPoolStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/trips', tripRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('⚠️', err.stack);
  res.status(500).json({
    success: false,
    error: { code: 'SYS_001', message: 'Internal server error' },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Trip Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Search trips: http://localhost:${PORT}/trips/search`);
    console.log(`💾 Cache stats: http://localhost:${PORT}/cache/stats`);
    console.log(`🏊 DB pool stats: http://localhost:${PORT}/db/stats`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
      await closeRedisConnection();
      await closePool();
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(async () => {
      await closeRedisConnection();
      await closePool();
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

module.exports = app;
