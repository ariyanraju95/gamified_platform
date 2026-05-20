const AnalyticsEvent = require('../models/AnalyticsEvent');
const Session = require('../models/Session');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// GET /api/analytics/summary  (admin only)
const getSummary = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ order: 1 });

    // Registered user counts per mode
    const [standardCount, gamifiedCount] = await Promise.all([
      User.countDocuments({ role: 'user', mode: 'standard' }),
      User.countDocuments({ role: 'user', mode: 'gamified' }),
    ]);

    // Average session duration per mode (only sessions with a recorded duration)
    const sessions = await Session.find({ endTime: { $ne: null }, durationSeconds: { $ne: null } });
    const sessionsByMode = { standard: [], gamified: [] };
    sessions.forEach((s) => sessionsByMode[s.mode]?.push(s.durationSeconds));

    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

    // Lesson completion counts per mode per lesson
    const completionData = await Promise.all(
      lessons.map(async (lesson) => {
        const completions = await Progress.find({ lessonId: lesson._id }).populate(
          'userId',
          'mode'
        );
        return {
          lessonTitle: lesson.title,
          order: lesson.order,
          standard: completions.filter((p) => p.userId?.mode === 'standard').length,
          gamified: completions.filter((p) => p.userId?.mode === 'gamified').length,
        };
      })
    );

    // Daily active users per mode (last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);
    const loginEvents = await AnalyticsEvent.find({
      eventType: 'login',
      timestamp: { $gte: fourteenDaysAgo },
    });

    const dailyActiveUsers = {};
    loginEvents.forEach((e) => {
      const day = e.timestamp.toISOString().split('T')[0];
      if (!dailyActiveUsers[day]) dailyActiveUsers[day] = { standard: 0, gamified: 0 };
      dailyActiveUsers[day][e.mode] = (dailyActiveUsers[day][e.mode] || 0) + 1;
    });

    // Return visit frequency — avg login sessions per user per mode (all time)
    const allLoginEvents = await AnalyticsEvent.find({ eventType: 'login' });
    const loginCountByUser = {};
    allLoginEvents.forEach((e) => {
      const uid = e.userId?.toString();
      if (!uid) return;
      if (!loginCountByUser[uid]) loginCountByUser[uid] = { mode: e.mode, count: 0 };
      loginCountByUser[uid].count += 1;
    });
    const returnVisitCounts = { standard: [], gamified: [] };
    Object.values(loginCountByUser).forEach(({ mode, count }) => {
      if (returnVisitCounts[mode]) returnVisitCounts[mode].push(count);
    });

    res.json({
      userCounts: { standard: standardCount, gamified: gamifiedCount, total: standardCount + gamifiedCount },
      avgSessionDuration: {
        standard: Math.round(avg(sessionsByMode.standard)),
        gamified: Math.round(avg(sessionsByMode.gamified)),
      },
      lessonCompletions: completionData,
      dailyActiveUsers,
      returnVisitFrequency: {
        standard: {
          avgLoginsPerUser: parseFloat(avg(returnVisitCounts.standard).toFixed(2)),
          totalUsers: returnVisitCounts.standard.length,
        },
        gamified: {
          avgLoginsPerUser: parseFloat(avg(returnVisitCounts.gamified).toFixed(2)),
          totalUsers: returnVisitCounts.gamified.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/analytics/export  (admin only)
const exportData = async (req, res) => {
  try {
    // Returns anonymized raw events — no userId exposed
    const events = await AnalyticsEvent.find()
      .select('-userId -_id')
      .sort({ timestamp: -1 })
      .limit(5000);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/analytics/event  (authenticated users — logs client-side events)
const ALLOWED_CLIENT_EVENTS = ['page_visit', 'lesson_start', 'quiz_attempt'];

const logClientEvent = async (req, res) => {
  try {
    const { eventType, metadata } = req.body;
    if (!ALLOWED_CLIENT_EVENTS.includes(eventType)) {
      return res.status(400).json({ message: `Invalid event type. Allowed: ${ALLOWED_CLIENT_EVENTS.join(', ')}` });
    }
    await AnalyticsEvent.create({
      userId: req.user._id,
      mode: req.user.mode,
      eventType,
      metadata: metadata || {},
    });
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary, exportData, logClientEvent };
