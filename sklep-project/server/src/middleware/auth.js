const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change_me';

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Token required' });

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { authRequired, adminRequired };
