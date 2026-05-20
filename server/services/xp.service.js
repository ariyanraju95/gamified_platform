const GamificationState = require('../models/GamificationState');

const getStreakMultiplier = (streak) => {
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
};

const awardXP = async (userId, baseXP) => {
  const state = await GamificationState.findOne({ userId });
  if (!state) return null;

  const multiplier = getStreakMultiplier(state.currentStreak);
  const xpEarned = Math.floor(baseXP * multiplier);

  state.totalXP += xpEarned;
  await state.save();

  return { xpEarned, multiplier, totalXP: state.totalXP };
};

module.exports = { awardXP, getStreakMultiplier };
