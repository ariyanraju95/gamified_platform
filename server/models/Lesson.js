const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
      default: 'python-basics',
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: Number,
      required: true,
    },
    content: {
      type: String, // Markdown content
      required: true,
    },
    exercises: [exerciseSchema],
    xpReward: {
      type: Number,
      required: true,
      default: 100,
    },
    estimatedMinutes: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
