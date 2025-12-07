const bookingService = require('../services/bookingService');

/**
 * Job to process expired bookings
 * Runs every minute to check and cancel expired bookings
 */
class BookingExpirationJob {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Start the expiration job
   * @param {number} intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
   */
  start(intervalMs = 60000) {
    if (this.isRunning) {
      console.log('⏰ Booking expiration job is already running');
      return;
    }

    console.log(`⏰ Starting booking expiration job (interval: ${intervalMs}ms)`);
    
    // Run immediately on start
    this.run();
    
    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.run();
    }, intervalMs);
    
    this.isRunning = true;
  }

  /**
   * Stop the expiration job
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('⏰ Stopping booking expiration job');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
  }

  /**
   * Run the expiration check
   */
  async run() {
    try {
      const cancelledCount = await bookingService.processExpiredBookings();
      
      if (cancelledCount > 0) {
        console.log(`⏰ Cancelled ${cancelledCount} expired bookings`);
      }
    } catch (error) {
      console.error('⏰ Error processing expired bookings:', error);
    }
  }
}

module.exports = new BookingExpirationJob();
