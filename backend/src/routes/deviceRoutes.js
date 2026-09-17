const router = require('express').Router();
const controller = require('../controllers/deviceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(controller.register));
router.get('/available', asyncHandler(controller.available));
router.get('/sequence', asyncHandler(controller.sequence));
router.post('/', requireAuth, requireAdmin, asyncHandler(controller.create));
router.get('/', requireAuth, asyncHandler(controller.list));
router.get('/:deviceId', requireAuth, asyncHandler(controller.getOne));
router.patch('/:deviceId', requireAuth, requireAdmin, asyncHandler(controller.update));
router.delete('/:deviceId', requireAuth, requireAdmin, asyncHandler(controller.remove));

module.exports = router;