# Booking Service - Complete Implementation Guide

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Booking Flow](#booking-flow)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Overview

The Booking Service is a microservice responsible for managing bus ticket bookings in the Bus Ticket Booking System. It handles:

- **Booking Creation**: Create bookings with passenger information
- **Seat Locking**: Temporarily reserve seats for 10 minutes
- **Payment Processing**: Confirm payments and update booking status
- **Booking Management**: View, cancel, and manage bookings
- **Auto-Expiration**: Automatically cancel unpaid bookings after timeout
- **Guest Checkout**: Support booking without user accounts

---

## Architecture

### Service Structure

```
booking-service/
├── src/
│   ├── controllers/        # Request handlers
│   │   └── bookingController.js
│   ├── services/           # Business logic
│   │   └── bookingService.js
│   ├── repositories/       # Data access layer
│   │   ├── bookingRepository.js
│   │   └── passengerRepository.js
│   ├── validators/         # Request validation
│   │   └── bookingValidators.js
│   ├── middleware/         # Authentication, logging
│   │   └── authMiddleware.js
│   ├── jobs/              # Background jobs
│   │   └── bookingExpirationJob.js
│   ├── utils/             # Helper functions
│   │   └── helpers.js
│   ├── database.js        # PostgreSQL connection
│   ├── redis.js           # Redis connection
│   └── index.js           # Main application
├── Dockerfile
├── package.json
└── .env.example
```

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Validation**: Joi
- **Authentication**: JWT

---

## Database Schema

### Tables

#### `bookings`
Stores main booking information.

```sql
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    trip_id UUID NOT NULL REFERENCES trips(trip_id),
    user_id UUID, -- Nullable for guest checkout
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    locked_until TIMESTAMP WITH TIME ZONE,
    subtotal DECIMAL(12,2) NOT NULL,
    service_fee DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    paid_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    refund_amount DECIMAL(12,2),
    ticket_url TEXT,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- `idx_bookings_user` on `user_id`
- `idx_bookings_ref` on `booking_reference`
- `idx_bookings_check_seats` on `(trip_id, status)` for availability checks

#### `booking_passengers`
Stores passenger information for each booking.

```sql
CREATE TABLE booking_passengers (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    seat_code VARCHAR(10) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    document_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Booking Status Flow

```
pending → confirmed → completed
   ↓
cancelled
```

- **pending**: Seats reserved, awaiting payment
- **confirmed**: Payment received, booking active
- **completed**: Trip completed
- **cancelled**: Booking cancelled by user or system

---

## API Endpoints

### Base URL: `/bookings`

#### 1. Create Booking
**POST** `/bookings`

Creates a new booking with passenger information.

**Request**:
```json
{
  "tripId": "uuid",
  "seats": ["A1", "A2"],
  "passengers": [
    {
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "documentId": "079012345678",
      "seatCode": "A1"
    }
  ],
  "contactEmail": "user@example.com",
  "contactPhone": "0901234567",
  "isGuestCheckout": false
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "bookingReference": "BK20251205001",
    "status": "pending",
    "lockedUntil": "2025-12-05T10:45:00Z",
    "pricing": {
      "subtotal": 700000,
      "serviceFee": 20000,
      "total": 720000,
      "currency": "VND"
    },
    "passengers": [...]
  },
  "message": "Booking created successfully. Please complete payment within 10 minutes."
}
```

#### 2. Get Booking by ID
**GET** `/bookings/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "bookingReference": "BK20251205001",
    "tripDetails": {...},
    "passengers": [...],
    "pricing": {...},
    "payment": {...}
  }
}
```

#### 3. Get User Bookings
**GET** `/bookings?status=all&page=1&limit=10`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status`: pending|confirmed|cancelled|completed|all
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: createdAt|updatedAt|totalPrice
- `sortOrder`: asc|desc

**Response** (200):
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### 4. Confirm Payment
**POST** `/bookings/:id/confirm-payment`

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "paymentMethod": "momo",
  "transactionRef": "TXN123456",
  "amount": 720000
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "status": "confirmed",
    "payment": {
      "status": "paid",
      "method": "momo",
      "paidAt": "2025-12-05T10:40:00Z"
    }
  },
  "message": "Payment confirmed successfully"
}
```

#### 5. Cancel Booking
**PUT** `/bookings/:id/cancel`

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "reason": "Change of plans",
  "requestRefund": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "status": "cancelled",
    "refund": {
      "amount": 576000,
      "percentage": 80,
      "processingTime": "3-5 business days"
    }
  },
  "message": "Booking cancelled successfully"
}
```

#### 6. Get Booking by Reference (Guest)
**GET** `/bookings/reference/:reference?email=user@example.com`

No authentication required. Email verification required.

---

## Frontend Components

### 1. PassengerInformationForm
Location: `frontend/src/components/booking/PassengerInformationForm.tsx`

**Purpose**: Collect passenger information for each selected seat.

**Features**:
- Dynamic form fields for each seat
- Real-time validation
- Vietnamese phone number format
- Document ID validation (9-12 digits)

**Usage**:
```tsx
<PassengerInformationForm
  seatCodes={['A1', 'A2']}
  onSubmit={(passengers) => handlePassengers(passengers)}
  onBack={() => goBack()}
  isLoading={false}
/>
```

### 2. BookingSummary
Location: `frontend/src/components/booking/BookingSummary.tsx`

**Purpose**: Display booking details before confirmation.

**Features**:
- Trip information display
- Passenger list with seat assignments
- Pricing breakdown
- Countdown timer for seat reservation
- Responsive design

**Usage**:
```tsx
<BookingSummary
  trip={tripData}
  passengers={passengerData}
  contactEmail="user@example.com"
  contactPhone="0901234567"
  pricing={pricingData}
  onConfirm={createBooking}
  onBack={goBack}
  isLoading={false}
/>
```

### 3. UserBookingDashboard
Location: `frontend/src/components/users/UserBookingDashboard.tsx`

**Purpose**: User interface to view and manage bookings.

**Features**:
- Filter by status
- Sort by date/price
- Pagination
- Cancel booking
- View booking details
- Payment reminders for pending bookings

**Usage**:
```tsx
<UserBookingDashboard />
```

---

## Booking Flow

### Complete User Journey

```
┌──────────────────────────────────────────────────────────────┐
│                    1. Trip Search & Selection                 │
│                                                               │
│  User searches for trips → Selects trip → Chooses seats     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              2. Passenger Information Collection              │
│                                                               │
│  FE: PassengerInformationForm component                      │
│  - Collects name, phone, ID for each passenger              │
│  - Validates input (name required, phone/ID optional)        │
│  - Each passenger assigned to a seat                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    3. Booking Summary Review                  │
│                                                               │
│  FE: BookingSummary component                                │
│  - Displays trip details                                     │
│  - Shows passenger list with seat assignments                │
│  - Calculates pricing (subtotal + service fee)               │
│  - User reviews and confirms                                 │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    4. Create Booking Request                  │
│                                                               │
│  FE → API Gateway → Booking Service                          │
│  POST /bookings                                              │
│  {                                                           │
│    tripId, seats, passengers,                               │
│    contactEmail, contactPhone                               │
│  }                                                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              5. Booking Service Processing                    │
│                                                               │
│  a) Validate trip exists (call Trip Service)                 │
│  b) Check seat availability in DB                            │
│  c) Calculate pricing (base price × seats + service fee)     │
│  d) Generate unique booking reference (BK20251205001)        │
│  e) Create booking record (status: pending)                  │
│  f) Create passenger records                                 │
│  g) Set lock expiration (10 minutes from now)                │
│  h) Schedule expiration check in Redis                       │
│  i) Return booking details to FE                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  6. Payment Processing                        │
│                                                               │
│  FE redirects to payment page                                │
│  User completes payment via:                                 │
│  - MoMo                                                      │
│  - ZaloPay                                                   │
│  - VNPay                                                     │
│  - Credit Card                                               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│               7. Payment Confirmation                         │
│                                                               │
│  Payment Gateway → Webhook → Booking Service                 │
│  POST /bookings/:id/confirm-payment                          │
│                                                               │
│  Actions:                                                    │
│  a) Update booking status: pending → confirmed               │
│  b) Update payment status: unpaid → paid                     │
│  c) Clear expiration from Redis                              │
│  d) Send confirmation email (Notification Service)           │
│  e) Generate e-ticket & QR code                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  8. Booking Confirmed                         │
│                                                               │
│  User receives:                                              │
│  - Email confirmation                                        │
│  - E-ticket with QR code                                     │
│  - Booking reference for check-in                            │
└──────────────────────────────────────────────────────────────┘
```

### Alternative Flow: Booking Expiration

```
If payment NOT completed within 10 minutes:

Booking Service (Background Job)
├── Runs every 60 seconds
├── Queries: SELECT * FROM bookings 
│   WHERE status='pending' 
│   AND payment_status='unpaid'
│   AND locked_until < NOW()
│
├── For each expired booking:
│   ├── Update status → 'cancelled'
│   ├── Reason: "Booking expired - payment not received"
│   ├── Release seats (status=cancelled, not counted in availability)
│   └── Clear Redis expiration key
│
└── Send notification: "Booking expired" (optional)
```

### Cancellation Flow

```
User requests cancellation:

1. FE: User clicks "Cancel" button
2. API: PUT /bookings/:id/cancel
3. Booking Service:
   - Check authorization (user owns booking)
   - Check if cancellable (not completed)
   - Calculate refund based on time until departure:
     * >24h before: 100% refund
     * 12-24h: 80% refund
     * 6-12h: 50% refund
     * <6h: 20% refund
   - Update booking status → cancelled
   - Record refund amount
   - Clear Redis expiration
4. Notification Service: Send cancellation email
5. Payment Service: Process refund (if applicable)
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Option 1: Docker Setup (Recommended)

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create `.env` file** (copy from `.env.example`):
```bash
cp .env.example .env
```

3. **Edit environment variables**:
```bash
# .env
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
SENDGRID_API_KEY=your-sendgrid-key
```

4. **Start all services**:
```bash
docker-compose up -d
```

5. **Verify services are running**:
```bash
docker-compose ps
```

Expected output:
```
NAME                            STATUS
bus-ticket-postgres             running (healthy)
bus-ticket-redis                running (healthy)
bus-ticket-auth-service         running
bus-ticket-trip-service         running
bus-ticket-booking-service      running
bus-ticket-notification-service running
bus-ticket-api-gateway          running
```

6. **Check logs**:
```bash
docker-compose logs -f booking-service
```

### Option 2: Local Development

1. **Install dependencies**:
```bash
cd backend/services/booking-service
npm install
```

2. **Setup PostgreSQL database**:
```sql
CREATE DATABASE bus_ticket_dev;
```

3. **Run migrations** (from backend folder):
```bash
psql -U postgres -d bus_ticket_dev -f sql/014_create_bookings_table.sql
psql -U postgres -d bus_ticket_dev -f sql/015_create_bookings_passenger_table.sql
```

4. **Start Redis**:
```bash
redis-server
```

5. **Create `.env` file**:
```bash
cp .env.example .env
```

6. **Start the service**:
```bash
npm run dev
```

The service will run on `http://localhost:3004`.

### Frontend Setup

1. **Navigate to frontend**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create `.env` file**:
```bash
VITE_API_URL=http://localhost:3000
```

4. **Start development server**:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`.

---

## Environment Variables

### Booking Service

```bash
# Server
NODE_ENV=development
PORT=3004

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_ticket_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-key

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
TRIP_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3005

# Booking Configuration
BOOKING_LOCK_DURATION_MINUTES=10
BOOKING_REFERENCE_PREFIX=BK

# Service Fee Configuration
SERVICE_FEE_PERCENTAGE=3
SERVICE_FEE_FIXED=10000
```

---

## Testing

### Manual API Testing

Use the provided test script or curl commands:

#### 1. Create Booking
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tripId": "YOUR_TRIP_ID",
    "seats": ["A1", "A2"],
    "passengers": [
      {
        "fullName": "Nguyen Van A",
        "phone": "0901234567",
        "documentId": "079012345678",
        "seatCode": "A1"
      },
      {
        "fullName": "Tran Thi B",
        "seatCode": "A2"
      }
    ],
    "contactEmail": "test@example.com",
    "contactPhone": "0901234567"
  }'
```

#### 2. Get User Bookings
```bash
curl -X GET "http://localhost:3000/bookings?status=all&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Cancel Booking
```bash
curl -X PUT http://localhost:3000/bookings/BOOKING_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Change of plans",
    "requestRefund": true
  }'
```

### Health Check

```bash
curl http://localhost:3004/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "booking-service",
  "timestamp": "2025-12-05T10:30:00.000Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| VAL_001 | Validation error |
| BOOKING_001 | Seats already booked |
| BOOKING_002 | Booking not found |
| BOOKING_003 | Invalid booking state for operation |
| BOOKING_004 | Cancellation not allowed |
| AUTH_001 | No token provided |
| AUTH_002 | Invalid or expired token |
| AUTH_003 | Insufficient permissions |
| SYS_001 | Internal server error |

---

## Key Features Implemented

✅ **Booking Creation with Seat Locking**
- Validates trip and seat availability
- Creates booking with 10-minute expiration
- Generates unique booking reference

✅ **Passenger Information Management**
- Supports multiple passengers per booking
- Validates passenger data
- Associates passengers with specific seats

✅ **Auto-Expiration System**
- Background job runs every 60 seconds
- Automatically cancels unpaid bookings
- Releases seats for other users

✅ **Payment Integration Ready**
- Payment confirmation endpoint
- Updates booking and payment status
- Sends notifications

✅ **User Booking Management**
- View booking history
- Filter and sort bookings
- Cancel with refund calculation

✅ **Guest Checkout Support**
- Book without user account
- Retrieve booking by reference + email

✅ **Frontend Components**
- Passenger information form
- Booking summary review
- User booking dashboard

✅ **Clean Architecture**
- Controller → Service → Repository pattern
- Joi validation
- JWT authentication
- Redis caching

---

## Next Steps

1. **Payment Service Integration**: Integrate with real payment gateways (MoMo, ZaloPay, VNPay)
2. **E-Ticket Generation**: Implement PDF ticket generation with QR codes
3. **Email Templates**: Create professional email templates for confirmations/cancellations
4. **Admin Dashboard**: Build admin interface for booking management
5. **Analytics**: Track booking metrics and revenue
6. **Testing**: Add unit tests and integration tests
7. **Performance**: Implement caching strategies for frequently accessed data

---

## Support

For issues or questions:
- Check logs: `docker-compose logs booking-service`
- Review API documentation above
- Verify environment variables
- Ensure all services are running

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025  
**Author**: Bus Ticket Development Team
