const router = require('express').Router();
const { login, changePassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
router.post('/login', asyncHandler(login));
router.post('/change-password', requireAuth, asyncHandler(changePassword));
module.exports = router;