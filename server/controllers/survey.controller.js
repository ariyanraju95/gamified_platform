const SurveyResponse = require('../models/SurveyResponse');

// Compute SUS score from 10 Likert items (1-5)
// Standard SUS formula: sum of odd items (score-1) + sum of (5-score) for even items, multiplied by 2.5
const computeSUSScore = (scores) => {
  let total = 0;
  scores.forEach((score, index) => {
    if ((index + 1) % 2 !== 0) {
      total += score - 1; // odd items
    } else {
      total += 5 - score; // even items
    }
  });
  return total * 2.5;
};

// POST /api/survey
const submitSurvey = async (req, res) => {
  try {
    const { susScores, openEndedQ1, openEndedQ2, openEndedQ3 } = req.body;

    const existing = await SurveyResponse.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Survey already submitted' });
    }

    if (!susScores || susScores.length !== 10) {
      return res.status(400).json({ message: 'All 10 SUS items are required' });
    }

    const susTotal = computeSUSScore(susScores);

    const response = await SurveyResponse.create({
      userId: req.user._id,
      mode: req.user.mode,
      susScores,
      susTotal,
      openEndedQ1: openEndedQ1 || '',
      openEndedQ2: openEndedQ2 || '',
      openEndedQ3: openEndedQ3 || '',
    });

    res.status(201).json({ message: 'Survey submitted', susTotal, id: response._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/survey/results  (admin only)
const getSurveyResults = async (req, res) => {
  try {
    const results = await SurveyResponse.find()
      .select('-userId') // anonymized — no user reference returned
      .sort({ submittedAt: -1 });

    const summary = {
      total: results.length,
      standard: results.filter((r) => r.mode === 'standard').length,
      gamified: results.filter((r) => r.mode === 'gamified').length,
      avgSUSStandard:
        results
          .filter((r) => r.mode === 'standard')
          .reduce((sum, r) => sum + r.susTotal, 0) /
          (results.filter((r) => r.mode === 'standard').length || 1),
      avgSUSGamified:
        results
          .filter((r) => r.mode === 'gamified')
          .reduce((sum, r) => sum + r.susTotal, 0) /
          (results.filter((r) => r.mode === 'gamified').length || 1),
    };

    res.json({ summary, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/survey/me  — returns the current user's own submission (or null)
const getMySubmission = async (req, res) => {
  try {
    const response = await SurveyResponse.findOne({ userId: req.user._id });
    if (!response) return res.json(null);
    res.json({
      susScores: response.susScores,
      susTotal: response.susTotal,
      openEndedQ1: response.openEndedQ1,
      openEndedQ2: response.openEndedQ2,
      openEndedQ3: response.openEndedQ3,
      mode: response.mode,
      submittedAt: response.submittedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitSurvey, getSurveyResults, getMySubmission };
