const router = require('express').Router();
const { sync } = require('../controllers/syncController');
const asyncHandler = require('../utils/asyncHandler');
router.post('/', asyncHandler(sync));
module.exports = router;