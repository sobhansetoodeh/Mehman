const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// ساخت کاربر جدید (فقط ادمین)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  }
  try {
    const { username, password, role, fullName, nationalId, position, personnelCode, phone } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash, role, fullName, nationalId, position, personnelCode, phone });
    await user.save();
    res.status(201).json({ message: 'کاربر ساخته شد' });
  } catch (err) {
    console.error('خطا در ساخت کاربر:', err);
    res.status(500).json({ message: 'خطا در ساخت کاربر', error: err.message });
  }
});

// دریافت لیست همه کاربران (فقط ادمین)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  }
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'خطا در دریافت کاربران', error: err.message });
  }
});

// حذف کاربر (فقط ادمین)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'کاربر حذف شد' });
  } catch (err) {
    res.status(500).json({ message: 'خطا در حذف کاربر', error: err.message });
  }
});

// ویرایش کاربر (فقط ادمین)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  }
  try {
    const updateData = { ...req.body };
    // اگر پسورد جدید فرستاده شده بود، هش کن
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }
    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: 'کاربر ویرایش شد' });
  } catch (err) {
    res.status(500).json({ message: 'خطا در ویرایش کاربر', error: err.message });
  }
});

module.exports = router;