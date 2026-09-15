const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const env = require('../config/env');
const { sendSuccess, sendError } = require('../utils/apiResponse');

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return sendError(res, 'Username and password are required', 'INVALID_CREDENTIALS', 400);
  const admin = await Admin.findOne({ username: username.trim() }).select('+passwordHash');
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return sendError(res, 'Invalid username or password', 'INVALID_CREDENTIALS', 401);
  const token = jwt.sign({ sub: admin.id, username: admin.username, role: 'admin' }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
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

async function userLogin(req, res) {
  const { username, password } = req.body || {};
  const user = await User.findOne({ username: username?.trim().toLowerCase(), active: true }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return sendError(res, 'Invalid username or password', 'INVALID_CREDENTIALS', 401);
  const token = jwt.sign({ sub: user.id, username: user.username, role: 'user', displayName: user.displayName }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  return sendSuccess(res, { token, user: { id: user.id, username: user.username, displayName: user.displayName } });
}

async function createUser(req, res) {
  const { username, displayName, password } = req.body || {};
  if (!username?.trim() || !displayName?.trim() || !password || password.length < 8) return sendError(res, 'Username, display name, and a password of at least 8 characters are required', 'VALIDATION_ERROR', 400);
  const user = await User.create({ username: username.trim().toLowerCase(), displayName: displayName.trim(), passwordHash: await bcrypt.hash(password, 12) });
  return sendSuccess(res, { user: { id: user.id, username: user.username, displayName: user.displayName, active: user.active } }, 201);
}

async function listUsers(req, res) {
  return sendSuccess(res, { users: await User.find().select('username displayName active createdAt').sort({ displayName: 1 }).lean() });
}

module.exports = { login, changePassword, userLogin, createUser, listUsers };