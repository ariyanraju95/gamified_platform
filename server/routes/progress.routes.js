const express = require('express');
const router = express.Router();
const { completeLesson, getMyProgress } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, completeLesson);
router.get('/me', protect, getMyProgress);

module.exports = router;
