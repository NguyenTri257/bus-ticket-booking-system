const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const userRepository = require('../repositories/userRepository');
const authService = require('../services/authService');
const { registerSchema, loginSchema, googleAuthSchema, refreshSchema } = require('../validators/authValidators');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  async register(req, res) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(422).json({
          success: false,
          error: { code: 'VAL_001', message: 'Validation error', details: error.details },
          timestamp: new Date().toISOString()
        });
      }

      const { email, phone, password, fullName, role } = value;

      // Check if email or phone exists
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: { code: 'USER_002', message: 'Email already exists' },
          timestamp: new Date().toISOString()
        });
      }

      const existingPhone = await userRepository.findByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          error: { code: 'USER_003', message: 'Phone already exists' },
          timestamp: new Date().toISOString()
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await userRepository.create({ email, phone, passwordHash, fullName, role });

      res.status(201).json({
        success: true,
        data: {
          userId: user.user_id,
          email: user.email,
          phone: user.phone,
          fullName: user.full_name,
          role: user.role,
          createdAt: user.created_at
        },
        message: 'Registration successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: { code: 'SYS_001', message: 'Internal server error' },
        timestamp: new Date().toISOString()
      });
    }
  }

  async login(req, res) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(422).json({
          success: false,
          error: { code: 'VAL_001', message: 'Validation error', details: error.details },
          timestamp: new Date().toISOString()
        });
      }

      const { identifier, password } = value;

      // Find user by email or phone
      let user = await userRepository.findByEmail(identifier);
      if (!user) {
        user = await userRepository.findByPhone(identifier);
      }

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Invalid credentials' },
          timestamp: new Date().toISOString()
        });
      }

      // Generate tokens
      const accessToken = authService.generateAccessToken({ userId: user.user_id, role: user.role });
      const refreshToken = authService.generateRefreshToken({ userId: user.user_id });

      // Store refresh token
      await authService.storeRefreshToken(user.user_id, refreshToken);

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour
          user: {
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            role: user.role
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: { code: 'SYS_001', message: 'Internal server error' },
        timestamp: new Date().toISOString()
      });
    }
  }

  async googleAuth(req, res) {
    try {
      const { error, value } = googleAuthSchema.validate(req.body);
      if (error) {
        return res.status(422).json({
          success: false,
          error: { code: 'VAL_001', message: 'Validation error', details: error.details },
          timestamp: new Date().toISOString()
        });
      }

      const { idToken } = value;

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { sub: googleId, email, name } = payload;

      // Find or create user
      let user = await userRepository.findByGoogleId(googleId);
      let isNewUser = false;
      if (!user) {
        // Check if email exists
        user = await userRepository.findByEmail(email);
        if (user) {
          // Link Google ID
          await userRepository.updateGoogleId(user.user_id, googleId);
        } else {
          // Create new user
          const passwordHash = await bcrypt.hash(Math.random().toString(36), 12); // Random password
          user = await userRepository.create({
            email,
            phone: null,
            passwordHash,
            fullName: name,
            role: 'passenger'
          });
          await userRepository.updateGoogleId(user.user_id, googleId);
          isNewUser = true;
        }
      }

      // Generate tokens
      const accessToken = authService.generateAccessToken({ userId: user.user_id, role: user.role });
      const refreshToken = authService.generateRefreshToken({ userId: user.user_id });

      await authService.storeRefreshToken(user.user_id, refreshToken);

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          isNewUser,
          user: {
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            role: user.role
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        error: { code: 'AUTH_001', message: 'Invalid Google token' },
        timestamp: new Date().toISOString()
      });
    }
  }

  async refresh(req, res) {
    try {
      const { error, value } = refreshSchema.validate(req.body);
      if (error) {
        return res.status(422).json({
          success: false,
          error: { code: 'VAL_001', message: 'Validation error', details: error.details },
          timestamp: new Date().toISOString()
        });
      }

      const { refreshToken } = value;
      const decoded = authService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_002', message: 'Invalid refresh token' },
          timestamp: new Date().toISOString()
        });
      }

      const storedToken = await authService.getRefreshToken(decoded.userId);
      if (storedToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_002', message: 'Refresh token revoked' },
          timestamp: new Date().toISOString()
        });
      }

      // Blacklist the old access token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const oldAccessToken = authHeader.substring(7);
        await authService.blacklistAccessToken(oldAccessToken);
      }

      const newAccessToken = authService.generateAccessToken({ userId: decoded.userId, role: decoded.role });

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: 3600
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: { code: 'SYS_001', message: 'Internal server error' },
        timestamp: new Date().toISOString()
      });
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.userId;
      
      // Blacklist the current access token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await authService.blacklistAccessToken(token);
      }
      
      await authService.deleteRefreshToken(userId);

      res.json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: { code: 'SYS_001', message: 'Internal server error' },
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new AuthController();