# Admin Bus Management API

## Overview

Admin endpoints for managing bus fleet in the system. Includes bus registration, maintenance tracking, seat layout management, and availability checking.

**Base URL:** `http://localhost:3004` (trip-service)  
**Authentication:** Bearer Token (Admin JWT)

---

## 🔐 Authentication

All bus management endpoints require:

```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## 📋 API Endpoints

### 1. Get All Buses

**GET** `/admin/buses` or via API Gateway: `GET /buses/admin`

#### Query Parameters

| Parameter       | Type    | Required | Default | Description                                           |
| --------------- | ------- | -------- | ------- | ----------------------------------------------------- |
| page            | integer | No       | 1       | Page number                                           |
| limit           | integer | No       | 20      | Results per page (max 100)                            |
| status          | string  | No       | -       | Filter by status: `active`, `maintenance`, `inactive` |
| search          | string  | No       | -       | Search by license plate or model                      |
| type            | string  | No       | -       | Filter by bus type: `standard`, `vip`, `sleeper`      |
| operator_id     | string  | No       | -       | Filter by operator UUID                               |
| has_seat_layout | boolean | No       | -       | Filter buses with/without seat layout                 |

#### Example Request

```bash
# Direct to trip-service
curl -X GET "http://localhost:3004/admin/buses?page=1&limit=10&status=active&operator_id=<operator_id>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Via API Gateway
curl -X GET "http://localhost:3000/buses/admin?page=1&limit=10&status=active&operator_id=<operator_id>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "bus_id": "uuid",
      "license_plate": "51A-12345",
      "model_name": "Thaco King Long X80",
      "capacity": 45,
      "bus_type": "standard",
      "operator": {
        "name": "SaiGon Express",
        "operator_id": "uuid"
      },
      "status": "active",
      "has_seat_layout": true,
      "total_seats": 45,
      "active_seats": 43,
      "created_at": "2025-12-20T10:00:00.000Z",
      "last_maintenance": "2025-12-15T08:00:00.000Z"
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

### 2. Get Bus Details

**GET** `/admin/buses/:id` or via API Gateway: `GET /buses/admin/:id`

#### Path Parameters

- `id` (string, required) - Bus UUID

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "license_plate": "51A-12345",
    "model_name": "Thaco King Long X80",
    "capacity": 45,
    "bus_type": "standard",
    "operator": {
      "name": "SaiGon Express",
      "operator_id": "uuid"
    },
    "status": "active",
    "has_seat_layout": true,
    "total_seats": 45,
    "active_seats": 43,
    "seat_layout": {
      "layout_id": "uuid",
      "rows": 12,
      "columns": 4,
      "driver_position": "front",
      "door_position": "middle",
      "aisle_position": "center"
    },
    "maintenance_history": [
      {
        "date": "2025-12-15T08:00:00.000Z",
        "type": "regular",
        "description": "Oil change and tire rotation",
        "cost": 2500000
      }
    ],
    "created_at": "2025-12-20T10:00:00.000Z",
    "updated_at": "2025-12-27T14:30:00.000Z"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 3. Create Bus

**POST** `/admin/buses` or via API Gateway: `POST /buses/admin`

#### Request Body

```json
{
  "license_plate": "51A-12345",
  "model": "Thaco King Long X80",
  "operator_id": "uuid",
  "capacity": 45,
  "bus_type": "standard"
}
```

| Field         | Type    | Required | Validation                                 |
| ------------- | ------- | -------- | ------------------------------------------ |
| license_plate | string  | Yes      | Unique, valid format                       |
| model         | string  | Yes      | Must exist in bus_models table             |
| operator_id   | string  | Yes      | Valid operator UUID                        |
| capacity      | integer | No       | Auto-calculated from model if not provided |
| bus_type      | string  | No       | `standard`, `vip`, `sleeper`               |

#### Example Request

```bash
curl -X POST "http://localhost:3004/admin/buses" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "51A-12345",
    "model": "Thaco King Long X80",
    "operator_id": "uuid",
    "capacity": 45,
    "bus_type": "standard"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "license_plate": "51A-12345",
    "model_name": "Thaco King Long X80",
    "capacity": 45,
    "bus_type": "standard",
    "operator": {
      "name": "SaiGon Express"
    },
    "status": "active",
    "has_seat_layout": false,
    "total_seats": 0,
    "active_seats": 0
  },
  "message": "Create bus successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)

```json
{
  "success": false,
  "error": {
    "code": "BUS_001",
    "message": "This license plate already exists"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 4. Update Bus

**PUT** `/admin/buses/:id` or via API Gateway: `PUT /buses/admin/:id`

#### Path Parameters

- `id` (string, required) - Bus UUID

#### Request Body

```json
{
  "license_plate": "51A-12346",
  "model": "Thaco King Long X80 VIP",
  "bus_type": "vip",
  "status": "active"
}
```

**Updatable fields:** `license_plate`, `model`, `bus_type`, `status`

#### Business Logic

- **License Plate Change**: Validates uniqueness
- **Model Change**: Updates bus_model_id and capacity validation
- **Status Change**: Affects trip assignments

#### Example Request

```bash
curl -X PUT "http://localhost:3004/admin/buses/<bus_id>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "51A-12346",
    "model": "Thaco King Long X80 VIP",
    "bus_type": "vip"
  }'
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "license_plate": "51A-12346",
    "model_name": "Thaco King Long X80 VIP",
    "bus_type": "vip",
    "updated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Cập nhật xe thành công",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 5. Deactivate Bus

**PUT** `/admin/buses/:id/deactivate` or via API Gateway: `PUT /buses/admin/:id/deactivate`

#### Path Parameters

- `id` (string, required) - Bus UUID

#### Business Logic

1. **Status Change**: Sets status to `maintenance`
2. **Trip Impact**: Prevents new trip assignments
3. **Existing Trips**: May require reassignment if scheduled
4. **Audit Trail**: Logs deactivation reason and admin

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "license_plate": "51A-12345",
    "status": "maintenance",
    "deactivated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Bus has been successfully set to maintenance",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 6. Activate Bus

**PUT** `/admin/buses/:id/activate` or via API Gateway: `PUT /buses/admin/:id/activate`

#### Path Parameters

- `id` (string, required) - Bus UUID

#### Business Logic

1. **Status Validation**: Checks maintenance completion
2. **Safety Inspection**: Ensures bus is roadworthy
3. **Seat Layout**: Verifies seat configuration is complete
4. **Availability**: Makes bus available for trip assignments

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "license_plate": "51A-12345",
    "status": "active",
    "activated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Bus has been successfully activated",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 7. Delete Bus

**DELETE** `/admin/buses/:id` or via API Gateway: `DELETE /buses/admin/:id`

#### Path Parameters

- `id` (string, required) - Bus UUID

**Note:** Soft delete - sets status to `maintenance`. Only buses with no future trips can be deleted.

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "status": "maintenance"
  },
  "message": "Bus has been successfully set to maintenance",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)

```json
{
  "success": false,
  "error": {
    "code": "BUS_HAS_FUTURE_TRIPS",
    "message": "Cannot deactivate bus with scheduled future trips"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 8. Check Bus Availability

**GET** `/admin/buses/:id/availability` or via API Gateway: `GET /buses/admin/:id/availability`

#### Path Parameters

- `id` (string, required) - Bus UUID

#### Query Parameters

- `departure_time` (ISO8601, required) - Trip departure time
- `arrival_time` (ISO8601, required) - Trip arrival time

#### Business Logic

Checks if bus is available for the specified time period:

1. **Status Check**: Bus must be `active`
2. **Trip Overlap**: No conflicting trips in the time range
3. **Maintenance**: No scheduled maintenance during the period

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "license_plate": "51A-12345",
    "available": true,
    "conflicting_trips": [],
    "next_available": null
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Not Available Response (200)

```json
{
  "success": true,
  "data": {
    "bus_id": "uuid",
    "license_plate": "51A-12345",
    "available": false,
    "conflicting_trips": [
      {
        "trip_id": "uuid",
        "route": "Ho Chi Minh City → Da Lat",
        "departure_time": "2025-12-28T06:00:00.000Z",
        "arrival_time": "2025-12-28T12:00:00.000Z"
      }
    ],
    "next_available": "2025-12-28T14:00:00.000Z"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

## 🔍 Filter Examples

### Filter by Status and Type

```bash
GET /buses/admin?status=active&type=vip&page=1&limit=20
```

### Search by License Plate

```bash
GET /buses/admin?search=51A&page=1&limit=20
```

### Filter by Operator

```bash
GET /buses/admin?operator_id=<operator_id>&status=active&page=1&limit=20
```

### Buses with Seat Layout

```bash
GET /buses/admin?has_seat_layout=true&page=1&limit=20
```

### Combined Filters

```bash
GET /buses/admin?operator_id=<operator_id>&status=active&type=standard&has_seat_layout=true&page=1&limit=10
```

---

## 📊 Business Logic

### Bus Lifecycle Management

#### 1. Registration Process

- **License Plate Validation**: Unique across system
- **Model Assignment**: Links to predefined bus models with capacity
- **Operator Assignment**: Associates with approved operator
- **Initial Status**: `active` (ready for service)

#### 2. Status Management

```
active → maintenance (scheduled maintenance)
active → inactive (temporary out of service)
maintenance → active (maintenance completed)
inactive → active (returned to service)
```

#### 3. Maintenance Tracking

- **Scheduled Maintenance**: Regular service intervals
- **Unscheduled Repairs**: Breakdowns and emergency fixes
- **Compliance**: Regulatory inspection requirements
- **Cost Tracking**: Maintenance expense monitoring

### Availability Logic

#### Trip Assignment Rules

- **Time Overlap Detection**: Prevents double-booking
- **Buffer Time**: Includes travel time between trips
- **Maintenance Windows**: Blocks during scheduled maintenance
- **Emergency Overrides**: Admin can force assignments when necessary

#### Conflict Resolution

- **Automatic Detection**: System prevents conflicting assignments
- **Manual Override**: Admin can reassign buses in emergencies
- **Passenger Notification**: Automatic alerts for affected bookings
- **Alternative Options**: Suggests available replacement buses

### Seat Layout Management

#### Layout Configuration

- **Model-based**: Predefined layouts for each bus model
- **Customizable**: Admin can modify seat arrangements
- **Validation**: Ensures layout matches physical bus
- **Version Control**: Tracks layout changes over time

#### Seat Status Tracking

- **Active/Inactive**: Seats available for booking
- **Maintenance**: Temporarily out of service
- **VIP Configuration**: Premium seating options
- **Accessibility**: Special accommodation seats

### Performance Monitoring

#### Utilization Metrics

- **Occupancy Rate**: Average seat utilization across trips
- **Revenue per Trip**: Financial performance tracking
- **Maintenance Costs**: Expense monitoring and optimization
- **Downtime**: Tracking out-of-service periods

#### Fleet Analytics

- **Age Distribution**: Bus age and replacement planning
- **Reliability Scores**: Based on breakdown frequency
- **Fuel Efficiency**: Consumption tracking and optimization
- **Operator Performance**: By bus and by operator

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
node test-admin-bus-api.js
```

Before running tests:

1. Start trip-service: `npm start`
2. Get admin JWT token
3. Update `ADMIN_TOKEN` in test file

---

## 📝 Error Codes

| Code                 | Description                             |
| -------------------- | --------------------------------------- |
| VAL_001              | Validation error                        |
| AUTH_003             | Unauthorized access                     |
| BUS_001              | License plate already exists            |
| BUS_002              | Bus not found                           |
| BUS_MODEL_NOT_FOUND  | Bus model not found                     |
| OPERATOR_NOT_FOUND   | Operator not found                      |
| CAPACITY_MISMATCH    | Capacity does not match model           |
| BUS_HAS_FUTURE_TRIPS | Cannot deactivate bus with future trips |
| SYS_001              | Internal server error                   |

---

## 🚀 Future Enhancements

1. **GPS Tracking Integration**
   - Real-time location monitoring
   - Route deviation alerts
   - Automated arrival/departure detection

2. **Predictive Maintenance**
   - Sensor data integration
   - Failure prediction algorithms
   - Automated maintenance scheduling

3. **Fuel Management**
   - Fuel consumption tracking
   - Cost optimization
   - Environmental impact monitoring

4. **Advanced Analytics**
   - Fleet utilization dashboards
   - Performance benchmarking
   - Cost-benefit analysis

5. **Bulk Operations**
   - Bulk registration via CSV
   - Mass status updates
   - Batch maintenance scheduling

6. **Integration**
   - Insurance company APIs
   - Vehicle registration systems
   - Fuel card management</content>
     <parameter name="filePath">c:\Users\HP\clones\bus-ticket-booking-system\backend\services\trip-service\ADMIN_BUS_MANAGEMENT_API.md
