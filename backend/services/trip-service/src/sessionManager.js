const { getRedisClient } = require('./redis');

/**
 * Session Manager for trip service
 * Handles user session data, seat locks, and cart persistence in Redis
 */
class SessionManager {
  /**
   * Create/update user session
   * @param {string} userId - User ID
   * @param {Object} sessionData - Session data
   * @param {number} ttl - Time to live in seconds (default: 24 hours)
   * @returns {Promise<boolean>}
   */
  static async createSession(userId, sessionData, ttl = 24 * 60 * 60) {
    try {
      const redis = getRedisClient();
      if (!redis) {
        console.warn('⚠️ Redis not available for session');
        return false;
      }

      const sessionKey = `session:user:${userId}`;
      const sessionJson = JSON.stringify({
        ...sessionData,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      });

      await redis.setex(sessionKey, ttl, sessionJson);
      console.log(`✅ Session created for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to create session:', error.message);
      return false;
    }
  }

  /**
   * Get user session
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  static async getSession(userId) {
    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const sessionKey = `session:user:${userId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      // Update last accessed time
      session.lastAccessed = new Date().toISOString();
      await redis.setex(sessionKey, 24 * 60 * 60, JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('❌ Failed to get session:', error.message);
      return null;
    }
  }

  /**
   * Save cart/booking draft to session
   * @param {string} userId - User ID
   * @param {Object} cartData - Cart data
   * @returns {Promise<boolean>}
   */
  static async saveCart(userId, cartData) {
    try {
      const redis = getRedisClient();
      if (!redis) return false;

      const cartKey = `cart:user:${userId}`;
      const cartJson = JSON.stringify({
        ...cartData,
        lastSaved: new Date().toISOString(),
      });

      // Cart persists for 7 days
      await redis.setex(cartKey, 7 * 24 * 60 * 60, cartJson);
      console.log(`✅ Cart saved for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to save cart:', error.message);
      return false;
    }
  }

  /**
   * Get cart/booking draft
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  static async getCart(userId) {
    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const cartKey = `cart:user:${userId}`;
      const cartData = await redis.get(cartKey);

      if (!cartData) return null;
      return JSON.parse(cartData);
    } catch (error) {
      console.error('❌ Failed to get cart:', error.message);
      return null;
    }
  }

  /**
   * Clear user session
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  static async clearSession(userId) {
    try {
      const redis = getRedisClient();
      if (!redis) return false;

      const sessionKey = `session:user:${userId}`;
      const cartKey = `cart:user:${userId}`;

      await redis.del(sessionKey, cartKey);
      console.log(`✅ Session cleared for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to clear session:', error.message);
      return false;
    }
  }

  /**
   * Get all active sessions count
   * @returns {Promise<number>}
   */
  static async getActiveSessions() {
    try {
      const redis = getRedisClient();
      if (!redis) return 0;

      const keys = await redis.keys('session:user:*');
      return keys.length;
    } catch (error) {
      console.error('❌ Failed to get active sessions:', error.message);
      return 0;
    }
  }

  /**
   * Get session statistics
   * @returns {Promise<Object>}
   */
  static async getSessionStats() {
    try {
      const redis = getRedisClient();
      if (!redis) return { error: 'Redis not available' };

      const sessionKeys = await redis.keys('session:user:*');
      const cartKeys = await redis.keys('cart:user:*');

      return {
        activeSessions: sessionKeys.length,
        savedCarts: cartKeys.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to get session stats:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = SessionManager;
