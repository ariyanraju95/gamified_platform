const AnalyticsEvent = require('../models/AnalyticsEvent');

// Logs an analytics event — called manually from controllers (not auto-middleware)
const logEvent = async (userId, mode, eventType, metadata = {}) => {
  try {
    await AnalyticsEvent.create({ userId, mode, eventType, metadata });
  } catch (err) {
    // Non-blocking — analytics failure should not break user flow
    console.error('Analytics log error:', err.message);
  }
};

module.exports = { logEvent };
