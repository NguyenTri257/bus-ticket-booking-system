
// Chỉ giữ lại hàm upload base64 avatar cho API chuẩn hóa (PUT /users/profile)
const cloudinary = require('../configs/cloudinary.config');

// Hàm upload base64 avatar cho API chuẩn hóa
async function uploadBase64ToCloudinary(base64, userId) {
  // base64: data:image/png;base64,...
  try {
    const uploadRes = await cloudinary.uploader.upload(base64, {
      folder: 'avatars',
      public_id: `user_${userId}`,
      overwrite: true,
    });
    return uploadRes.secure_url;
  } catch (err) {
    console.error('Upload base64 avatar error:', err);
    throw new Error('Failed to upload avatar');
  }
}

module.exports.uploadBase64ToCloudinary = uploadBase64ToCloudinary;
