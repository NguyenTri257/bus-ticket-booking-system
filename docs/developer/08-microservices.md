# Microservices Documentation

## Overview

The system is composed of 8 independent microservices, each responsible for specific business domains.

## Service Details

### 1. API Gateway (Port 3000)

**Purpose:** Single entry point, request routing, authentication

**Key Features:**

- Routes requests to appropriate services
- JWT token validation
- CORS configuration
- Rate limiting
- Request/response logging

**Technology:** Express.js, Axios

**Environment Variables:**

```env
PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
TRIP_SERVICE_URL=http://trip-service:3002
BOOKING_SERVICE_URL=http://booking-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3003
PAYMENT_SERVICE_URL=http://payment-service:3005
JWT_SECRET=your-jwt-secret
```

---

### 2. Auth Service (Port 3001)

**Purpose:** Authentication, user management, authorization

**Key Features:**

- User registration and login
- JWT token generation and validation
- Google OAuth integration
- Password reset via email
- Email verification
- Token blacklist (logout)
- Role-based access control

**Technology:** Express.js, bcrypt, JWT, Passport.js, Google Auth Library

**Database Tables:** `users`

**Redis Keys:**

- `blacklist:{token}` - Blacklisted tokens
- `session:{userId}` - User sessions
- `reset:{token}` - Password reset tokens

**Endpoints:**

- POST `/register` - Register new user
- POST `/login` - Login
- POST `/oauth/google` - Google OAuth
- POST `/refresh` - Refresh tokens
- POST `/logout` - Logout
- GET `/me` - Get profile
- PUT `/me` - Update profile

---

### 3. Trip Service (Port 3002)

**Purpose:** Trip search, fleet management, seat management

**Key Features:**

- Advanced trip search with filters
- Seat locking (Redis)
- Bus and route management
- Rating and review system
- Admin trip management

**Technology:** Express.js, PostgreSQL, Redis

**Database Tables:** `trips`, `routes`, `buses`, `bus_models`, `operators`, `route_stops`, `seats`, `ratings`

**Redis Keys:**

- `seat_lock:{tripId}:{seatCode}` - Seat locks (10 min TTL)
- `trip_search:{hash}` - Cached search results

**Key Endpoints:**

- GET `/search` - Search trips
- GET `/:id` - Get trip details
- GET `/:id/seats` - Get seat availability
- POST `/:id/seats/lock` - Lock seats
- POST `/:id/seats/release` - Release seats
- POST `/` - Create trip (admin)

---

### 4. Booking Service (Port 3004)

**Purpose:** Booking management, ticket generation

**Key Features:**

- Create bookings (guest and authenticated)
- Unique booking reference generation (Redis counter)
- E-ticket PDF generation with QR code
- Booking expiration (10-minute lock)
- Booking lookup and verification
- Automated email delivery

**Technology:** Express.js, PostgreSQL, Redis, PDFKit, QRCode

**Database Tables:** `bookings`, `booking_passengers`

**Redis Keys:**

- `booking_ref_counter` - Atomic counter for booking references
- `booking_lock:{bookingId}` - Booking expiration tracking

**Background Jobs:**

- `bookingExpirationJob.js` - Cancel expired bookings (runs every minute)

**Key Endpoints:**

- POST `/bookings` - Create booking
- GET `/bookings/:id` - Get booking
- GET `/bookings` - List user bookings
- POST `/bookings/lookup` - Guest booking lookup
- PATCH `/bookings/:id/cancel` - Cancel booking

---

### 5. Payment Service (Port 3005)

**Purpose:** Payment processing, webhook handling

**Key Features:**

- Multiple payment gateways (PayOS, Momo, ZaloPay, Stripe)
- Payment initiation
- Webhook handling and verification
- Payment status updates
- Refund processing

**Technology:** Express.js, PayOS SDK, Momo SDK, ZaloPay SDK, Stripe SDK

**Payment Gateways:**

1. **PayOS** - Credit/debit cards, e-wallets
2. **Momo** - Mobile wallet
3. **ZaloPay** - Digital wallet
4. **Stripe** - International cards

**Key Endpoints:**

- POST `/api/payment` - Create payment
- POST `/webhooks/payos` - PayOS webhook
- POST `/webhooks/momo` - Momo webhook
- POST `/webhooks/zalopay` - ZaloPay webhook
- POST `/webhooks/stripe` - Stripe webhook

---

### 6. Notification Service (Port 3003)

**Purpose:** Email and SMS notifications

**Key Features:**

- E-ticket email delivery
- Booking confirmation emails
- Trip reminder emails (24h, 2h before)
- Password reset emails
- Email verification
- Weather updates in reminders

**Technology:** Express.js, SendGrid, OpenWeather API

**Database Tables:** `notifications`

**Background Jobs:**

- `tripReminderJob.js` - Send trip reminders (runs hourly)

**Email Templates:**

- Booking confirmation
- E-ticket delivery
- Trip reminder
- Password reset
- Email verification

**Key Endpoints:**

- POST `/internal/send-email` - Send email (internal)
- POST `/internal/send-sms` - Send SMS (internal)

---

### 7. Analytics Service (Port 3006)

**Purpose:** Business intelligence, reporting

**Key Features:**

- Dashboard metrics
- Revenue analytics
- Booking analytics
- Popular routes
- Occupancy rates
- Trend analysis

**Technology:** Express.js, PostgreSQL

**Key Endpoints:**

- GET `/dashboard` - Dashboard summary
- GET `/bookings` - Booking analytics
- GET `/revenue` - Revenue analytics

---

### 8. User Service (Port 3007)

**Purpose:** User profile management

**Key Features:**

- Profile management
- Notification preferences
- Booking history
- User settings

**Technology:** Express.js, PostgreSQL

**Key Endpoints:**

- GET `/profile` - Get profile
- PUT `/profile` - Update profile
- GET `/bookings` - Get user bookings
- PUT `/preferences` - Update preferences

---

### 9. Chatbot Service (Port 3008)

**Purpose:** AI-powered booking assistance

**Key Features:**

- Natural language processing
- Conversational booking
- FAQ handling
- Session management
- Feedback collection

**Technology:** Express.js, PostgreSQL

**Database Tables:** `chatbot_sessions`, `chatbot_messages`, `chatbot_feedback`

**Key Endpoints:**

- POST `/chatbot/query` - Send message
- GET `/chatbot/session` - Get session
- POST `/chatbot/feedback` - Submit feedback

---

## Service Communication

### Synchronous (REST)

Services communicate via HTTP REST APIs:

```javascript
// Example: Booking Service → Trip Service
const tripResponse = await axios.get(
  `${TRIP_SERVICE_URL}/internal/trips/${tripId}`,
  {
    headers: {
      "x-internal-service-key": INTERNAL_SERVICE_KEY,
    },
  },
);
```

### Internal Authentication

Internal service calls use shared secret key:

```javascript
// Middleware
function validateInternalServiceKey(req, res, next) {
  const key = req.headers["x-internal-service-key"];

  if (key !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
```

## Service Dependencies

```
API Gateway
├── Auth Service
├── Trip Service
├── Booking Service
│   ├── Trip Service
│   ├── Notification Service
│   └── Payment Service (indirectly)
├── Payment Service
│   └── Booking Service
├── Notification Service
├── Analytics Service
├── User Service
└── Chatbot Service

All Services
├── PostgreSQL
└── Redis
```

## Health Checks

All services expose `/health` endpoint:

```javascript
app.get("/health", (req, res) => {
  res.json({
    service: "booking-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    dependencies: {
      database: "connected",
      redis: "connected",
    },
  });
});
```

## Logging

Each service logs to stdout:

```javascript
console.log(
  JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "info",
    service: "booking-service",
    message: "Booking created",
    context: {
      bookingId: "uuid",
      userId: "uuid",
    },
  }),
);
```

## Error Handling

Standardized error responses:

```javascript
app.use((error, req, res, next) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      service: "booking-service",
      error: error.message,
      stack: error.stack,
    }),
  );

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || "SERVER_ERROR",
      message: error.message,
    },
    timestamp: new Date().toISOString(),
  });
});
```

## Related Documentation

- [Architecture Overview](./02-architecture.md)
- [API Reference](./06-api-reference.md)
- [Database Schema](./05-database-schema.md)
- [Redis Caching](./09-redis-caching.md)
