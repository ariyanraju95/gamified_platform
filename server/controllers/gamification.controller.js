const GamificationState = require('../models/GamificationState');

// GET /api/gamification/me
const getMyGamificationState = async (req, res) => {
  try {
    if (req.user.mode !== 'gamified') {
      return res.status(403).json({ message: 'Not available in standard mode' });
    }

    const state = await GamificationState.findOne({ userId: req.user._id })
      .populate('badgesEarned.badgeId');

    if (!state) {
      return res.status(404).json({ message: 'Gamification state not found' });
    }

    res.json(state);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyGamificationState };
