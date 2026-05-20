const mongoose = require('mongoose');

const badgeEarnedSchema = new mongoose.Schema({
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
});

const gamificationStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalXP: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: null,
    },
    badgesEarned: [badgeEarnedSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('GamificationState', gamificationStateSchema);
