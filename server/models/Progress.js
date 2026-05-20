const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    exerciseAttempts: {
      type: Number,
      default: 1,
    },
    exerciseScore: {
      type: Number, // percentage correct (0-100)
      default: 0,
    },
  },
  { timestamps: true }
);

// One record per user per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
