const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const redis = require('redis');

class AuthService {
  constructor() {
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: process.env.REDIS_URL && process.env.NODE_ENV === 'production' ? { tls: true } : {},
    });

    this.redisClient
      .connect()
      .then(() => {
        console.log('🔌 AuthService: Redis client connected');
      })
      .catch((err) => {
        console.error('⚠️ AuthService: Redis connection failed:', err.message);
        // Don't exit here, let the app startup check handle it
      });

    // Handle Redis connection errors
    this.redisClient.on('error', (err) => {
      console.error('⚠️ Redis connection error:', err.message);
    });

    this.redisClient.on('connect', () => {
      console.log('🔌 Redis connected');
    });

    this.redisClient.on('ready', () => {
      console.log('🔌 Redis ready to receive commands');
    });

    this.redisClient.on('end', () => {
      console.log('🔌 Redis connection ended');
    });

    // Configure Passport JWT Strategy
    this.configurePassport();
  }

  configurePassport() {
    const jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // Pass req to callback to check blacklist
    };

    passport.use(
      new JwtStrategy(jwtOptions, async (req, payload, done) => {
        try {
          // Check if token is blacklisted
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const isBlacklisted = await this.isTokenBlacklisted(token);
            if (isBlacklisted) {
              return done(null, false, { message: 'Token has been revoked' });
            }
          }

          // Token is valid and not blacklisted
          return done(null, payload);
        } catch (error) {
          return done(error, false);
        }
      })
    );
  }

  // Initialize Passport (call this in app.js)
  initialize() {
    return passport.initialize();
  }

  // Get Passport JWT middleware
  authenticate() {
    return passport.authenticate('jwt', { session: false });
  }

  // Keep old methods for backward compatibility
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }); // Using same secret for simplicity
  }

  // This method is now handled by Passport strategy
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async storeRefreshToken(userId, refreshToken) {
    try {
      const expiresIn = 7 * 24 * 60 * 60; // 7 days
      await this.redisClient.set(`refresh:${userId}`, refreshToken, { EX: expiresIn });
    } catch (error) {
      console.error('⚠️ Failed to store refresh token in Redis:', error.message);
      throw new Error('Session storage unavailable');
    }
  }

  async getRefreshToken(userId) {
    try {
      return await this.redisClient.get(`refresh:${userId}`);
    } catch (error) {
      console.error('⚠️ Failed to get refresh token from Redis:', error.message);
      return null;
    }
  }

  async deleteRefreshToken(userId) {
    try {
      await this.redisClient.del(`refresh:${userId}`);
    } catch (error) {
      console.error('⚠️ Failed to delete refresh token from Redis:', error.message);
    }
  }

  async blacklistAccessToken(token) {
    try {
      // Extract expiration time from token to set TTL
      const decoded = this.verifyAccessToken(token);
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redisClient.set(`blacklist:${token}`, '1', { EX: ttl });
        }
      }
    } catch (error) {
      console.error('⚠️ Failed to blacklist token in Redis:', error.message);
    }
  }

  async isTokenBlacklisted(token) {
    try {
      const result = await this.redisClient.get(`blacklist:${token}`);
      return result !== null;
    } catch (error) {
      console.error('⚠️ Failed to check token blacklist in Redis:', error.message);
      return false; // Default to not blacklisted if Redis fails
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async storeOTP(email, otp) {
    try {
      const expiresIn = 5 * 60; // 5 minutes
      await this.redisClient.set(`otp:${email}`, otp, { EX: expiresIn });
    } catch (error) {
      console.error('⚠️ Failed to store OTP in Redis:', error.message);
      throw new Error(`Failed to store OTP: ${error.message}`);
    }
  }

  async getOTP(email) {
    try {
      return await this.redisClient.get(`otp:${email}`);
    } catch (error) {
      console.error('⚠️ Failed to get OTP from Redis:', error.message);
      return null;
    }
  }

  async deleteOTP(email) {
    try {
      await this.redisClient.del(`otp:${email}`);
    } catch (error) {
      console.error('⚠️ Failed to delete OTP from Redis:', error.message);
    }
  }
}

module.exports = new AuthService();
