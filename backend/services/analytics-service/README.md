# Analytics Service

Analytics and reporting microservice for admin booking statistics and revenue analysis.

## Overview

The analytics-service provides comprehensive analytics endpoints for administrators to view:
- Booking trends and statistics
- Revenue analytics by various dimensions
- Top performing routes and operators
- Cancellation rates and patterns

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (shared with booking-service)
- **Architecture**: Controller → Service → Repository pattern

## Port

**Service Port**: `3006`

## Setup

### 1. Install Dependencies

```bash
cd backend/services/analytics-service
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
PORT=3006
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_booking
DB_USER=postgres
DB_PASSWORD=postgres
```

### 3. Run Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check

**GET** `/health`

Check service health status.

**Response**:
```json
{
  "success": true,
  "data": {
    "service": "analytics-service",
    "status": "healthy",
    "timestamp": "2025-12-17T10:30:00Z"
  }
}
```

---

### Booking Analytics

**GET** `/analytics/bookings`

Get comprehensive booking analytics with trends, status distribution, top routes, and cancellation statistics.

**Query Parameters**:
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): Grouping period - `day` | `week` | `month` (default: `day`)

**Example Request**:
```
GET /analytics/bookings?fromDate=2025-11-01&toDate=2025-11-15&groupBy=day
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-11-01",
      "to": "2025-11-15"
    },
    "summary": {
      "totalBookings": 1234,
      "successRate": 85.5,
      "cancellationRate": 12.3,
      "conversionRate": null
    },
    "trends": [
      {
        "period": "2025-11-15",
        "totalBookings": 87,
        "confirmedBookings": 75,
        "cancelledBookings": 10,
        "pendingBookings": 2
      }
    ],
    "statusDistribution": [
      {
        "status": "confirmed",
        "count": 1050,
        "percentage": 85.1
      },
      {
        "status": "cancelled",
        "count": 152,
        "percentage": 12.3
      }
    ],
    "topRoutes": [
      {
        "routeId": "route-uuid",
        "route": "Ho Chi Minh City → Hanoi",
        "origin": "Ho Chi Minh City",
        "destination": "Hanoi",
        "totalBookings": 234,
        "revenue": 8200000,
        "uniqueTrips": 15
      }
    ],
    "cancellationStats": {
      "cancelledBookings": 152,
      "confirmedBookings": 1050,
      "totalBookings": 1234,
      "cancellationRate": 12.3,
      "lostRevenue": 5460000
    }
  },
  "message": "booking analytics retrieved successfully",
  "timestamp": "2025-12-17T10:30:00Z"
}
```

**What it provides**:
- Total bookings in period
- Success/cancellation rates
- Booking trends over time (daily/weekly/monthly)
- Status distribution (confirmed, cancelled, pending)
- Top 10 most booked routes with revenue
- Detailed cancellation statistics

---

### Revenue Analytics

**GET** `/analytics/revenue`

Get comprehensive revenue analytics with trends, breakdown by route, status, and operator.

**Query Parameters**:
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): Grouping period - `day` | `week` | `month` (default: `day`)
- `operatorId` (optional): Filter by specific operator UUID

**Example Request**:
```
GET /analytics/revenue?fromDate=2025-11-01&toDate=2025-11-15&groupBy=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-11-01",
      "to": "2025-11-15"
    },
    "summary": {
      "totalRevenue": 45200000,
      "totalBookings": 1234,
      "averageBookingValue": 36634,
      "currency": "VND"
    },
    "trends": [
      {
        "period": "2025-11-15",
        "revenue": 3200000,
        "bookings": 87,
        "averageBookingValue": 36781
      }
    ],
    "byRoute": [
      {
        "routeId": "route-uuid",
        "route": "Ho Chi Minh City → Hanoi",
        "origin": "Ho Chi Minh City",
        "destination": "Hanoi",
        "revenue": 8200000,
        "bookings": 234,
        "averagePrice": 35043
      }
    ],
    "byStatus": [
      {
        "status": "confirmed",
        "revenue": 38520000,
        "bookings": 1050,
        "averageValue": 36686
      },
      {
        "status": "cancelled",
        "revenue": 5460000,
        "bookings": 152,
        "averageValue": 35921
      }
    ],
    "byOperator": [
      {
        "operatorId": "operator-uuid",
        "operatorName": "Futa Bus Lines",
        "revenue": 12500000,
        "bookings": 356,
        "uniqueTrips": 25
      }
    ]
  },
  "message": "revenue analytics retrieved successfully",
  "timestamp": "2025-12-17T10:30:00Z"
}
```

**What it provides**:
- Total revenue and average booking value
- Revenue trends over time
- Top 10 routes by revenue
- Revenue breakdown by booking status
- Top 10 operators by revenue

---

### Dashboard Summary

**GET** `/analytics/dashboard`

Get quick summary statistics for admin dashboard overview.

**Query Parameters**:
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)

**Example Request**:
```
GET /analytics/dashboard?fromDate=2025-11-01&toDate=2025-11-15
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-11-01",
      "to": "2025-11-15"
    },
    "revenue": {
      "total": 45200000,
      "average": 36634,
      "currency": "VND"
    },
    "bookings": {
      "total": 1234,
      "confirmed": 1050,
      "cancelled": 152,
      "cancellationRate": 12.3
    }
  },
  "message": "dashboard summary retrieved successfully",
  "timestamp": "2025-12-17T10:30:00Z"
}
```

**What it provides**:
- Quick revenue summary
- Booking counts and cancellation rate
- Perfect for dashboard overview widgets

---

## Architecture

```
analytics-service/
├── src/
│   ├── controllers/
│   │   └── analyticsController.js    # Request handling, validation
│   ├── services/
│   │   └── analyticsService.js       # Business logic, data processing
│   ├── repositories/
│   │   └── analyticsRepository.js    # SQL queries only
│   ├── config/
│   │   └── database.js               # PostgreSQL connection
│   └── index.js                      # Express server setup
├── package.json
├── Dockerfile
└── .env.example
```

### Layer Responsibilities

**Controller Layer** (`analyticsController.js`):
- Validate request parameters
- Call service methods
- Format HTTP responses
- Handle errors

**Service Layer** (`analyticsService.js`):
- Implement business logic
- Process and transform data
- Coordinate repository calls
- Calculate derived metrics

**Repository Layer** (`analyticsRepository.js`):
- Execute SQL queries only
- Return raw data
- No business logic

## Key SQL Queries

### Booking Trends Query
```sql
SELECT 
  TO_CHAR(created_at, 'YYYY-MM-DD') as period,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
FROM bookings
WHERE created_at >= $1 AND created_at <= $2
GROUP BY period
ORDER BY period ASC
```

### Top Routes Query
```sql
SELECT 
  r.route_id,
  r.origin_city,
  r.destination_city,
  COUNT(b.booking_id) as total_bookings,
  SUM(b.total_price) as total_revenue
FROM bookings b
INNER JOIN trips t ON b.trip_id = t.trip_id
INNER JOIN routes r ON t.route_id = r.route_id
WHERE b.status IN ('confirmed', 'completed')
  AND b.created_at >= $1 
  AND b.created_at <= $2
GROUP BY r.route_id, r.origin_city, r.destination_city
ORDER BY total_bookings DESC
LIMIT 10
```

### Revenue Trends Query
```sql
SELECT 
  TO_CHAR(created_at, 'YYYY-MM-DD') as period,
  COALESCE(SUM(total_price), 0) as revenue,
  COUNT(*) as bookings,
  COALESCE(AVG(total_price), 0) as average_booking_value
FROM bookings
WHERE created_at >= $1 
  AND created_at <= $2
  AND status IN ('confirmed', 'completed')
GROUP BY period
ORDER BY period ASC
```

## Database Tables Used

- `bookings` - Main booking records
- `trips` - Trip schedules
- `routes` - Route definitions
- `operators` - Bus operators
- `buses` - Bus fleet information

## Authentication

This service assumes authentication is handled by the API Gateway. All endpoints should be protected with admin authentication middleware at the gateway level.

Expected middleware flow:
```
Client → API Gateway → Admin Auth Middleware → Analytics Service
```

## Error Codes

| Code | Description |
|------|-------------|
| `VAL_001` | Validation error (missing/invalid parameters) |
| `SYS_001` | Internal server error |

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t analytics-service:latest .

# Run container
docker run -p 3006:3006 \
  -e DB_HOST=postgres \
  -e DB_NAME=bus_booking \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  analytics-service:latest
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## Testing

Test endpoints using curl:

```bash
# Health check
curl http://localhost:3006/health

# Booking analytics
curl "http://localhost:3006/analytics/bookings?fromDate=2025-01-01&toDate=2025-01-31&groupBy=day"

# Revenue analytics
curl "http://localhost:3006/analytics/revenue?fromDate=2025-01-01&toDate=2025-01-31&groupBy=month"

# Dashboard summary
curl "http://localhost:3006/analytics/dashboard?fromDate=2025-01-01&toDate=2025-01-31"
```

## Future Enhancements

- [ ] Add conversion rate tracking (requires trip view logging)
- [ ] Add caching layer (Redis) for frequently accessed analytics
- [ ] Add real-time analytics using WebSocket
- [ ] Add export functionality (CSV, PDF reports)
- [ ] Add comparative analytics (period over period)
- [ ] Add predictive analytics (booking forecasting)

## Notes

- Service runs on port **3006** (different from booking-service on port 3001)
- Uses same PostgreSQL database as booking-service
- All revenue calculations exclude pending bookings
- Cancellation rate = (cancelled / total) * 100
- Success rate = (confirmed / (confirmed + cancelled)) * 100
- Conversion rate is currently `null` (TODO: implement trip view tracking)

## Support

For issues or questions, contact the backend development team.
