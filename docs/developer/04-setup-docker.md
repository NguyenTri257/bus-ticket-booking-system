# Docker Deployment Setup

## Overview

The Bus Ticket Booking System uses Docker and Docker Compose for containerized deployment. This approach ensures consistency across development, testing, and production environments.

## Prerequisites

- Docker v20 or higher
- Docker Compose v2 or higher
- Git

### Install Docker

**Windows:**

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run installer and follow wizard
3. Restart computer if prompted
4. Verify: `docker --version`

**macOS:**

```bash
brew install --cask docker
# Or download from docker.com
```

**Linux (Ubuntu/Debian):**

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd bus-ticket-booking-system/backend
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bus_ticket_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# OpenWeather API (optional)
OPENWEATHER_API_KEY=your-openweather-api-key

# Payment Gateways
PAYOS_CLIENT_ID=your-payos-client-id
PAYOS_API_KEY=your-payos-api-key
PAYOS_CHECKSUM_KEY=your-payos-checksum-key

MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key

ZALOPAY_APP_ID=your-zalopay-app-id
ZALOPAY_KEY1=your-zalopay-key1
ZALOPAY_KEY2=your-zalopay-key2

STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Internal Service Key (CHANGE IN PRODUCTION!)
INTERNAL_SERVICE_KEY=internal-service-secret-key-change-in-prod

# Frontend URL
FRONTEND_URL=http://localhost:5173

# API URL
API_URL=http://api-gateway:3000
```

### 3. Start Services

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f booking-service
```

### 4. Verify Deployment

Check service status:

```bash
docker-compose ps
```

Expected output:

```
NAME                                COMMAND                  SERVICE             STATUS              PORTS
bus-ticket-analytics-service        "docker-entrypoint.s…"   analytics-service   running
bus-ticket-api-gateway              "docker-entrypoint.s…"   api-gateway         running             0.0.0.0:3000->3000/tcp
bus-ticket-auth-service             "docker-entrypoint.s…"   auth-service        running
bus-ticket-booking-service          "docker-entrypoint.s…"   booking-service     running             0.0.0.0:3004->3004/tcp
bus-ticket-chatbot-service          "docker-entrypoint.s…"   chatbot-service     running
bus-ticket-notification-service     "docker-entrypoint.s…"   notification-service running
bus-ticket-payment-service          "docker-entrypoint.s…"   payment-service     running             0.0.0.0:3005->3005/tcp
bus-ticket-postgres                 "docker-entrypoint.s…"   postgres            running (healthy)   5432/tcp
bus-ticket-redis                    "docker-entrypoint.s…"   redis               running (healthy)   0.0.0.0:6379->6379/tcp
bus-ticket-trip-service             "docker-entrypoint.s…"   trip-service        running             0.0.0.0:3002->3002/tcp
bus-ticket-user-service             "docker-entrypoint.s…"   user-service        running
```

Check health endpoints:

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service (through API Gateway)
curl http://localhost:3000/auth/health

# Booking Service
curl http://localhost:3004/health

# Trip Service
curl http://localhost:3002/health
```

## Docker Compose Configuration

### Network Architecture

All services run in a custom bridge network:

```yaml
networks:
  bus-ticket-network:
    driver: bridge
```

Services communicate using service names:

- `postgres` → PostgreSQL database
- `redis` → Redis cache
- `auth-service` → Authentication service
- `trip-service` → Trip management
- etc.

### Service Definitions

#### PostgreSQL Database

```yaml
postgres:
  image: postgres:15-alpine
  container_name: bus-ticket-postgres
  environment:
    POSTGRES_DB: bus_ticket_dev
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./sql:/docker-entrypoint-initdb.d # Auto-run migrations
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**Key Features:**

- Uses Alpine Linux for smaller image size
- Automatically runs SQL migrations from `/sql` directory on first start
- Health check ensures database is ready before dependent services start
- Persistent volume for data storage

#### Redis Cache

```yaml
redis:
  image: redis:7-alpine
  container_name: bus-ticket-redis
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 5
```

**Key Features:**

- Exposed on port 6379 for debugging
- Persistent volume for data
- Health check with redis-cli ping

#### Auth Service

```yaml
auth-service:
  build:
    context: ./services/auth-service
    dockerfile: Dockerfile
  container_name: bus-ticket-auth-service
  environment:
    - NODE_ENV=development
    - PORT=3001
    - DB_HOST=postgres
    - DB_PORT=5432
    - DB_NAME=bus_ticket_dev
    - DB_USER=postgres
    - DB_PASSWORD=postgres
    - REDIS_URL=redis://redis:6379
    - JWT_SECRET=${JWT_SECRET}
    - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    - NOTIFICATION_SERVICE_URL=http://notification-service:3003
    - INTERNAL_SERVICE_KEY=${INTERNAL_SERVICE_KEY}
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  volumes:
    - ./services/auth-service:/app
    - /app/node_modules # Anonymous volume for node_modules
```

**Key Features:**

- Waits for PostgreSQL and Redis to be healthy before starting
- Volume mount for hot-reload development
- Uses service names for internal communication

#### API Gateway

```yaml
api-gateway:
  build:
    context: ./api-gateway
    dockerfile: Dockerfile
  container_name: bus-ticket-api-gateway
  environment:
    - NODE_ENV=development
    - PORT=3000
    - AUTH_SERVICE_URL=http://auth-service:3001
    - TRIP_SERVICE_URL=http://trip-service:3002
    - BOOKING_SERVICE_URL=http://booking-service:3004
    - NOTIFICATION_SERVICE_URL=http://notification-service:3003
    - PAYMENT_SERVICE_URL=http://payment-service:3005
    - ANALYTICS_SERVICE_URL=http://analytics-service:3006
    - USER_SERVICE_URL=http://user-service:3007
    - CHATBOT_SERVICE_URL=http://chatbot-service:3008
    - JWT_SECRET=${JWT_SECRET}
  ports:
    - "3000:3000"
  depends_on:
    - auth-service
    - trip-service
    - booking-service
```

**Key Features:**

- Single entry point for all client requests
- Routes to all microservices
- Exposed on port 3000

### Volumes

```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

Persistent volumes ensure data survives container restarts.

## Docker Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d booking-service

# Start without detached mode (see logs)
docker-compose up

# Build and start
docker-compose up --build -d
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v

# Stop specific service
docker-compose stop booking-service
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f booking-service

# Last 100 lines
docker-compose logs --tail=100 auth-service

# Since specific time
docker-compose logs --since 2026-01-04T10:00:00 trip-service
```

### Execute Commands

```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -d bus_ticket_dev

# Redis
docker-compose exec redis redis-cli

# Shell in service container
docker-compose exec booking-service sh

# Run npm command
docker-compose exec booking-service npm run test
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart booking-service

# Rebuild and restart
docker-compose up --build -d booking-service
```

### Check Status

```bash
# List running containers
docker-compose ps

# List all containers (including stopped)
docker-compose ps -a

# View resource usage
docker stats
```

## Database Management

### Access Database

```bash
docker-compose exec postgres psql -U postgres -d bus_ticket_dev
```

### Backup Database

```bash
# Export to SQL file
docker-compose exec postgres pg_dump -U postgres bus_ticket_dev > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres -d bus_ticket_dev < backup.sql
```

### Run SQL Migrations

```bash
# Single file
docker-compose exec -T postgres psql -U postgres -d bus_ticket_dev < sql/001_new_migration.sql

# All files
for file in sql/*.sql; do
  docker-compose exec -T postgres psql -U postgres -d bus_ticket_dev < "$file"
done
```

## Redis Management

### Access Redis CLI

```bash
docker-compose exec redis redis-cli
```

### Common Commands

```bash
# Check connection
PING

# List all keys
KEYS *

# Get value
GET key_name

# Delete key
DEL key_name

# Clear all data
FLUSHALL

# Get info
INFO

# Monitor commands
MONITOR
```

## Development Workflow

### Hot Reload

Services are configured with volume mounts for hot-reload:

```yaml
volumes:
  - ./services/auth-service:/app
  - /app/node_modules
```

Changes to source code will automatically restart the service.

### Install New Dependencies

```bash
# Stop service
docker-compose stop booking-service

# Install dependency
cd services/booking-service
npm install new-package

# Rebuild and start
docker-compose up --build -d booking-service
```

### Run Tests

```bash
# Run tests in container
docker-compose exec booking-service npm test

# Run with coverage
docker-compose exec booking-service npm run test:coverage
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs booking-service

# Check if port is in use
lsof -i :3004  # macOS/Linux
netstat -ano | findstr :3004  # Windows

# Remove container and restart
docker-compose rm -f booking-service
docker-compose up -d booking-service
```

### Database Connection Error

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Verify connection
docker-compose exec postgres psql -U postgres -c "SELECT version();"
```

### Redis Connection Error

```bash
# Check if Redis is healthy
docker-compose ps redis

# Check logs
docker-compose logs redis

# Test connection
docker-compose exec redis redis-cli ping
```

### Out of Memory

```bash
# Check resource usage
docker stats

# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory
```

### Network Issues

```bash
# List networks
docker network ls

# Inspect network
docker network inspect bus-ticket-network

# Recreate network
docker-compose down
docker-compose up -d
```

### Clean Up

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## Production Deployment

For production deployment, use `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Key differences:

- No volume mounts (build artifacts are copied)
- Optimized images (multi-stage builds)
- Health checks and restart policies
- Resource limits
- Production environment variables

## Monitoring

### Health Checks

All services expose `/health` endpoints:

```bash
curl http://localhost:3000/health
curl http://localhost:3004/health
```

### Logs Aggregation

**Not documented in current project.**

### Metrics

**Not documented in current project.**

## Next Steps

- [Local Development Setup](./03-setup-local.md)
- [Architecture Overview](./02-architecture.md)
- [API Reference](./06-api-reference.md)
- [Deployment Guide](./11-deployment.md)
