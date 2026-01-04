# Testing Guide

## Overview

The project uses **Jest** for unit and integration testing, with **Supertest** for API testing.

## Running Tests

### Backend Services

```bash
# Run tests for a specific service
cd backend/services/auth-service
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend

```bash
cd frontend
npm run test
npm run test:coverage
npm run test:ui  # Vitest UI
```

## Test Structure

```
service/
├── src/
│   ├── controllers/
│   │   └── authController.js
│   ├── services/
│   │   └── authService.js
│   └── __tests__/
│       ├── authController.test.js
│       ├── authService.test.js
│       └── integration/
│           └── auth.integration.test.js
```

## Unit Tests

Example unit test:

```javascript
// authService.test.js
const authService = require("../services/authService");

describe("authService", () => {
  describe("generateAccessToken", () => {
    it("should generate valid JWT token", () => {
      const user = {
        user_id: "uuid",
        email: "test@example.com",
        role: "passenger",
      };

      const token = authService.generateAccessToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = authService.verifyAccessToken(token);
      expect(decoded.userId).toBe(user.user_id);
      expect(decoded.email).toBe(user.email);
    });
  });
});
```

## Integration Tests

Example integration test:

```javascript
// auth.integration.test.js
const request = require("supertest");
const app = require("../index");

describe("POST /auth/register", () => {
  it("should register new user successfully", async () => {
    const response = await request(app).post("/register").send({
      email: "newuser@example.com",
      password: "password123",
      fullName: "New User",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toHaveProperty("userId");
    expect(response.body.data.user.email).toBe("newuser@example.com");
  });

  it("should return error for duplicate email", async () => {
    const response = await request(app).post("/register").send({
      email: "existing@example.com",
      password: "password123",
      fullName: "Existing User",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

## API Testing with curl

### Authentication

```bash
# Register
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

# Save token
export TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Get profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/me
```

### Trip Search

```bash
# Search trips
curl "http://localhost:3000/trips/search?origin=Ho%20Chi%20Minh%20City&destination=Hanoi&date=2026-01-10"

# Get trip details
curl http://localhost:3000/trips/550e8400-e29b-41d4-a716-446655440000

# Get seat availability
curl http://localhost:3000/trips/550e8400-e29b-41d4-a716-446655440000/seats
```

### Booking

```bash
# Create booking
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tripId": "550e8400-e29b-41d4-a716-446655440000",
    "contactEmail": "user@example.com",
    "contactPhone": "+84901234567",
    "passengers": [
      {
        "seatCode": "A1",
        "fullName": "John Doe",
        "phone": "+84901234567"
      }
    ]
  }'

# Get booking
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/bookings/booking-id

# Cancel booking
curl -X PATCH http://localhost:3000/bookings/booking-id/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"reason": "Change of plans"}'
```

## Manual Testing Scripts

### Test Trip Search

```bash
# backend/test-trip-search.js
cd backend
node test-trip-search.js
```

### Test Pagination

```bash
cd backend
node test-pagination.js
```

### Test Multi-Passenger Booking

```bash
cd backend
node test-multi-passenger.js
```

## Database Testing

### Test Database Connection

```bash
psql -U postgres -d bus_ticket_dev -c "SELECT COUNT(*) FROM users;"
```

### Reset Test Database

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS bus_ticket_test;"
psql -U postgres -c "CREATE DATABASE bus_ticket_test;"

# Run migrations
cd backend/sql
for file in *.sql; do
  psql -U postgres -d bus_ticket_test -f "$file"
done
```

## Redis Testing

```bash
redis-cli
> PING
> SET test_key "test_value"
> GET test_key
> DEL test_key
> FLUSHALL  # Clear all (use cautiously)
```

## Performance Testing

Not documented in current project.

## Test Coverage

Target coverage: 80%+

```bash
# Run with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## CI/CD Testing

Not documented in current project.

## Related Documentation

- [Getting Started](./01-getting-started.md)
- [API Reference](./06-api-reference.md)
- [Database Schema](./05-database-schema.md)
