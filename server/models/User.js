const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  role: { type: String, enum: ['herasat', 'tashrifat', 'admin'] },
  fullName: String,        // نام و نام خانوادگی
  nationalId: String,      // شماره ملی
  position: String,        // سمت
  personnelCode: String,   // کد پرسنلی
  phone: String,           // شماره تماس
});

module.exports = mongoose.model('User', userSchema);