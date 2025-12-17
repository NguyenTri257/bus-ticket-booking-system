const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const analyticsController = require('./controllers/analyticsController');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', analyticsController.healthCheck);

// Analytics routes (admin only - assume auth middleware from API Gateway)
app.get('/bookings', analyticsController.getBookingAnalytics);
app.get('/revenue', analyticsController.getRevenueAnalytics);
app.get('/dashboard', analyticsController.getDashboardSummary);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'endpoint not found',
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'SYS_001',
      message: 'internal server error',
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Analytics Service');
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Analytics API: http://localhost:${PORT}/analytics`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_NAME || 'bus_booking'}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
