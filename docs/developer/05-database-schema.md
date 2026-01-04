# Database Schema

## Overview

The Bus Ticket Booking System uses **PostgreSQL 15** as its primary database. The schema is designed to support a complete bus ticketing platform with fleet management, trip scheduling, seat reservations, bookings, and analytics.

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────────────────────────────────────────────┐
│                                                      │
│  ┌──────────────┐      ┌───────────────────────┐   │
│  │  bookings    │───N──│ booking_passengers    │   │
│  └──────┬───────┘      └───────────────────────┘   │
│         │ N                                         │
│         │                                           │
│         │ 1                                         │
│  ┌──────┴──────┐                                    │
│  │    trips    │                                    │
│  └──────┬──────┘                                    │
│         │ N                                         │
│         │                                           │
│    ┌────┴────┐                                      │
│  1 │         │ 1                                    │
├────┤         ├────────────────────────────┐         │
│    └─────────┘                            │         │
│                                           │         │
┌┴──────────┐   ┌──────────────┐   ┌───────┴──────┐ │
│  routes   │   │    buses     │   │  operators   │ │
└───────────┘   └──────┬───────┘   └──────────────┘ │
                       │ 1                           │
                       │                             │
                       │ 1                           │
                ┌──────┴─────────┐                   │
                │   bus_models   │                   │
                └────────────────┘                   │
                                                     │
┌────────────────────────────────────────────────────┘
│
│  ┌───────────────────────┐
│  │  chatbot_sessions     │
│  └──────┬────────────────┘
│         │ 1
│         │
│         │ N
│  ┌──────┴────────────────┐
│  │  chatbot_messages     │
│  └───────────────────────┘
│
│  ┌───────────────────────┐
│  │  notifications        │
│  └───────────────────────┘
│
│  ┌───────────────────────┐
│  │  ratings              │
│  └───────────────────────┘
└────────────────────────────
```

## Core Tables

### users

Stores user accounts (passengers and admins).

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(32) UNIQUE,
  password_hash TEXT,
  full_name VARCHAR(100),
  role VARCHAR(32) DEFAULT 'passenger',
  google_id VARCHAR(255),
  avatar VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{
    "notifications": {
      "bookingConfirmations": {"email": true, "sms": false},
      "tripReminders": {"email": true, "sms": false},
      "tripUpdates": {"email": true, "sms": false}
    },
    "promotionalEmails": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_google_id ON users(google_id);
```

**Key Fields:**

- `user_id`: UUID primary key
- `email`: Unique email address
- `role`: 'passenger' or 'admin'
- `google_id`: For Google OAuth
- `preferences`: JSONB for notification preferences

### operators

Bus operating companies.

```sql
CREATE TABLE operators (
  operator_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  address TEXT,
  logo_url VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### bus_models

Bus model specifications.

```sql
CREATE TABLE bus_models (
  bus_model_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  seat_capacity INTEGER NOT NULL,
  seat_layout JSONB,  -- Seat map configuration
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**seat_layout Example:**

```json
{
  "rows": 10,
  "columns": 4,
  "aisles": [2],
  "seats": [
    { "code": "A1", "type": "standard", "position": { "row": 1, "col": 1 } },
    { "code": "A2", "type": "standard", "position": { "row": 1, "col": 2 } }
  ]
}
```

### buses

Individual bus instances.

```sql
CREATE TABLE buses (
  bus_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES operators(operator_id) ON DELETE CASCADE,
  bus_model_id UUID REFERENCES bus_models(bus_model_id) ON DELETE RESTRICT,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  plate_number VARCHAR(20),
  amenities JSONB DEFAULT '[]'::jsonb,  -- ["wifi", "toilet", "ac", "entertainment"]
  type VARCHAR(20) DEFAULT 'standard' CHECK (type IN ('standard', 'limousine', 'sleeper')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  image_url JSONB DEFAULT '[]'::jsonb,  -- Array of Cloudinary URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buses_operator_id ON buses(operator_id);
CREATE INDEX idx_buses_model_id ON buses(bus_model_id);
CREATE INDEX idx_buses_license_plate ON buses(license_plate);
```

### routes

Travel routes between cities.

```sql
CREATE TABLE routes (
  route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  distance_km INTEGER NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routes_origin_destination ON routes(origin, destination);
```

### route_stops

Pickup and drop-off points along routes.

```sql
CREATE TABLE route_stops (
  stop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(route_id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  location VARCHAR(200) NOT NULL,
  arrival_offset_minutes INTEGER,  -- Minutes from departure
  departure_offset_minutes INTEGER,
  stop_type VARCHAR(20) CHECK (stop_type IN ('pickup', 'dropoff', 'both')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
```

### trips

Scheduled bus trips.

```sql
CREATE TABLE trips (
  trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(route_id) ON DELETE RESTRICT,
  bus_id UUID REFERENCES buses(bus_id) ON DELETE RESTRICT,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  base_price DECIMAL(12,2) NOT NULL CHECK (base_price > 0),
  policies JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_search ON trips (departure_time) WHERE status = 'active';
CREATE INDEX idx_trips_active_route_time ON trips (route_id, departure_time) WHERE status = 'active';
```

**policies Example:**

```json
{
  "cancellation": {
    "allowed": true,
    "refundPercentage": 80,
    "deadline": "24h_before_departure"
  },
  "luggage": {
    "maxWeight": 20,
    "maxPieces": 2
  }
}
```

### seats

Seat instances for trips (Not documented in current project, may be dynamically generated).

### bookings

Customer bookings.

```sql
CREATE TABLE bookings (
  booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "BK20260104001"

  trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE RESTRICT,
  user_id UUID,  -- Nullable for guest checkout

  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),

  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  locked_until TIMESTAMP WITH TIME ZONE,  -- Seat lock expiration (10 min)

  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_fee DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'VND',

  payment_method VARCHAR(50),  -- 'momo', 'zalopay', 'payos', 'stripe'
  payment_status VARCHAR(20) DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE,

  cancellation_reason TEXT,
  refund_amount DECIMAL(12,2),

  ticket_url TEXT,
  qr_code_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_bookings_check_seats ON bookings (trip_id, status) WHERE status != 'cancelled';
```

**Status Flow:**

- `pending` → Payment awaited, seats locked
- `confirmed` → Payment received
- `completed` → Trip finished
- `cancelled` → User or system cancelled

### booking_passengers

Passenger details for each booked seat.

```sql
CREATE TABLE booking_passengers (
  ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,

  seat_code VARCHAR(10) NOT NULL,  -- e.g., "A1", "B2"
  price DECIMAL(12,2) NOT NULL,

  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  document_id VARCHAR(50),  -- CMND/CCCD/Passport

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### notifications

Email/SMS notification logs.

```sql
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  type VARCHAR(50) NOT NULL,  -- 'booking_confirmation', 'trip_reminder', etc.
  channel VARCHAR(20) NOT NULL,  -- 'email', 'sms'
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
```

### chatbot_sessions

Chatbot conversation sessions.

```sql
CREATE TABLE chatbot_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  context JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active'
);
```

### chatbot_messages

Individual chatbot messages.

```sql
CREATE TABLE chatbot_messages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL,  -- 'user' or 'bot'
  message TEXT NOT NULL,
  intent VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chatbot_messages_session ON chatbot_messages(session_id);
```

### ratings

Trip and operator ratings.

```sql
CREATE TABLE ratings (
  rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(booking_id),
  user_id UUID REFERENCES users(user_id),
  trip_id UUID REFERENCES trips(trip_id),
  operator_id UUID REFERENCES operators(operator_id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_trip ON ratings(trip_id);
CREATE INDEX idx_ratings_operator ON ratings(operator_id);
```

## Indexes

### Performance Indexes

```sql
-- Users
CREATE INDEX idx_users_google_id ON users(google_id);

-- Bookings
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_bookings_check_seats ON bookings (trip_id, status) WHERE status != 'cancelled';

-- Trips
CREATE INDEX idx_trips_search ON trips (departure_time) WHERE status = 'active';
CREATE INDEX idx_trips_active_route_time ON trips (route_id, departure_time) WHERE status = 'active';

-- Routes
CREATE INDEX idx_routes_origin_destination ON routes(origin, destination);

-- Buses
CREATE INDEX idx_buses_operator_id ON buses(operator_id);
CREATE INDEX idx_buses_model_id ON buses(bus_model_id);
CREATE INDEX idx_buses_license_plate ON buses(license_plate);

-- Route Stops
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Chatbot
CREATE INDEX idx_chatbot_messages_session ON chatbot_messages(session_id);

-- Ratings
CREATE INDEX idx_ratings_trip ON ratings(trip_id);
CREATE INDEX idx_ratings_operator ON ratings(operator_id);
```

## Data Types

### JSONB Usage

JSONB is used for flexible schema fields:

1. **User Preferences**: Notification settings
2. **Seat Layouts**: Bus seat maps
3. **Amenities**: Bus features
4. **Policies**: Trip cancellation and luggage policies
5. **Chatbot Context**: Conversation state

### Timestamp Handling

All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling:

```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

### UUID Primary Keys

All tables use UUID v4 for primary keys:

```sql
table_id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

**Benefits:**

- Globally unique identifiers
- No sequence collisions in distributed systems
- Harder to enumerate records

## Relationships

### One-to-Many

- `users` → `bookings` (one user, many bookings)
- `trips` → `bookings` (one trip, many bookings)
- `operators` → `buses` (one operator, many buses)
- `routes` → `trips` (one route, many trips)
- `bookings` → `booking_passengers` (one booking, many passengers)

### Many-to-One

- `buses` → `bus_models` (many buses, one model)
- `trips` → `routes` (many trips, one route)
- `trips` → `buses` (many trips, one bus)

## Constraints

### Foreign Key Constraints

```sql
-- Cascade deletion
operator_id UUID REFERENCES operators(operator_id) ON DELETE CASCADE

-- Restrict deletion
bus_model_id UUID REFERENCES bus_models(bus_model_id) ON DELETE RESTRICT

-- Nullify on deletion
user_id UUID REFERENCES users(user_id) ON DELETE SET NULL
```

### Check Constraints

```sql
-- Status validation
status VARCHAR(20) DEFAULT 'pending'
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))

-- Rating range
rating INTEGER CHECK (rating >= 1 AND rating <= 5)

-- Positive price
base_price DECIMAL(12,2) NOT NULL CHECK (base_price > 0)
```

### Unique Constraints

```sql
-- Unique email
email VARCHAR(255) UNIQUE

-- Unique booking reference
booking_reference VARCHAR(20) UNIQUE NOT NULL

-- Unique license plate
license_plate VARCHAR(20) UNIQUE NOT NULL
```

## Migrations

Migrations are located in `backend/sql/` directory and run in numerical order:

```
000_create_uuid_extension.sql
001_create_users_table.sql
002_add_email_verification.sql
003_add_password_reset.sql
004_add_failed_login_attempts.sql
005_seed_users.sql
006_create_bus_models_table.sql
007_create_seat_layouts_table.sql
008_create_operators_table.sql
009_create_routes_table.sql
010_create_route_stops_table.sql
011_create_buses_table.sql
012_create_trips_table.sql
013_create_seats_table.sql
014_create_bookings_table.sql
015_create_bookings_passenger_table.sql
...
```

### Running Migrations

**Manual:**

```bash
cd backend/sql
psql -U postgres -d bus_ticket_dev -f 001_create_users_table.sql
```

**Automated (Docker):**
Migrations run automatically on first container start via volume mount:

```yaml
volumes:
  - ./sql:/docker-entrypoint-initdb.d
```

## Sample Data

### Seed Users

```sql
-- Admin account
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES ('admin@example.com', '$2b$10$...', 'Admin User', 'admin', true);

-- Passenger account
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES ('john.doe@example.com', '$2b$10$...', 'John Doe', 'passenger', true);
```

### Seed Data Files

- `005_seed_users.sql` - Default users
- `020_seed_admin_account.sql` - Admin account
- `021_seed_route_points.sql` - Route stops
- `024_seed_notifications.sql` - Sample notifications
- `030_seed_ratings.sql` - Sample ratings

## Query Examples

### Find Available Seats for a Trip

```sql
SELECT seat_code
FROM generate_series(1, (
  SELECT seat_capacity
  FROM bus_models bm
  JOIN buses b ON b.bus_model_id = bm.bus_model_id
  JOIN trips t ON t.bus_id = b.bus_id
  WHERE t.trip_id = $1
)) AS seat_number
WHERE seat_code NOT IN (
  SELECT bp.seat_code
  FROM booking_passengers bp
  JOIN bookings b ON bp.booking_id = b.booking_id
  WHERE b.trip_id = $1
    AND b.status IN ('pending', 'confirmed')
);
```

### Search Trips with Filters

```sql
SELECT t.*, r.*, b.*, o.*
FROM trips t
JOIN routes r ON t.route_id = r.route_id
JOIN buses b ON t.bus_id = b.bus_id
JOIN operators o ON b.operator_id = o.operator_id
WHERE r.origin = $1
  AND r.destination = $2
  AND DATE(t.departure_time) = $3
  AND t.base_price BETWEEN $4 AND $5
  AND b.type = ANY($6)
  AND t.status = 'active'
ORDER BY t.departure_time ASC;
```

### Get User Bookings

```sql
SELECT b.*, t.*, r.*, bp.*
FROM bookings b
JOIN trips t ON b.trip_id = t.trip_id
JOIN routes r ON t.route_id = r.route_id
LEFT JOIN booking_passengers bp ON b.booking_id = bp.booking_id
WHERE b.user_id = $1
ORDER BY b.created_at DESC;
```

## Database Maintenance

### Backup

```bash
pg_dump -U postgres bus_ticket_dev > backup.sql
```

### Restore

```bash
psql -U postgres -d bus_ticket_dev < backup.sql
```

### Vacuum

```sql
VACUUM ANALYZE;
```

### Reindex

```sql
REINDEX DATABASE bus_ticket_dev;
```

## Related Documentation

- [Getting Started](./01-getting-started.md)
- [Architecture Overview](./02-architecture.md)
- [API Reference](./06-api-reference.md)
- [Microservices](./08-microservices.md)
