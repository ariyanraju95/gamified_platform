const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['standard', 'gamified'],
      required: true,
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
    consentTimestamp: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // ── Demographics (collected at registration for research purposes) ──
    demographics: {
      ageGroup: {
        type: String,
        enum: ['under_18', '18_24', '25_34', '35_44', '45_plus', 'prefer_not_to_say'],
        default: 'prefer_not_to_say',
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'non_binary', 'prefer_not_to_say'],
        default: 'prefer_not_to_say',
      },
      educationLevel: {
        type: String,
        enum: ['secondary', 'undergraduate', 'postgraduate', 'professional', 'other'],
        default: 'other',
      },
      priorProgrammingExperience: {
        type: String,
        enum: ['none', 'beginner', 'intermediate', 'advanced'],
        default: 'none',
      },
      onlineLearningFrequency: {
        type: String,
        enum: ['never', 'rarely', 'sometimes', 'often', 'very_often'],
        default: 'never',
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
