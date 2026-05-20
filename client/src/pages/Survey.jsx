import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Card, Typography, Button, Slider,
  TextField, Alert, CircularProgress, Chip, LinearProgress, Divider,
} from '@mui/material';
import { submitSurvey } from '../services/analytics.service';
import { computeSUSScore, getSUSGrade } from '../utils/susCalculator';
import { useAuth } from '../context/AuthContext';

const SUS_QUESTIONS = [
  'I think that I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think that I would need the support of a technical person to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine that most people would learn to use this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot of things before I could get going with this system.',
];

export default function Survey() {
  const { user, isGamified } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState(Array(10).fill(3));
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const previewSUS = computeSUSScore(scores);
  const grade = getSUSGrade(previewSUS);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitSurvey({ susScores: scores, openEndedQ1: q1, openEndedQ2: q2, openEndedQ3: q3 });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. You may have already submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>🎉</Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Thank you!</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Your survey response has been recorded. Your feedback is invaluable for this research.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Chip
          label={`Mode: ${isGamified ? 'Gamified' : 'Standard'}`}
          color={isGamified ? 'primary' : 'default'}
          sx={{ mb: 2, fontWeight: 700 }}
        />
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Usability Survey</Typography>
        <Typography color="text.secondary">
          This is the System Usability Scale (SUS) — a validated 10-item questionnaire.
          Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: { xs: 2.5, md: 4 }, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Part 1 — System Usability Scale</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SUS_QUESTIONS.map((q, i) => (
              <Box key={i}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1, pr: 2 }}>
                    {i + 1}. {q}
                  </Typography>
                  <Chip
                    label={scores[i]}
                    size="small"
                    color={scores[i] >= 4 ? 'success' : scores[i] <= 2 ? 'error' : 'default'}
                    sx={{ fontWeight: 800, minWidth: 32 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>Strongly Disagree</Typography>
                  <Slider
                    value={scores[i]}
                    onChange={(_, v) => setScores((s) => s.map((x, idx) => idx === i ? v : x))}
                    min={1} max={5} step={1}
                    marks={[1,2,3,4,5].map((v) => ({ value: v, label: String(v) }))}
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>Strongly Agree</Typography>
                </Box>
                {i < SUS_QUESTIONS.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Box>

          {/* Live SUS preview */}
          <Box
            sx={{
              mt: 4, p: 3, borderRadius: 2,
              background: isGamified ? 'rgba(168,85,247,0.08)' : 'rgba(30,64,175,0.05)',
              border: `1px solid ${isGamified ? 'rgba(168,85,247,0.2)' : 'rgba(30,64,175,0.15)'}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">Preview SUS Score</Typography>
            <Typography variant="h3" fontWeight={900} sx={{ color: grade.color, my: 0.5 }}>
              {Math.round(previewSUS)}
            </Typography>
            <Chip label={grade.label} size="small" sx={{ background: grade.color + '22', color: grade.color, fontWeight: 700, border: `1px solid ${grade.color}44` }} />
          </Box>
        </Card>

        {/* Open-ended questions */}
        <Card sx={{ p: { xs: 2.5, md: 4 }, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Part 2 — Open Feedback</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="What did you enjoy most about the platform?"
              multiline rows={3}
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              fullWidth
              placeholder="Your response..."
            />
            <TextField
              label="What frustrated you or could be improved?"
              multiline rows={3}
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              fullWidth
              placeholder="Your response..."
            />
            <TextField
              label="Would you return to this platform to continue learning? Why or why not?"
              multiline rows={3}
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              fullWidth
              placeholder="Your response..."
            />
          </Box>
        </Card>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={submitting}
          sx={{ py: 1.75, fontSize: '1rem' }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Survey'}
        </Button>
      </form>
    </Container>
  );
}
