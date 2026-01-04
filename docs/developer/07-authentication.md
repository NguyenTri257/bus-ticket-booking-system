# Authentication and Authorization

## Overview

The Bus Ticket Booking System uses **JWT (JSON Web Tokens)** for authentication and **Role-Based Access Control (RBAC)** for authorization.

## Authentication Flow

```
1. User Registration/Login
   ↓
2. Auth Service validates credentials
   ↓
3. Generate Access Token (15 min) + Refresh Token (7 days)
   ↓
4. Return tokens to client
   ↓
5. Client stores tokens (localStorage)
   ↓
6. Client includes Access Token in Authorization header
   ↓
7. API Gateway validates token
   ↓
8. Forward request with user context
```

## JWT Tokens

### Access Token

**Lifetime:** 15 minutes
**Purpose:** Authenticate API requests
**Storage:** Memory or localStorage (less secure)

**Payload:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "passenger",
  "iat": 1704361200,
  "exp": 1704362100
}
```

### Refresh Token

**Lifetime:** 7 days
**Purpose:** Obtain new access tokens
**Storage:** httpOnly cookie (recommended) or localStorage

**Payload:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tokenId": "unique-token-id",
  "iat": 1704361200,
  "exp": 1704966000
}
```

## Token Generation

```javascript
// auth-service/src/authService.js
const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      tokenId: uuidv4(),
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
}
```

## Token Validation

### API Gateway Middleware

```javascript
// api-gateway/src/middleware/authMiddleware.js
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_001", message: "No token provided" },
    });
  }

  try {
    // Verify token with Auth Service
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/verify`, {
      token,
    });

    // Check if token is blacklisted
    const blacklistCheck = await axios.post(
      `${AUTH_SERVICE_URL}/auth/blacklist-check`,
      { token },
    );

    if (blacklistCheck.data.blacklisted) {
      return res.status(401).json({
        success: false,
        error: { code: "AUTH_002", message: "Token has been revoked" },
      });
    }

    // Attach user to request
    req.user = response.data.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_002", message: "Invalid token" },
    });
  }
}
```

## Authorization (RBAC)

### Roles

1. **passenger** - Regular users who book tickets
2. **admin** - System administrators with full access

### Role-Based Middleware

```javascript
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "AUTH_001", message: "Not authenticated" },
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: "AUTH_003", message: "Insufficient permissions" },
      });
    }

    next();
  };
}

// Usage
app.get(
  "/admin/users",
  authenticate,
  authorize(["admin"]),
  userController.getAll,
);
```

## Password Security

### Hashing

Passwords are hashed using **bcrypt** with 10 salt rounds:

```javascript
const bcrypt = require("bcrypt");

async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
```

### Password Requirements

- Minimum 8 characters
- No maximum length (but typically limited to 72 chars by bcrypt)
- No complexity requirements enforced (optional)

## OAuth Integration

### Google OAuth 2.0

```javascript
// Frontend
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return {
    googleId: payload["sub"],
    email: payload["email"],
    name: payload["name"],
    picture: payload["picture"],
  };
}
```

**Flow:**

1. User clicks "Login with Google"
2. Frontend gets Google ID token
3. Frontend sends ID token to backend
4. Backend verifies token with Google
5. Backend creates/finds user
6. Backend returns JWT tokens

## Token Refresh

```javascript
// POST /auth/refresh
async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      throw new Error("Token revoked");
    }

    // Get user
    const user = await db.query("SELECT * FROM users WHERE user_id = $1", [
      decoded.userId,
    ]);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Blacklist old refresh token
    await redis.setex(
      `blacklist:${refreshToken}`,
      604800, // 7 days
      "true",
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
}
```

## Token Blacklist (Logout)

When a user logs out, tokens are added to Redis blacklist:

```javascript
// POST /auth/logout
async function logout(req, res) {
  const token = req.headers.authorization.replace("Bearer ", "");

  // Add to blacklist with expiration matching token expiry
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);

  await redis.setex(`blacklist:${token}`, ttl, "true");

  res.json({ message: "Logged out successfully" });
}
```

## Guest Authentication

Guest users can book without registration:

- `user_id` is NULL in bookings table
- Booking lookup requires `bookingReference` + `contactEmail`
- No authentication token needed for booking lookup

## Session Management

### Redis Session Storage

```javascript
// Store session
await redis.setex(
  `session:${userId}`,
  900, // 15 minutes
  JSON.stringify({
    userId,
    lastActivity: Date.now(),
  }),
);

// Check session
const session = await redis.get(`session:${userId}`);
```

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Secure Headers**: Use Helmet.js for security headers
3. **CORS**: Restrict origins
4. **Rate Limiting**: Prevent brute force attacks
5. **Input Validation**: Validate all inputs with Joi
6. **SQL Injection**: Use parameterized queries
7. **XSS Prevention**: Sanitize user input
8. **CSRF Protection**: Use CSRF tokens for state-changing operations

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Internal Service Communication
INTERNAL_SERVICE_KEY=internal-service-secret-key-change-in-prod
```

## Testing Authentication

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

# Use token
export TOKEN="your-access-token"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/me

# Refresh token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues

### Token Expired

**Error:** `Token expired or invalid`
**Solution:** Use refresh token to get new access token

### Invalid Token

**Error:** `Invalid token`
**Solution:** Re-authenticate

### Missing Token

**Error:** `No token provided`
**Solution:** Include `Authorization: Bearer <token>` header

### Insufficient Permissions

**Error:** `Insufficient permissions`
**Solution:** User role doesn't have access to endpoint

## Related Documentation

- [API Reference](./06-api-reference.md)
- [Getting Started](./01-getting-started.md)
- [Microservices](./08-microservices.md)
