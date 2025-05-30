const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret';

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'توکن وجود ندارد' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'توکن نامعتبر است' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // حالا req.user.role و ... داری
    next();
  } catch (err) {
    return res.status(401).json({ message: 'توکن نامعتبر است' });
  }
}

module.exports = auth;