// routes.js - user-service
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

// Chuẩn hóa endpoint theo API mẫu

router.get('/users/profile', authenticate, userController.getProfile);
// CŨ: Không có upload file, chỉ nhận JSON (base64)
// router.put('/users/profile', authenticate, userController.updateProfile);
// MỚI: Cho phép upload file avatar (multipart/form-data)
router.put('/users/profile', authenticate, upload.single('avatar'), userController.updateProfile);
router.put('/users/profile/password', authenticate, userController.changePassword);
router.post('/users/change-password', authenticate, userController.changePassword);

module.exports = router;
