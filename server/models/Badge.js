const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    iconKey: {
      type: String, // maps to MUI icon or asset key on frontend
      required: true,
    },
    criteria: {
      type: {
        type: String,
        enum: ['xp_threshold', 'streak_days', 'lessons_completed', 'first_lesson'],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
