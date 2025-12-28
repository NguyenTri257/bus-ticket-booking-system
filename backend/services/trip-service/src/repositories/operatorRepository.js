// repositories/operatorRepository.js
const pool = require('../database');

class OperatorRepository {
  async findAll({ status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        operator_id, name, contact_email, contact_phone, status,
        rating, logo_url, approved_at, created_at
      FROM operators
    `;
    const values = [];
    let where = [];

    if (status) {
      where.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (where.length > 0) query += ' WHERE ' + where.join(' AND ');

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Đếm tổng + thống kê routes & buses & ratings
    const enriched = await Promise.all(
      result.rows.map(async (op) => {
        const stats = await pool.query(
          `SELECT 
             (SELECT COUNT(DISTINCT t.route_id) FROM buses b JOIN trips t ON b.bus_id = t.bus_id WHERE b.operator_id = $1) as total_routes,
             (SELECT COUNT(*) FROM buses WHERE operator_id = $1) as total_buses,
             (SELECT COUNT(*) FROM ratings WHERE operator_id = $1 AND is_approved = true) as total_ratings,
             (SELECT AVG(overall_rating) FROM ratings WHERE operator_id = $1 AND is_approved = true) as avg_rating`,
          [op.operator_id]
        );
        return {
          operatorId: op.operator_id,
          name: op.name,
          contactEmail: op.contact_email,
          contactPhone: op.contact_phone,
          status: op.status,
          rating: parseFloat(stats.rows[0].avg_rating) || 0.0,
          ratingCount: parseInt(stats.rows[0].total_ratings),
          logoUrl: op.logo_url,
          approvedAt: op.approved_at,
          createdAt: op.created_at,
          totalRoutes: parseInt(stats.rows[0].total_routes),
          totalBuses: parseInt(stats.rows[0].total_buses),
        };
      })
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM operators ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}`,
      values.slice(0, -2)
    );
    const total = parseInt(countResult.rows[0].count);

    return {
      data: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(operatorId) {
    const query = `
        SELECT operator_id, name, contact_email, contact_phone, status, rating
        FROM operators 
        WHERE operator_id = $1
    `;
    const result = await pool.query(query, [operatorId]);

    if (result.rowCount === 0) return null;

    const op = result.rows[0];

    // Get rating stats
    const ratingStats = await pool.query(
      `SELECT 
         COUNT(*) as total_ratings,
         AVG(overall_rating) as avg_rating
       FROM ratings 
       WHERE operator_id = $1 AND is_approved = true`,
      [operatorId]
    );

    return {
      operatorId: op.operator_id,
      name: op.name,
      contactEmail: op.contact_email,
      contactPhone: op.contact_phone,
      status: op.status,
      rating: parseFloat(ratingStats.rows[0].avg_rating) || 0.0,
      ratingCount: parseInt(ratingStats.rows[0].total_ratings),
    };
  }

  async updateStatus(operatorId, status, notes = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let approvedAt = null;
      if (status === 'approved') approvedAt = 'NOW()';

      const query = `
        UPDATE operators 
        SET status = $1, 
            approved_at = ${approvedAt},
            updated_at = NOW()
        WHERE operator_id = $2
        RETURNING operator_id, status, approved_at
      `;
      const result = await client.query(query, [status, operatorId]);

      if (result.rowCount === 0) throw new Error('Operator not found');

      // TODO: Gửi email thông báo/email cho nhà xe (có thể dùng queue)

      await client.query('COMMIT');
      return {
        operatorId: result.rows[0].operator_id,
        status: result.rows[0].status,
        approvedAt: result.rows[0].approved_at,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAnalytics() {
    const client = await pool.connect();
    try {
      // Overall statistics
      const overallStats = await client.query(`
        SELECT
          COUNT(*) as total_operators,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_operators,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_operators,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_operators,
          COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_operators
        FROM operators
      `);

      // Calculate average rating from ratings table
      const ratingStats = await client.query(`
        SELECT
          AVG(overall_rating) as avg_rating,
          COUNT(*) as rated_operators
        FROM ratings
        WHERE is_approved = true
      `);

      // Top performing operators by rating
      const topRated = await client.query(`
        SELECT
          o.operator_id, o.name,
          AVG(r.overall_rating) as rating
        FROM operators o
        LEFT JOIN ratings r ON o.operator_id = r.operator_id AND r.is_approved = true
        GROUP BY o.operator_id, o.name
        HAVING AVG(r.overall_rating) > 0
        ORDER BY rating DESC
        LIMIT 10
      `);

      // Operators with most trips
      const mostTrips = await client.query(`
        SELECT
          o.operator_id, o.name,
          COUNT(t.trip_id) as total_trips
        FROM operators o
        LEFT JOIN buses b ON o.operator_id = b.operator_id
        LEFT JOIN trips t ON b.bus_id = t.bus_id
        GROUP BY o.operator_id, o.name
        ORDER BY total_trips DESC
        LIMIT 10
      `);

      // Revenue by operator (assuming bookings have price)
      const revenueByOperator = await client.query(`
        SELECT
          o.operator_id, o.name,
          COALESCE(SUM(b.total_price), 0) as total_revenue
        FROM operators o
        LEFT JOIN buses bus ON o.operator_id = bus.operator_id
        LEFT JOIN trips t ON bus.bus_id = t.bus_id
        LEFT JOIN bookings b ON t.trip_id = b.trip_id AND b.status = 'confirmed'
        GROUP BY o.operator_id, o.name
        ORDER BY total_revenue DESC
        LIMIT 10
      `);

      return {
        overall: {
          totalOperators: parseInt(overallStats.rows[0].total_operators),
          approvedOperators: parseInt(overallStats.rows[0].approved_operators),
          pendingOperators: parseInt(overallStats.rows[0].pending_operators),
          rejectedOperators: parseInt(overallStats.rows[0].rejected_operators),
          suspendedOperators: parseInt(overallStats.rows[0].suspended_operators),
          averageRating: parseFloat(ratingStats.rows[0].avg_rating) || 0,
          ratedOperators: parseInt(ratingStats.rows[0].rated_operators),
        },
        topRated: topRated.rows.map((row) => ({
          operatorId: row.operator_id,
          name: row.name,
          rating: parseFloat(row.rating),
        })),
        mostTrips: mostTrips.rows.map((row) => ({
          operatorId: row.operator_id,
          name: row.name,
          totalTrips: parseInt(row.total_trips),
        })),
        topRevenue: revenueByOperator.rows.map((row) => ({
          operatorId: row.operator_id,
          name: row.name,
          totalRevenue: parseFloat(row.total_revenue),
        })),
      };
    } finally {
      client.release();
    }
  }

  async getOperatorAnalytics(operatorId) {
    // Operator basic info
    const operatorInfo = await pool.query(
      'SELECT operator_id, name, rating FROM operators WHERE operator_id = $1',
      [operatorId]
    );

    if (operatorInfo.rowCount === 0) throw new Error('Operator not found');

    // Get rating stats
    const ratingStats = await pool.query(
      `SELECT 
         COUNT(*) as total_ratings,
         AVG(overall_rating) as avg_rating
       FROM ratings 
       WHERE operator_id = $1::uuid`,
      [operatorId]
    );

    // Trip statistics
    const tripStats = await pool.query(
      `
      SELECT
        COUNT(*) as total_trips,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_trips,
        COUNT(CASE WHEN t.status = 'cancelled' THEN 1 END) as cancelled_trips,
        COALESCE(AVG(
          CASE WHEN t.status = 'completed' THEN
            CASE WHEN seat_counts.total_seats > 0 THEN
              (passenger_counts.confirmed_passengers::decimal / seat_counts.total_seats) * 100
            ELSE 0 END
          END
        ), 0) as avg_occupancy
      FROM buses b
      JOIN trips t ON b.bus_id = t.bus_id
      LEFT JOIN (
        SELECT bus_id, COUNT(*) as total_seats
        FROM seats
        GROUP BY bus_id
      ) seat_counts ON b.bus_id = seat_counts.bus_id
      LEFT JOIN (
        SELECT bkg.trip_id, COUNT(bp.ticket_id) as confirmed_passengers
        FROM bookings bkg
        JOIN booking_passengers bp ON bkg.booking_id = bp.booking_id
        WHERE bkg.status = 'confirmed'
        GROUP BY bkg.trip_id
      ) passenger_counts ON t.trip_id = passenger_counts.trip_id
      WHERE b.operator_id = $1
    `,
      [operatorId]
    );

    // Revenue statistics
    const revenueStats = await pool.query(
      `
      SELECT
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COUNT(b.booking_id) as total_bookings,
        AVG(b.total_price) as avg_ticket_price
      FROM buses bus
      JOIN trips t ON bus.bus_id = t.bus_id
      LEFT JOIN bookings b ON t.trip_id = b.trip_id AND b.status = 'confirmed'
      WHERE bus.operator_id = $1
    `,
      [operatorId]
    );

    // Route and bus stats
    const routeBusStats = await pool.query(
      `
      SELECT
        (SELECT COUNT(DISTINCT t.route_id) FROM buses b JOIN trips t ON b.bus_id = t.bus_id WHERE b.operator_id = $1) as total_routes,
        (SELECT COUNT(*) FROM buses WHERE operator_id = $1) as total_buses
    `,
      [operatorId]
    );

    return {
      operatorId: operatorInfo.rows[0].operator_id,
      name: operatorInfo.rows[0].name,
      rating: parseFloat(ratingStats.rows[0].avg_rating) || 0,
      totalTrips: parseInt(tripStats.rows[0].total_trips),
      completedTrips: parseInt(tripStats.rows[0].completed_trips),
      cancelledTrips: parseInt(tripStats.rows[0].cancelled_trips),
      avgOccupancy: parseFloat(tripStats.rows[0].avg_occupancy) || 0,
      totalRevenue: parseFloat(revenueStats.rows[0].total_revenue),
      totalBookings: parseInt(revenueStats.rows[0].total_bookings),
      avgTicketPrice: parseFloat(revenueStats.rows[0].avg_ticket_price) || 0,
      totalRoutes: parseInt(routeBusStats.rows[0].total_routes),
      totalBuses: parseInt(routeBusStats.rows[0].total_buses),
    };
  }
}
module.exports = new OperatorRepository();
