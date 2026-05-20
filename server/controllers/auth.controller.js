const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const GamificationState = require('../models/GamificationState');
const Session = require('../models/Session');
const { logEvent } = require('../middleware/tracking.middleware');

const generateToken = (id, mode, role) => {
  return jwt.sign({ id, mode, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, email, password, consentGiven, demographics } = req.body;

    if (!consentGiven) {
      return res.status(400).json({ message: 'Consent is required to participate' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Randomly assign mode — 50/50 split for research validity
    const mode = Math.random() < 0.5 ? 'standard' : 'gamified';

    const user = await User.create({
      fullName,
      email,
      passwordHash: password, // pre-save hook hashes it
      mode,
      consentGiven: true,
      consentTimestamp: new Date(),
      demographics: demographics || {},
    });

    // Create gamification state for gamified users only
    if (mode === 'gamified') {
      await GamificationState.create({ userId: user._id });
    }

    await logEvent(user._id, mode, 'login', { type: 'register' });

    const token = generateToken(user._id, user.mode, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mode: user.mode,
        role: user.role,
        demographics: user.demographics || {},
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Start a new session
    const session = await Session.create({
      userId: user._id,
      mode: user.mode,
      startTime: new Date(),
    });

    await logEvent(user._id, user.mode, 'login', { sessionId: session._id });

    const token = generateToken(user._id, user.mode, user.role);

    res.json({
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mode: user.mode,
        role: user.role,
        demographics: user.demographics || {},
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (session) {
        session.endTime = new Date();
        session.durationSeconds = Math.floor(
          (session.endTime - session.startTime) / 1000
        );
        await session.save();
      }
    }

    await logEvent(req.user._id, req.user.mode, 'logout', { sessionId });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    mode: req.user.mode,
    role: req.user.role,
    demographics: req.user.demographics || {},
    createdAt: req.user.createdAt,
  });
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, logout, getMe, changePassword };