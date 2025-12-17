# Analytics Service - Implementation Summary

## Service Overview

**Service Name**: `analytics-service`  
**Port**: `3006`  
**Purpose**: Admin booking analytics and revenue reporting  
**Database**: PostgreSQL (shared with booking-service)

## Technology Stack

- Node.js 18+ with Express.js
- PostgreSQL with pg driver
- Controller → Service → Repository architecture
- CORS enabled for frontend integration
- Morgan for request logging

## API Endpoints

### 1. GET `/analytics/bookings`
**Purpose**: Comprehensive booking analytics with trends and statistics

**Query Parameters**:
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): day | week | month

**What it provides**:
- Total bookings count
- Success rate (confirmed / total)
- Cancellation rate
- Booking trends over time (grouped by period)
- Status distribution (confirmed, cancelled, pending)
- Top 10 most booked routes with revenue
- Detailed cancellation statistics

**Use case**: Admin dashboard booking overview, trend analysis

---

### 2. GET `/analytics/revenue`
**Purpose**: Comprehensive revenue analytics with multiple dimensions

**Query Parameters**:
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): day | week | month
- `operatorId` (optional): Filter by operator UUID

**What it provides**:
- Total revenue and average booking value
- Revenue trends over time
- Top 10 routes by revenue
- Revenue breakdown by booking status
- Top 10 operators by revenue

**Use case**: Financial reporting, revenue analysis, operator performance tracking

---

### 3. GET `/analytics/dashboard`
**Purpose**: Quick summary statistics for dashboard overview

**Query Parameters**:
- `fromDate` (required): Start date (YYYY-MM-DD)
- `toDate` (required): End date (YYYY-MM-DD)

**What it provides**:
- Revenue summary (total, average)
- Booking counts (total, confirmed, cancelled)
- Cancellation rate

**Use case**: Dashboard summary cards, quick metrics

---

### 4. GET `/health`
**Purpose**: Service health check

**Use case**: Monitoring, container orchestration health checks

## Architecture

```
analytics-service/
├── src/
│   ├── controllers/
│   │   └── analyticsController.js    # HTTP handling, validation
│   ├── services/
│   │   └── analyticsService.js       # Business logic
│   ├── repositories/
│   │   └── analyticsRepository.js    # SQL queries only
│   ├── config/
│   │   └── database.js               # PostgreSQL connection
│   └── index.js                      # Express server (port 3006)
├── package.json
├── Dockerfile
├── .env.example
└── README.md
```

## Key Features

### Booking Analytics
1. **Booking Trends**: Track bookings over time (daily/weekly/monthly)
2. **Status Distribution**: Breakdown by confirmed/cancelled/pending
3. **Top Routes**: Most popular routes by booking count
4. **Cancellation Analysis**: Cancellation rate, lost revenue

### Revenue Analytics
1. **Revenue Trends**: Track revenue over time
2. **Route Performance**: Revenue by route
3. **Status Breakdown**: Revenue by booking status
4. **Operator Performance**: Revenue by operator

### Data Processing
- Parallel query execution for performance
- Date validation and range checking
- Currency formatting (VND)
- Percentage calculations
- Average value computations

## SQL Queries Implemented

1. **getTotalBookings**: Count bookings with filters
2. **getBookingTrends**: Time-series booking data
3. **getBookingStatusDistribution**: Status percentages
4. **getTopRoutes**: Most booked routes
5. **getTotalRevenue**: Revenue summary
6. **getRevenueTrends**: Time-series revenue data
7. **getRevenueByRoute**: Route revenue breakdown
8. **getRevenueByStatus**: Status revenue breakdown
9. **getRevenueByOperator**: Operator revenue breakdown
10. **getCancellationStats**: Cancellation metrics

## Response Format

All responses follow the standard format:

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "operation description",
  "timestamp": "2025-12-17T10:30:00Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "error description"
  },
  "timestamp": "2025-12-17T10:30:00Z"
}
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   cd backend/services/analytics-service
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run service**:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

4. **Test endpoints**:
   ```bash
   curl http://localhost:3006/health
   curl "http://localhost:3006/analytics/bookings?fromDate=2025-01-01&toDate=2025-01-31"
   ```

## Database Requirements

Uses existing tables from booking-service:
- `bookings` - Booking records
- `trips` - Trip schedules
- `routes` - Route definitions
- `operators` - Operator information
- `buses` - Bus fleet

**No new tables required** - reads from existing data.

## Security

- Assumes admin authentication at API Gateway level
- No direct authentication in service (gateway handles it)
- CORS enabled for frontend integration
- Input validation on all endpoints
- Parameterized SQL queries (SQL injection protection)

## Performance Considerations

- Uses PostgreSQL connection pooling (max 20 connections)
- Parallel query execution with Promise.all()
- Efficient SQL queries with proper indexes (assumes existing)
- No caching layer yet (future enhancement)

## Error Handling

- Input validation (missing/invalid parameters)
- Date validation (invalid dates, from > to)
- Database connection errors
- Query execution errors
- Graceful error responses with error codes

## Extensibility

The service is designed to be easily extended:

1. **Add new analytics**: Create new methods in repository → service → controller
2. **Add filters**: Add query parameters and modify SQL queries
3. **Add caching**: Integrate Redis at service layer
4. **Add exports**: Add PDF/CSV generation endpoints
5. **Add real-time**: Integrate WebSocket for live updates

## Docker Support

Includes Dockerfile with:
- Node.js 18 Alpine base
- Health check endpoint
- Production-ready configuration
- Exposed port 3006

## Frontend Integration

Frontend can directly consume these endpoints for admin dashboards:

```typescript
// Example frontend usage
const getBookingAnalytics = async (fromDate: string, toDate: string) => {
  const response = await fetch(
    `http://localhost:3006/analytics/bookings?fromDate=${fromDate}&toDate=${toDate}`
  );
  return response.json();
};
```

## Status

✅ **Complete and Ready for Use**

All requirements implemented:
- ✅ Booking analytics API
- ✅ Revenue analytics API
- ✅ Dashboard summary API
- ✅ Controller-Service-Repository pattern
- ✅ SQL queries separated in repository
- ✅ Input validation
- ✅ Error handling
- ✅ Documentation
- ✅ Docker support
- ✅ Running on port 3006

## Notes

- **Conversion rate** is set to `null` (requires trip view tracking - marked as TODO)
- Service is admin-only (assumes gateway authentication)
- All monetary values in VND
- Uses existing database schema (no migrations needed)
- Ready for immediate integration with admin frontend

## Next Steps for Production

1. Deploy to container orchestration (Docker Compose/Kubernetes)
2. Configure API Gateway routing
3. Add admin authentication middleware at gateway
4. Set up monitoring and logging
5. Add caching layer if needed for performance
6. Implement trip view tracking for conversion rate
