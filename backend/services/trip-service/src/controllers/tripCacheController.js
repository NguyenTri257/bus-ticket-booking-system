/**
 * Trip Cache Controller
 * Handles cache management endpoints for trip search results
 */

const { getCacheStats, clearCache } = require('../cacheMiddleware');

/**
 * Get cache statistics
 * GET /api/trip/cache/stats
 */
const getCacheStatistics = async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'CACHE_STATS_ERROR', message: error.message },
    });
  }
};

/**
 * Clear cache
 * DELETE /api/trip/cache/clear (Admin only)
 */
const clearCacheData = async (req, res) => {
  try {
    const pattern = req.query.pattern || 'trip:search:*';
    const deleted = await clearCache(pattern);
    res.json({
      success: true,
      message: `Cleared ${deleted} cache keys matching: ${pattern}`,
      deletedCount: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'CACHE_CLEAR_ERROR', message: error.message },
    });
  }
};

module.exports = {
  getCacheStatistics,
  clearCacheData,
};
