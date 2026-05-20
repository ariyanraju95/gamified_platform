const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GamificationState = require('../models/GamificationState');

// GET /api/admin/users
// Returns all non-admin users, with gamification stats attached for gamified users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('fullName email mode createdAt demographics')
      .sort({ createdAt: -1 });

    // Fetch gamification state for all gamified users in one query
    const gamifiedIds = users.filter((u) => u.mode === 'gamified').map((u) => u._id);
    const gamStates = await GamificationState.find({ userId: { $in: gamifiedIds } })
      .select('userId totalXP currentStreak longestStreak badgesEarned');

    const stateMap = {};
    gamStates.forEach((s) => { stateMap[s.userId.toString()] = s; });

    const result = users.map((u) => {
      const base = u.toObject();
      if (u.mode === 'gamified') {
        const gs = stateMap[u._id.toString()];
        base.gamification = gs
          ? {
              totalXP: gs.totalXP,
              currentStreak: gs.currentStreak,
              longestStreak: gs.longestStreak,
              badgesEarned: gs.badgesEarned.length,
            }
          : { totalXP: 0, currentStreak: 0, longestStreak: 0, badgesEarned: 0 };
      }
      return base;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/users/:userId/mode
// Changes a specific user's mode (standard ↔ gamified).
// Does NOT operate on all users — admin selects one user at a time.
const changeUserMode = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mode } = req.body;

    if (!['standard', 'gamified'].includes(mode)) {
      return res.status(400).json({ message: 'Mode must be "standard" or "gamified"' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot change mode of an admin account' });
    }

    const previousMode = user.mode;
    if (previousMode === mode) {
      return res.status(400).json({ message: `User is already in ${mode} mode` });
    }

    user.mode = mode;
    await user.save();

    // If switching to gamified, ensure a GamificationState document exists
    if (mode === 'gamified') {
      const exists = await GamificationState.findOne({ userId });
      if (!exists) {
        await GamificationState.create({ userId });
      }
    }

    // Issue a fresh JWT with the updated mode so the user sees the change immediately on next login
    const newToken = jwt.sign(
      { id: user._id, mode: user.mode, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: `User "${user.fullName}" switched from ${previousMode} to ${mode} mode`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mode: user.mode,
      },
      newToken, // frontend can store this if needed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users/:userId/detail
// Returns full progress, session stats, and quiz performance for one user
const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('fullName email mode createdAt demographics');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // All progress records, populated with lesson info
    const Progress = require('../models/Progress');
    const progress = await Progress.find({ userId })
      .populate('lessonId', 'title order slug xpReward estimatedMinutes exercises')
      .sort({ completedAt: 1 });

    // Session summary
    const Session = require('../models/Session');
    const sessions = await Session.find({ userId }).sort({ startTime: -1 });
    const totalSessions = sessions.length;
    const totalDurationSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    const lastActiveAt = sessions[0]?.startTime || null;

    // Gamification state (if applicable)
    let gamification = null;
    const gs = await GamificationState.findOne({ userId });
    if (gs) {
      gamification = {
        totalXP: gs.totalXP,
        currentStreak: gs.currentStreak,
        longestStreak: gs.longestStreak,
        badgesEarned: gs.badgesEarned.length,
      };
    }

    const progressData = progress.map((p) => {
      const lesson = p.lessonId;
      const totalQuestions = lesson?.exercises?.length || 0;
      const correctAnswers = totalQuestions > 0
        ? Math.round((p.exerciseScore / 100) * totalQuestions)
        : 0;
      return {
        lessonOrder: lesson?.order,
        lessonTitle: lesson?.title,
        xpReward: lesson?.xpReward,
        estimatedMinutes: lesson?.estimatedMinutes,
        totalQuestions,
        correctAnswers,
        exerciseScore: p.exerciseScore,
        exerciseAttempts: p.exerciseAttempts,
        timeSpentSeconds: p.timeSpentSeconds,
        completedAt: p.completedAt,
      };
    });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mode: user.mode,
        createdAt: user.createdAt,
        demographics: user.demographics,
      },
      progress: progressData,
      sessions: {
        total: totalSessions,
        totalDurationSeconds,
        lastActiveAt,
      },
      gamification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, changeUserMode, getUserDetail };
