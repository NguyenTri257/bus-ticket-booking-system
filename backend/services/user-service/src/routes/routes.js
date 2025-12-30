// routes.js - user-service
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

// Chuẩn hóa endpoint theo API mẫu

router.get('/users/profile', authenticate, userController.getProfile);
router.put('/users/profile', authenticate, userController.updateProfile);
router.put('/users/profile/password', authenticate, userController.changePassword);
router.post('/users/change-password', authenticate, userController.changePassword);

module.exports = router;
