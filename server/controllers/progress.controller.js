const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const { updateStreak } = require('../services/streak.service');
const { awardXP } = require('../services/xp.service');
const { checkAndAwardBadges } = require('../services/badge.service');
const { logEvent } = require('../middleware/tracking.middleware');

// POST /api/progress
const completeLesson = async (req, res) => {
  try {
    const { lessonId, timeSpentSeconds, exerciseAttempts, exerciseScore } = req.body;
    const userId = req.user._id;
    const mode = req.user.mode;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Enforce sequential unlock — lesson N requires lesson N-1 to be completed first
    if (lesson.order > 1) {
      const previousLesson = await Lesson.findOne({ moduleId: lesson.moduleId, order: lesson.order - 1 });
      if (previousLesson) {
        const previousDone = await Progress.findOne({ userId, lessonId: previousLesson._id });
        if (!previousDone) {
          return res.status(403).json({ message: 'Complete the previous lesson first' });
        }
      }
    }

    // Check if already completed (upsert so re-completion updates stats)
    const existing = await Progress.findOne({ userId, lessonId });
    if (existing) {
      return res.status(200).json({ message: 'Already completed', alreadyDone: true });
    }

    const progress = await Progress.create({
      userId,
      lessonId,
      timeSpentSeconds: timeSpentSeconds || 0,
      exerciseAttempts: exerciseAttempts || 1,
      exerciseScore: exerciseScore || 0,
    });

    await logEvent(userId, mode, 'lesson_complete', {
      lessonId,
      lessonTitle: lesson.title,
      timeSpentSeconds,
      exerciseScore,
    });

    let gamificationResult = null;

    // Only process gamification for gamified users
    if (mode === 'gamified') {
      await updateStreak(userId);
      const xpResult = await awardXP(userId, lesson.xpReward);
      const newBadges = await checkAndAwardBadges(userId);

      gamificationResult = {
        xpEarned: xpResult?.xpEarned || 0,
        multiplier: xpResult?.multiplier || 1,
        totalXP: xpResult?.totalXP || 0,
        newBadges,
      };
    }

    res.status(201).json({
      progress,
      gamification: gamificationResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/progress/me
const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id })
      .populate('lessonId', 'title slug order xpReward')
      .sort({ completedAt: 1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { completeLesson, getMyProgress };
