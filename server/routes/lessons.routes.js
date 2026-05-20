const express = require('express');
const router = express.Router();
const { getAllLessons, getLessonBySlug } = require('../controllers/lessons.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getAllLessons);
router.get('/:slug', protect, getLessonBySlug);

module.exports = router;
