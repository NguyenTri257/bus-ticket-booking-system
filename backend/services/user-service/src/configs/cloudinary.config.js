// cloudinary.config.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dleqkiaj0',
  api_key: process.env.CLOUDINARY_API_KEY || '957383667687537',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'FzIR1-p0xgW6-uw78AeAaebuIlw',
});

module.exports = cloudinary;
