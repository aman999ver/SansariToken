const router = require('express').Router();
const { sync, sequence } = require('../controllers/syncController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/', asyncHandler(sync));
router.get('/sequence', asyncHandler(sequence));

module.exports = router;