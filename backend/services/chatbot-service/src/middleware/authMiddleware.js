const axios = require('axios');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

// Configure Passport JWT Strategy (same as auth-service)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true,
};

passport.use(
  new JwtStrategy(jwtOptions, async (req, payload, done) => {
    try {
      // Check if token is blacklisted via auth-service
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const blacklistCheck = await axios.post(`${AUTH_SERVICE_URL}/auth/blacklist-check`, {
            token,
          });
          if (blacklistCheck.data.isBlacklisted) {
            return done(null, false, { message: 'Token has been revoked' });
          }
        } catch (error) {
          // If auth-service is down, allow token for now (fail open)
          console.warn('⚠️ Could not check token blacklist:', error.message);
        }
      }

      return done(null, payload);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Passport-based authentication middleware
const authenticate = passport.authenticate('jwt', { session: false });

/**
 * Optional authentication - attach user if token is valid, but don't fail if missing
 */
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  // Use Passport to authenticate optionally
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.warn('Optional auth error:', err.message);
      req.user = null;
      return next();
    }

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware to check user roles
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Authentication required',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Insufficient permissions',
        },
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate,
};
