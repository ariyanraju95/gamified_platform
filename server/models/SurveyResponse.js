const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one survey per user
    },
    mode: {
      type: String,
      enum: ['standard', 'gamified'],
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    susScores: {
      type: [Number], // 10 Likert items, values 1-5
      validate: {
        validator: (arr) => arr.length === 10,
        message: 'SUS requires exactly 10 scores',
      },
    },
    susTotal: {
      type: Number, // Computed SUS score 0-100
    },
    openEndedQ1: {
      type: String, // "What did you enjoy most?"
      default: '',
    },
    openEndedQ2: {
      type: String, // "What frustrated you?"
      default: '',
    },
    openEndedQ3: {
      type: String, // "Would you return to this platform?"
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
