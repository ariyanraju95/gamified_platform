const GamificationState = require('../models/GamificationState');

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const top10 = await GamificationState.find()
      .sort({ totalXP: -1 })
      .limit(10)
      .populate('userId', 'fullName');

    const leaderboard = top10.map((entry, index) => ({
      rank: index + 1,
      fullName: entry.userId?.fullName || 'Anonymous',
      totalXP: entry.totalXP,
      currentStreak: entry.currentStreak,
      isCurrentUser: entry.userId?._id.toString() === req.user._id.toString(),
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };
