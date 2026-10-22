const jwt = require('jsonwebtoken');
const httpError = require('../utils/httpError');

// Checks the "Authorization: Bearer <token>" header
exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(httpError(401, 'Please log in'));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { phone, role }
    next();
  } catch {
    next(httpError(401, 'Session invalid, please log in again'));
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return next(httpError(403, 'Admins only'));
  next();
};
