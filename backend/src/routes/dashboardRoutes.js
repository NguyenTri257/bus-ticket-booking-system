const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Protected routes - require authentication
router.get('/summary', authenticate, dashboardController.getSummary);
router.get('/activity', authenticate, dashboardController.getActivity);
router.get('/stats', authenticate, authorize(['admin']), dashboardController.getStats);

// Admin-only route
router.get('/admin-data', authenticate, authorize(['admin']), dashboardController.getAdminData);

module.exports = router;
