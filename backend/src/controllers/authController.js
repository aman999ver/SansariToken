const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const env = require('../config/env');
const { sendSuccess, sendError } = require('../utils/apiResponse');

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return sendError(res, 'Username and password are required', 'INVALID_CREDENTIALS', 400);
  const admin = await Admin.findOne({ username: username.trim() }).select('+passwordHash');
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return sendError(res, 'Invalid username or password', 'INVALID_CREDENTIALS', 401);
  const token = jwt.sign({ sub: admin.id, username: admin.username }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  return sendSuccess(res, { token, admin: { id: admin.id, username: admin.username } });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) return sendError(res, 'Current password and a new password of at least 8 characters are required', 'INVALID_PASSWORD', 400);
  const admin = await Admin.findById(req.admin.sub).select('+passwordHash');
  if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) return sendError(res, 'Current password is incorrect', 'INVALID_PASSWORD', 401);
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();
  return sendSuccess(res, { message: 'Password changed successfully' });
}

module.exports = { login, changePassword };