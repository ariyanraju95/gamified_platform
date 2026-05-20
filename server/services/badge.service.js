const Badge = require('../models/Badge');
const GamificationState = require('../models/GamificationState');
const Progress = require('../models/Progress');

const checkAndAwardBadges = async (userId) => {
  const state = await GamificationState.findOne({ userId }).populate('badgesEarned.badgeId');
  if (!state) return [];

  const allBadges = await Badge.find();
  const earnedIds = state.badgesEarned.map((b) => b.badgeId._id.toString());
  const lessonsCompleted = await Progress.countDocuments({ userId });

  const newlyAwarded = [];

  for (const badge of allBadges) {
    if (earnedIds.includes(badge._id.toString())) continue; // already earned

    let earned = false;

    switch (badge.criteria.type) {
      case 'first_lesson':
        earned = lessonsCompleted >= 1;
        break;
      case 'lessons_completed':
        earned = lessonsCompleted >= badge.criteria.value;
        break;
      case 'xp_threshold':
        earned = state.totalXP >= badge.criteria.value;
        break;
      case 'streak_days':
        earned = state.currentStreak >= badge.criteria.value;
        break;
    }

    if (earned) {
      state.badgesEarned.push({ badgeId: badge._id, earnedAt: new Date() });
      newlyAwarded.push(badge);
    }
  }

  if (newlyAwarded.length > 0) {
    await state.save();
  }

  return newlyAwarded;
};

module.exports = { checkAndAwardBadges };
