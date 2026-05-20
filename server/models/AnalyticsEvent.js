const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mode: {
      type: String,
      enum: ['standard', 'gamified'],
      required: true,
    },
    eventType: {
      type: String,
      enum: ['lesson_start', 'lesson_complete', 'quiz_attempt', 'page_visit', 'login', 'logout'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: false }
);

// Index for fast querying by user and event type
analyticsEventSchema.index({ userId: 1, eventType: 1 });
analyticsEventSchema.index({ mode: 1, timestamp: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
