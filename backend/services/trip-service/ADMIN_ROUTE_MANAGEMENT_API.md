# Admin Route Management API

## Overview

Admin endpoints for managing bus routes in the system. Includes route creation, stop management, pricing configuration, and route optimization.

**Base URL:** `http://localhost:3004` (trip-service)  
**Authentication:** Bearer Token (Admin JWT)

---

## 🔐 Authentication

All route management endpoints require:

```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## 📋 API Endpoints

### 1. Get All Routes

**GET** `/admin/routes` or via API Gateway: `GET /routes/admin`

#### Query Parameters

| Parameter    | Type    | Required | Default | Description                         |
| ------------ | ------- | -------- | ------- | ----------------------------------- |
| page         | integer | No       | 1       | Page number                         |
| limit        | integer | No       | 20      | Results per page (max 100)          |
| search       | string  | No       | -       | Search by origin/destination cities |
| min_distance | number  | No       | -       | Minimum distance (km)               |
| max_distance | number  | No       | -       | Maximum distance (km)               |
| min_duration | number  | No       | -       | Minimum duration (hours)            |
| max_duration | number  | No       | -       | Maximum duration (hours)            |
| origin       | string  | No       | -       | Filter by origin city               |
| destination  | string  | No       | -       | Filter by destination city          |

#### Example Request

```bash
# Direct to trip-service
curl -X GET "http://localhost:3004/admin/routes?page=1&limit=10&origin=Ho%20Chi%20Minh%20City" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Via API Gateway
curl -X GET "http://localhost:3000/routes/admin?page=1&limit=10&origin=Ho%20Chi%20Minh%20City" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "route_id": "uuid",
      "origin": "Ho Chi Minh City",
      "destination": "Da Lat",
      "distance_km": 310,
      "estimated_duration_hours": 6.5,
      "base_price": 150000,
      "currency": "VND",
      "status": "active",
      "stops": [
        {
          "stop_id": "uuid",
          "city": "Ho Chi Minh City",
          "address": "123 Pham Ngu Lao, District 1",
          "stop_order": 1,
          "is_pickup": true,
          "is_dropoff": true,
          "pickup_fee": 0,
          "dropoff_fee": 0
        },
        {
          "stop_id": "uuid",
          "city": "Da Lat",
          "address": "456 Nguyen Thi Minh Khai",
          "stop_order": 2,
          "is_pickup": true,
          "is_dropoff": true,
          "pickup_fee": 0,
          "dropoff_fee": 0
        }
      ],
      "trip_count": 15,
      "active_trips": 12,
      "created_at": "2025-12-20T10:00:00.000Z"
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

### 2. Get Route Details

**GET** `/admin/routes/:id` or via API Gateway: `GET /routes/admin/:id`

#### Path Parameters

- `id` (string, required) - Route UUID

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "route_id": "uuid",
    "origin": "Ho Chi Minh City",
    "destination": "Da Lat",
    "distance_km": 310,
    "estimated_duration_hours": 6.5,
    "base_price": 150000,
    "currency": "VND",
    "status": "active",
    "description": "Scenic route through coffee hills",
    "highlights": ["Coffee plantations", "Pine forests", "Mountain views"],
    "stops": [
      {
        "stop_id": "uuid",
        "city": "Ho Chi Minh City",
        "address": "123 Pham Ngu Lao, District 1",
        "coordinates": {
          "latitude": 10.8231,
          "longitude": 106.6297
        },
        "stop_order": 1,
        "is_pickup": true,
        "is_dropoff": true,
        "pickup_fee": 0,
        "dropoff_fee": 0,
        "estimated_arrival": "08:00",
        "estimated_departure": "08:30"
      }
    ],
    "pricing_tiers": [
      {
        "tier": "standard",
        "multiplier": 1.0,
        "description": "Standard seating"
      },
      {
        "tier": "vip",
        "multiplier": 1.5,
        "description": "VIP seating with extra legroom"
      }
    ],
    "trip_count": 15,
    "active_trips": 12,
    "created_at": "2025-12-20T10:00:00.000Z",
    "updated_at": "2025-12-27T14:30:00.000Z"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 3. Create Route

**POST** `/admin/routes` or via API Gateway: `POST /routes/admin`

#### Request Body

```json
{
  "origin": "Ho Chi Minh City",
  "destination": "Da Lat",
  "distance_km": 310,
  "estimated_duration_hours": 6.5,
  "base_price": 150000,
  "currency": "VND",
  "description": "Scenic route through coffee hills",
  "highlights": ["Coffee plantations", "Pine forests", "Mountain views"]
}
```

| Field                    | Type   | Required | Validation                                    |
| ------------------------ | ------ | -------- | --------------------------------------------- |
| origin                   | string | Yes      | City name, min 2 chars                        |
| destination              | string | Yes      | City name, min 2 chars, different from origin |
| distance_km              | number | Yes      | > 0                                           |
| estimated_duration_hours | number | Yes      | > 0, <= 24                                    |
| base_price               | number | Yes      | > 0                                           |
| currency                 | string | No       | Default: VND                                  |
| description              | string | No       | Max 500 chars                                 |
| highlights               | array  | No       | Array of strings                              |

#### Business Logic

- **Uniqueness Check**: Origin-destination pair must be unique
- **Geographic Validation**: Cities must exist in system
- **Pricing Validation**: Base price must be reasonable for distance

#### Example Request

```bash
curl -X POST "http://localhost:3004/admin/routes" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Ho Chi Minh City",
    "destination": "Da Lat",
    "distance_km": 310,
    "estimated_duration_hours": 6.5,
    "base_price": 150000,
    "description": "Scenic route through coffee hills"
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "route_id": "uuid",
    "origin": "Ho Chi Minh City",
    "destination": "Da Lat",
    "distance_km": 310,
    "estimated_duration_hours": 6.5,
    "base_price": 150000,
    "currency": "VND",
    "status": "active",
    "stops": []
  },
  "message": "Route created successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_001",
    "message": "Route between Ho Chi Minh City and Da Lat already exists"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 4. Update Route

**PUT** `/admin/routes/:id` or via API Gateway: `PUT /routes/admin/:id`

#### Path Parameters

- `id` (string, required) - Route UUID

#### Request Body

```json
{
  "distance_km": 315,
  "estimated_duration_hours": 6.7,
  "base_price": 155000,
  "description": "Updated scenic route with new highway",
  "status": "active"
}
```

**Updatable fields:** `distance_km`, `estimated_duration_hours`, `base_price`, `currency`, `description`, `highlights`, `status`

#### Business Logic

- **Impact Assessment**: Updates affect existing trip pricing
- **Notification**: Operators notified of route changes
- **Gradual Rollout**: Price changes applied to future bookings only

#### Example Request

```bash
curl -X PUT "http://localhost:3004/admin/routes/<route_id>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 315,
    "estimated_duration_hours": 6.7,
    "base_price": 155000,
    "description": "Updated scenic route with new highway"
  }'
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "route_id": "uuid",
    "origin": "Ho Chi Minh City",
    "destination": "Da Lat",
    "distance_km": 315,
    "estimated_duration_hours": 6.7,
    "base_price": 155000,
    "updated_at": "2025-12-28T10:00:00.000Z"
  },
  "message": "Route updated successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 5. Delete Route

**DELETE** `/admin/routes/:id` or via API Gateway: `DELETE /routes/admin/:id`

#### Path Parameters

- `id` (string, required) - Route UUID

**Note:** Only routes with no associated trips can be deleted.

#### Business Logic

1. **Dependency Check**: Verifies no active or future trips
2. **Cascade Delete**: Removes associated stops and pricing data
3. **Audit Trail**: Logs deletion with reason

#### Success Response (200)

```json
{
  "success": true,
  "message": "Route deleted successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

#### Error Response (409)

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_HAS_TRIPS",
    "message": "Cannot delete route with associated trips"
  },
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

### 6. Add Stop to Route

**POST** `/admin/routes/:id/stops` or via API Gateway: `POST /routes/admin/:id/stops`

#### Path Parameters

- `id` (string, required) - Route UUID

#### Request Body

```json
{
  "city": "Bao Loc",
  "address": "789 Tran Phu Street",
  "latitude": 11.5476,
  "longitude": 107.8077,
  "stop_order": 2,
  "is_pickup": true,
  "is_dropoff": true,
  "pickup_fee": 20000,
  "dropoff_fee": 20000,
  "estimated_arrival": "11:30",
  "estimated_departure": "12:00"
}
```

| Field               | Type    | Required | Validation            |
| ------------------- | ------- | -------- | --------------------- |
| city                | string  | Yes      | City name             |
| address             | string  | Yes      | Full address          |
| latitude            | number  | No       | -90 to 90             |
| longitude           | number  | No       | -180 to 180           |
| stop_order          | integer | Yes      | > 0, unique per route |
| is_pickup           | boolean | No       | Default: true         |
| is_dropoff          | boolean | No       | Default: true         |
| pickup_fee          | number  | No       | >= 0                  |
| dropoff_fee         | number  | No       | >= 0                  |
| estimated_arrival   | string  | No       | HH:MM format          |
| estimated_departure | string  | No       | HH:MM format          |

#### Business Logic

- **Order Validation**: Stop order must be sequential
- **Geographic Logic**: Stops should be geographically ordered
- **Fee Structure**: Additional fees for non-origin/destination stops

#### Example Request

```bash
curl -X POST "http://localhost:3004/admin/routes/<route_id>/stops" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Bao Loc",
    "address": "789 Tran Phu Street",
    "stop_order": 2,
    "is_pickup": true,
    "is_dropoff": true,
    "pickup_fee": 20000,
    "dropoff_fee": 20000
  }'
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "stop_id": "uuid",
    "route_id": "uuid",
    "city": "Bao Loc",
    "address": "789 Tran Phu Street",
    "stop_order": 2,
    "is_pickup": true,
    "is_dropoff": true,
    "pickup_fee": 20000,
    "dropoff_fee": 20000
  },
  "message": "Stop added successfully",
  "timestamp": "2025-12-28T10:00:00.000Z"
}
```

---

## 🔍 Filter Examples

### Filter by Distance Range

```bash
GET /routes/admin?min_distance=200&max_distance=500&page=1&limit=20
```

### Filter by Duration

```bash
GET /routes/admin?min_duration=4&max_duration=8&page=1&limit=20
```

### Search by Cities

```bash
GET /routes/admin?search=da%20lat&page=1&limit=20
```

### Filter by Origin/Destination

```bash
GET /routes/admin?origin=Ho%20Chi%20Minh%20City&destination=Da%20Lat&page=1&limit=20
```

### Combined Filters

```bash
GET /routes/admin?origin=Ho%20Chi%20Minh%20City&min_distance=250&max_duration=7&page=1&limit=10
```

---

## 📊 Business Logic

### Route Planning and Optimization

#### 1. Geographic Considerations

- **Distance Calculation**: Accurate kilometer measurements
- **Duration Estimation**: Based on road conditions and speed limits
- **Stop Sequencing**: Logical geographic ordering of stops
- **Alternative Routes**: Multiple route options for same origin-destination

#### 2. Pricing Strategy

- **Distance-based**: Base price correlated with distance
- **Demand Pricing**: Dynamic pricing based on demand/supply
- **Seasonal Adjustments**: Peak/off-peak pricing variations
- **Competitive Analysis**: Pricing relative to market rates

#### 3. Stop Management

- **Intermediate Stops**: Additional pickup/dropoff points
- **Fee Structure**: Surcharges for convenience stops
- **Time Scheduling**: Estimated arrival/departure times
- **Capacity Planning**: Stop-specific capacity considerations

### Route Performance Analytics

#### Key Metrics

- **Popularity**: Number of trips and bookings per route
- **Revenue**: Total revenue generated by route
- **Occupancy**: Average seat utilization
- **Customer Satisfaction**: Ratings and feedback

#### Optimization Opportunities

- **High-Demand Routes**: Increase frequency for popular routes
- **Low-Performance Routes**: Review pricing or discontinue
- **New Route Discovery**: Identify potential new routes
- **Schedule Optimization**: Adjust departure times based on demand

### Integration with Trip Management

#### Trip Creation Workflow

1. **Route Selection**: Choose from available active routes
2. **Stop Configuration**: Define which stops are served
3. **Pricing Application**: Apply route base price with modifiers
4. **Schedule Planning**: Set departure/arrival times

#### Dynamic Updates

- **Price Changes**: Automatic propagation to future trips
- **Stop Modifications**: Update existing trips when stops change
- **Status Changes**: Deactivate trips when route becomes inactive

### Quality Assurance

#### Route Validation

- **Geographic Accuracy**: Verify coordinates and addresses
- **Time Estimates**: Validate duration calculations
- **Stop Sequencing**: Ensure logical stop ordering
- **Pricing Consistency**: Check for pricing anomalies

#### Maintenance and Updates

- **Regular Audits**: Periodic review of route data accuracy
- **Customer Feedback**: Incorporate passenger suggestions
- **Regulatory Compliance**: Ensure compliance with transport regulations
- **Performance Monitoring**: Track and improve route metrics

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
node test-admin-route-api.js
```

Before running tests:

1. Start trip-service: `npm start`
2. Get admin JWT token
3. Update `ADMIN_TOKEN` in test file

---

## 📝 Error Codes

| Code            | Description                    |
| --------------- | ------------------------------ |
| VAL_001         | Validation error               |
| AUTH_003        | Unauthorized access            |
| ROUTE_001       | Duplicate route                |
| ROUTE_002       | Route not found                |
| ROUTE_003       | Route update failed            |
| ROUTE_004       | Stop addition failed           |
| ROUTE_HAS_TRIPS | Cannot delete route with trips |
| SYS_001         | Internal server error          |

---

## 🚀 Future Enhancements

1. **GPS Route Mapping**
   - Interactive route visualization
   - Real-time traffic integration
   - Alternative route suggestions

2. **Dynamic Pricing**
   - AI-powered price optimization
   - Demand forecasting
   - Competitive pricing analysis

3. **Route Analytics**
   - Passenger flow analysis
   - Revenue optimization
   - Performance dashboards

4. **Multi-stop Complexity**
   - Complex route networks
   - Interconnected route systems
   - Transfer point optimization

5. **Integration**
   - Google Maps API integration
   - Traffic data providers
   - Weather impact analysis

6. **Bulk Operations**
   - CSV import/export
   - Bulk route creation
   - Mass updates</content>
     <parameter name="filePath">c:\Users\HP\clones\bus-ticket-booking-system\backend\services\trip-service\ADMIN_ROUTE_MANAGEMENT_API.md
