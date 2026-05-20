const express = require('express');
const router = express.Router();
const { getSummary, exportData, logClientEvent } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

router.post('/event', protect, logClientEvent);
router.get('/summary', protect, requireAdmin, getSummary);
router.get('/export', protect, requireAdmin, exportData);

module.exports = router;
