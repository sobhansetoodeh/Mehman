const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      fullName: user.fullName,
      personnelCode: user.personnelCode,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({
    token,
    role: user.role,
    fullName: user.fullName,
    personnelCode: user.personnelCode,
  });
});

module.exports = router;