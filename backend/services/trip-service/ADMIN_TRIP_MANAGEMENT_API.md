# Admin Trip Management API

## Overview

Admin endpoints for managing bus trips in the system. Includes trip creation, updates, cancellations, and bulk operations.

**Base URL:** `http://localhost:3004` (trip-service)  
**Authentication:** Bearer Token (Admin JWT)

---

## � Trip Status Transitions

Trip statuses follow strict state transitions to ensure data integrity:

### Valid Statuses

- `scheduled`: Trip is planned and ready for booking
- `in_progress`: Trip has started (departed)
- `completed`: Trip has finished successfully
- `cancelled`: Trip has been cancelled

### Allowed Transitions

| From Status   | To Status     | Description                     |
| ------------- | ------------- | ------------------------------- |
| `scheduled`   | `in_progress` | Trip starts                     |
| `scheduled`   | `cancelled`   | Trip cancelled before departure |
| `in_progress` | `completed`   | Trip finishes                   |
| `in_progress` | `cancelled`   | Trip cancelled after departure  |
| `completed`   | -             | No further transitions allowed  |
| `cancelled`   | -             | No further transitions allowed  |

### Validation

- **Frontend**: Shows error message for invalid transitions
- **Backend**: Returns 400 error for invalid transitions
- **Error Message**: `Invalid status transition from {current} to {target}`

---

## �🔐 Authentication

All trip management endpoints require:

```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## 📋 API Endpoints

### 1. Get All Trips (Admin)

**GET** `/admin/trips` or via API Gateway: `GET /trips/admin`

#### Query Parameters

| Parameter           | Type    | Required | Default        | Description                                                         |
| ------------------- | ------- | -------- | -------------- | ------------------------------------------------------------------- |
| page                | integer | No       | 1              | Page number                                                         |
| limit               | integer | No       | 20             | Results per page (max 100)                                          |
| status              | string  | No       | -              | Filter by status: `scheduled`, `departed`, `completed`, `cancelled` |
| route_id            | string  | No       | -              | Filter by route UUID                                                |
| bus_id              | string  | No       | -              | Filter by bus UUID                                                  |
| operator_id         | string  | No       | -              | Filter by operator UUID                                             |
| departure_date_from | ISO8601 | No       | -              | Filter trips from this date                                         |
| departure_date_to   | ISO8601 | No       | -              | Filter trips until this date                                        |
| search              | string  | No       | -              | Search in route origin/destination                                  |
| sort_by             | string  | No       | departure_time | Sort by: `departure_time`, `bookings`, `created_at`                 |
| sort_order          | string  | No       | desc           | Sort order: `asc` or `desc`                                         |

#### Example Request

```bash
# Direct to trip-service
curl -X GET "http://localhost:3004/admin/trips?page=1&limit=10&status=scheduled&operator_id=<operator_id>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Via API Gateway
curl -X GET "http://localhost:3000/trips/admin?page=1&limit=10&status=scheduled&operator_id=<operator_id>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "trip_id": "uuid",
        "route": {
          "origin": "Ho Chi Minh City",
          "destination": "Da Lat"
        },
        "bus": {
          "license_plate": "51A-12345",
          "capacity": 45
        },
        "operator": {
          "name": "SaiGon Express"
        },
        "schedule": {
          "departure_time": "2025-12-28T08:00:00.000Z",
          "arrival_time": "2025-12-28T14:00:00.000Z",
          "duration_hours": 6
        },
        "pricing": {
          "base_price": 150000,
          "currency": "VND"
        },
        "status": "scheduled",
        "bookings_count": 32,
        "available_seats": 13,
        "created_at": "2025-12-20T10:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10,
    "total_pages": 15
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 2. Create Trip

**POST** `/admin/trips` or via API Gateway: `POST /trips/admin`

#### Request Body

```json
{
  "route_id": "uuid",
  "bus_id": "uuid",
  "departure_time": "2025-12-28T08:00:00.000Z",
  "arrival_time": "2025-12-28T14:00:00.000Z",
  "base_price": 150000,
  "currency": "VND",
  "status": "scheduled"
}
```

| Field          | Type    | Required | Validation                           |
| -------------- | ------- | -------- | ------------------------------------ |
| route_id       | string  | Yes      | Valid route UUID                     |
| bus_id         | string  | Yes      | Valid bus UUID, not already assigned |
| departure_time | ISO8601 | Yes      | Future date, before arrival_time     |
| arrival_time   | ISO8601 | Yes      | After departure_time                 |
| base_price     | number  | Yes      | > 0                                  |
| currency       | string  | No       | Default: VND                         |
| status         | string  | No       | Default: scheduled                   |

#### Example Request

```bash
curl -X POST "http://localhost:3004/admin/trips" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "route_id": "uuid",
    "bus_id": "uuid",
    "departure_time": "2025-12-28T08:00:00.000Z",
    "arrival_time": "2025-12-28T14:00:00.000Z",
    "base_price": 150000,
    "currency": "VND"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "trip_id": "uuid",
    "route_id": "uuid",
    "bus_id": "uuid",
    "departure_time": "2025-12-28T08:00:00.000Z",
    "arrival_time": "2025-12-28T14:00:00.000Z",
    "base_price": 150000,
    "currency": "VND",
    "status": "scheduled",
    "created_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Trip created successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)

```json
{
  "success": false,
  "error": {
    "code": "TRIP_OVERLAP",
    "message": "Bus is already assigned to another trip during this time period"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 3. Update Trip

**PUT** `/admin/trips/:id` or via API Gateway: `PUT /trips/admin/:id`

#### Path Parameters

- `id` (string, required) - Trip UUID

#### Request Body

```json
{
  "departure_time": "2025-12-28T09:00:00.000Z",
  "arrival_time": "2025-12-28T15:00:00.000Z",
  "base_price": 160000,
  "status": "scheduled"
}
```

**Updatable fields:** `departure_time`, `arrival_time`, `base_price`, `currency`, `status`

#### Example Request

```bash
curl -X PUT "http://localhost:3004/admin/trips/<trip_id>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "departure_time": "2025-12-28T09:00:00.000Z",
    "arrival_time": "2025-12-28T15:00:00.000Z",
    "base_price": 160000
  }'
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "trip_id": "uuid",
    "departure_time": "2025-12-28T09:00:00.000Z",
    "arrival_time": "2025-12-28T15:00:00.000Z",
    "base_price": 160000,
    "updated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Trip updated successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 4. Delete Trip

**DELETE** `/admin/trips/:id` or via API Gateway: `DELETE /trips/admin/:id`

#### Path Parameters

- `id` (string, required) - Trip UUID

**Note:** Only trips with no confirmed bookings can be deleted.

#### Success Response (200)

```json
{
  "success": true,
  "message": "Trip deleted successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)

```json
{
  "success": false,
  "error": {
    "code": "TRIP_HAS_BOOKINGS",
    "message": "Cannot delete trip with existing bookings"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 5. Assign Bus to Trip

**POST** `/admin/trips/:id/assign-bus` or via API Gateway: `POST /trips/admin/:id/assign-bus`

#### Path Parameters

- `id` (string, required) - Trip UUID

#### Request Body

```json
{
  "bus_id": "uuid"
}
```

#### Example Request

```bash
curl -X POST "http://localhost:3004/admin/trips/<trip_id>/assign-bus" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type": application/json" \
  -d '{"bus_id": "uuid"}'
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "trip_id": "uuid",
    "bus_id": "uuid",
    "updated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Bus assigned to trip successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 6. Assign Route to Trip

**POST** `/admin/trips/:id/assign-route` or via API Gateway: `POST /trips/admin/:id/assign-route`

#### Path Parameters

- `id` (string, required) - Trip UUID

#### Request Body

```json
{
  "route_id": "uuid"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "trip_id": "uuid",
    "route_id": "uuid",
    "updated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Route assigned to trip successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 7. Update Trip Status

**PATCH** `/admin/trips/:id/status` or via API Gateway: `PATCH /trips/admin/:id/status`

#### Path Parameters

- `id` (string, required) - Trip UUID

#### Request Body

```json
{
  "status": "departed"
}
```

**Valid statuses:** `scheduled`, `departed`, `completed`, `cancelled`

#### Example Request

```bash
curl -X PATCH "http://localhost:3004/admin/trips/<trip_id>/status" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type": application/json" \
  -d '{"status": "departed"}'
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "trip_id": "uuid",
    "status": "departed",
    "updated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Trip status updated successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 8. Cancel Trip

**POST** `/admin/trips/:id/cancel` or via API Gateway: `POST /trips/admin/:id/cancel`

#### Path Parameters

- `id` (string, required) - Trip UUID

#### Request Body

```json
{
  "refund_reason": "Bus mechanical failure"
}
```

#### Business Logic

1. **Status Update**: Trip status changed to `cancelled`
2. **Bulk Refund**: Automatically processes refunds for all confirmed bookings
3. **Notification**: Sends cancellation notifications to affected passengers
4. **Audit Trail**: Logs cancellation reason and admin who performed the action

#### Example Request

```bash
curl -X POST "http://localhost:3004/admin/trips/<trip_id>/cancel" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"refund_reason": "Bus mechanical failure"}'
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "trip": {
      "trip_id": "uuid",
      "status": "cancelled",
      "cancelled_at": "2025-12-28T10:00:00.000Z"
    },
    "refundResult": {
      "totalBookings": 25,
      "successfulRefunds": 25,
      "failedRefunds": 0,
      "totalRefundAmount": 3750000
    }
  },
  "message": "Trip cancelled successfully. All confirmed bookings have been refunded.",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Partial Success Response (207)

```json
{
  "success": true,
  "data": {
    "trip": {
      "trip_id": "uuid",
      "status": "cancelled"
    },
    "refundError": "Booking service timeout"
  },
  "message": "Trip cancelled successfully, but bulk refund processing failed. Please check booking service logs.",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

## 🔍 Filter Examples

### Filter by Date Range

```bash
GET /trips/admin?departure_date_from=2025-12-01&departure_date_to=2025-12-31
```

### Filter by Operator and Status

```bash
GET /trips/admin?operator_id=<operator_id>&status=scheduled&page=1&limit=20
```

### Search by Route

```bash
GET /trips/admin?search=saigon&page=1&limit=20
```

### Sort by Bookings Count

```bash
GET /trips/admin?sort_by=bookings&sort_order=desc&page=1&limit=20
```

### Combined Filters

```bash
GET /trips/admin?status=scheduled&operator_id=<operator_id>&departure_date_from=2025-12-01&sort_by=departure_time&sort_order=asc&page=1&limit=10
```

---

## 📊 Business Logic

### Trip Creation Rules

#### 1. Bus Availability Check

- Bus cannot be assigned to overlapping trips
- Time overlap detection: `departure_time < existing_arrival AND arrival_time > existing_departure`

#### 2. Route Validation

- Route must exist and be active
- Origin and destination cities must be valid

#### 3. Schedule Validation

- Departure time must be in the future
- Arrival time must be after departure time
- Duration should be reasonable (1-24 hours)

#### 4. Pricing Rules

- Base price must be positive
- Currency validation (VND, USD)
- Price consistency with route pricing

### Trip Status Management

#### Status Transitions

```
scheduled → departed (when bus departs)
departed → completed (when bus arrives)
scheduled → cancelled (admin cancellation)
departed → cancelled (emergency cancellation)
```

#### Status Change Restrictions

- Cannot change status of completed trips
- Cancelled trips cannot be reactivated
- Departed trips cannot go back to scheduled

### Cancellation and Refund Logic

#### 1. Automatic Refund Processing

- Identifies all confirmed bookings for the trip
- Calculates refund amounts based on cancellation policy
- Processes refunds via booking service
- Updates booking statuses to cancelled

#### 2. Refund Policy Tiers

- **>24 hours before departure**: 100% refund
- **12-24 hours before departure**: 70% refund
- **6-12 hours before departure**: 50% refund
- **<6 hours before departure**: No refund

#### 3. Bulk Operation Handling

- Processes refunds in batches to avoid timeouts
- Continues processing even if some refunds fail
- Provides detailed success/failure reporting
- Maintains data consistency across services

### Performance Monitoring

#### Trip Metrics

- **Occupancy Rate**: `(booked_seats / total_seats) * 100`
- **Revenue Tracking**: Total revenue from confirmed bookings
- **On-time Performance**: Actual vs scheduled arrival times
- **Cancellation Rate**: Percentage of cancelled trips

#### Real-time Updates

- Live tracking of bus location (GPS integration)
- Automatic status updates based on GPS data
- Passenger notifications for delays/cancellations

---

## 🔐 Authorization

All endpoints require:

1. Valid JWT token
2. User role = `admin`

**Middleware:** `authenticate` → `authorize(['admin'])`

---

## 🧪 Testing

Run automated tests:

```bash
cd backend/services/trip-service
node test-admin-trip-api.js
```

Before running tests:

1. Start trip-service: `npm start`
2. Get admin JWT token
3. Update `ADMIN_TOKEN` in test file

---

## 📝 Error Codes

| Code               | Description                              |
| ------------------ | ---------------------------------------- |
| VAL_001            | Validation error                         |
| AUTH_003           | Unauthorized access                      |
| TRIP_NOT_FOUND     | Trip not found                           |
| TRIP_OVERLAP       | Bus already assigned to overlapping trip |
| TRIP_HAS_BOOKINGS  | Cannot delete trip with bookings         |
| RESOURCE_NOT_FOUND | Route or bus not found                   |
| SYS_001            | Internal server error                    |

---

## 🚀 Future Enhancements

1. **Bulk Operations**
   - Bulk trip creation via CSV upload
   - Bulk status updates for multiple trips
   - Bulk cancellations with custom refund policies

2. **Advanced Scheduling**
   - Recurring trip patterns (daily, weekly)
   - Dynamic pricing based on demand
   - Automated trip optimization

3. **Real-time Tracking**
   - GPS integration for live bus tracking
   - Automatic delay detection and notifications
   - ETA calculations and updates

4. **Analytics & Reporting**
   - Trip performance dashboards
   - Revenue analytics by route/operator
   - Passenger demand forecasting

5. **Integration**
   - Weather API for delay predictions
   - Traffic data for route optimization
   - Third-party booking system sync</content>
     <parameter name="filePath">c:\Users\HP\clones\bus-ticket-booking-system\backend\services\trip-service\ADMIN_TRIP_MANAGEMENT_API.md
