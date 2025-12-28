# Admin Operator Management API

## Overview
Admin endpoints for managing bus operators in the system. Includes operator approval, suspension, analytics, and performance monitoring.

**Base URL:** `http://localhost:3004` (trip-service)  
**Authentication:** Bearer Token (Admin JWT)

---

## 🔐 Authentication
All operator management endpoints require:
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## 📋 API Endpoints

### 1. Get All Operators
**GET** `/admin/operators` or via API Gateway: `GET /operators/admin`

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Results per page (max 100) |
| status | string | No | - | Filter by status: `pending`, `approved`, `rejected`, `suspended` |
| search | string | No | - | Search by name, email, or phone |
| sortBy | string | No | created_at | Sort column: `created_at`, `name`, `rating`, `status` |
| sortOrder | string | No | DESC | Sort order: `ASC` or `DESC` |

#### Example Request
```bash
# Direct to trip-service
curl -X GET "http://localhost:3004/admin/operators?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Via API Gateway
curl -X GET "http://localhost:3000/operators/admin?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "operatorId": "uuid",
      "name": "SaiGon Express",
      "email": "contact@saigonexpress.vn",
      "phone": "+84901234567",
      "licenseNumber": "LIC2025001",
      "status": "pending",
      "rating": 4.2,
      "totalTrips": 150,
      "totalRevenue": 45000000,
      "createdAt": "2025-12-20T10:00:00.000Z",
      "documents": [
        {
          "type": "business_license",
          "url": "https://storage.example.com/license.pdf",
          "verified": true
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 2. Get Operator Details
**GET** `/admin/operators/:id` or via API Gateway: `GET /operators/admin/:id`

#### Path Parameters
- `id` (string, required) - Operator UUID

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "operatorId": "uuid",
    "name": "SaiGon Express",
    "email": "contact@saigonexpress.vn",
    "phone": "+84901234567",
    "licenseNumber": "LIC2025001",
    "status": "approved",
    "rating": 4.2,
    "totalTrips": 150,
    "totalRevenue": 45000000,
    "occupancyRate": 85.5,
    "createdAt": "2025-12-20T10:00:00.000Z",
    "approvedAt": "2025-12-21T09:00:00.000Z",
    "approvedBy": "admin@example.com",
    "documents": [
      {
        "type": "business_license",
        "url": "https://storage.example.com/license.pdf",
        "verified": true,
        "verifiedAt": "2025-12-21T09:00:00.000Z"
      }
    ],
    "buses": [
      {
        "busId": "uuid",
        "licensePlate": "51A-12345",
        "model": "Thaco King Long",
        "capacity": 45,
        "status": "active"
      }
    ]
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 3. Approve Operator
**PUT** `/admin/operators/:id/approve` or via API Gateway: `PUT /operators/admin/:id/approve`

#### Path Parameters
- `id` (string, required) - Operator UUID

#### Request Body
```json
{
  "approved": true,
  "notes": "All documents verified. Business license and insurance valid."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| approved | boolean | Yes | true for approval, false for rejection |
| notes | string | No | Review notes (max 500 chars) |

#### Example Request
```bash
curl -X PUT "http://localhost:3004/admin/operators/<operator_id>/approve" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "All documents verified. Business license and insurance valid."
  }'
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "operatorId": "uuid",
    "name": "SaiGon Express",
    "status": "approved",
    "approvedAt": "2025-12-28T10:00:00.000Z",
    "approvedBy": "admin@example.com",
    "notes": "All documents verified. Business license and insurance valid."
  },
  "message": "Operator approved successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 4. Suspend Operator
**PUT** `/admin/operators/:id/suspend` or via API Gateway: `PUT /operators/admin/:id/suspend`

#### Path Parameters
- `id` (string, required) - Operator UUID

#### Request Body
```json
{
  "notes": "Multiple customer complaints about service quality"
}
```

#### Example Request
```bash
curl -X PUT "http://localhost:3004/admin/operators/<operator_id>/suspend" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Multiple customer complaints about service quality"
  }'
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "operatorId": "uuid",
    "name": "SaiGon Express",
    "status": "suspended",
    "suspendedAt": "2025-12-28T10:00:00.000Z",
    "suspendedBy": "admin@example.com",
    "notes": "Multiple customer complaints about service quality"
  },
  "message": "Operator suspended successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 5. Reactivate Operator
**PUT** `/admin/operators/:id/activate` or via API Gateway: `PUT /operators/admin/:id/activate`

#### Path Parameters
- `id` (string, required) - Operator UUID

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "operatorId": "uuid",
    "name": "SaiGon Express",
    "status": "approved",
    "reactivatedAt": "2025-12-28T10:00:00.000Z",
    "reactivatedBy": "admin@example.com"
  },
  "message": "Operator activated successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 6. Get Operator Analytics
**GET** `/admin/operators/:id/analytics` or via API Gateway: `GET /operators/admin/:id/analytics`

#### Path Parameters
- `id` (string, required) - Operator UUID

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "operatorId": "uuid",
    "name": "SaiGon Express",
    "overall": {
      "totalTrips": 150,
      "completedTrips": 145,
      "cancelledTrips": 5,
      "avgOccupancy": 85.5,
      "totalRevenue": 45000000,
      "avgRating": 4.2,
      "totalRatings": 320
    },
    "monthly": [
      {
        "month": "2025-12",
        "trips": 45,
        "revenue": 13500000,
        "occupancy": 87.2,
        "rating": 4.3
      }
    ],
    "performance": {
      "onTimeRate": 92.5,
      "cancellationRate": 3.3,
      "customerSatisfaction": 4.2
    }
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 7. Get Overall Operator Analytics
**GET** `/admin/operators/analytics/overview` or via API Gateway: `GET /operators/admin/analytics/overview`

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalOperators": 25,
      "approvedOperators": 20,
      "pendingOperators": 3,
      "rejectedOperators": 1,
      "suspendedOperators": 1,
      "averageRating": 4.1,
      "ratedOperators": 18
    },
    "topRated": [
      {
        "operatorId": "uuid",
        "name": "SaiGon Express",
        "rating": 4.8
      }
    ],
    "mostTrips": [
      {
        "operatorId": "uuid",
        "name": "The Sinh Tourist",
        "totalTrips": 500
      }
    ],
    "topRevenue": [
      {
        "operatorId": "uuid",
        "name": "Sapaco Tourist",
        "totalRevenue": 150000000
      }
    ]
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

## 🔍 Filter Examples

### Filter by Status
```bash
GET /operators/admin?status=pending&page=1&limit=20
```

### Search Operators
```bash
GET /operators/admin?search=saigon&page=1&limit=20
```

### Sort by Rating
```bash
GET /operators/admin?sortBy=rating&sortOrder=DESC&page=1&limit=20
```

### Combined Filters
```bash
GET /operators/admin?status=approved&search=tourist&sortBy=rating&sortOrder=DESC&page=1&limit=10
```

---

## 📊 Business Logic

### Operator Lifecycle Management

#### 1. Registration Process
- **Pending**: Initial state after operator registration
- **Document Verification**: Admin reviews business license, insurance, vehicle documents
- **Approval**: Operator gains access to create trips and manage fleet
- **Active Operation**: Regular monitoring and performance tracking

#### 2. Status Transitions
```
pending → approved (admin approval)
pending → rejected (admin rejection)
approved → suspended (admin suspension due to violations)
suspended → approved (admin reactivation)
```

#### 3. Performance Monitoring
- **Occupancy Rate**: Average seat utilization across all trips
- **On-time Performance**: Percentage of trips departing/arriving on schedule
- **Customer Ratings**: Average rating from passenger feedback
- **Cancellation Rate**: Percentage of trips cancelled by operator

#### 4. Quality Assurance
- **Document Verification**: All legal documents must be valid and current
- **Vehicle Inspection**: Regular checks on bus condition and safety
- **Service Standards**: Minimum rating thresholds for continued operation
- **Customer Complaints**: Monitoring and response to passenger issues

### Analytics Calculations

#### Occupancy Rate
```sql
AVG(
  CASE WHEN t.status = 'completed' THEN
    CASE WHEN seat_counts.total_seats > 0 THEN
      (passenger_counts.confirmed_passengers::decimal / seat_counts.total_seats) * 100
    ELSE 0 END
  END
) as avg_occupancy
```

#### Revenue Tracking
- Total revenue from confirmed bookings
- Commission calculations (platform fees)
- Revenue trends and forecasting

#### Rating Aggregation
- Weighted average of all customer ratings
- Rating distribution analysis
- Trend analysis over time

### Suspension Criteria
- **Rating Threshold**: Below 3.0 average rating
- **Cancellation Rate**: Above 10% cancellation rate
- **Customer Complaints**: Multiple unresolved complaints
- **Regulatory Violations**: Non-compliance with transport regulations
- **Safety Issues**: Vehicle maintenance or safety concerns

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
node test-admin-operator-api.js
```

Before running tests:
1. Start trip-service: `npm start`
2. Get admin JWT token
3. Update `ADMIN_TOKEN` in test file

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| VAL_001 | Validation error |
| AUTH_003 | Unauthorized access |
| OPER_001 | Operator not found |
| OPER_002 | Invalid status transition |
| OPER_003 | Missing required documents |
| SYS_001 | Internal server error |

---

## 🚀 Future Enhancements

1. **Automated Approval**
   - AI-powered document verification
   - Automated compliance checking
   - Risk scoring for new operators

2. **Advanced Analytics**
   - Predictive performance modeling
   - Route optimization recommendations
   - Dynamic pricing suggestions

3. **Quality Monitoring**
   - Real-time GPS tracking
   - Automated customer feedback analysis
   - Predictive maintenance alerts

4. **Integration**
   - Insurance company API integration
   - Vehicle registration database sync
   - Regulatory compliance automation

5. **Bulk Operations**
   - Bulk approval/rejection
   - Bulk status updates
   - Mass communication tools</content>
<parameter name="filePath">c:\Users\HP\clones\bus-ticket-booking-system\backend\services\trip-service\ADMIN_OPERATOR_MANAGEMENT_API.md