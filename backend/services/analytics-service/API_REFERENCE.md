# Analytics Service - Quick API Reference

## Base URL
`http://localhost:3006`

## Endpoints

### 1. Booking Analytics
```
GET /analytics/bookings?fromDate=2025-01-01&toDate=2025-01-31&groupBy=day
```

**Returns**:
- Total bookings, success rate, cancellation rate
- Booking trends over time
- Status distribution
- Top 10 routes by bookings
- Cancellation statistics

---

### 2. Revenue Analytics
```
GET /analytics/revenue?fromDate=2025-01-01&toDate=2025-01-31&groupBy=month
```

**Returns**:
- Total revenue, average booking value
- Revenue trends over time
- Top 10 routes by revenue
- Revenue by status (confirmed, cancelled)
- Top 10 operators by revenue

---

### 3. Dashboard Summary
```
GET /analytics/dashboard?fromDate=2025-01-01&toDate=2025-01-31
```

**Returns**:
- Quick revenue summary
- Booking counts
- Cancellation rate

---

### 4. Health Check
```
GET /health
```

**Returns**: Service status

## Parameters

| Parameter | Type | Required | Options | Description |
|-----------|------|----------|---------|-------------|
| fromDate | string | Yes | YYYY-MM-DD | Start date |
| toDate | string | Yes | YYYY-MM-DD | End date |
| groupBy | string | No | day, week, month | Time grouping |
| operatorId | string | No | UUID | Filter by operator |

## Example Usage

### cURL
```bash
# Booking analytics
curl "http://localhost:3006/analytics/bookings?fromDate=2025-01-01&toDate=2025-01-31"

# Revenue analytics with monthly grouping
curl "http://localhost:3006/analytics/revenue?fromDate=2025-01-01&toDate=2025-12-31&groupBy=month"

# Dashboard summary
curl "http://localhost:3006/analytics/dashboard?fromDate=2025-01-01&toDate=2025-01-31"
```

### JavaScript/TypeScript
```typescript
const API_BASE = 'http://localhost:3006';

// Booking analytics
const getBookingAnalytics = async (from: string, to: string) => {
  const response = await fetch(
    `${API_BASE}/analytics/bookings?fromDate=${from}&toDate=${to}&groupBy=day`
  );
  return response.json();
};

// Revenue analytics
const getRevenueAnalytics = async (from: string, to: string) => {
  const response = await fetch(
    `${API_BASE}/analytics/revenue?fromDate=${from}&toDate=${to}&groupBy=month`
  );
  return response.json();
};

// Dashboard summary
const getDashboardSummary = async (from: string, to: string) => {
  const response = await fetch(
    `${API_BASE}/analytics/dashboard?fromDate=${from}&toDate=${to}`
  );
  return response.json();
};
```

## Response Structure

All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "message": "...",
  "timestamp": "2025-12-17T10:30:00Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| VAL_001 | Validation error |
| SYS_001 | Internal server error |

## Port

**3006** (different from booking-service)
