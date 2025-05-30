const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret';

// Middleware for authentication
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'توکن نیاز است' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'توکن نامعتبر' });
  }
}

// Generate a unique tracking code
async function generateUniqueTrackingCode() {
  let trackingCode;
  let exists = true;
  while (exists) {
    trackingCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    exists = await Request.findOne({ trackingCode });
  }
  return trackingCode;
}

// ثبت درخواست (تشریفات)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'tashrifat') return res.status(403).json({ message: 'دسترسی ندارید' });

  const trackingCode = await generateUniqueTrackingCode();

  const request = new Request({
    ...req.body,
    trackingCode,
    createdBy: {
      userId: req.user.userId,
      fullName: req.user.fullName,
      personnelCode: req.user.personnelCode,
    }
  });
  await request.save();
  res.json(request);
});

// لیست درخواست‌ها
router.get('/', authMiddleware, async (req, res) => {
  let requests;
  if (req.user.role === 'herasat' || req.user.role === 'admin') {
    requests = await Request.find();
  } else {
    requests = await Request.find({ 'createdBy.userId': req.user.userId });
  }
  res.json(requests);
});

// تعداد درخواست‌های جدید
router.get('/count', authMiddleware, async (req, res) => {
  const count = await Request.countDocuments({ status: 'pending' });
  res.json({ count });
});

// جزئیات درخواست با کد پیگیری
router.get('/tracking/:trackingCode', authMiddleware, async (req, res) => {
  const request = await Request.findOne({ trackingCode: req.params.trackingCode });
  if (!request) return res.status(404).json({ message: 'درخواست پیدا نشد' });
  res.json(request);
});

// جزئیات درخواست با آیدی
router.get('/:id', authMiddleware, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'درخواست پیدا نشد' });
  res.json(request);
});

// ویرایش/تغییر وضعیت درخواست
router.put('/:id', authMiddleware, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'درخواست پیدا نشد' });

 if (req.user.role === 'herasat' || req.user.role === 'admin') {
    const { status, statusNote } = req.body;
    request.status = status;
    request.statusNote = statusNote;
    request.updatedAt = new Date();
    request.lastActionBy = {
      userId: req.user.userId,
      fullName: req.user.fullName,
      role: req.user.role
    };
    await request.save();
    return res.json(request);
  }

  if (req.user.role === 'tashrifat' || req.user.role === 'admin' && request.status === 'incomplete') {
    Object.assign(request, req.body, { status: 'pending', statusNote: '', updatedAt: new Date() });
    request.lastActionBy = {
      userId: req.user.userId,
      fullName: req.user.fullName,
      role: req.user.role
    };
    await request.save();
    return res.json(request);
  }

  return res.status(403).json({ message: 'دسترسی ندارید' });
});
module.exports = router;