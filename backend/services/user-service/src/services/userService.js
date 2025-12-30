// userService.js - user-service
// Chứa logic xử lý nghiệp vụ user profile

const userRepository = require('../repositories/userRepository');

class UserService {
  async updateProfile(userId, data) {
    return userRepository.update(userId, data);
  }
  async updateUserAvatar(userId, avatarUrl) {
    return userRepository.updateUserAvatar(userId, avatarUrl);
  }
  async findById(userId) {
    return userRepository.findById(userId);
  }
  async findByEmail(email) {
    return userRepository.findByEmail(email);
  }
  async findByPhone(phone) {
    return userRepository.findByPhone(phone);
  }
  async update(userId, updateData) {
    return userRepository.update(userId, updateData);
  }
  async updatePassword(userId, hashedPassword) {
    return userRepository.updatePassword(userId, hashedPassword);
  }
}

module.exports = new UserService();
