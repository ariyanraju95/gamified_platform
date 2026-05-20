const express = require('express');
const router = express.Router();
const { getMyGamificationState } = require('../controllers/gamification.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/me', protect, getMyGamificationState);

module.exports = router;
