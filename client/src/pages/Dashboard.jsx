import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Card, Typography, Chip,
  LinearProgress, Skeleton,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getAllLessons } from '../services/lessons.service';
import { getMyProgress } from '../services/progress.service';
import { getLeaderboard } from '../services/gamification.service';
import { getMySurvey } from '../services/analytics.service';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import XPBar from '../components/gamified/XPBar';
import BadgeGrid from '../components/gamified/BadgeGrid';
import LeaderboardTable from '../components/gamified/LeaderboardTable';
import LessonCard from '../components/common/LessonCard';
import StandardProgressPanel from '../components/standard/StandardProgressPanel';


export default function Dashboard() {
  const { user, isGamified } = useAuth();
  const { state, refresh } = useGamification();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [leaderboard, setLeaderboard] = useState([]);
  const [mySurvey, setMySurvey] = useState(undefined); // undefined=loading, null=not submitted
  const [loading, setLoading] = useState(true);

  // Theme-aware helpers
  const cardBg = isGamified ? 'linear-gradient(145deg,rgba(30,24,60,0.95),rgba(22,17,48,0.98))' : '#ffffff';
  const cardBorder = isGamified ? '1px solid rgba(168,85,247,0.18)' : '1px solid rgba(0,0,0,0.08)';
  const textPrimary = isGamified ? '#F1F5F9' : '#0F172A';
  const textSecondary = isGamified ? 'rgba(255,255,255,0.55)' : '#475569';
  const statBoxGamified = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

  useEffect(() => {
    const load = async () => {
      try {
        const [lessonsRes, progressRes, surveyRes] = await Promise.all([
          getAllLessons(),
          getMyProgress(),
          getMySurvey().catch(() => ({ data: null })),
        ]);
        setLessons(lessonsRes.data);
        setCompletedIds(new Set(progressRes.data.map((p) => p.lessonId?._id || p.lessonId)));
        setMySurvey(surveyRes.data);
        if (isGamified) {
          await refresh();
          const lbRes = await getLeaderboard();
          setLeaderboard(lbRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isGamified]);

  const completedCount = completedIds.size;
  const totalCount = lessons.length;
  const progressPct = totalCount ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: textPrimary }}>
          Welcome back, {user?.fullName}
        </Typography>
        <Typography sx={{ color: textSecondary }}>
          {isGamified
            ? 'Keep your streak alive and climb the leaderboard!'
            : 'Continue your Python learning journey.'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left column — lessons */}
        <Grid item xs={12} md={7}>
          {/* Overall progress card */}
          <Card sx={{ p: 3, mb: 3, background: cardBg, border: cardBorder }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: textPrimary }}>
                  Course Progress
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  {completedCount} of {totalCount} lessons completed
                </Typography>
              </Box>
              <Chip
                label={`${Math.round(progressPct)}%`}
                color={progressPct === 100 ? 'success' : 'primary'}
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <LinearProgress variant="determinate" value={progressPct} />
            {isGamified && state && (
              <Box sx={{ mt: 2.5 }}>
                <XPBar totalXP={state.totalXP} />
              </Box>
            )}
          </Card>

          {/* Lesson list */}
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: textPrimary }}>
            Python Basics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {lessons.map((lesson, idx) => {
              const done = completedIds.has(lesson._id);
              const isNext = !done && lessons.slice(0, idx).every((l) => completedIds.has(l._id));
              const isLocked = !done && !isNext && idx > 0;
              return (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  isCompleted={done}
                  isNext={isNext}
                  isLocked={isLocked}
                  isGamified={isGamified}
                  onClick={() => navigate(`/lessons/${lesson.slug}`)}
                />
              );
            })}
          </Box>
        </Grid>

        {/* Right column — sidebar (both modes get a sidebar for layout parity) */}
        <Grid item xs={12} md={5}>
          {isGamified && state ? (
            /* Gamified sidebar — XP, streaks, badges, leaderboard */
            <Box>
              <Card sx={{ p: 3, mb: 3, background: cardBg, border: cardBorder }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: textPrimary }}>
                  Your Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: '#F59E0B' }}>{state.currentStreak}</Typography>
                      <Typography variant="caption" sx={{ color: textSecondary }}>Day Streak</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: '#A855F7' }}>{state.totalXP.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ color: textSecondary }}>Total XP</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, ...statBoxGamified }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: textPrimary }}>{state.longestStreak}</Typography>
                      <Typography variant="caption" sx={{ color: textSecondary }}>Best Streak</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, ...statBoxGamified }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: textPrimary }}>{state.badgesEarned?.length || 0}</Typography>
                      <Typography variant="caption" sx={{ color: textSecondary }}>Badges Earned</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              {state.badgesEarned?.length > 0 && (
                <Card sx={{ p: 3, mb: 3, background: cardBg, border: cardBorder }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: textPrimary }}>
                    Badges
                    <Chip label={state.badgesEarned.length} size="small" color="primary" sx={{ ml: 1, fontWeight: 700 }} />
                  </Typography>
                  <BadgeGrid
                    allBadges={state.badgesEarned.map((b) => b.badgeId).filter(Boolean)}
                    earnedBadges={state.badgesEarned}
                  />
                </Card>
              )}

              <Card sx={{ p: 3, background: cardBg, border: cardBorder }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: textPrimary }}>Leaderboard</Typography>
                </Box>
                <LeaderboardTable entries={leaderboard} />
              </Card>
            </Box>
          ) : (
            /* Standard mode sidebar — plain progress panel, no gamification */
            <StandardProgressPanel
              completedCount={completedCount}
              totalCount={totalCount}
              lessons={lessons}
              completedIds={completedIds}
              mySurvey={mySurvey}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
