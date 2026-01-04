# Redis Caching Strategy

## Overview

Redis 7 is used for caching, seat locking, session management, and atomic operations.

## Connection

```javascript
const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis error:", err));
await client.connect();
```

## Use Cases

### 1. Seat Locking

**Purpose:** Prevent double bookings during checkout (10-minute hold)

**Implementation:**

```javascript
// Lock seats
async function lockSeats(tripId, seatCodes, userId) {
  const lockId = uuidv4();
  const expiry = 600; // 10 minutes

  for (const seatCode of seatCodes) {
    const key = `seat_lock:${tripId}:${seatCode}`;
    await redisClient.set(
      key,
      JSON.stringify({
        lockId,
        userId,
        lockedAt: Date.now(),
      }),
      "EX",
      expiry,
    );
  }

  return { lockId, expiresAt: Date.now() + expiry * 1000 };
}

// Check if seat is locked
async function isSeatLocked(tripId, seatCode) {
  const key = `seat_lock:${tripId}:${seatCode}`;
  const lock = await redisClient.get(key);
  return lock !== null;
}

// Release seats
async function releaseSeats(tripId, seatCodes) {
  for (const seatCode of seatCodes) {
    const key = `seat_lock:${tripId}:${seatCode}`;
    await redisClient.del(key);
  }
}
```

**Keys:**

- `seat_lock:{tripId}:{seatCode}` - TTL: 600 seconds

### 2. Token Blacklist

**Purpose:** Revoke JWT tokens on logout

**Implementation:**

```javascript
// Blacklist token
async function blacklistToken(token, expiresIn) {
  const key = `blacklist:${token}`;
  await redisClient.set(key, "true", "EX", expiresIn);
}

// Check if token is blacklisted
async function isTokenBlacklisted(token) {
  const key = `blacklist:${token}`;
  const result = await redisClient.get(key);
  return result === "true";
}
```

**Keys:**

- `blacklist:{token}` - TTL: Token expiry time

### 3. Booking Reference Counter

**Purpose:** Generate unique booking references atomically

**Implementation:**

```javascript
async function generateBookingReference() {
  const counter = await redisClient.incr("booking_ref_counter");
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `BK${date}${String(counter).padStart(5, "0")}`;
  // Example: BK20260104000001
}
```

**Keys:**

- `booking_ref_counter` - No expiry (persistent counter)

### 4. Session Storage

**Purpose:** Track active user sessions

**Implementation:**

```javascript
// Store session
async function createSession(userId, data) {
  const key = `session:${userId}`;
  await redisClient.set(
    key,
    JSON.stringify({
      ...data,
      lastActivity: Date.now(),
    }),
    "EX",
    900, // 15 minutes
  );
}

// Get session
async function getSession(userId) {
  const key = `session:${userId}`;
  const session = await redisClient.get(key);
  return session ? JSON.parse(session) : null;
}
```

**Keys:**

- `session:{userId}` - TTL: 900 seconds (15 minutes)

### 5. Search Caching

**Purpose:** Cache trip search results

**Implementation:**

```javascript
const crypto = require("crypto");

function createSearchHash(params) {
  return crypto.createHash("md5").update(JSON.stringify(params)).digest("hex");
}

async function cacheSearchResults(params, results) {
  const hash = createSearchHash(params);
  const key = `trip_search:${hash}`;
  await redisClient.set(
    key,
    JSON.stringify(results),
    "EX",
    300, // 5 minutes
  );
}

async function getCachedSearchResults(params) {
  const hash = createSearchHash(params);
  const key = `trip_search:${hash}`;
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
}
```

**Keys:**

- `trip_search:{hash}` - TTL: 300 seconds (5 minutes)

### 6. Rate Limiting

**Purpose:** Prevent API abuse

**Implementation:**

```javascript
async function checkRateLimit(ip) {
  const key = `rate_limit:${ip}`;
  const count = await redisClient.incr(key);

  if (count === 1) {
    await redisClient.expire(key, 900); // 15 minutes
  }

  return {
    count,
    limit: 100,
    remaining: Math.max(0, 100 - count),
    resetAt: Date.now() + 900 * 1000,
  };
}
```

**Keys:**

- `rate_limit:{ip}` - TTL: 900 seconds (15 minutes)

## Key Naming Conventions

Format: `{namespace}:{identifier}:{subkey}`

Examples:

- `seat_lock:550e8400-e29b-41d4-a716-446655440000:A1`
- `session:user:550e8400-e29b-41d4-a716-446655440000`
- `blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `trip_search:5d41402abc4b2a76b9719d911017c592`

## TTL Strategy

| Use Case        | TTL          | Reasoning                        |
| --------------- | ------------ | -------------------------------- |
| Seat locks      | 10 min       | Match booking timeout            |
| Token blacklist | Token expiry | Match JWT expiration             |
| Sessions        | 15 min       | Standard session timeout         |
| Search cache    | 5 min        | Balance freshness vs performance |
| Rate limiting   | 15 min       | Standard rate limit window       |

## Redis Commands Used

```javascript
// String operations
await client.set("key", "value");
await client.get("key");
await client.del("key");
await client.incr("counter");

// With expiry
await client.set("key", "value", "EX", 600);
await client.expire("key", 600);

// Check existence
await client.exists("key");

// Get TTL
await client.ttl("key");

// Multiple keys
await client.mGet(["key1", "key2"]);
await client.del(["key1", "key2"]);
```

## Monitoring

### Check Redis Health

```bash
redis-cli ping
# PONG

redis-cli info
# Memory usage, connections, etc.
```

### View Keys

```bash
redis-cli
> KEYS *
> KEYS seat_lock:*
> GET seat_lock:uuid:A1
> TTL seat_lock:uuid:A1
```

### Clear Cache

```bash
# Clear all keys (CAUTION!)
redis-cli FLUSHALL

# Clear specific pattern
redis-cli --scan --pattern 'trip_search:*' | xargs redis-cli DEL
```

## Performance Considerations

1. **Connection Pooling**: Reuse Redis client connections
2. **Pipeline Commands**: Batch multiple operations
3. **Avoid KEYS in Production**: Use SCAN instead
4. **Monitor Memory**: Set maxmemory and eviction policy
5. **Use Appropriate Data Structures**: Strings, Hashes, Sets, etc.

## Configuration

```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS=false
```

## Error Handling

```javascript
try {
  await redisClient.set("key", "value");
} catch (error) {
  console.error("Redis error:", error);
  // Fallback to database or fail gracefully
}
```

## Related Documentation

- [Architecture Overview](./02-architecture.md)
- [Microservices](./08-microservices.md)
- [Database Schema](./05-database-schema.md)
