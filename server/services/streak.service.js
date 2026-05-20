const GamificationState = require('../models/GamificationState');

// Returns date string YYYY-MM-DD in UTC for consistent comparison
const toDateString = (date) => new Date(date).toISOString().split('T')[0];

const updateStreak = async (userId) => {
  const state = await GamificationState.findOne({ userId });
  if (!state) return null;

  const today = toDateString(new Date());
  const lastActivity = state.lastActivityDate ? toDateString(state.lastActivityDate) : null;

  // Already updated today — no change needed
  if (lastActivity === today) return state;

  const yesterday = toDateString(new Date(Date.now() - 86400000));

  if (lastActivity === yesterday) {
    // Consecutive day — increment streak
    state.currentStreak += 1;
  } else {
    // Missed a day or first activity — reset streak
    state.currentStreak = 1;
  }

  // Update longest streak record
  if (state.currentStreak > state.longestStreak) {
    state.longestStreak = state.currentStreak;
  }

  state.lastActivityDate = new Date();
  await state.save();
  return state;
};

module.exports = { updateStreak };
