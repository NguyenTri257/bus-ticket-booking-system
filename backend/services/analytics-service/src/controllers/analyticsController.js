const analyticsService = require('../services/analyticsService');

/**
 * Analytics Controller
 * Handles HTTP requests and responses for analytics endpoints
 */
class AnalyticsController {
  /**
   * GET /analytics/bookings
   * Get comprehensive booking analytics
   */
  async getBookingAnalytics(req, res) {
    try {
      const { fromDate, toDate, groupBy = 'day' } = req.query;

      // Validation
      if (!fromDate || !toDate) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'fromDate and toDate are required',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Validate groupBy
      const validGroupBy = ['day', 'week', 'month'];
      if (!validGroupBy.includes(groupBy)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'groupBy must be one of: day, week, month',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const analytics = await analyticsService.getBookingAnalytics(
        fromDate,
        toDate,
        groupBy
      );

      return res.status(200).json({
        success: true,
        data: analytics,
        message: 'booking analytics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in getBookingAnalytics:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SYS_001',
          message: error.message || 'internal server error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /analytics/revenue
   * Get comprehensive revenue analytics
   */
  async getRevenueAnalytics(req, res) {
    try {
      const { fromDate, toDate, groupBy = 'day', operatorId } = req.query;

      // Validation
      if (!fromDate || !toDate) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'fromDate and toDate are required',
          },
          timestamp: new Date().toISOString(),
        });
      }

      // Validate groupBy
      const validGroupBy = ['day', 'week', 'month'];
      if (!validGroupBy.includes(groupBy)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'groupBy must be one of: day, week, month',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const analytics = await analyticsService.getRevenueAnalytics(
        fromDate,
        toDate,
        groupBy,
        operatorId
      );

      return res.status(200).json({
        success: true,
        data: analytics,
        message: 'revenue analytics retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in getRevenueAnalytics:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SYS_001',
          message: error.message || 'internal server error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /analytics/dashboard
   * Get summary dashboard statistics
   */
  async getDashboardSummary(req, res) {
    try {
      const { fromDate, toDate } = req.query;

      // Validation
      if (!fromDate || !toDate) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'fromDate and toDate are required',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const summary = await analyticsService.getDashboardSummary(
        fromDate,
        toDate
      );

      return res.status(200).json({
        success: true,
        data: summary,
        message: 'dashboard summary retrieved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'SYS_001',
          message: error.message || 'internal server error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /health
   * Health check endpoint
   */
  async healthCheck(req, res) {
    return res.status(200).json({
      success: true,
      data: {
        service: 'analytics-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

module.exports = new AnalyticsController();
