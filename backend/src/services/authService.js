const jwt = require('jsonwebtoken');
const redis = require('redis');

class AuthService {
  constructor() {
    this.redisClient = redis.createClient({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB) || 0,
    });
    this.redisClient.connect();
  }

  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }); // Using same secret for simplicity
  }

  async storeRefreshToken(userId, refreshToken) {
    const expiresIn = 7 * 24 * 60 * 60; // 7 days
    await this.redisClient.set(`refresh:${userId}`, refreshToken, { EX: expiresIn });
  }

  async getRefreshToken(userId) {
    return await this.redisClient.get(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId) {
    await this.redisClient.del(`refresh:${userId}`);
  }

  async blacklistAccessToken(token) {
    // Extract expiration time from token to set TTL
    const decoded = this.verifyAccessToken(token);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redisClient.set(`blacklist:${token}`, '1', { EX: ttl });
      }
    }
  }

  async isTokenBlacklisted(token) {
    const result = await this.redisClient.get(`blacklist:${token}`);
    return result !== null;
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthService();