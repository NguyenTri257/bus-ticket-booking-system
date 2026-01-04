# Getting Started

## Quick Start Guide

This guide will help you set up and run the Bus Ticket Booking System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v15 or higher)
- **Redis** (v7 or higher)
- **Git**
- **npm** or **yarn**

### Optional (for Docker deployment)

- **Docker** (v20 or higher)
- **Docker Compose** (v2 or higher)

## Project Structure

```
bus-ticket-booking-system/
├── backend/
│   ├── api-gateway/           # API Gateway (Port 3000)
│   ├── services/
│   │   ├── auth-service/      # Authentication (Port 3001)
│   │   ├── trip-service/      # Trip Management (Port 3002)
│   │   ├── notification-service/  # Email/SMS (Port 3003)
│   │   ├── booking-service/   # Booking Management (Port 3004)
│   │   ├── payment-service/   # Payment Processing (Port 3005)
│   │   ├── analytics-service/ # Analytics & Reporting (Port 3006)
│   │   ├── user-service/      # User Management (Port 3007)
│   │   └── chatbot-service/   # AI Chatbot (Port 3008)
│   ├── sql/                   # Database migrations
│   ├── docker-compose.yml     # Docker configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── stores/
│   ├── package.json
│   └── vite.config.ts
└── docs/                      # Documentation
```

## Quick Start (Docker - Recommended)

The fastest way to get started is using Docker Compose:

1. **Clone the repository**

```bash
git clone https://github.com/ngocnhu100/bus-ticket-booking-system.git
cd bus-ticket-booking-system
```

2. **Set up environment variables**

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bus_ticket_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# SendGrid (Email)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

3. **Start all services**

```bash
docker-compose up -d
```

4. **Access the application**

- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

5. **Check service health**

```bash
# Auth Service
curl http://localhost:3001/health

# Trip Service
curl http://localhost:3002/health

# Booking Service
curl http://localhost:3004/health
```

## Manual Setup (Local Development)

### Step 1: Database Setup

1. **Install PostgreSQL**

2. **Create database**

```bash
psql -U postgres
CREATE DATABASE bus_ticket_dev;
\c bus_ticket_dev
```

3. **Run migrations**

```bash
cd backend/sql
psql -U postgres -d bus_ticket_dev -f 000_create_uuid_extension.sql
psql -U postgres -d bus_ticket_dev -f 001_create_users_table.sql
# Run all SQL files in order (001-040+)
```

Or use the automated script:

```bash
cd backend
for file in sql/*.sql; do
  psql -U postgres -d bus_ticket_dev -f "$file"
done
```

### Step 2: Redis Setup

1. **Install Redis**

**Windows:**

```bash
# Use Redis on WSL or download Redis for Windows
wsl -install
wsl
sudo apt-get install redis-server
redis-server
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux:**

```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

2. **Verify Redis is running**

```bash
redis-cli ping
# Should return: PONG
```

### Step 3: Backend Services

1. **Install dependencies**

```bash
cd backend

# Install root dependencies
npm install

# Install API Gateway dependencies
cd api-gateway
npm install

# Install each service dependencies
cd ../services/auth-service
npm install

cd ../trip-service
npm install

cd ../booking-service
npm install

cd ../notification-service
npm install

cd ../payment-service
npm install

cd ../analytics-service
npm install

cd ../user-service
npm install

cd ../chatbot-service
npm install
```

2. **Configure environment variables**

Create `.env` file in each service directory:

**Example: auth-service/.env**

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_ticket_dev
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
NOTIFICATION_SERVICE_URL=http://localhost:3003
```

3. **Start services**

Open separate terminal windows for each service:

```bash
# Terminal 1: Auth Service
cd backend/services/auth-service
npm run dev

# Terminal 2: Trip Service
cd backend/services/trip-service
npm run dev

# Terminal 3: Booking Service
cd backend/services/booking-service
npm run dev

# Terminal 4: Notification Service
cd backend/services/notification-service
npm run dev

# Terminal 5: Payment Service
cd backend/services/payment-service
npm run dev

# Terminal 6: API Gateway
cd backend/api-gateway
npm run dev
```

### Step 4: Frontend Setup

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Configure environment**

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

3. **Start development server**

```bash
npm run dev
```

The application should now be running at http://localhost:5173

## Default Credentials

After running the database migrations, you can use these default accounts:

**Admin Account:**

- Email: `admin@example.com`
- Password: `admin123`

**Test Passenger Account:**

- Email: `john.doe@example.com`
- Password: `password123`

## Verification Steps

1. **Check backend services**

```bash
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3004/health
```

2. **Check database connection**

```bash
psql -U postgres -d bus_ticket_dev -c "SELECT COUNT(*) FROM users;"
```

3. **Check Redis connection**

```bash
redis-cli
> PING
> EXIT
```

4. **Test authentication**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

## Development Workflow

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

### Git Workflow

The project uses Husky for pre-commit hooks:

```bash
# Install Husky
npm run prepare

# Hooks will run automatically on commit
git add .
git commit -m "Your message"
```

### Running Tests

```bash
# Backend service tests
cd backend/services/auth-service
npm test

# Frontend tests
cd frontend
npm run test
npm run test:coverage
```

## Troubleshooting

### Port Already in Use

If ports 3000-3008 are already in use:

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Check connection
psql -U postgres -c "SELECT version();"
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping

# Start Redis
sudo systemctl start redis  # Linux
brew services start redis  # macOS
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [Architecture Overview](./02-architecture.md) - Understand the system architecture
- [API Reference](./06-api-reference.md) - Explore available APIs
- [Database Schema](./05-database-schema.md) - Learn about the database structure
- [Testing Guide](./10-testing.md) - Write and run tests

## Additional Resources

- [Docker Setup Guide](./04-setup-docker.md) - Detailed Docker configuration
- [Deployment Guide](./11-deployment.md) - Production deployment
- [Microservices Documentation](./08-microservices.md) - Service-specific details
