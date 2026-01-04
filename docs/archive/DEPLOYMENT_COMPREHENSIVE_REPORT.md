<!-- File Location: /DEPLOYMENT_COMPREHENSIVE_REPORT.md -->
<!-- This file has been reviewed for documentation consolidation -->
<!-- Content: Production Deployment Report -->
<!-- Status: Keep for production reference - comprehensive deployment guide -->

# Bus Ticket Booking System: Comprehensive Deployment Report

## Executive Summary

This report provides comprehensive documentation for deploying the Bus Ticket Booking System across multiple environments. The system employs a containerized microservices architecture with Docker Compose for orchestration, supporting development, staging, and production deployments. The deployment process encompasses database initialization, service configuration, frontend and backend deployment, and post-deployment verification procedures.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Deployment Environments](#3-deployment-environments)
4. [Development Environment Setup](#4-development-environment-setup)
5. [Docker-Based Deployment](#5-docker-based-deployment)
6. [Backend Services Deployment](#6-backend-services-deployment)
7. [Frontend Deployment](#7-frontend-deployment)
8. [Production Deployment](#8-production-deployment)
9. [Configuration Management](#9-configuration-management)
10. [Monitoring and Health Checks](#10-monitoring-and-health-checks)
11. [Troubleshooting](#11-troubleshooting)
12. [Best Practices](#12-best-practices)

---

## 1. System Architecture

### 1.1 Microservices Overview

The Bus Ticket Booking System follows a microservices architecture with the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│                  React + Vite (Port: 5173)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Port: 3000)                      │
│  • Request Routing  • Authentication  • Error Handling          │
└──────────┬──────────────────┬──────────────┬────────────────────┘
           │                  │              │
    ┌──────▼────────┐  ┌──────▼─────┐  ┌────▼──────────┐
    │ Auth Service  │  │Trip Service │  │Booking Service│
    │   (3001)      │  │  (3002)     │  │    (3004)     │
    └──────┬────────┘  └──────┬─────┘  └────┬──────────┘
           │                  │             │
    ┌──────▼────────┐  ┌──────▼──────┐  ┌──────▼───────┐
    │Notification   │  │Payment      │  │Analytics     │
    │Service (3003) │  │Service(3005)│  │Service(3006) │
    └───────────────┘  └─────────────┘  └──────────────┘
           │
    ┌──────▼────────┐
    │Chatbot Service│
    │   (3007)      │
    └───────────────┘
           │
    ┌──────▼────────────────────┐
    │  INFRASTRUCTURE LAYER     │
    │  PostgreSQL (5432)        │
    │  Redis (6379)             │
    └───────────────────────────┘
```

### 1.2 Core Services

| Service                  | Port | Function                    | Technology           |
| ------------------------ | ---- | --------------------------- | -------------------- |
| **API Gateway**          | 3000 | Request routing, auth, CORS | Express.js           |
| **Auth Service**         | 3001 | User authentication, JWT    | Node.js + PostgreSQL |
| **Trip Service**         | 3002 | Trip search & management    | Node.js + PostgreSQL |
| **Notification Service** | 3003 | Email notifications         | SendGrid             |
| **Booking Service**      | 3004 | Bookings & e-tickets        | Node.js + PostgreSQL |
| **Payment Service**      | 3005 | Payment processing          | Stripe API           |
| **Analytics Service**    | 3006 | Metrics & reporting         | Node.js + PostgreSQL |
| **Chatbot Service**      | 3007 | Customer support            | Node.js + PostgreSQL |
| **User Service**         | 3008 | User management             | Node.js + PostgreSQL |
| **Frontend**             | 5173 | Web UI                      | React + Vite         |
| **PostgreSQL**           | 5432 | Primary database            | PostgreSQL 15        |
| **Redis**                | 6379 | Caching & sessions          | Redis 7              |

### 1.3 Key Technologies

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker, Docker Compose
- **Email**: SendGrid
- **Payment**: Stripe
- **Authentication**: JWT, Google OAuth 2.0
- **Cloud Storage**: Cloudinary (images)

---

## 2. Prerequisites

### 2.1 System Requirements

| Requirement | Minimum                                  | Recommended                            |
| ----------- | ---------------------------------------- | -------------------------------------- |
| **RAM**     | 4 GB                                     | 8 GB                                   |
| **Storage** | 5 GB                                     | 20 GB                                  |
| **CPU**     | Dual-core                                | Quad-core                              |
| **OS**      | Windows 10 / macOS 10.14 / Ubuntu 18.04+ | Windows 11 / macOS 12+ / Ubuntu 20.04+ |

### 2.2 Required Software

**Installation Commands**:

```bash
# Windows (using Chocolatey)
choco install docker-desktop git nodejs

# macOS (using Homebrew)
brew install docker git node

# Ubuntu/Debian
sudo apt-get install docker.io docker-compose git nodejs npm
```

**Verification**:

```bash
docker --version          # Docker version >= 20.10
docker-compose --version  # Docker Compose version >= 2.0
git --version             # Git version >= 2.30
node --version            # Node.js version >= 18.0
npm --version             # npm version >= 8.0
```

### 2.3 API Keys and Credentials

Before deployment, obtain the following:

| Service          | Credentials               | Purpose             |
| ---------------- | ------------------------- | ------------------- |
| **Google OAuth** | Client ID, Client Secret  | User authentication |
| **SendGrid**     | API Key                   | Email notifications |
| **Stripe**       | API Key, Secret Key       | Payment processing  |
| **Cloudinary**   | Cloud Name, Upload Preset | Image storage       |
| **JWT Secret**   | Generated key             | Token encryption    |

### 2.4 Port Availability

Ensure the following ports are available:

```
3000 - API Gateway
3001 - Auth Service
3002 - Trip Service
3003 - Notification Service
3004 - Booking Service
3005 - Payment Service
3006 - Analytics Service
3007 - Chatbot Service
3008 - User Service
5173 - Frontend (Vite)
5432 - PostgreSQL
6379 - Redis
80/443 - Nginx (production)
```

---

## 3. Deployment Environments

### 3.1 Environment Tiers

| Environment     | Purpose                | Configuration     | Database      | Updates  |
| --------------- | ---------------------- | ----------------- | ------------- | -------- |
| **Development** | Local development      | Loose constraints | Local         | Frequent |
| **Staging**     | Pre-production testing | Production-like   | Clone of prod | Weekly   |
| **Production**  | Live system            | Strict controls   | Replicated    | Planned  |

### 3.2 Environment Variables

Different environments require different configuration sets:

**Development (.env.development)**:

```env
NODE_ENV=development
API_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bus_ticket_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
DEBUG=true
LOG_LEVEL=debug
```

**Staging (.env.staging)**:

```env
NODE_ENV=staging
API_URL=https://staging-api.example.com
DATABASE_URL=postgresql://user:pass@staging-db.example.com:5432/bus_ticket
REDIS_URL=redis://staging-redis.example.com:6379
JWT_SECRET=staging-secret-key
DEBUG=false
LOG_LEVEL=info
```

**Production (.env.production)**:

```env
NODE_ENV=production
API_URL=https://api.example.com
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/bus_ticket
REDIS_URL=redis://prod-redis.example.com:6379
JWT_SECRET=production-secret-key
DEBUG=false
LOG_LEVEL=error
ENABLE_MONITORING=true
```

---

## 4. Development Environment Setup

### 4.1 Local Installation (Without Docker)

#### Step 1: Clone Repository

```bash
git clone https://github.com/ngocnhu100/bus-ticket-booking-system.git
cd bus-ticket-booking-system
```

#### Step 2: Install Node Dependencies

**Backend**:

```bash
cd backend
npm install

# Install service dependencies
cd api-gateway && npm install && cd ..
cd services/auth-service && npm install && cd ../..
cd services/trip-service && npm install && cd ../..
# ... repeat for all services
```

**Frontend**:

```bash
cd frontend
npm install
```

#### Step 3: Setup PostgreSQL

**macOS/Linux**:

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb -U postgres bus_ticket_dev
```

**Windows**:

```powershell
# Download and install from postgresql.org
# Then in PowerShell:
psql -U postgres -c "CREATE DATABASE bus_ticket_dev;"
```

#### Step 4: Initialize Database Schema

```bash
cd backend/sql
for file in *.sql; do
  psql -U postgres -d bus_ticket_dev -f "$file"
done
```

#### Step 5: Setup Environment Files

```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.dev backend/.env

# Edit .env with your credentials
nano .env
```

#### Step 6: Start Redis

```bash
# macOS/Linux
brew services start redis

# Windows (using Docker)
docker run -d -p 6379:6379 redis:7-alpine
```

#### Step 7: Start Services

**Terminal 1 - API Gateway**:

```bash
cd backend/api-gateway
npm start
```

**Terminal 2 - Auth Service**:

```bash
cd backend/services/auth-service
npm start
```

**Terminal 3 - Trip Service**:

```bash
cd backend/services/trip-service
npm start
```

**Terminal 4 - Frontend**:

```bash
cd frontend
npm run dev
```

**Expected Output**:

```
API Gateway listening on http://localhost:3000
Auth Service listening on http://localhost:3001
Trip Service listening on http://localhost:3002
Frontend available at http://localhost:5173
```

### 4.2 Local Installation (With Docker)

**Recommended for consistency**

#### Step 1: Clone Repository

```bash
git clone https://github.com/ngocnhu100/bus-ticket-booking-system.git
cd bus-ticket-booking-system
```

#### Step 2: Setup Environment

```bash
# Copy and configure environment file
cp .env.example .env

# Edit for your setup
nano .env
```

**Minimal .env Configuration**:

```env
NODE_ENV=development
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_API_KEY=your-stripe-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
VITE_API_URL=http://localhost:3000
```

#### Step 3: Build Services

```bash
# Build all containers
docker-compose build

# Expected output:
# Successfully built bus-ticket-postgres
# Successfully built bus-ticket-redis
# Successfully built bus-ticket-api-gateway
# Successfully built bus-ticket-auth-service
# ... (more services)
```

#### Step 4: Start Services

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output should show all services as "Up"
```

#### Step 5: Verify Deployment

```bash
# Check API Gateway
curl http://localhost:3000/health

# Check frontend
open http://localhost:5173

# View logs
docker-compose logs -f

# Access database
docker-compose exec postgres psql -U postgres -d bus_ticket_dev -c "\dt"
```

### 4.3 Troubleshooting Local Setup

**Issue: Port already in use**

```bash
# Find and kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use Docker to specify different port
docker-compose up -p custom-prefix
```

**Issue: Database connection failed**

```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Reset password if needed
psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

**Issue: Node modules not installed**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or in Docker
docker-compose down -v  # Remove volumes
docker-compose up --build
```

---

## 5. Docker-Based Deployment

### 5.1 Docker Compose Architecture

The `docker-compose.yml` file orchestrates all services:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: bus-ticket-postgres
    environment:
      POSTGRES_DB: bus_ticket_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/sql:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

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

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: bus-ticket-frontend
    ports:
      - "5173:80"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=${VITE_API_URL}
    depends_on:
      - api-gateway

  api-gateway:
    build:
      context: ./backend/api-gateway
      dockerfile: Dockerfile
    container_name: bus-ticket-api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  # Additional services defined similarly...
```

### 5.2 Build and Deploy

#### Full Deployment Workflow

```bash
# 1. Clean previous deployment
docker-compose down -v

# 2. Build all services
docker-compose build --no-cache

# 3. Start services in background
docker-compose up -d

# 4. Wait for healthy state
sleep 30

# 5. Verify all services are running
docker-compose ps

# 6. Run health checks
docker-compose exec api-gateway curl http://localhost:3000/health
```

#### Incremental Build

```bash
# Rebuild only changed service (e.g., frontend)
docker-compose build frontend

# Restart only that service
docker-compose up -d frontend
```

### 5.3 Container Management

**Common Docker Compose Commands**:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View running containers
docker-compose ps

# View logs
docker-compose logs -f api-gateway

# View logs for all services
docker-compose logs -f --tail=100

# Execute command in container
docker-compose exec postgres psql -U postgres -d bus_ticket_dev

# Rebuild without cache
docker-compose build --no-cache

# Remove all volumes
docker-compose down -v

# Restart services
docker-compose restart
```

### 5.4 Resource Management

**Limit resource consumption**:

```yaml
# In docker-compose.yml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
```

**Monitor resource usage**:

```bash
# View real-time statistics
docker stats

# View specific container
docker stats bus-ticket-api-gateway
```

---

## 6. Backend Services Deployment

### 6.1 Service-by-Service Deployment

#### API Gateway Deployment

**Dockerfile**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Build if needed
RUN npm run build || true

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD npm run health || exit 1

# Start application
CMD ["npm", "start"]
```

**Deployment Command**:

```bash
# Build
docker build -t bus-ticket-api-gateway:latest ./backend/api-gateway

# Run
docker run -d \
  --name bus-ticket-api-gateway \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=$JWT_SECRET \
  --network bus-ticket-network \
  bus-ticket-api-gateway:latest
```

#### Individual Service Deployment

```bash
# Auth Service
cd backend/services/auth-service
docker build -t bus-ticket-auth-service:latest .
docker run -d \
  --name bus-ticket-auth-service \
  -p 3001:3001 \
  -e DB_HOST=postgres \
  -e JWT_SECRET=$JWT_SECRET \
  --network bus-ticket-network \
  bus-ticket-auth-service:latest

# Trip Service
cd backend/services/trip-service
docker build -t bus-ticket-trip-service:latest .
docker run -d \
  --name bus-ticket-trip-service \
  -p 3002:3002 \
  -e DB_HOST=postgres \
  --network bus-ticket-network \
  bus-ticket-trip-service:latest
```

### 6.2 Service Configuration

**Environment Variables for Services**:

```bash
# API Gateway
API_GATEWAY_PORT=3000
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://auth-service:3001
TRIP_SERVICE_URL=http://trip-service:3002
BOOKING_SERVICE_URL=http://booking-service:3004

# Auth Service
AUTH_DB_HOST=postgres
AUTH_DB_PORT=5432
AUTH_DB_NAME=bus_ticket_dev
AUTH_DB_USER=postgres
AUTH_DB_PASSWORD=postgres
GOOGLE_CLIENT_ID=your-google-id
SENDGRID_API_KEY=your-sendgrid-key

# Booking Service
BOOKING_SERVICE_PORT=3004
SENDGRID_API_KEY=your-sendgrid-key
STRIPE_API_KEY=your-stripe-key
```

### 6.3 Service Dependencies

**Dependency Chain**:

```
PostgreSQL (must be ready first)
    ↓
Redis (must be ready first)
    ↓
Auth Service → API Gateway
Trip Service ↘
Booking Service → API Gateway (depends on all above)
Payment Service ↗
Notification Service
Analytics Service
```

**Ensure proper startup order**:

```yaml
# In docker-compose.yml
services:
  api-gateway:
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      auth-service:
        condition: service_started
      trip-service:
        condition: service_started
```

### 6.4 Database Connection Management

**Connection Pool Configuration**:

```javascript
// In backend service config
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000, // Idle timeout
  connectionTimeoutMillis: 5000, // Connection timeout
});
```

---

## 7. Frontend Deployment

### 7.1 Development Frontend

**Local Development**:

```bash
cd frontend
npm install
npm run dev

# Access at http://localhost:5173
```

**Development Server Features**:

- Hot Module Replacement (HMR)
- Fast build with Vite
- TypeScript compilation
- ESLint validation

### 7.2 Production Frontend Build

**Build Process**:

```bash
cd frontend
npm run build

# Output: frontend/dist/
# This creates an optimized production build
```

**Build Configuration** (vite.config.ts):

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    minify: "terser",
    sourcemap: false, // Set to true for production debugging
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

### 7.3 Nginx Configuration for Frontend

**Production Nginx Setup** (`nginx.prod.conf`):

```nginx
upstream api {
    server api-gateway:3000;
}

server {
    listen 80;
    server_name _;

    # Frontend static files
    root /usr/share/nginx/html;
    index index.html;

    # Cache strategy
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

**Docker Setup for Frontend**:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 7.4 Environment Configuration

**Frontend Environment Variables**:

```env
# .env.production
VITE_API_URL=https://api.example.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=https://example.com/auth/google/callback
```

**Runtime Configuration Injection**:

```html
<!-- In index.html -->
<script>
  window.__RUNTIME_CONFIG__ = {
    API_URL: "%VITE_API_URL%",
    GOOGLE_CLIENT_ID: "%VITE_GOOGLE_CLIENT_ID%",
  };
</script>
```

---

## 8. Production Deployment

### 8.1 Pre-Production Checklist

**Before deploying to production, verify**:

- [ ] All services pass unit tests: `npm run test`
- [ ] Linting passes: `npm run lint`
- [ ] No console errors in browser
- [ ] Database migrations are complete
- [ ] Environment variables are set correctly
- [ ] SSL certificates are configured
- [ ] Backup strategy is in place
- [ ] Monitoring/alerting is setup
- [ ] Load testing shows acceptable performance
- [ ] Security audit completed

### 8.2 Production Environment Setup

**Production Docker Compose** (`docker-compose.prod.yml`):

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: bus-ticket-postgres
    environment:
      POSTGRES_DB: bus_ticket_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backend/sql:/docker-entrypoint-initdb.d
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bus-ticket-redis
    restart: always
    volumes:
      - redis_prod_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: bus-ticket-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/dist:/usr/share/nginx/html
      - /etc/letsencrypt:/etc/letsencrypt
    restart: always
    depends_on:
      - api-gateway

  api-gateway:
    image: bus-ticket-api-gateway:latest
    container_name: bus-ticket-api-gateway
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DB_HOST=postgres
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Additional services...

volumes:
  postgres_prod_data:
  redis_prod_data:
```

### 8.3 SSL/TLS Configuration

**Let's Encrypt with Certbot**:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone -d example.com -d www.example.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

**Nginx SSL Configuration**:

```nginx
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 8.4 Database Backup and Recovery

**Automated Backup**:

```bash
# Create backup script (backup.sh)
#!/bin/bash

BACKUP_DIR="/backups"
DB_NAME="bus_ticket_prod"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker-compose exec -T postgres pg_dump \
  -U $DB_USER \
  $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
```

**Cron Job**:

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

**Database Recovery**:

```bash
# Restore from backup
docker-compose exec -T postgres psql \
  -U $DB_USER \
  $DB_NAME < /backups/backup_20250103_000000.sql.gz

# Or with gunzip
gunzip < /backups/backup_20250103_000000.sql.gz | \
  docker-compose exec -T postgres psql \
  -U $DB_USER \
  $DB_NAME
```

### 8.5 Blue-Green Deployment

**Zero-downtime deployment**:

```bash
#!/bin/bash

# Create new "green" environment
docker-compose -f docker-compose.prod.yml -p bus-ticket-green up -d

# Run tests
sleep 30
curl http://localhost:9000/health || exit 1

# Switch traffic to green
docker-compose -f docker-compose.prod.yml -p bus-ticket-nginx \
  exec nginx nginx -s reload

# Remove old "blue" environment
docker-compose -f docker-compose.prod.yml -p bus-ticket-blue down

# Rename green to blue for next deployment
docker-compose -f docker-compose.prod.yml -p bus-ticket-green rename bus-ticket-green bus-ticket-blue
```

---

## 9. Configuration Management

### 9.1 Environment File Management

**Secure Configuration Handling**:

```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use .env.example for template
cp .env.example .env.template
git add .env.template

# Use encrypted secrets for CI/CD
# Example: GitHub Secrets
```

### 9.2 Configuration Hierarchy

```
1. Environment variables (highest priority)
2. .env file
3. docker-compose.yml
4. config/default.js
5. Hardcoded defaults (lowest priority)
```

### 9.3 Secrets Management

**Using Docker Secrets** (for Docker Swarm):

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt

services:
  api-gateway:
    secrets:
      - db_password
      - jwt_secret
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret
```

**Using HashiCorp Vault** (for Kubernetes):

```bash
# Store secrets in Vault
vault kv put secret/bus-ticket/prod \
  db_password="secure_password" \
  jwt_secret="secure_jwt_secret"

# Retrieve in application
curl -H "X-Vault-Token: $VAULT_TOKEN" \
  http://vault:8200/v1/secret/data/bus-ticket/prod
```

### 9.4 Configuration Validation

**Startup Configuration Check**:

```javascript
// In main service file
function validateConfig() {
  const required = [
    "NODE_ENV",
    "JWT_SECRET",
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing configuration: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("Configuration validated successfully");
}

validateConfig();
```

---

## 10. Monitoring and Health Checks

### 10.1 Service Health Checks

**Docker Health Checks**:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Custom Health Endpoint** (Express):

```javascript
app.get("/health", (req, res) => {
  const health = {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: "CONNECTED",
      redis: "CONNECTED",
    },
  };

  res.status(200).json(health);
});
```

### 10.2 Logging and Monitoring

**Centralized Logging Setup**:

```javascript
// Using Winston logger
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

module.exports = logger;
```

**Docker Log Rotation**:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 10.3 Performance Monitoring

**Metrics Collection** (Prometheus):

```javascript
const promClient = require("prom-client");

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Expose metrics
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

### 10.4 Alerting

**Basic Alert Configuration** (Alert Manager):

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ["alertname"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: "default"
  routes:
    - match:
        severity: critical
      receiver: "critical"

receivers:
  - name: "default"
    email_configs:
      - to: "admin@example.com"
        from: "alerts@example.com"
        smarthost: "smtp.example.com:587"

  - name: "critical"
    pagerduty_configs:
      - service_key: "YOUR_PAGERDUTY_KEY"
```

---

## 11. Troubleshooting

### 11.1 Common Deployment Issues

**Issue 1: Services fail to start**

**Symptoms**: Container exits immediately after starting

**Diagnosis**:

```bash
# Check logs
docker-compose logs service-name

# Check exit code
docker-compose ps  # Exit code > 0 indicates error
```

**Solutions**:

- Verify environment variables are set
- Check database connectivity
- Validate configuration files
- Review error messages in logs

**Issue 2: Database connection timeout**

**Symptoms**: "Unable to connect to database" errors

**Diagnosis**:

```bash
# Test database connectivity
docker-compose exec api-gateway curl postgresql://postgres:postgres@postgres:5432

# Check postgres container status
docker-compose logs postgres

# Verify database is initialized
docker-compose exec postgres psql -U postgres -d bus_ticket_dev -c "\dt"
```

**Solutions**:

- Ensure postgres service is healthy
- Check DB_HOST environment variable (use service name in Docker)
- Verify credentials match
- Increase connection timeout

**Issue 3: Memory/Resource issues**

**Symptoms**: OOM (Out of Memory) errors, slow response times

**Diagnosis**:

```bash
# Monitor resource usage
docker stats

# Check specific service
docker inspect bus-ticket-api-gateway | grep -A 10 "Memory"
```

**Solutions**:

- Increase allocated resources
- Implement connection pooling
- Optimize database queries
- Scale to multiple instances

**Issue 4: Port already in use**

**Symptoms**: "Port 3000 already in use" error

**Diagnosis**:

```bash
# Find process using port
lsof -i :3000
netstat -ano | findstr :3000  # Windows
```

**Solutions**:

```bash
# Kill existing process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows

# Or use different port
docker-compose up -p custom-prefix
```

### 11.2 Database Troubleshooting

**Database won't initialize**:

```bash
# Check migration logs
docker-compose logs postgres

# Manually run migrations
docker-compose exec postgres psql -U postgres -d bus_ticket_dev -f /docker-entrypoint-initdb.d/001_create_users_table.sql

# Reset database
docker-compose down -v
docker-compose up
```

**Data integrity issues**:

```bash
# Check foreign key constraints
docker-compose exec postgres psql -U postgres -d bus_ticket_dev \
  -c "SELECT * FROM information_schema.constraint_column_usage;"

# Rebuild indexes
docker-compose exec postgres psql -U postgres -d bus_ticket_dev \
  -c "REINDEX DATABASE bus_ticket_dev;"
```

### 11.3 Performance Issues

**Slow API responses**:

```bash
# Check API logs
docker-compose logs -f api-gateway

# Monitor database queries
docker-compose exec postgres psql -U postgres -d bus_ticket_dev \
  -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check database connections
docker-compose exec postgres psql -U postgres -d bus_ticket_dev \
  -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

---

## 12. Best Practices

### 12.1 Development Best Practices

1. **Use Docker for consistency**: All developers should use Docker Compose
2. **Environment files**: Keep `.env` files out of version control
3. **Hot reload**: Configure services for hot reloading in development
4. **Database seeding**: Include test data in migrations
5. **Code quality**: Run linters and tests before committing

```bash
# Pre-commit hooks with Husky
npm install husky lint-staged --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### 12.2 Testing Best Practices

**Unit Tests**:

```bash
npm run test
```

**Integration Tests**:

```bash
# Ensure services are running
docker-compose up -d

# Run integration tests against running services
npm run test:integration
```

**Load Testing**:

```bash
# Using Artillery
npm install -g artillery

artillery run load-test.yml
```

### 12.3 Deployment Best Practices

1. **Always use git tags for releases**:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

2. **Maintain deployment logs**:

```bash
docker-compose logs --timestamps > deployment_$(date +%Y%m%d_%H%M%S).log
```

3. **Implement graceful shutdown**:

```javascript
process.on("SIGTERM", async () => {
  console.log("Graceful shutdown initiated");
  // Close connections
  await db.end();
  await redis.quit();
  process.exit(0);
});
```

4. **Use database transactions**:

```sql
BEGIN;
-- Multiple operations
COMMIT;
-- Or ROLLBACK on error
```

5. **Document changes**:

```bash
# Keep CHANGELOG.md updated
# Example format:
# ## [1.1.0] - 2025-01-03
# ### Added
# - Guest checkout feature
# ### Fixed
# - Database connection pooling issue
```

### 12.4 Security Best Practices

1. **Secrets Management**:
   - Never commit secrets to Git
   - Use environment variables for sensitive data
   - Rotate credentials regularly

2. **Database Security**:
   - Use strong passwords
   - Implement SQL injection prevention
   - Regular backups

3. **API Security**:
   - Implement rate limiting
   - Use CORS properly
   - Validate all inputs

4. **Infrastructure Security**:
   - Keep Docker images updated
   - Use health checks
   - Implement monitoring and alerting

```javascript
// Example: Rate limiting middleware
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);
```

---

## 13. Rollback Procedures

### 13.1 Rolling Back Deployments

**Rollback Failed Deployment**:

```bash
# Stop current services
docker-compose down

# Checkout previous version
git checkout previous-tag

# Rebuild and restart
docker-compose build
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:3000/health
```

### 13.2 Database Rollback

**Rollback Recent Migration**:

```bash
# Create rollback migration
cat > backend/sql/999_rollback_migration.sql << EOF
-- Reverse changes from migration 040
DROP INDEX IF EXISTS idx_fulltext_search;
ALTER TABLE bookings DROP COLUMN IF EXISTS search_vector;
EOF

# Execute rollback
docker-compose exec postgres psql -U postgres -d bus_ticket_dev \
  -f /docker-entrypoint-initdb.d/999_rollback_migration.sql

# Restore from backup if needed
gunzip < backups/backup_20250103_000000.sql.gz | \
  docker-compose exec -T postgres psql -U postgres -d bus_ticket_dev
```

---

## 14. Appendices

### Appendix A: Quick Reference

**Common Deployment Commands**:

```bash
# Initial setup
git clone <repo>
cd bus-ticket-booking-system
cp .env.example .env
docker-compose build

# Start services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Hard reset
docker-compose down -v
docker-compose up --build

# Access database
docker-compose exec postgres psql -U postgres -d bus_ticket_dev
```

### Appendix B: File Structure

```
bus-ticket-booking-system/
├── backend/
│   ├── api-gateway/
│   ├── services/
│   │   ├── auth-service/
│   │   ├── trip-service/
│   │   ├── booking-service/
│   │   └── ...
│   └── sql/  (migration scripts)
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

### Appendix C: Health Check URLs

```
API Gateway:        http://localhost:3000/health
Auth Service:       http://localhost:3001/health
Trip Service:       http://localhost:3002/health
Booking Service:    http://localhost:3004/health
Frontend:           http://localhost:5173
```

---

## 15. Conclusion

This deployment guide provides comprehensive instructions for deploying the Bus Ticket Booking System across multiple environments. Success requires:

1. **Proper setup**: Follow prerequisites and environment configuration
2. **Methodology**: Use consistent deployment procedures
3. **Monitoring**: Track service health and performance
4. **Automation**: Implement CI/CD pipelines for reliability
5. **Documentation**: Maintain deployment procedures and changes

By adhering to these procedures and best practices, teams can ensure reliable, scalable, and secure deployments.

---

**Document Version**: 1.0  
**Date**: January 3, 2026  
**Project**: Bus Ticket Booking System  
**Maintainers**: Development Team

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
