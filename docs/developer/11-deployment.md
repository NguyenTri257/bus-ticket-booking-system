# Production Deployment Guide

## Overview

This guide covers deploying the Bus Ticket Booking System to production environments.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL 15+
- Redis 7+

## Environment Setup

### 1. Server Requirements

**Minimum Specifications:**

- CPU: 2 cores
- RAM: 4 GB
- Storage: 50 GB SSD
- Network: 100 Mbps

**Recommended for Production:**

- CPU: 4+ cores
- RAM: 8+ GB
- Storage: 100 GB SSD
- Network: 1 Gbps

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify
docker --version
docker compose version
```

## Deployment Steps

### 1. Clone Repository

```bash
git clone <repository-url> /opt/bus-ticket-booking-system
cd /opt/bus-ticket-booking-system
```

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env.production
nano .env.production
```

**Production .env:**

```env
NODE_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bus_ticket_prod
DB_USER=postgres
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

# JWT Secrets (MUST CHANGE!)
JWT_SECRET=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING
JWT_REFRESH_SECRET=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING

# Internal Service Key (MUST CHANGE!)
INTERNAL_SERVICE_KEY=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING

# SendGrid
SENDGRID_API_KEY=your-actual-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Payment Gateways (Real credentials)
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

# URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### 3. Build and Deploy with Docker

```bash
# Use production docker-compose file
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 4. Database Initialization

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d bus_ticket_prod

# Verify tables
\dt

# Check data
SELECT COUNT(*) FROM users;
```

### 5. SSL Configuration (Nginx)

**Install Certbot:**

```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain SSL Certificate:**

```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

**Nginx Configuration:**

```nginx
# /etc/nginx/sites-available/bus-ticket

# Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API Gateway
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**Enable and Restart:**

```bash
sudo ln -s /etc/nginx/sites-available/bus-ticket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Security Hardening

### 1. Firewall Configuration

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Fail2Ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Database Security

```bash
# Change PostgreSQL password
docker-compose exec postgres psql -U postgres
ALTER USER postgres WITH PASSWORD 'new-strong-password';
```

### 4. Redis Security

```bash
# Add password to Redis
docker-compose exec redis redis-cli
CONFIG SET requirepass "your-strong-redis-password"
CONFIG REWRITE
```

## Monitoring

### 1. Health Checks

```bash
# Check all services
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/auth/health
curl https://api.yourdomain.com/trips/health
curl https://api.yourdomain.com/bookings/health
```

### 2. Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f booking-service

# Save logs
docker-compose -f docker-compose.prod.yml logs > logs.txt
```

### 3. Resource Monitoring

```bash
# Docker stats
docker stats

# System resources
htop
```

## Backup Strategy

### Database Backup

```bash
# Automated daily backup
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres bus_ticket_prod > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/backup-db.sh
```

### Redis Backup

Redis automatically creates dump.rdb in the data volume.

## Updates and Maintenance

### Update Services

```bash
# Pull latest code
cd /opt/bus-ticket-booking-system
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

### Database Migrations

```bash
# Run new migrations
docker-compose exec postgres psql -U postgres -d bus_ticket_prod -f /docker-entrypoint-initdb.d/new_migration.sql
```

## Rollback Strategy

```bash
# Rollback to previous version
git log --oneline
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml up -d

# Restore database backup
gunzip /opt/backups/db_YYYYMMDD_HHMMSS.sql.gz
docker-compose exec -T postgres psql -U postgres -d bus_ticket_prod < /opt/backups/db_YYYYMMDD_HHMMSS.sql
```

## Performance Optimization

### 1. Database Indexes

Ensure all indexes are created (run migrations).

### 2. Redis Configuration

```bash
# Increase memory
docker-compose exec redis redis-cli
CONFIG SET maxmemory 2gb
CONFIG SET maxmemory-policy allkeys-lru
CONFIG REWRITE
```

### 3. Connection Pooling

Already configured in services (max 20 connections per service).

## Troubleshooting

### Service Won't Start

```bash
docker-compose -f docker-compose.prod.yml logs <service-name>
docker-compose -f docker-compose.prod.yml restart <service-name>
```

### Database Connection Issues

```bash
docker-compose exec postgres psql -U postgres -c "SELECT version();"
```

### Redis Issues

```bash
docker-compose exec redis redis-cli ping
```

## Production Checklist

- [ ] All environment variables configured with strong secrets
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured
- [ ] Database backups automated
- [ ] Monitoring and alerting set up
- [ ] Log rotation configured
- [ ] Payment gateways tested with real credentials
- [ ] Email service configured and tested
- [ ] Domain DNS configured correctly
- [ ] Health check endpoints accessible
- [ ] Rate limiting configured
- [ ] Error tracking set up

## Related Documentation

- [Getting Started](./01-getting-started.md)
- [Docker Setup](./04-setup-docker.md)
- [Architecture](./02-architecture.md)
