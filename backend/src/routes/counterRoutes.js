const router = require('express').Router();
const controller = require('../controllers/counterController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/available', asyncHandler(controller.available));
router.get('/', requireAuth, asyncHandler(controller.list));
router.post('/', requireAuth, requireAdmin, asyncHandler(controller.create));
router.patch('/:counterId', requireAuth, requireAdmin, asyncHandler(controller.update));
router.delete('/:counterId', requireAuth, requireAdmin, asyncHandler(controller.remove));

module.exports = router;
