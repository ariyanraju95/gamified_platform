import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Card, Typography, Chip, Grid,
  LinearProgress, Button, Avatar, Divider, TextField, Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getMyProgress } from '../services/progress.service';
import { changePassword as apiChangePassword } from '../services/auth.service';

const AGE_LABELS = {
  under_18: 'Under 18',
  '18_24': '18 – 24',
  '25_34': '25 – 34',
  '35_44': '35 – 44',
  '45_plus': '45 or older',
  prefer_not_to_say: 'Prefer not to say',
};
const GENDER_LABELS = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  prefer_not_to_say: 'Prefer not to say',
};
const EDU_LABELS = {
  secondary: 'Secondary / High School',
  undergraduate: "Undergraduate (Bachelor's)",
  postgraduate: "Postgraduate (Master's / PhD)",
  professional: 'Professional / Vocational',
  other: 'Other',
};
const EXP_LABELS = {
  none: 'No prior experience',
  beginner: 'Beginner (< 6 months)',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
const FREQ_LABELS = {
  never: 'Never',
  rarely: 'Rarely',
  sometimes: 'Sometimes',
  often: 'Often',
  very_often: 'Very often',
};

function DemoField({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'inherit', opacity: 0.6 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 500 }}>
        {value || <span style={{ opacity: 0.45 }}>Not provided</span>}
      </Typography>
    </Box>
  );
}

function SectionHeader({ icon, title, textPrimary }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
      {icon}
      <Typography variant="h6" fontWeight={700} sx={{ color: textPrimary }}>
        {title}
      </Typography>
    </Box>
  );
}

function formatMemberSince(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export default function Profile() {
  const { user, isGamified } = useAuth();
  const { state } = useGamification();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null); // { type: 'success'|'error', text: string }

  // Theme-aware helpers
  const cardBg = isGamified
    ? 'linear-gradient(145deg,rgba(30,24,60,0.95),rgba(22,17,48,0.98))'
    : '#ffffff';
  const cardBorder = isGamified
    ? '1px solid rgba(168,85,247,0.18)'
    : '1px solid rgba(0,0,0,0.08)';
  const textPrimary = isGamified ? '#F1F5F9' : '#0F172A';
  const textSecondary = isGamified ? 'rgba(255,255,255,0.55)' : '#475569';
  const statBoxStyle = isGamified
    ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
    : { background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' };

  useEffect(() => {
    getMyProgress()
      .then((res) => setProgress(res.data || []))
      .catch(() => setProgress([]))
      .finally(() => setLoadingProgress(false));
  }, []);

  const completedCount = progress.length;
  const totalLessons = 10;
  const progressPct = totalLessons ? (completedCount / totalLessons) * 100 : 0;

  const demographics = user?.demographics || {};
  const memberSince = formatMemberSince(user?.createdAt);

  const avatarBg = isGamified
    ? 'linear-gradient(135deg,#7C3AED,#A855F7)'
    : 'linear-gradient(135deg,#1E40AF,#3B82F6)';

  const cardSx = { p: 3, mb: 3, background: cardBg, border: cardBorder };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    setPwLoading(true);
    try {
      await apiChangePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: textPrimary }}>
        My Profile
      </Typography>

      {/* Section 1 — Account Info */}
      <Card sx={cardSx}>
        <SectionHeader
          icon={<PersonIcon sx={{ color: isGamified ? '#A855F7' : '#1E40AF' }} />}
          title="Account Info"
          textPrimary={textPrimary}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: '1.6rem',
              fontWeight: 700,
              background: avatarBg,
              flexShrink: 0,
            }}
          >
            {user?.fullName?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: textPrimary }}>
              {user?.fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary, mt: 0.25 }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={isGamified ? 'Gamified Mode' : 'Standard Mode'}
                size="small"
                sx={{
                  fontWeight: 700,
                  background: isGamified
                    ? 'rgba(168,85,247,0.15)'
                    : 'rgba(30,64,175,0.1)',
                  color: isGamified ? '#C084FC' : '#1E40AF',
                  border: isGamified
                    ? '1px solid rgba(168,85,247,0.35)'
                    : '1px solid rgba(30,64,175,0.2)',
                }}
              />
              {user?.role === 'admin' && (
                <Chip label="Admin" size="small" color="error" sx={{ fontWeight: 700 }} />
              )}
              {memberSince && (
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Member since {memberSince}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Section 2 — Demographics */}
      <Card sx={cardSx}>
        <SectionHeader
          icon={<PersonIcon sx={{ color: isGamified ? '#A855F7' : '#1E40AF' }} />}
          title="Demographics"
          textPrimary={textPrimary}
        />
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ ...statBoxStyle, p: 2, borderRadius: 2 }}>
              <DemoField
                label="Age Group"
                value={AGE_LABELS[demographics.ageGroup] || null}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ ...statBoxStyle, p: 2, borderRadius: 2 }}>
              <DemoField
                label="Gender"
                value={GENDER_LABELS[demographics.gender] || null}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ ...statBoxStyle, p: 2, borderRadius: 2 }}>
              <DemoField
                label="Education Level"
                value={EDU_LABELS[demographics.educationLevel] || null}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ ...statBoxStyle, p: 2, borderRadius: 2 }}>
              <DemoField
                label="Prior Programming Experience"
                value={EXP_LABELS[demographics.priorProgrammingExperience] || null}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ ...statBoxStyle, p: 2, borderRadius: 2 }}>
              <DemoField
                label="Online Learning Frequency"
                value={FREQ_LABELS[demographics.onlineLearningFrequency] || null}
              />
            </Box>
          </Grid>
        </Grid>
        {Object.keys(demographics).length === 0 && (
          <Typography variant="body2" sx={{ color: textSecondary, mt: 1 }}>
            No demographic information on file.
          </Typography>
        )}
      </Card>

      {/* Section 3 — Learning Progress */}
      <Card sx={cardSx}>
        <SectionHeader
          icon={<SchoolIcon sx={{ color: isGamified ? '#A855F7' : '#1E40AF' }} />}
          title="Learning Progress"
          textPrimary={textPrimary}
        />
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: isGamified ? '#A855F7' : '#1E40AF' }}>
            {loadingProgress ? '—' : completedCount}
          </Typography>
          <Typography variant="body1" sx={{ color: textSecondary }}>
            of {totalLessons} lessons completed
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={loadingProgress ? 0 : progressPct}
          sx={{ height: 8, borderRadius: 4, mb: 1 }}
        />
        <Typography variant="caption" sx={{ color: textSecondary }}>
          {loadingProgress ? 'Loading...' : `${Math.round(progressPct)}% complete`}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/dashboard')}
            sx={{ fontWeight: 600 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Card>

      {/* Section 4 — Gamification Stats (gamified users only) */}
      {isGamified && state && (
        <Card sx={cardSx}>
          <SectionHeader
            icon={<BarChartIcon sx={{ color: '#A855F7' }} />}
            title="Gamification Stats"
            textPrimary={textPrimary}
          />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#A855F7' }}>
                  {state.totalXP.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Total XP
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#F59E0B' }}>
                  {state.currentStreak}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Current Streak
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: textPrimary }}>
                  {state.longestStreak}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Longest Streak
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: textPrimary }}>
                  {state.badgesEarned?.length || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  Badges Earned
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Section 5 — Change Password */}
      <Card sx={cardSx} component="form" onSubmit={handleChangePassword}>
        <SectionHeader
          icon={<LockOutlinedIcon sx={{ color: isGamified ? '#A855F7' : '#1E40AF' }} />}
          title="Change Password"
          textPrimary={textPrimary}
        />
        {pwMsg && (
          <Alert severity={pwMsg.type} sx={{ mb: 2 }} onClose={() => setPwMsg(null)}>
            {pwMsg.text}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
            size="small"
            autoComplete="current-password"
            InputLabelProps={{ style: { color: textSecondary } }}
            inputProps={{ style: { color: textPrimary } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: isGamified ? 'rgba(168,85,247,0.3)' : undefined } } }}
          />
          <TextField
            label="New Password"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
            size="small"
            helperText="At least 8 characters"
            autoComplete="new-password"
            InputLabelProps={{ style: { color: textSecondary } }}
            inputProps={{ style: { color: textPrimary } }}
            FormHelperTextProps={{ style: { color: textSecondary } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: isGamified ? 'rgba(168,85,247,0.3)' : undefined } } }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
            size="small"
            autoComplete="new-password"
            InputLabelProps={{ style: { color: textSecondary } }}
            inputProps={{ style: { color: textPrimary } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: isGamified ? 'rgba(168,85,247,0.3)' : undefined } } }}
          />
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={pwLoading}
              sx={isGamified ? { background: 'linear-gradient(135deg,#7C3AED,#A855F7)', '&:hover': { background: 'linear-gradient(135deg,#6D28D9,#9333EA)' } } : {}}
            >
              {pwLoading ? 'Saving…' : 'Update Password'}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Section 6 — Research Info */}
      <Card sx={cardSx}>
        <SectionHeader
          icon={<InfoOutlinedIcon sx={{ color: isGamified ? '#A855F7' : '#1E40AF' }} />}
          title="Research Information"
          textPrimary={textPrimary}
        />
        <Typography variant="body2" sx={{ color: textSecondary, mb: 2, lineHeight: 1.7 }}>
          Your data is anonymised and used solely for this academic study. You were randomly
          assigned to <strong style={{ color: isGamified ? '#C084FC' : '#1E40AF' }}>
            {isGamified ? 'gamified' : 'standard'}
          </strong> mode. Participation is voluntary and you may withdraw at any time.
        </Typography>
        <Divider sx={{ mb: 2, borderColor: isGamified ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <AssignmentTurnedInIcon sx={{ color: isGamified ? '#A855F7' : '#1E40AF', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: textSecondary, flex: 1 }}>
            Once you have completed all lessons, please fill in the usability survey.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/survey')}
            sx={{ fontWeight: 700, flexShrink: 0 }}
          >
            Take Survey
          </Button>
        </Box>
      </Card>
    </Container>
  );
}
