const Lesson = require('../models/Lesson');
const { logEvent } = require('../middleware/tracking.middleware');

// GET /api/lessons
const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .select('title slug order xpReward estimatedMinutes moduleId')
      .sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/lessons/:slug
const getLessonBySlug = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    await logEvent(req.user._id, req.user.mode, 'lesson_start', {
      lessonId: lesson._id,
      lessonTitle: lesson.title,
    });

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllLessons, getLessonBySlug };
