# Local Development Setup

## Prerequisites

Ensure you have the following installed:

- Node.js v18 or higher
- PostgreSQL v15 or higher
- Redis v7 or higher
- Git
- npm or yarn
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd bus-ticket-booking-system
```

### 2. Database Setup

#### Install PostgreSQL

**Windows:**

1. Download from https://www.postgresql.org/download/windows/
2. Run installer and follow wizard
3. Remember the password you set for `postgres` user

**macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE bus_ticket_dev;

# Verify
\l

# Exit
\q
```

#### Run Database Migrations

The project includes SQL migration files in `backend/sql/` directory:

```bash
cd backend/sql

# On Unix/Linux/macOS
for file in *.sql; do
  echo "Running $file..."
  psql -U postgres -d bus_ticket_dev -f "$file"
done

# On Windows (PowerShell)
Get-ChildItem -Filter *.sql | ForEach-Object {
  Write-Host "Running $($_.Name)..."
  psql -U postgres -d bus_ticket_dev -f $_.FullName
}
```

Migration files include:

- `000_create_uuid_extension.sql` - UUID support
- `001_create_users_table.sql` - Users
- `006_create_bus_models_table.sql` - Bus models
- `007_create_seat_layouts_table.sql` - Seat layouts
- `008_create_operators_table.sql` - Bus operators
- `009_create_routes_table.sql` - Routes
- `011_create_buses_table.sql` - Buses
- `012_create_trips_table.sql` - Trips
- `013_create_seats_table.sql` - Seats
- `014_create_bookings_table.sql` - Bookings
- `015_create_bookings_passenger_table.sql` - Passengers
- And more...

#### Verify Database

```bash
psql -U postgres -d bus_ticket_dev

# Check tables
\dt

# Check users
SELECT * FROM users LIMIT 5;

# Exit
\q
```

### 3. Redis Setup

#### Install Redis

**Windows:**

```bash
# Install WSL first
wsl --install

# Inside WSL
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
redis-server
```

Or use Redis Docker container:

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux:**

```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Verify Redis

```bash
redis-cli ping
# Expected output: PONG

# Test set/get
redis-cli
> SET test "Hello"
> GET test
> EXIT
```

### 4. Backend Setup

#### Install Dependencies

```bash
cd backend

# Root dependencies
npm install

# API Gateway
cd api-gateway
npm install
cd ..

# Install all services
cd services/auth-service && npm install && cd ../..
cd services/trip-service && npm install && cd ../..
cd services/booking-service && npm install && cd ../..
cd services/notification-service && npm install && cd ../..
cd services/payment-service && npm install && cd ../..
cd services/analytics-service && npm install && cd ../..
cd services/user-service && npm install && cd ../..
cd services/chatbot-service && npm install && cd ../..
```

#### Configure Environment Variables

Create `.env` file in backend root:

```bash
cd backend
touch .env
```

**backend/.env:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_ticket_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id

# SendGrid (required for emails)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# OpenWeather (optional)
OPENWEATHER_API_KEY=your-openweather-api-key

# Payment Gateways (required for payments)
# PayOS
PAYOS_CLIENT_ID=your-payos-client-id
PAYOS_API_KEY=your-payos-api-key
PAYOS_CHECKSUM_KEY=your-payos-checksum-key

# Momo
MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key

# ZaloPay
ZALOPAY_APP_ID=your-zalopay-app-id
ZALOPAY_KEY1=your-zalopay-key1
ZALOPAY_KEY2=your-zalopay-key2

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Internal Service Communication
INTERNAL_SERVICE_KEY=internal-service-secret-key-change-in-prod

# Frontend URL
FRONTEND_URL=http://localhost:5173

# API URL
API_URL=http://localhost:3000

# Booking Configuration
BOOKING_LOCK_DURATION_MINUTES=10
SERVICE_FEE_PERCENTAGE=3
SERVICE_FEE_FIXED=10000
```

Copy this `.env` to each service that needs it, or create service-specific `.env` files.

**Example: services/auth-service/.env**

```env
PORT=3001
NODE_ENV=development
SERVICE_NAME=auth-service

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_ticket_dev
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

GOOGLE_CLIENT_ID=your-google-client-id

NOTIFICATION_SERVICE_URL=http://localhost:3003
INTERNAL_SERVICE_KEY=internal-service-secret-key-change-in-prod
```

### 5. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

### 6. Start Services

You'll need multiple terminal windows/tabs.

#### Terminal 1: Auth Service

```bash
cd backend/services/auth-service
npm run dev
```

#### Terminal 2: Trip Service

```bash
cd backend/services/trip-service
npm run dev
```

#### Terminal 3: Booking Service

```bash
cd backend/services/booking-service
npm run dev
```

#### Terminal 4: Notification Service

```bash
cd backend/services/notification-service
npm run dev
```

#### Terminal 5: Payment Service

```bash
cd backend/services/payment-service
npm run dev
```

#### Terminal 6: Analytics Service

```bash
cd backend/services/analytics-service
npm run dev
```

#### Terminal 7: User Service

```bash
cd backend/services/user-service
npm run dev
```

#### Terminal 8: Chatbot Service

```bash
cd backend/services/chatbot-service
npm run dev
```

#### Terminal 9: API Gateway

```bash
cd backend/api-gateway
npm run dev
```

#### Terminal 10: Frontend

```bash
cd frontend
npm run dev
```

### 7. Verify Setup

#### Check Service Health

```bash
# Auth Service
curl http://localhost:3001/health

# Trip Service
curl http://localhost:3002/health

# Notification Service
curl http://localhost:3003/health

# Booking Service
curl http://localhost:3004/health

# Payment Service
curl http://localhost:3005/health

# Analytics Service
curl http://localhost:3006/health

# User Service
curl http://localhost:3007/health

# Chatbot Service
curl http://localhost:3008/health

# API Gateway
curl http://localhost:3000/health
```

Expected response:

```json
{
  "service": "auth-service",
  "status": "healthy",
  "timestamp": "2026-01-04T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Test Authentication

```bash
# Register new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Access Frontend

Open browser and navigate to:

- http://localhost:5173

Default credentials:

- Admin: `admin@example.com` / `admin123`
- User: `john.doe@example.com` / `password123`

## Development Tools

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- PostgreSQL (by Chris Kolkman)
- Redis (by zihao.tang)
- Docker
- Thunder Client (API testing)

### Database Client

**pgAdmin 4:**

```bash
# Download from https://www.pgadmin.org/download/
```

**DBeaver:**

```bash
# Download from https://dbeaver.io/download/
```

**Command Line:**

```bash
psql -U postgres -d bus_ticket_dev
```

### Redis Client

**RedisInsight:**

```bash
# Download from https://redis.io/insight/
```

**Command Line:**

```bash
redis-cli
```

### API Testing

**Thunder Client** (VS Code extension)
**Postman** (Desktop app)
**curl** (Command line)

Example Thunder Client collection:

```json
{
  "name": "Auth",
  "requests": [
    {
      "name": "Login",
      "method": "POST",
      "url": "http://localhost:3000/auth/login",
      "body": {
        "email": "admin@example.com",
        "password": "admin123"
      }
    }
  ]
}
```

## Useful Scripts

### Reset Database

```bash
cd backend

# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS bus_ticket_dev;"
psql -U postgres -c "CREATE DATABASE bus_ticket_dev;"

# Re-run migrations
cd sql
for file in *.sql; do
  psql -U postgres -d bus_ticket_dev -f "$file"
done
```

### Clear Redis Cache

```bash
redis-cli FLUSHALL
```

### Restart All Services

```bash
# Create this script: backend/restart-services.sh
#!/bin/bash

pkill -f "node.*auth-service"
pkill -f "node.*trip-service"
pkill -f "node.*booking-service"
pkill -f "node.*notification-service"
pkill -f "node.*payment-service"

cd services/auth-service && npm run dev &
cd services/trip-service && npm run dev &
cd services/booking-service && npm run dev &
cd services/notification-service && npm run dev &
cd services/payment-service && npm run dev &
```

## Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Refused

```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS
```

### Redis Connection Error

```bash
# Check Redis status
redis-cli ping

# Start Redis
sudo systemctl start redis  # Linux
brew services start redis  # macOS
redis-server  # Manual start
```

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Ensure API Gateway CORS is configured:

```javascript
// api-gateway/src/index.js
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
```

### JWT Token Errors

```bash
# Check .env files have matching JWT_SECRET
grep JWT_SECRET backend/.env
grep JWT_SECRET backend/services/*/env
```

## Next Steps

- [Architecture Overview](./02-architecture.md)
- [Docker Setup](./04-setup-docker.md)
- [API Reference](./06-api-reference.md)
- [Database Schema](./05-database-schema.md)
