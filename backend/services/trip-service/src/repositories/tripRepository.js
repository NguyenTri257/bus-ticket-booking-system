// repositories/tripRepository.js
const pool = require('../database');

class TripRepository {
  // Helper để tạo câu SELECT đầy đủ các trường theo interface Trip
  _getSelectClause() {
    return `
      SELECT 
        t.trip_id, t.departure_time, t.arrival_time, t.base_price, t.status, t.policies::jsonb AS policies,
        
        -- Route info
        r.route_id, r.origin, r.destination, r.distance_km, r.estimated_minutes,
        
        -- Operator info
        o.operator_id, o.name as operator_name, 
        COALESCE((
          SELECT AVG(rating.overall_rating) 
          FROM ratings rating 
          WHERE rating.operator_id = o.operator_id AND rating.is_approved = true
        ), 0) as operator_rating, 
        o.logo_url as operator_logo,
        
        -- Bus info
        b.bus_id, b.plate_number, b.type as bus_type, bm.name as bus_model,
        b.seat_capacity, b.amenities::jsonb AS amenities,
        
        -- Availability (subquery for booked seats)
        (
          SELECT COUNT(*) 
          FROM bookings bk 
          WHERE bk.trip_id = t.trip_id AND bk.status = 'confirmed'
        ) as booked_seats
        
      FROM trips t
      JOIN routes r ON t.route_id = r.route_id
      JOIN buses b ON t.bus_id = b.bus_id
      JOIN operators o ON b.operator_id = o.operator_id
      JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
    `;
  }

  async _getPointsForTrip(trip_id, route_id, departure_time) {
    // Route-level points: query `route_points` (canonical route-level pickup/dropoff offsets)
    const routePointsQuery = `
      SELECT point_id, name, address, departure_offset_minutes, arrival_offset_minutes, is_pickup, is_dropoff
      FROM route_points
      WHERE route_id = $1
      ORDER BY sequence
    `;
    const routePointsRes = await pool.query(routePointsQuery, [route_id]);

    if (routePointsRes.rowCount > 0) {
      const rows = routePointsRes.rows;

      // Compute absolute timestamptz for each point using departure_time + appropriate offset minutes
      // For pickups prefer `departure_offset_minutes`; for dropoffs prefer `arrival_offset_minutes`.
      // If a point is both pickup and dropoff we compute both times separately.
      const points = rows.map((r) => {
        const depOffset = parseInt(r.departure_offset_minutes ?? 0, 10);
        const arrOffset = parseInt(r.arrival_offset_minutes ?? r.departure_offset_minutes ?? 0, 10);

        let pickupTimeIso = null;
        let dropoffTimeIso = null;
        try {
          const base = new Date(departure_time);
          const t1 = new Date(base);
          t1.setMinutes(t1.getMinutes() + depOffset);
          pickupTimeIso = t1.toISOString();

          const t2 = new Date(base);
          t2.setMinutes(t2.getMinutes() + arrOffset);
          dropoffTimeIso = t2.toISOString();
        } catch (e) {
          // keep nulls if parsing fails
        }

        return {
          point_id: r.point_id,
          name: r.name,
          address: r.address,
          pickup_time: pickupTimeIso,
          dropoff_time: dropoffTimeIso,
          is_pickup: r.is_pickup,
          is_dropoff: r.is_dropoff,
        };
      });

      const pickup = points
        .filter((p) => p.is_pickup)
        .map((p) => ({
          point_id: p.point_id,
          name: p.name,
          address: p.address,
          time: p.pickup_time,
        }));

      const dropoff = points
        .filter((p) => p.is_dropoff)
        .map((p) => ({
          point_id: p.point_id,
          name: p.name,
          address: p.address,
          time: p.dropoff_time,
        }));

      return { pickup_points: pickup, dropoff_points: dropoff };
    }

    // If no route_points defined, fallback to existing route_stops behaviour (compute from offsets)
    console.log(
      `[TripRepository] No route_points for route_id=${route_id}, falling back to route_stops`
    );
    const fallbackQuery = `
      SELECT 
        stop_id as point_id, stop_name as name, address, 
        ($1::timestamptz + INTERVAL '1 minute' * arrival_offset_minutes) AS time
      FROM route_stops 
      WHERE route_id = $2
      ORDER BY sequence
    `;
    const result = await pool.query(fallbackQuery, [departure_time, route_id]);
    const points = result.rows.map((row) => ({
      point_id: row.point_id,
      name: row.name,
      address: row.address,
      time: row.time ? row.time.toISOString() : null,
    }));

    return {
      pickup_points: points.slice(0, Math.floor(points.length / 2)),
      dropoff_points: points.slice(Math.floor(points.length / 2)),
    };
  }

  // Helper mapping từ DB Row sang Trip interface (snake_case)
  async _mapRowToTrip(row) {
    if (!row) return null;

    const { pickup_points, dropoff_points } = await this._getPointsForTrip(
      row.trip_id,
      row.route_id,
      row.departure_time
    );

    const total_seats = parseInt(row.seat_capacity);
    const booked_seats = parseInt(row.booked_seats || 0);
    const available_seats = total_seats - booked_seats;

    // Tính duration
    const dep_time = new Date(row.departure_time);
    const arr_time = new Date(row.arrival_time);
    const duration = Math.round((arr_time - dep_time) / 60000);

    return {
      trip_id: row.trip_id,
      route: {
        route_id: row.route_id,
        origin: row.origin,
        destination: row.destination,
        distance_km: parseFloat(row.distance_km),
        estimated_minutes: parseInt(row.estimated_minutes),
      },
      operator: {
        operator_id: row.operator_id,
        name: row.operator_name,
        rating: parseFloat(row.operator_rating || 0),
        logo: row.operator_logo,
      },
      bus: {
        bus_id: row.bus_id,
        model: row.bus_model,
        plate_number: row.plate_number,
        seat_capacity: total_seats,
        bus_type: row.bus_type,
        amenities: row.amenities || [],
      },
      schedule: {
        departure_time: row.departure_time.toISOString(),
        arrival_time: row.arrival_time.toISOString(),
        duration,
      },
      pricing: {
        base_price: parseFloat(row.base_price),
        currency: 'VND', // Mặc định
        service_fee: 0, // Mặc định nếu thiếu
      },
      availability: {
        total_seats,
        available_seats: available_seats > 0 ? available_seats : 0,
        occupancy_rate: total_seats > 0 ? parseFloat((booked_seats / total_seats).toFixed(2)) : 0,
      },
      bookings: booked_seats,
      policies: row.policies || {
        cancellation_policy: 'Standard cancellation',
        modification_policy: 'Flexible',
        refund_policy: 'Refundable up to 24h',
      },
      pickup_points,
      dropoff_points,
      status: row.status, // Return actual status from database
    };
  }

  async create(trip_data) {
    const query = `
      INSERT INTO trips (route_id, bus_id, departure_time, arrival_time, base_price, policies, status)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'scheduled')
      RETURNING *
    `;
    const values = [
      trip_data.route_id,
      trip_data.bus_id,
      trip_data.departure_time,
      trip_data.arrival_time,
      trip_data.base_price,
      trip_data.policies || {},
    ];
    const result = await pool.query(query, values);

    return await this._mapRowToTrip(result.rows[0]);
  }

  async update(id, trip_data) {
    const fields = [];
    const values = [];
    let index = 1;

    if (trip_data.departure_time) {
      fields.push(`departure_time = $${index++}`);
      values.push(trip_data.departure_time);
    }
    if (trip_data.arrival_time) {
      fields.push(`arrival_time = $${index++}`);
      values.push(trip_data.arrival_time);
    }
    if (trip_data.base_price) {
      fields.push(`base_price = $${index++}`);
      values.push(trip_data.base_price);
    }
    if (trip_data.bus_id) {
      fields.push(`bus_id = $${index++}`);
      values.push(trip_data.bus_id);
    }
    if (trip_data.policies) {
      fields.push(`policies = $${index++}::jsonb`);
      values.push(trip_data.policies);
    }
    if (trip_data.status) {
      fields.push(`status = $${index++}`);
      values.push(trip_data.status);
    }

    if (fields.length === 0) return await this.findById(id);

    const query = `UPDATE trips SET ${fields.join(', ')}, updated_at = NOW() WHERE trip_id = $${index} RETURNING trip_id`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) return null;

    // Fetch the updated trip with all relationships
    return await this.findById(id);
  }

  async findById(id) {
    const query = `${this._getSelectClause()} WHERE t.trip_id = $1`;
    const result = await pool.query(query, [id]);
    return this._mapRowToTrip(result.rows[0]);
  }

  /**
   * Get all trips with admin filtering, searching, sorting, and pagination
   * Supports: status, route_id, bus_id, operator_id filters
   * Supports: search in route origin/destination
   * Supports: date range filtering by departure_time
   * Supports: sorting by departure_time, bookings, created_at, price
   */
  async findAll({
    limit = 20,
    offset = 0,
    status,
    route_id,
    bus_id,
    operator_id,
    license_plate,
    search,
    departure_date_from,
    departure_date_to,
    sort_by = 'departure_time',
    sort_order = 'desc',
  } = {}) {
    try {
      let countQuery = `SELECT COUNT(*) as total FROM trips t 
        JOIN routes r ON t.route_id = r.route_id
        JOIN buses b ON t.bus_id = b.bus_id
        JOIN operators o ON b.operator_id = o.operator_id
        JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
        LEFT JOIN (SELECT trip_id, COUNT(*) as booking_count FROM bookings WHERE status = 'confirmed' GROUP BY trip_id) bk ON t.trip_id = bk.trip_id`;

      let query = `SELECT
        t.trip_id, t.departure_time, t.arrival_time, t.base_price, t.status, t.policies::jsonb AS policies, t.created_at,
        r.route_id, r.origin, r.destination, r.distance_km, r.estimated_minutes,
        o.operator_id, o.name as operator_name, o.logo_url as operator_logo,
        b.bus_id, b.plate_number, b.type as bus_type, bm.name as bus_model,
        b.seat_capacity, b.amenities::jsonb AS amenities,
        COALESCE(bk.booking_count, 0) as booked_seats
      FROM trips t
      JOIN routes r ON t.route_id = r.route_id
      JOIN buses b ON t.bus_id = b.bus_id
      JOIN operators o ON b.operator_id = o.operator_id
      JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
      LEFT JOIN (SELECT trip_id, COUNT(*) as booking_count FROM bookings WHERE status = 'confirmed' GROUP BY trip_id) bk ON t.trip_id = bk.trip_id`;

      const values = [];
      let index = 1;

      // Build WHERE clause
      const whereConditions = [];

      if (status) {
        whereConditions.push(`t.status = $${index}`);
        values.push(status);
        index++;
      }

      if (route_id) {
        whereConditions.push(`t.route_id = $${index}`);
        values.push(route_id);
        index++;
      }

      if (bus_id) {
        whereConditions.push(`t.bus_id = $${index}`);
        values.push(bus_id);
        index++;
      }

      if (operator_id) {
        whereConditions.push(`o.operator_id = $${index}`);
        values.push(operator_id);
        index++;
      }

      if (license_plate) {
        whereConditions.push(`UPPER(b.plate_number) LIKE UPPER($${index})`);
        values.push(`%${license_plate}%`);
        index++;
      }

      if (search) {
        // Search in route origin and destination
        whereConditions.push(`(
          UPPER(r.origin) LIKE UPPER($${index}) OR
          UPPER(r.destination) LIKE UPPER($${index})
        )`);
        values.push(`%${search}%`);
        index++;
      }

      if (departure_date_from) {
        whereConditions.push(`t.departure_time >= $${index}`);
        values.push(departure_date_from);
        index++;
      }

      if (departure_date_to) {
        whereConditions.push(`t.departure_time <= $${index}`);
        values.push(departure_date_to);
        index++;
      }

      if (whereConditions.length > 0) {
        const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
        countQuery += whereClause;
        query += whereClause;
      }

      // Get total count
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Build ORDER BY clause
      let orderBy = 't.departure_time DESC, t.trip_id DESC'; // default
      if (sort_by === 'departure_time') {
        orderBy = `t.departure_time ${sort_order === 'asc' ? 'ASC' : 'DESC'}, t.trip_id DESC`;
      } else if (sort_by === 'bookings') {
        orderBy = `COALESCE(bk.booking_count, 0) ${sort_order === 'asc' ? 'ASC' : 'DESC'}, t.trip_id DESC`;
      } else if (sort_by === 'created_at') {
        orderBy = `t.created_at ${sort_order === 'asc' ? 'ASC' : 'DESC'}, t.trip_id DESC`;
      } else if (sort_by === 'price') {
        orderBy = `t.base_price ${sort_order === 'asc' ? 'ASC' : 'DESC'}, t.trip_id DESC`;
      }

      // Add ORDER BY, LIMIT, OFFSET with correct parameter indices
      const limitIndex = index;
      const offsetIndex = index + 1;
      query += ` ORDER BY ${orderBy} LIMIT $${limitIndex} OFFSET $${offsetIndex}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      // Map all rows to TripData format
      const trips = await Promise.all(result.rows.map((row) => this._mapRowToTrip(row)));

      return {
        data: trips,
        total: total,
        limit: limit,
        offset: offset,
      };
    } catch (err) {
      console.error('Error in findAll trips:', err);
      throw err;
    }
  }

  async checkOverlap(bus_id, departure_time, arrival_time, exclude_trip_id = null) {
    let query = `
      SELECT COUNT(*) FROM trips 
      WHERE bus_id = $1 
      AND status = 'active'
      AND departure_time < $3 AND arrival_time > $2
    `;
    const values = [bus_id, departure_time, arrival_time];
    if (exclude_trip_id) {
      query += ` AND trip_id != $4`;
      values.push(exclude_trip_id);
    }
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }

  async search(filters) {
    const {
      origin,
      destination,
      date,
      price_min,
      price_max,
      departure_start,
      departure_end,
      bus_type,
      limit = 20,
      page = 1,
      sort,
    } = filters;

    const offset = (page - 1) * limit;
    const values = [];
    let index = 1;
    let where_clauses = [`t.status = 'scheduled'`];

    // Build filters
    if (origin) {
      where_clauses.push(`r.origin ILIKE $${index++}`);
      values.push(`%${origin}%`);
    }
    if (destination) {
      where_clauses.push(`r.destination ILIKE $${index++}`);
      values.push(`%${destination}%`);
    }
    if (date) {
      where_clauses.push(`DATE(t.departure_time) = $${index++}`);
      values.push(date);
    }
    if (price_min) {
      where_clauses.push(`t.base_price >= $${index++}`);
      values.push(price_min);
    }
    if (price_max) {
      where_clauses.push(`t.base_price <= $${index++}`);
      values.push(price_max);
    }
    if (departure_start) {
      where_clauses.push(`t.departure_time >= $${index++}`);
      values.push(departure_start);
    }
    if (departure_end) {
      where_clauses.push(`t.departure_time <= $${index++}`);
      values.push(departure_end);
    }
    if (bus_type) {
      where_clauses.push(`b.type = $${index++}`);
      values.push(bus_type);
    }

    // Sort mapping
    const sort_mapping = {
      'departure_time ASC': 't.departure_time ASC',
      'departure_time DESC': 't.departure_time DESC',
      'base_price ASC': 't.base_price ASC',
      'base_price DESC': 't.base_price DESC',
    };
    const order_by = sort_mapping[sort] || 't.departure_time ASC';

    const query = `
      ${this._getSelectClause()}
      WHERE ${where_clauses.join(' AND ')}
      ORDER BY ${order_by}
      LIMIT $${index++} OFFSET $${index++}
    `;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Map tất cả rows (parallel)
    return Promise.all(result.rows.map((row) => this._mapRowToTrip(row)));
  }

  async softDelete(id) {
    const query = `UPDATE trips SET status = 'cancelled', updated_at = NOW() WHERE trip_id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) return null;
    return await this._mapRowToTrip(result.rows[0]);
  }

  async getBookingsForTrip(tripId) {
    const query = `
      SELECT
        b.booking_id,
        b.booking_reference,
        b.contact_email,
        b.contact_phone,
        json_agg(
          json_build_object(
            'full_name', bp.full_name,
            'seat_code', bp.seat_code
          )
        ) as passengers
      FROM bookings b
      LEFT JOIN booking_passengers bp ON b.booking_id = bp.booking_id
      WHERE b.trip_id = $1 AND b.status = 'confirmed'
      GROUP BY b.booking_id, b.booking_reference, b.contact_email, b.contact_phone
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [tripId]);
    return result.rows;
  }

  async getAlternativeTrips(tripId) {
    // First get the cancelled trip details
    const cancelledTrip = await this.findById(tripId);
    if (!cancelledTrip) return [];

    const query = `
      SELECT
        t.trip_id,
        t.departure_time,
        t.arrival_time,
        t.base_price as price,
        t.status,
        r.origin,
        r.destination,
        r.estimated_minutes,
        o.name as operator_name,
        bm.name as bus_model,
        b.license_plate
      FROM trips t
      JOIN routes r ON t.route_id = r.route_id
      JOIN buses b ON t.bus_id = b.bus_id
      JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
      JOIN operators o ON b.operator_id = o.operator_id
      WHERE t.route_id = $1
        AND t.status IN ('scheduled', 'in_progress')
        AND t.trip_id != $2
        AND DATE(t.departure_time) >= DATE($3)
        AND DATE(t.departure_time) <= DATE($3) + INTERVAL '7 days'
      ORDER BY t.departure_time ASC
      LIMIT 5
    `;

    const result = await pool.query(query, [
      cancelledTrip.route.route_id,
      tripId,
      cancelledTrip.schedule.departure_time,
    ]);

    return result.rows.map((trip) => ({
      tripId: trip.trip_id,
      departureTime: trip.departure_time,
      arrivalTime: trip.arrival_time,
      price: trip.price,
      operatorName: trip.operator_name,
      busModel: trip.bus_model,
      licensePlate: trip.license_plate,
      fromLocation: trip.origin,
      toLocation: trip.destination,
    }));
  }
}

module.exports = new TripRepository();
