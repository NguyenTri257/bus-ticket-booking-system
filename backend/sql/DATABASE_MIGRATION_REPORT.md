# Database Migration System Implementation Report

## Executive Summary

This report details the architecture, implementation, and operational procedures of the database migration system for the Bus Ticket Booking System. The migration framework employs a sequential, numbered SQL script approach to maintain schema consistency and data integrity across development, testing, and production environments.

---

## 1. Introduction

### 1.1 Purpose

The database migration system ensures reliable schema initialization and maintenance through automated, version-controlled SQL scripts. This approach eliminates manual database setup errors and provides reproducible deployment workflows.

### 1.2 Scope

This report covers:

- Migration script architecture and organization
- Automated and manual import procedures
- Database initialization workflows
- Best practices and troubleshooting

### 1.3 Key Objectives

- Provide clear step-by-step import instructions
- Document system architecture
- Enable team members to initialize or reset the database independently
- Ensure consistency across all deployment environments

---

## 2. System Architecture

### 2.1 Migration Script Organization

The migration system comprises 40+ SQL scripts located in `backend/sql/` directory, organized with numeric prefixes (000-040) to enforce execution order:

```
backend/sql/
├── 000_create_uuid_extension.sql
├── 001_create_users_table.sql
├── 002_add_email_verification.sql
├── ...
└── 040_add_fulltext_search_columns_indexes.sql
```

### 2.2 Execution Phases

| Phase           | Scripts | Purpose                                           |
| --------------- | ------- | ------------------------------------------------- |
| **Foundation**  | 000-005 | Extensions, user table, authentication setup      |
| **Core Schema** | 006-015 | Bus operators, routes, trips, bookings, seats     |
| **Maintenance** | 016-022 | Schema repairs, seat regeneration, updates        |
| **Features**    | 023-040 | Notifications, chatbot, ratings, full-text search |

### 2.3 Database Configuration

- **Database Name**: `bus_ticket_dev`
- **User**: `postgres`
- **Password**: `postgres`
- **Port**: 5432
- **DBMS**: PostgreSQL 15 (Alpine)

---

## 3. Migration Import Methods

### 3.1 Method 1: Automatic Initialization (Docker Compose) - **RECOMMENDED**

**Overview**: PostgreSQL automatically executes all `.sql` files in `/docker-entrypoint-initdb.d/` during container startup.

**Procedure**:

1. **Navigate to project root**:

   ```bash
   cd c:\Users\HP\clones\bus-ticket-booking-system
   ```

2. **Start Docker services**:

   ```bash
   docker-compose up
   ```

3. **Verification**: Monitor output for successful migration completion:
   ```
   postgres | Creating extension uuid-ossp...
   postgres | Creating table users...
   postgres | [SUCCESS] All migrations completed
   ```

**Advantages**:

- ✅ Fully automated
- ✅ No manual commands required
- ✅ Ensures correct execution order
- ✅ Ideal for development and CI/CD pipelines

**Disadvantages**:

- ❌ Requires Docker installation
- ❌ Executes on each container startup (unless volume persistence is configured)

---

### 3.2 Method 2: Manual Reset and Reimport (Docker Container)

**Overview**: Clears existing schema and reimports all migrations into a running PostgreSQL container.

**Procedure**:

1. **Ensure PostgreSQL container is running**:

   ```bash
   docker-compose up -d postgres
   ```

2. **Execute full reset and migration command**:

   ```bash
   docker-compose exec postgres bash -c "psql -U postgres -d bus_ticket_dev -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;' && psql -U postgres -d bus_ticket_dev -f /docker-entrypoint-initdb.d/000_create_uuid_extension.sql -f /docker-entrypoint-initdb.d/001_create_users_table.sql -f /docker-entrypoint-initdb.d/002_add_email_verification.sql -f /docker-entrypoint-initdb.d/003_add_password_reset.sql -f /docker-entrypoint-initdb.d/004_add_failed_login_attempts.sql -f /docker-entrypoint-initdb.d/005_seed_users.sql -f /docker-entrypoint-initdb.d/006_create_bus_models_table.sql -f /docker-entrypoint-initdb.d/007_create_seat_layouts_table.sql -f /docker-entrypoint-initdb.d/008_create_operators_table.sql -f /docker-entrypoint-initdb.d/009_create_routes_table.sql -f /docker-entrypoint-initdb.d/010_create_route_stops_table.sql -f /docker-entrypoint-initdb.d/011_create_buses_table.sql -f /docker-entrypoint-initdb.d/012_create_trips_table.sql -f /docker-entrypoint-initdb.d/013_create_seats_table.sql -f /docker-entrypoint-initdb.d/014_create_bookings_table.sql -f /docker-entrypoint-initdb.d/015_create_bookings_passenger_table.sql && echo 'All migrations completed successfully!'"
   ```

3. **Verification**: Confirm all tables exist:
   ```bash
   docker-compose exec postgres psql -U postgres -d bus_ticket_dev -c "\dt"
   ```

**Advantages**:

- ✅ Provides full schema reset
- ✅ Useful for testing and data cleanup
- ✅ Can be scheduled for automated resets

**Disadvantages**:

- ❌ Destroys all existing data
- ❌ Command is lengthy and complex
- ❌ Requires careful execution

---

### 3.3 Method 3: Local PostgreSQL Direct Import

**Overview**: Import migrations directly into a local PostgreSQL installation (without Docker).

**Procedure**:

1. **Install PostgreSQL** (if not already installed):

   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql@15`
   - Linux: `apt-get install postgresql-15`

2. **Create database** (if it doesn't exist):

   ```bash
   psql -U postgres -c "CREATE DATABASE bus_ticket_dev;"
   ```

3. **Execute migrations sequentially** (Option A - Individual files):

   ```bash
   psql -U postgres -d bus_ticket_dev -f backend/sql/000_create_uuid_extension.sql
   psql -U postgres -d bus_ticket_dev -f backend/sql/001_create_users_table.sql
   psql -U postgres -d bus_ticket_dev -f backend/sql/002_add_email_verification.sql
   # ... continue with remaining files in order
   ```

4. **Execute migrations in batch** (Option B - Loop script):

   **For Windows PowerShell**:

   ```powershell
   $sqlPath = "backend/sql"
   Get-ChildItem $sqlPath -Filter "*.sql" | Sort-Object Name | ForEach-Object {
       Write-Host "Executing: $($_.Name)"
       psql -U postgres -d bus_ticket_dev -f $_.FullName
   }
   ```

   **For Linux/macOS Bash**:

   ```bash
   for file in backend/sql/*.sql; do
       echo "Executing: $file"
       psql -U postgres -d bus_ticket_dev -f "$file"
   done
   ```

5. **Verification**:
   ```bash
   psql -U postgres -d bus_ticket_dev -c "\dt"
   ```

**Advantages**:

- ✅ Works without Docker
- ✅ Allows selective migration execution
- ✅ Useful for production deployments

**Disadvantages**:

- ❌ Requires local PostgreSQL installation
- ❌ Manual error handling
- ❌ More complex for batch operations

---

### 3.4 Method 4: Selective Migration Execution

**Overview**: Execute specific migrations when updating only certain schema components.

**Procedure**:

1. **Identify migration range** needed (e.g., for chat features: migrations 026-028)

2. **Execute specific range**:

   ```bash
   for file in backend/sql/{026,027,028}_*.sql; do
       psql -U postgres -d bus_ticket_dev -f "$file"
   done
   ```

3. **Verify specific tables**:
   ```bash
   psql -U postgres -d bus_ticket_dev -c "\dt chatbot*"
   ```

---

## 4. Migration Script Details

### 4.1 Key Migration Files

| File                                          | Description                      | Type          |
| --------------------------------------------- | -------------------------------- | ------------- |
| `000_create_uuid_extension.sql`               | PostgreSQL UUID generation       | Extension     |
| `001_create_users_table.sql`                  | User authentication and profiles | Core Table    |
| `005_seed_users.sql`                          | Initial user data                | Seed Data     |
| `012_create_trips_table.sql`                  | Trip schedules and details       | Core Table    |
| `014_create_bookings_table.sql`               | Booking records                  | Core Table    |
| `026_create_chatbot_sessions_table.sql`       | Chatbot functionality            | Feature Table |
| `040_add_fulltext_search_columns_indexes.sql` | Search optimization              | Index         |

### 4.2 Migration Conventions

- **Idempotency**: Each script uses `IF NOT EXISTS` checks, allowing safe re-execution
- **Schema Safety**: Includes rollback-safe operations and constraint checks
- **Naming**: Sequential numbering (000-040) enforces strict execution order
- **Disabled Scripts**: Files ending in `.sql.disabled` are automatically skipped

**Example of idempotent migration**:

```sql
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  ...
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'google_id') THEN
    ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
  END IF;
END $$;
```

---

## 5. Troubleshooting Guide

### Issue 5.1: "Database already exists" error

**Symptom**:

```
ERROR: database "bus_ticket_dev" already exists
```

**Solution**:

```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE IF EXISTS bus_ticket_dev;"

# Recreate database
psql -U postgres -c "CREATE DATABASE bus_ticket_dev;"

# Re-run migrations
docker-compose up
```

### Issue 5.2: "Role does not exist" error

**Symptom**:

```
ERROR: role "postgres" does not exist
```

**Solution**:

```bash
# Create PostgreSQL user
psql -U postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER;"
```

### Issue 5.3: Migration fails midway

**Symptom**: Partial schema creation, database inconsistency

**Solution**:

1. Reset the database (Method 2)
2. Check for disabled `.sql.disabled` files—verify they shouldn't be executed
3. Review error logs in migration output
4. Re-run from the beginning using Method 1 (Docker automatic)

### Issue 5.4: Docker volume persistence issues

**Symptom**: Migrations re-run on every container restart

**Solution**: Ensure volume is properly mounted in `docker-compose.yml`:

```yaml
postgres:
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./sql:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
```

---

## 6. Best Practices

1. **Always use Method 1 (Docker Compose)** for initial setup and development
2. **Backup database before reset operations**: `pg_dump -U postgres -d bus_ticket_dev > backup.sql`
3. **Test migrations in development environment first** before production deployment
4. **Document custom migrations** with clear comments explaining schema changes
5. **Never manually modify `.sql` files order**—use version control only
6. **Version control migrations**: Include all `.sql` files in Git
7. **Use transactions for data consistency**: Wrap batch operations in `BEGIN;` and `COMMIT;`

---

## 7. Implementation Verification

### 7.1 Verify Successful Migration

After completing migration, verify all tables were created:

```bash
# Connect to database
psql -U postgres -d bus_ticket_dev

# List all tables
\dt

# Expected output should show 30+ tables including:
# - users
# - trips
# - bookings
# - seats
# - routes
# - buses
# - notifications
# - chatbot_sessions
# - ratings
```

### 7.2 Data Integrity Check

```bash
# Check user seeding
psql -U postgres -d bus_ticket_dev -c "SELECT COUNT(*) FROM users;"

# Check foreign key constraints
psql -U postgres -d bus_ticket_dev -c "\d bookings"
```

---

## 8. Conclusion

The database migration system provides a robust, repeatable, and maintainable approach to database initialization and schema management. By following the documented procedures—particularly the recommended Docker Compose method—developers can ensure consistent database setup across all environments.

The four import methods accommodate different deployment scenarios:

- **Development**: Use Method 1 (automatic Docker initialization)
- **Testing & Reset**: Use Method 2 (manual Docker reset)
- **Local Development**: Use Method 3 (direct local PostgreSQL)
- **Selective Updates**: Use Method 4 (targeted migrations)

Adherence to these procedures ensures data consistency, reduces setup errors, and facilitates team collaboration.

---

## 9. References

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/15/
- **Docker PostgreSQL Image**: https://hub.docker.com/_/postgres/
- **Docker Compose Configuration**: `backend/docker-compose.yml`

---

## Appendix A: Quick Reference Commands

### Docker-based workflows:

```bash
# Start services (auto-migrate)
docker-compose up

# Reset and reimport
docker-compose down
docker-compose up

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d bus_ticket_dev

# View migration logs
docker-compose logs postgres
```

### Local PostgreSQL workflows:

```bash
# Connect to database
psql -U postgres -d bus_ticket_dev

# Execute single migration
psql -U postgres -d bus_ticket_dev -f backend/sql/001_create_users_table.sql

# List all tables
\dt

# Exit PostgreSQL
\q
```

---

**Project**: Bus Ticket Booking System  
**Database Version**: PostgreSQL 15  
**Docker Compose Version**: 3.8
