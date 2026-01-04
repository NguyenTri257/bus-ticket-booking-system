# API Reference

## Base URL

All API requests should be sent to the API Gateway:

```
Development: http://localhost:3000
Production: https://api.yourdomain.com
```

## Authentication

Most endpoints require authentication via JWT Bearer token.

### Request Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Response Format

All responses follow this structure:

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-04T10:30:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Human-readable error message"
  },
  "timestamp": "2026-01-04T10:30:00.000Z"
}
```

## Error Codes

| Code           | Description                  |
| -------------- | ---------------------------- |
| `AUTH_001`     | Missing authentication token |
| `AUTH_002`     | Invalid or expired token     |
| `AUTH_003`     | Insufficient permissions     |
| `VAL_001`      | Validation error             |
| `NOT_FOUND`    | Resource not found           |
| `SERVER_ERROR` | Internal server error        |

---

## Authentication Service

### POST /auth/register

Register a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+84901234567"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "passenger"
    }
  }
}
```

### POST /auth/login

Authenticate and receive JWT tokens.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "passenger"
    }
  }
}
```

### POST /auth/oauth/google

Authenticate via Google OAuth.

**Request:**

```json
{
  "idToken": "google-id-token"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": { ... }
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

### POST /auth/logout

Logout and blacklist tokens.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current user profile.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "passenger",
    "emailVerified": true,
    "preferences": { ... }
  }
}
```

### PUT /auth/me

Update current user profile.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "fullName": "John Updated",
  "phone": "+84901234567",
  "preferences": {
    "notifications": {
      "bookingConfirmations": { "email": true, "sms": false }
    }
  }
}
```

### POST /auth/forgot-password

Request password reset email.

**Request:**

```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password

Reset password with token.

**Request:**

```json
{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

---

## Trip Service

### GET /trips/search

Search for available trips.

**Query Parameters:**

- `origin` (string, required): Origin city
- `destination` (string, required): Destination city
- `date` (string, optional): Departure date (YYYY-MM-DD)
- `passengers` (number, optional): Number of passengers
- `busType` (string/array, optional): Bus types (standard, limousine, sleeper)
- `departureTime` (string/array, optional): Time periods (morning, afternoon, evening, night)
- `minPrice` (number, optional): Minimum price
- `maxPrice` (number, optional): Maximum price
- `amenities` (string/array, optional): Required amenities (wifi, ac, toilet, entertainment)
- `sortBy` (string, optional): Sort field (price, time, duration) - default: time
- `order` (string, optional): Sort order (asc, desc) - default: asc
- `page` (number, optional): Page number - default: 1
- `limit` (number, optional): Items per page - default: 10

**Example Request:**

```http
GET /trips/search?origin=Ho%20Chi%20Minh%20City&destination=Hanoi&date=2026-01-10&passengers=2&busType=limousine&sortBy=price&order=asc&page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "tripId": "uuid",
        "route": {
          "origin": "Ho Chi Minh City",
          "destination": "Hanoi",
          "distanceKm": 1700
        },
        "departureTime": "2026-01-10T08:00:00Z",
        "arrivalTime": "2026-01-11T08:00:00Z",
        "durationMinutes": 1440,
        "basePrice": 450000,
        "availableSeats": 25,
        "bus": {
          "type": "limousine",
          "amenities": ["wifi", "ac", "toilet", "entertainment"],
          "seatCapacity": 30
        },
        "operator": {
          "name": "ABC Bus Company",
          "rating": 4.5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 15,
      "totalPages": 2
    }
  }
}
```

### GET /trips/:id

Get trip details by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "tripId": "uuid",
    "route": {
      "origin": "Ho Chi Minh City",
      "destination": "Hanoi",
      "distanceKm": 1700,
      "estimatedMinutes": 1440
    },
    "departureTime": "2026-01-10T08:00:00Z",
    "arrivalTime": "2026-01-11T08:00:00Z",
    "basePrice": 450000,
    "availableSeats": 25,
    "bus": {
      "busId": "uuid",
      "type": "limousine",
      "amenities": ["wifi", "ac", "toilet", "entertainment"],
      "seatCapacity": 30,
      "licensePlate": "51A-12345"
    },
    "operator": {
      "operatorId": "uuid",
      "name": "ABC Bus Company",
      "rating": 4.5,
      "contactEmail": "contact@abc.com",
      "contactPhone": "+84901234567"
    },
    "policies": {
      "cancellation": {
        "allowed": true,
        "refundPercentage": 80,
        "deadline": "24h_before_departure"
      }
    },
    "stops": [
      {
        "stopName": "Ben Xe Mien Dong",
        "sequence": 1,
        "isPickup": true,
        "isDropoff": false
      }
    ]
  }
}
```

### GET /trips/:id/seats

Get seat availability for a trip.

**Response:**

```json
{
  "success": true,
  "data": {
    "seatLayout": {
      "rows": 10,
      "columns": 4,
      "seats": [
        {
          "code": "A1",
          "type": "standard",
          "position": "window",
          "price": 450000,
          "status": "available"
        },
        {
          "code": "A2",
          "type": "standard",
          "position": "aisle",
          "price": 450000,
          "status": "booked"
        },
        {
          "code": "A3",
          "type": "vip",
          "position": "window",
          "price": 550000,
          "status": "locked"
        }
      ]
    },
    "totalSeats": 40,
    "availableSeats": 25,
    "bookedSeats": 10,
    "lockedSeats": 5
  }
}
```

### POST /trips/:id/seats/lock

Lock seats temporarily (10 minutes).

**Request:**

```json
{
  "seatCodes": ["A1", "A2"],
  "guestId": "optional-guest-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "lockId": "uuid",
    "seatCodes": ["A1", "A2"],
    "lockedUntil": "2026-01-04T10:40:00Z",
    "durationMinutes": 10
  }
}
```

### POST /trips/:id/seats/release

Release locked seats.

**Request:**

```json
{
  "seatCodes": ["A1", "A2"]
}
```

### GET /trips/autocomplete/locations

Autocomplete for city names.

**Query Parameters:**

- `query` (string, required): Search query

**Response:**

```json
{
  "success": true,
  "data": {
    "locations": ["Ho Chi Minh City", "Hanoi", "Da Nang"]
  }
}
```

---

## Booking Service

### POST /bookings

Create a new booking.

**Request:**

```json
{
  "tripId": "uuid",
  "contactEmail": "user@example.com",
  "contactPhone": "+84901234567",
  "passengers": [
    {
      "seatCode": "A1",
      "fullName": "John Doe",
      "phone": "+84901234567",
      "documentId": "123456789"
    },
    {
      "seatCode": "A2",
      "fullName": "Jane Doe",
      "phone": "+84901234568"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "bookingReference": "BK20260104001",
    "tripId": "uuid",
    "contactEmail": "user@example.com",
    "contactPhone": "+84901234567",
    "status": "pending",
    "lockedUntil": "2026-01-04T10:40:00Z",
    "subtotal": 900000,
    "serviceFee": 27000,
    "totalPrice": 927000,
    "currency": "VND",
    "passengers": [
      {
        "ticketId": "uuid",
        "seatCode": "A1",
        "price": 450000,
        "fullName": "John Doe"
      }
    ]
  }
}
```

### GET /bookings/:id

Get booking details.

**Response:**

```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "bookingReference": "BK20260104001",
    "status": "confirmed",
    "totalPrice": 927000,
    "paymentStatus": "paid",
    "trip": {
      "tripId": "uuid",
      "origin": "Ho Chi Minh City",
      "destination": "Hanoi",
      "departureTime": "2026-01-10T08:00:00Z"
    },
    "passengers": [ ... ],
    "ticketUrl": "https://example.com/ticket.pdf",
    "qrCodeUrl": "https://example.com/qr.png"
  }
}
```

### GET /bookings

Get user bookings.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `status` (string, optional): Filter by status
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 25,
      "totalPages": 3
    }
  }
}
```

### POST /bookings/lookup

Lookup booking by reference and contact info.

**Request:**

```json
{
  "bookingReference": "BK20260104001",
  "contactEmail": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": { ... }
  }
}
```

### PATCH /bookings/:id/cancel

Cancel a booking.

**Request:**

```json
{
  "reason": "Change of plans"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "status": "cancelled",
    "refundAmount": 742000
  }
}
```

---

## Payment Service

### POST /payments/create

Initiate payment for a booking.

**Request:**

```json
{
  "bookingId": "uuid",
  "paymentMethod": "payos",
  "returnUrl": "https://example.com/payment/success",
  "cancelUrl": "https://example.com/payment/cancel"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://payos.vn/payment/...",
    "orderId": "uuid",
    "amount": 927000
  }
}
```

### POST /webhooks/payos

PayOS webhook handler (called by payment gateway).

### POST /webhooks/momo

Momo webhook handler (called by payment gateway).

### POST /webhooks/zalopay

ZaloPay webhook handler (called by payment gateway).

### POST /webhooks/stripe

Stripe webhook handler (called by payment gateway).

---

## Notification Service

### POST /notifications/send-email (Internal)

Send email notification.

**Headers:**

```http
x-internal-service-key: internal-service-secret-key
```

**Request:**

```json
{
  "to": "user@example.com",
  "subject": "Booking Confirmation",
  "template": "booking-confirmation",
  "data": {
    "bookingReference": "BK20260104001",
    "tripDetails": { ... }
  }
}
```

---

## Analytics Service

### GET /analytics/dashboard

Get admin dashboard summary.

**Headers:**

```http
Authorization: Bearer <admin-access-token>
```

**Query Parameters:**

- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalBookings": 1250,
    "totalRevenue": 562500000,
    "averageBookingValue": 450000,
    "occupancyRate": 75.5,
    "popularRoutes": [
      {
        "origin": "Ho Chi Minh City",
        "destination": "Hanoi",
        "bookings": 350
      }
    ],
    "revenueByDay": [
      {
        "date": "2026-01-01",
        "revenue": 15000000
      }
    ]
  }
}
```

### GET /analytics/bookings

Get booking analytics.

**Headers:**

```http
Authorization: Bearer <admin-access-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalBookings": 1250,
    "confirmedBookings": 1100,
    "cancelledBookings": 150,
    "bookingsByStatus": { ... },
    "bookingTrends": [ ... ]
  }
}
```

### GET /analytics/revenue

Get revenue analytics.

**Headers:**

```http
Authorization: Bearer <admin-access-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 562500000,
    "revenueByMonth": [ ... ],
    "revenueByRoute": [ ... ]
  }
}
```

---

## Admin Endpoints

### GET /admin/users

Get all users (admin only).

**Headers:**

```http
Authorization: Bearer <admin-access-token>
```

**Query Parameters:**

- `role` (string, optional): Filter by role
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

### POST /admin/trips

Create new trip (admin only).

**Request:**

```json
{
  "routeId": "uuid",
  "busId": "uuid",
  "departureTime": "2026-01-10T08:00:00Z",
  "arrivalTime": "2026-01-11T08:00:00Z",
  "basePrice": 450000
}
```

### PUT /admin/trips/:id

Update trip (admin only).

### DELETE /admin/trips/:id

Delete trip (admin only).

---

## Rate Limiting

API endpoints are rate limited to:

- **100 requests per 15 minutes** per IP address
- **1000 requests per hour** for authenticated users

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704361200
```

## Pagination

Paginated endpoints use these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Responses include:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 100,
    "totalPages": 10
  }
}
```

## Related Documentation

- [Authentication Guide](./07-authentication.md)
- [Database Schema](./05-database-schema.md)
- [Microservices Details](./08-microservices.md)
