import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Card, Typography, Button, LinearProgress,
  Radio, RadioGroup, FormControlLabel, Alert, Chip, Divider,
  IconButton, Tooltip, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getLessonBySlug } from '../services/lessons.service';
import { completeLesson, getMyProgress } from '../services/progress.service';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import useAnalyticsEvent from '../hooks/useAnalyticsEvent';

export default function LessonPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isGamified } = useAuth();
  const { refresh, showXPGain } = useGamification();
  const { trackEvent } = useAnalyticsEvent();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // Quiz state
  const [quizStep, setQuizStep] = useState(0); // which exercise
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completing, setCompleting] = useState(false);

  const startTime = useRef(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const [lessonRes, progressRes] = await Promise.all([
          getLessonBySlug(slug),
          getMyProgress(),
        ]);
        setLesson(lessonRes.data);
        const done = progressRes.data.some(
          (p) => (p.lessonId?.slug || p.lessonId) === slug ||
                  p.lessonId?.title === lessonRes.data.title
        );
        setAlreadyDone(done);
        // Track lesson_start event for research analytics
        trackEvent('lesson_start', { lessonSlug: slug, lessonTitle: lessonRes.data.title });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const currentExercise = lesson?.exercises[quizStep];
  const totalExercises = lesson?.exercises.length || 0;

  const handleSubmitAnswer = () => {
    if (!selected) return;
    setAttempts((a) => a + 1);
    const isCorrect = parseInt(selected) === currentExercise.correctIndex;
    setCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (quizStep + 1 >= totalExercises) {
      setAllDone(true);
    } else {
      setQuizStep((s) => s + 1);
      setSelected('');
      setSubmitted(false);
      setCorrect(false);
    }
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      const exerciseScore = totalExercises ? Math.round((score / totalExercises) * 100) : 100;
      const { data } = await completeLesson({
        lessonId: lesson._id,
        timeSpentSeconds: timeSpent,
        exerciseAttempts: attempts,
        exerciseScore,
      });
      if (data.alreadyDone) {
        navigate('/dashboard');
        return;
      }
      if (isGamified && data.gamification) {
        await refresh();
        showXPGain(data.gamification.xpEarned, data.gamification.multiplier, data.gamification.newBadges || []);
      }
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Lesson not found.</Typography>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>Back to Dashboard</Button>
      </Container>
    );
  }

  // Theme-aware style helpers
  const cardBg = isGamified
    ? 'linear-gradient(145deg, rgba(30,24,60,0.95), rgba(22,17,48,0.98))'
    : '#ffffff';
  const cardBorder = isGamified
    ? '1px solid rgba(168,85,247,0.18)'
    : '1px solid rgba(0,0,0,0.08)';
  const defaultOptionBorder = isGamified ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
  const textPrimary = isGamified ? '#F1F5F9' : '#0F172A';
  const textSecondary = isGamified ? 'rgba(255,255,255,0.55)' : '#475569';

  return (
    <Box sx={{ minHeight: '100vh', background: isGamified ? '#0D0B1E' : '#F1F5F9', pb: 6 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              onClick={() => navigate('/dashboard')}
              size="small"
              sx={{ color: textPrimary, background: isGamified ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', '&:hover': { background: isGamified ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary }}>{lesson.title}</Typography>
              {isGamified && (
                <Chip
                  icon={<BoltIcon sx={{ fontSize: 14, color: '#F59E0B !important' }} />}
                  label={`+${lesson.xpReward} XP`}
                  size="small"
                  sx={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D', fontWeight: 700 }}
                />
              )}
              {alreadyDone && <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Completed" color="success" size="small" sx={{ fontWeight: 700 }} />}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: textSecondary }} />
              <Typography variant="caption" sx={{ color: textSecondary }}>~{lesson.estimatedMinutes} minutes · Lesson {lesson.order} of 10</Typography>
            </Box>
          </Box>
        </Box>

        {/* Lesson content */}
        <Card sx={{ p: { xs: 2.5, md: 4 }, mb: 3, background: cardBg, border: cardBorder, boxShadow: isGamified ? '0 4px 24px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Box
            sx={{
              color: textPrimary,
              '& h1,& h2,& h3': { fontWeight: 700, mt: 2.5, mb: 1, color: textPrimary },
              '& h1': { fontSize: '1.6rem' },
              '& h2': { fontSize: '1.25rem' },
              '& h3': { fontSize: '1.05rem' },
              '& p': { lineHeight: 1.8, mb: 1.5, color: textPrimary },
              '& strong': { color: textPrimary },
              '& li': { mb: 0.5, lineHeight: 1.7, color: textPrimary },
              '& code': {
                background: isGamified ? 'rgba(168,85,247,0.15)' : 'rgba(30,64,175,0.08)',
                color: isGamified ? '#C084FC' : '#1E40AF',
                px: 0.75, py: 0.25, borderRadius: 1,
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: '0.875em',
              },
              '& pre': {
                background: '#0f172a',
                border: `1px solid ${isGamified ? 'rgba(168,85,247,0.25)' : 'rgba(30,64,175,0.2)'}`,
                borderRadius: 2, p: 2.5, overflow: 'auto', mb: 2,
                '& code': { background: 'none', color: isGamified ? '#C084FC' : '#93c5fd', p: 0 },
              },
              '& table': { width: '100%', borderCollapse: 'collapse', mb: 2, fontSize: '0.875rem' },
              '& th, & td': { border: `1px solid ${isGamified ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`, px: 2, py: 1, color: textPrimary },
              '& th': { background: isGamified ? 'rgba(168,85,247,0.15)' : 'rgba(30,64,175,0.06)', fontWeight: 700 },
              '& ul, & ol': { pl: 2.5, mb: 1.5 },
              '& blockquote': { borderLeft: `4px solid ${isGamified ? '#A855F7' : '#3B82F6'}`, pl: 2, ml: 0, mb: 2, color: textSecondary },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
          </Box>
        </Card>

        {/* Quiz section */}
        {totalExercises > 0 && (
          <Card sx={{ p: { xs: 2.5, md: 4 }, background: cardBg, border: cardBorder, boxShadow: isGamified ? '0 4px 24px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.08)' }}>
            {!allDone ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: textPrimary }}>
                    Check Your Understanding
                  </Typography>
                  <Chip
                    label={`${quizStep + 1} / ${totalExercises}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      background: isGamified ? 'rgba(168,85,247,0.2)' : 'rgba(30,64,175,0.1)',
                      color: isGamified ? '#C084FC' : '#1E40AF',
                      border: `1px solid ${isGamified ? 'rgba(168,85,247,0.4)' : 'rgba(30,64,175,0.3)'}`,
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(quizStep / totalExercises) * 100}
                  sx={{ mb: 3, height: 6, borderRadius: 3 }}
                />

                <Typography variant="body1" fontWeight={600} sx={{ mb: 2.5, lineHeight: 1.6, color: textPrimary }}>
                  {currentExercise?.question}
                </Typography>

                <RadioGroup value={selected} onChange={(e) => { if (!submitted) setSelected(e.target.value); }}>
                  {currentExercise?.options.map((option, idx) => {
                    let optionBg = 'transparent';
                    let borderColor = defaultOptionBorder;
                    if (submitted) {
                      if (idx === currentExercise.correctIndex) {
                        optionBg = 'rgba(34,197,94,0.1)';
                        borderColor = 'rgba(34,197,94,0.6)';
                      } else if (String(idx) === selected) {
                        optionBg = 'rgba(239,68,68,0.1)';
                        borderColor = 'rgba(239,68,68,0.6)';
                      }
                    } else if (String(idx) === selected) {
                      optionBg = isGamified ? 'rgba(168,85,247,0.12)' : 'rgba(30,64,175,0.07)';
                      borderColor = isGamified ? 'rgba(168,85,247,0.5)' : 'rgba(30,64,175,0.5)';
                    }
                    return (
                      <Box
                        key={idx}
                        onClick={() => { if (!submitted) setSelected(String(idx)); }}
                        sx={{
                          display: 'flex', alignItems: 'center',
                          p: 2, mb: 1.5, borderRadius: 2,
                          background: optionBg,
                          border: `1px solid ${borderColor}`,
                          cursor: submitted ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': !submitted ? { borderColor: isGamified ? 'rgba(168,85,247,0.5)' : 'rgba(30,64,175,0.5)', background: isGamified ? 'rgba(168,85,247,0.06)' : 'rgba(30,64,175,0.04)' } : {},
                        }}
                      >
                        <FormControlLabel
                          value={String(idx)}
                          control={<Radio disabled={submitted} size="small" />}
                          label={<Typography variant="body2" sx={{ color: textPrimary }}>{option}</Typography>}
                          sx={{ m: 0, flex: 1, pointerEvents: 'none' }}
                        />
                        {submitted && idx === currentExercise.correctIndex && (
                          <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20, ml: 1 }} />
                        )}
                        {submitted && String(idx) === selected && idx !== currentExercise.correctIndex && (
                          <CancelIcon sx={{ color: '#ef4444', fontSize: 20, ml: 1 }} />
                        )}
                      </Box>
                    );
                  })}
                </RadioGroup>

                {submitted && (
                  <Alert severity={correct ? 'success' : 'error'} sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {correct ? '✓ Correct!' : '✗ Not quite.'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{currentExercise.explanation}</Typography>
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  {!submitted ? (
                    <Button
                      variant="contained"
                      disabled={!selected}
                      onClick={handleSubmitAnswer}
                      size="large"
                      sx={{
                        minWidth: 160, py: 1.25,
                        background: isGamified ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : undefined,
                        '&:hover': isGamified ? { background: 'linear-gradient(135deg,#6D28D9,#9333EA)' } : {},
                      }}
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      size="large"
                      sx={{
                        minWidth: 160, py: 1.25,
                        background: isGamified ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : undefined,
                        '&:hover': isGamified ? { background: 'linear-gradient(135deg,#6D28D9,#9333EA)' } : {},
                      }}
                    >
                      {quizStep + 1 >= totalExercises ? 'Finish Quiz' : 'Next Question →'}
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              /* All quiz done */
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {score === totalExercises ? '🎉' : score >= totalExercises / 2 ? '👍' : '💪'}
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1, color: textPrimary }}>
                  {score}/{totalExercises} correct
                </Typography>
                <Typography sx={{ mb: 3, color: textSecondary }}>
                  {score === totalExercises
                    ? 'Perfect score! Excellent work.'
                    : score >= totalExercises / 2
                      ? 'Good effort! Review the explanations to reinforce your learning.'
                      : 'Keep practising — every attempt builds understanding.'}
                </Typography>
                {isGamified && !alreadyDone && (
                  <Box sx={{ p: 2, mb: 3, borderRadius: 2, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#FCD34D' }}>
                      <BoltIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      +{lesson.xpReward} XP incoming!
                    </Typography>
                  </Box>
                )}
                {alreadyDone ? (
                  <Button variant="outlined" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCompleteLesson}
                    disabled={completing}
                    sx={{
                      px: 4, py: 1.5,
                      background: isGamified ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : undefined,
                      '&:hover': isGamified ? { background: 'linear-gradient(135deg,#6D28D9,#9333EA)' } : {},
                    }}
                  >
                    {completing ? <CircularProgress size={22} color="inherit" /> : isGamified ? '🎯 Complete & Claim XP' : 'Complete Lesson'}
                  </Button>
                )}
              </Box>
            )}
          </Card>
        )}
      </Container>
    </Box>
  );
}
