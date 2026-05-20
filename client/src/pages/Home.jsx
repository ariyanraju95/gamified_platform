import { Box, Container, Typography, Button, Grid, Card, Chip, Stack, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BoltIcon from '@mui/icons-material/Bolt';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';

const features = [
  { icon: <BoltIcon />, title: 'XP System', desc: 'Earn experience points for every lesson you complete. Daily streaks multiply your XP gain up to 1.5×.' },
  { icon: <WhatshotIcon />, title: 'Daily Streaks', desc: 'Build momentum by learning every day. Miss a day and your streak resets — stay consistent.' },
  { icon: <EmojiEventsIcon />, title: 'Achievement Badges', desc: '7 unique badges to unlock based on lessons completed, XP earned, and streak milestones.' },
  { icon: <BarChartIcon />, title: 'Leaderboard', desc: 'See how you rank against other learners. Climb the board by earning more XP.' },
];

const highlights = [
  '10 structured Python lessons — beginner to mini-project',
  'Two modes: Standard vs Gamified — same content, different experience',
  'Your usage data contributes to academic research on learning',
  'GDPR-compliant — all data anonymised and handled securely',
];

export default function Home() {
  const { user } = useAuth();
  return (
    <Box sx={{ overflowX: 'hidden' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box
        sx={{
          minHeight: { xs: 'auto', md: '92vh' },
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0D0B1E 0%, #1a1035 50%, #0D0B1E 100%)',
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 8, md: 0 },
          '&::before': {
            content: '""', position: 'absolute',
            width: { xs: 300, md: 600 }, height: { xs: 300, md: 600 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            top: -100, right: -100,
          },
          '&::after': {
            content: '""', position: 'absolute',
            width: { xs: 200, md: 400 }, height: { xs: 200, md: 400 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
            bottom: 50, left: -50,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">

            {/* Left — headline */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                icon={<ScienceIcon sx={{ fontSize: '16px !important', color: '#C084FC !important' }} />}
                label="Academic Research Platform"
                sx={{
                  mb: 3, background: 'rgba(168,85,247,0.15)',
                  border: '1px solid rgba(168,85,247,0.35)', color: '#C084FC', fontWeight: 700,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.2rem', sm: '3rem', md: '3.75rem' },
                  fontWeight: 900, lineHeight: 1.15, mb: 3,
                  background: 'linear-gradient(135deg, #fff 30%, #C084FC 70%, #F59E0B 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                Learn Python.<br />Level Up Every Day.
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.65)', mb: 4, lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.125rem' } }}
              >
                A research-driven coding platform comparing gamified and standard learning.
                Discover how XP, streaks, and badges affect your progress.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {user ? (
                  <Button
                    component={Link} to="/dashboard" variant="contained" size="large"
                    sx={{ px: 4, py: 1.5, fontSize: '1rem', width: { xs: '100%', sm: 'auto' } }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      component={Link} to="/register" variant="contained" size="large"
                      sx={{ px: 4, py: 1.5, fontSize: '1rem', width: { xs: '100%', sm: 'auto' } }}
                    >
                      Start Learning Free
                    </Button>
                    <Button
                      component={Link} to="/login" variant="outlined" size="large"
                      sx={{
                        px: 4, py: 1.5, fontSize: '1rem',
                        borderColor: 'rgba(168,85,247,0.5)', color: '#C084FC',
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': { borderColor: '#A855F7', background: 'rgba(168,85,247,0.08)' },
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>

            {/* Right — info card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  background: 'linear-gradient(145deg, rgba(30,24,60,0.9), rgba(22,17,48,0.95))',
                  border: '1px solid rgba(168,85,247,0.2)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <SchoolIcon sx={{ color: '#A855F7', fontSize: 22 }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#C084FC' }}>
                    What you'll get
                  </Typography>
                </Box>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {highlights.map((text) => (
                    <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CheckCircleIcon sx={{ color: '#A855F7', fontSize: 18, mt: 0.25, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />
                <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Typography variant="caption" sx={{ color: '#FCD34D', fontWeight: 600, lineHeight: 1.6, display: 'block' }}>
                    You will be randomly assigned to Standard or Gamified mode on registration.
                    Both teach identical Python content — the research measures the difference in engagement.
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Gamification Features ────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: '#0D0B1E' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ color: '#F1F5F9', mb: 1.5, fontSize: { xs: '2rem', md: '2.5rem' } }}
            >
              Gamification Features
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}
            >
              If you are assigned to the gamified mode, you will experience these engagement mechanics.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid size={{ xs: 12, sm: 6 }} key={f.title}>
                <Card sx={{
                  p: { xs: 2.5, md: 3 },
                  height: '100%',
                  background: 'linear-gradient(145deg, rgba(30,24,60,0.95), rgba(22,17,48,0.98))',
                  border: '1px solid rgba(168,85,247,0.18)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}>
                  <Box
                    sx={{
                      width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                      background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(168,85,247,0.35)',
                      color: '#fff',
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', lineHeight: 1.3 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                    {f.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Research context strip ───────────────────────────── */}
      <Box sx={{ py: { xs: 6, md: 8 }, background: '#080614', borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', px: { xs: 2, md: 3 } }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#F1F5F9', mb: 2 }}>
            Part of a University Research Study
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, mb: 4, maxWidth: 600, mx: 'auto' }}>
            This platform was built as a dissertation artefact at Southampton Solent University (QHO634).
            The research question: do gamification mechanics improve user retention and engagement on educational platforms?
            All data is anonymised and GDPR-compliant.
          </Typography>
          <Button
            component={Link} to={user ? '/dashboard' : '/register'} variant="contained" size="large"
            sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
          >
            {user ? 'Go to Dashboard' : 'Participate in the Study'}
          </Button>
        </Container>
      </Box>

    </Box>
  );
}
