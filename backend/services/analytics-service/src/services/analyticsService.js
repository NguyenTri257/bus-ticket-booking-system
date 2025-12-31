const analyticsRepository = require('../repositories/analyticsRepository');

/**
 * Analytics Service
 * Business logic for processing analytics and reporting data
 */
class AnalyticsService {
  /**
   * Get comprehensive booking analytics
   */
  async getBookingAnalytics(fromDate, toDate, groupBy = 'day') {
    try {
      // Validate dates
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new Error('Invalid date format');
      }

      if (from > to) {
        throw new Error('fromDate must be before toDate');
      }

      // Get all booking statistics in parallel
      const [totalBookings, bookingTrends, statusDistribution, topRoutes, cancellationStats] =
        await Promise.all([
          analyticsRepository.getTotalBookings(fromDate, toDate),
          analyticsRepository.getBookingTrends(fromDate, toDate, groupBy),
          analyticsRepository.getBookingStatusDistribution(fromDate, toDate),
          analyticsRepository.getTopRoutes(fromDate, toDate, 10),
          analyticsRepository.getCancellationStats(fromDate, toDate),
        ]);

      // Calculate success rate
      const confirmedCount = statusDistribution.find((s) => s.status === 'confirmed')?.count || 0;
      const cancelledCount = statusDistribution.find((s) => s.status === 'cancelled')?.count || 0;
      const totalCompleted = confirmedCount + cancelledCount;

      const successRate =
        totalCompleted > 0 ? ((confirmedCount / totalCompleted) * 100).toFixed(2) : 0;

      const cancellationRate = cancellationStats.cancellation_rate || 0;

      // Format trends data
      const formattedTrends = bookingTrends.map((trend) => ({
        period: trend.period,
        totalBookings: parseInt(trend.total_bookings),
        confirmedBookings: parseInt(trend.confirmed_bookings),
        cancelledBookings: parseInt(trend.cancelled_bookings),
        pendingBookings: parseInt(trend.pending_bookings),
      }));

      // Format top routes
      const formattedTopRoutes = topRoutes.map((route) => ({
        routeId: route.route_id,
        route: `${route.origin} → ${route.destination}`,
        origin: route.origin,
        destination: route.destination,
        totalBookings: parseInt(route.total_bookings),
        revenue: parseFloat(route.total_revenue),
        uniqueTrips: parseInt(route.unique_trips),
      }));

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        summary: {
          totalBookings,
          successRate: parseFloat(successRate),
          cancellationRate: parseFloat(cancellationRate),
          conversionRate: null, // TODO: Implement when trip view tracking is available
        },
        trends: formattedTrends,
        statusDistribution: statusDistribution.map((s) => ({
          status: s.status,
          count: parseInt(s.count),
          percentage: parseFloat(s.percentage),
        })),
        topRoutes: formattedTopRoutes,
        cancellationStats: {
          cancelledBookings: parseInt(cancellationStats.cancelled_bookings),
          confirmedBookings: parseInt(cancellationStats.confirmed_bookings),
          totalBookings: parseInt(cancellationStats.total_bookings),
          cancellationRate: parseFloat(cancellationStats.cancellation_rate),
          lostRevenue: parseFloat(cancellationStats.lost_revenue),
        },
      };
    } catch (error) {
      console.error('Error in getBookingAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive revenue analytics
   */
  async getRevenueAnalytics(fromDate, toDate, groupBy = 'day', operatorId = null) {
    try {
      // Validate dates
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new Error('Invalid date format');
      }

      if (from > to) {
        throw new Error('fromDate must be before toDate');
      }

      // Get all revenue statistics in parallel
      const [totalRevenueData, revenueTrends, revenueByRoute, revenueByStatus, revenueByOperator] =
        await Promise.all([
          analyticsRepository.getTotalRevenue(fromDate, toDate),
          analyticsRepository.getRevenueTrends(fromDate, toDate, groupBy),
          analyticsRepository.getRevenueByRoute(fromDate, toDate, 10),
          analyticsRepository.getRevenueByStatus(fromDate, toDate),
          analyticsRepository.getRevenueByOperator(fromDate, toDate, 10),
        ]);

      // Format revenue trends
      const formattedTrends = revenueTrends.map((trend) => ({
        period: trend.period,
        revenue: parseFloat(trend.revenue),
        bookings: parseInt(trend.bookings),
        averageBookingValue: parseFloat(trend.average_booking_value),
      }));

      // Format revenue by route
      const formattedRouteRevenue = revenueByRoute.map((route) => ({
        routeId: route.route_id,
        route: `${route.origin} → ${route.destination}`,
        origin: route.origin,
        destination: route.destination,
        revenue: parseFloat(route.revenue),
        bookings: parseInt(route.bookings),
        averagePrice: parseFloat(route.average_price),
      }));

      // Format revenue by status
      const formattedStatusRevenue = revenueByStatus.map((status) => ({
        status: status.status,
        revenue: parseFloat(status.revenue),
        bookings: parseInt(status.bookings),
        averageValue: parseFloat(status.average_value),
      }));

      // Format revenue by operator
      const formattedOperatorRevenue = revenueByOperator.map((operator) => ({
        operatorId: operator.operator_id,
        operatorName: operator.operator_name,
        revenue: parseFloat(operator.revenue),
        bookings: parseInt(operator.bookings),
        uniqueTrips: parseInt(operator.unique_trips),
      }));

      // Filter by operator if specified
      let filteredOperatorRevenue = formattedOperatorRevenue;
      if (operatorId) {
        filteredOperatorRevenue = formattedOperatorRevenue.filter(
          (op) => op.operatorId === operatorId
        );
      }

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        summary: {
          totalRevenue: parseFloat(totalRevenueData.total_revenue),
          totalBookings: parseInt(totalRevenueData.booking_count),
          averageBookingValue: parseFloat(totalRevenueData.average_booking_value),
          currency: 'VND',
        },
        trends: formattedTrends,
        byRoute: formattedRouteRevenue,
        byStatus: formattedStatusRevenue,
        byOperator: filteredOperatorRevenue,
      };
    } catch (error) {
      console.error('Error in getRevenueAnalytics:', error);
      throw error;
    }
  }

  /**
   * Get summary dashboard statistics
   */
  async getDashboardSummary(fromDate, toDate) {
    try {
      const [totalRevenue, totalBookings, cancellationStats, activeUsers] = await Promise.all([
        analyticsRepository.getTotalRevenue(fromDate, toDate),
        analyticsRepository.getTotalBookings(fromDate, toDate),
        analyticsRepository.getCancellationStats(fromDate, toDate),
        analyticsRepository.getActiveUsersCount(),
      ]);

      return {
        period: {
          from: fromDate,
          to: toDate,
        },
        revenue: {
          total: parseFloat(totalRevenue.total_revenue),
          average: parseFloat(totalRevenue.average_booking_value),
          currency: 'VND',
        },
        bookings: {
          total: totalBookings,
          confirmed: parseInt(cancellationStats.confirmed_bookings),
          cancelled: parseInt(cancellationStats.cancelled_bookings),
          cancellationRate: parseFloat(cancellationStats.cancellation_rate),
        },
        activeUsers: activeUsers,
      };
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
