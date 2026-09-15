const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/apiResponse');

function requireAuth(req, res, next) {
  const header = req.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return sendError(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  try {
    req.admin = jwt.verify(header.slice(7), env.jwtSecret);
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 'AUTH_INVALID', 401);
  }
}

function requireAdmin(req, res, next) {
  if (req.admin?.role !== 'admin') return sendError(res, 'Administrator access required', 'ADMIN_REQUIRED', 403);
  next();
}

module.exports = { requireAuth, requireAdmin };