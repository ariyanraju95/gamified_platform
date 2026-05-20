const express = require('express');
const router = express.Router();
const { submitSurvey, getSurveyResults, getMySubmission } = require('../controllers/survey.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

router.post('/', protect, submitSurvey);
router.get('/me', protect, getMySubmission);
router.get('/results', protect, requireAdmin, getSurveyResults);

module.exports = router;
