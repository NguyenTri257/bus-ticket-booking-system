// userController.js - user-service
// REST API cho user profile

const userService = require('../services/userService');

module.exports = {
  async getProfile(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Unauthorized' },
        });
      }
      const user = await userService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_001', message: 'User not found' },
        });
      }
      res.json({
        success: true,
        data: {
          userId: user.user_id,
          email: user.email,
          phone: user.phone,
          fullName: user.full_name,
          role: user.role,
          avatar: user.avatar || null,
          emailVerified: user.email_verified,
          phoneVerified: user.phone_verified,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error('⚠️', error);
      res.status(500).json({
        success: false,
        error: { code: 'SYS_001', message: 'Internal server error' },
      });
    }
  },
  async changePassword(req, res) {
    try {
      const bcrypt = require('bcrypt');
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Unauthorized' },
          timestamp: new Date().toISOString(),
        });
      }
      const user = await userService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_001', message: 'User not found' },
          timestamp: new Date().toISOString(),
        });
      }
      if (user.google_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_010',
            message: 'Password change not available for Google OAuth accounts',
          },
          timestamp: new Date().toISOString(),
        });
      }
      if (!user.password_hash) {
        return res.status(400).json({
          success: false,
          error: { code: 'AUTH_011', message: 'No password set for this account' },
          timestamp: new Date().toISOString(),
        });
      }
      if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Current password is incorrect' },
          timestamp: new Date().toISOString(),
        });
      }
      if (await bcrypt.compare(newPassword, user.password_hash)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_009',
            message: 'New password must be different from current password',
          },
          timestamp: new Date().toISOString(),
        });
      }
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await userService.updatePassword(userId, newPasswordHash);
      res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('⚠️ changePassword error:', error && error.stack ? error.stack : error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_001',
          message: 'Internal server error',
          details: error && error.message ? error.message : error,
        },
        timestamp: new Date().toISOString(),
      });
    }
  },
  async updateProfile(req, res) {
    try {
      const userId = req.user?.userId;
      console.log('[updateProfile] req.user:', req.user);
      console.log('[updateProfile] req.body:', req.body);
      if (!userId) {
        console.error('[updateProfile] No userId in req.user');
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Unauthorized' },
        });
      }
      const { fullName, phone } = req.body;
      // Nếu upload file avatar (multer)
      const file = req.file;
      // Validate tên không rỗng
      if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'USER_004', message: 'Full name cannot be empty.' },
        });
      }
      // Validate Vietnam phone number (+84xxxxxxxxx or 0xxxxxxxxx)
      const phoneRegex = /^(\+84|0)\d{9}$/;
      if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone.trim())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_005',
            message: 'Phone number must be in the format +84xxxxxxxxx or 0xxxxxxxxx.',
          },
        });
      }
      // Validate phone unique
      if (phone) {
        const existingPhone = await userService.findByPhone(phone);
        if (existingPhone && existingPhone.user_id !== userId) {
          console.warn('[updateProfile] Phone already exists:', phone);
          return res.status(409).json({
            success: false,
            error: { code: 'USER_003', message: 'Phone already exists' },
          });
        }
      }

      // MỚI: Xử lý upload file avatar (multer)
      let avatarUrl;
      if (file) {
        // Upload buffer lên Cloudinary
        // --- CODE CŨ: KHÔNG XOÁ, CHỈ COMMENT LẠI ---
        /*
        const cloudinary = require('../configs/cloudinary.config');
        try {
          const uploadRes = await cloudinary.uploader.upload_stream(
            {
              folder: 'avatars',
              public_id: `user_${userId}`,
              overwrite: true,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) throw error;
              avatarUrl = result.secure_url;
            }
          );
          // Sử dụng stream để upload file buffer
          const streamifier = require('streamifier');
          await new Promise((resolve, reject) => {
            streamifier.createReadStream(file.buffer).pipe(uploadRes)
              .on('finish', resolve)
              .on('error', reject);
          });
          console.log('[updateProfile] avatar uploaded to Cloudinary (file):', avatarUrl);
        } catch (err) {
          console.error('Upload avatar file error:', err);
          return res.status(500).json({
            success: false,
            error: { code: 'USER_008', message: 'Lỗi upload avatar file.' },
          });
        }
        */
        // --- CODE MỚI: ĐẢM BẢO avatarUrl ĐƯỢC GÁN ĐÚNG ---
        const cloudinary = require('../configs/cloudinary.config');
        const streamifier = require('streamifier');
        try {
          avatarUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'avatars',
                public_id: `user_${userId}`,
                overwrite: true,
                resource_type: 'image',
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          });
          console.log('[updateProfile] avatar uploaded to Cloudinary (file):', avatarUrl);
        } catch (err) {
          console.error('Upload avatar file error:', err);
          return res.status(500).json({
            success: false,
            error: { code: 'USER_008', message: 'Lỗi upload avatar file.' },
          });
        }
      } else {
        // CŨ: Xử lý avatar base64 (giữ lại để tham khảo, không xóa)
        /*
        const { avatar } = req.body;
        if (typeof avatar === 'string' && avatar.startsWith('data:image/')) {
          // ...code cũ xử lý base64...
        } else if (typeof avatar === 'string' && avatar.trim() !== '') {
          avatarUrl = avatar;
        }
        */
      }

      // ⚠️ LƯU Ý: KHÔNG cập nhật preferences trong updateProfile
      const updateData = { fullName, phone };
      if (typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
        updateData.avatar = avatarUrl;
      }
      console.log('[updateProfile] updateData:', updateData);
      const updatedUser = await userService.update(userId, updateData);
      console.log('[updateProfile] updatedUser:', updatedUser);
      res.json({
        success: true,
        data: {
          userId: updatedUser.user_id,
          fullName: updatedUser.full_name,
          updatedAt: updatedUser.updated_at,
        },
        message: 'profile updated successfully',
      });
    } catch (error) {
      console.error('⚠️ updateProfile error:', error && error.stack ? error.stack : error);
      if (error && error.code) {
        console.error('⚠️ updateProfile error.code:', error.code);
      }
      if (error && error.detail) {
        console.error('⚠️ updateProfile error.detail:', error.detail);
      }
      if (error && error.message) {
        console.error('⚠️ updateProfile error.message:', error.message);
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'SYS_001',
          message: 'Internal server error',
          details: error && error.message ? error.message : error,
        },
      });
    }
  },
  async updateAvatar(req, res) {
    const updateAvatar = require('./updateAvatar.controller');
    await updateAvatar(req, res);
  },
};
