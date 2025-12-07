const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const bookingController = require('./controllers/bookingController');
const { authenticate, authorize, optionalAuthenticate } = require('./middleware/authMiddleware');
const bookingExpirationJob = require('./jobs/bookingExpirationJob');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', bookingController.healthCheck);

// Public routes (guest checkout) - MUST come before /:id route
app.get('/reference/:reference', bookingController.getByReference);

// Protected routes (require authentication)
app.get('/', authenticate, bookingController.getUserBookings);
app.post('/', optionalAuthenticate, bookingController.create);
app.get('/:id', authenticate, bookingController.getById);
app.post('/:id/confirm-payment', authenticate, bookingController.confirmPayment);
app.put('/:id/cancel', authenticate, bookingController.cancel);

// Admin routes
app.get('/admin/bookings', authenticate, authorize(['admin']), bookingController.getAllBookings);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'SYS_001',
      message: 'Internal server error'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_001',
      message: 'Route not found'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Booking Service running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start booking expiration job
  bookingExpirationJob.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  bookingExpirationJob.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  bookingExpirationJob.stop();
  process.exit(0);
});

module.exports = app;
