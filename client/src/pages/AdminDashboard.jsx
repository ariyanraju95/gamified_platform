import { useState, useEffect } from 'react';
import {
  Container, Grid, Card, Typography, Box, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Paper, Accordion, AccordionSummary, AccordionDetails,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, IconButton, Tooltip, LinearProgress, Divider,
  Avatar, Collapse,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip as ChartTooltip, Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getSummary, getSurveyResults, exportData } from '../services/analytics.service';
import { getAllUsers, changeUserMode, getUserDetail } from '../services/admin.service';
import standardTheme from '../theme/standardTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top', labels: { color: '#374151', font: { size: 12, weight: '600' } } },
  },
  scales: {
    x: { ticks: { color: '#6B7280' }, grid: { color: 'rgba(0,0,0,0.06)' } },
    y: { ticks: { color: '#6B7280' }, grid: { color: 'rgba(0,0,0,0.06)' }, beginAtZero: true },
  },
};

const getSUSGradeColor = (score) => {
  if (score >= 85) return '#16a34a';
  if (score >= 70) return '#2563eb';
  if (score >= 50) return '#d97706';
  return '#dc2626';
};
const getSUSGradeLabel = (score) => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'OK';
  return 'Poor';
};

const SUS_QUESTIONS = [
  'I think I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think I would need technical support to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine most people would learn this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot before I could get going with this system.',
];

const fmtDuration = (seconds) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const fmtDateTime = (d) => d
  ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '—';

const StatCard = ({ icon, label, standard, gamified, unit = '' }) => (
  <Card sx={{ p: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
      <Box sx={{ color: '#6366f1' }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
    </Box>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#2563EB' }}>{standard}{unit}</Typography>
          <Typography variant="caption" color="text.secondary">Standard</Typography>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#7C3AED' }}>{gamified}{unit}</Typography>
          <Typography variant="caption" color="text.secondary">Gamified</Typography>
        </Box>
      </Grid>
    </Grid>
  </Card>
);

const exportAnalyticsCSV = async () => {
  try {
    const res = await exportData();
    const events = res.data;
    if (!events.length) return;
    const header = ['mode', 'eventType', 'timestamp', 'metadata'].join(',');
    const rows = events.map((e) => [
      e.mode,
      e.eventType,
      new Date(e.timestamp).toISOString(),
      `"${JSON.stringify(e.metadata || {}).replace(/"/g, '""')}"`,
    ].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pylearn_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Analytics export failed', err);
  }
};

const exportToCSV = (results) => {
  const header = [
    'Row', 'Mode', 'SUS Score', 'Grade', 'Submitted',
    ...SUS_QUESTIONS.map((_, i) => `Q${i + 1}`),
    'Enjoyed most', 'Frustrations', 'Would return?',
  ].join(',');
  const rows = results.map((r, i) => [
    i + 1, r.mode,
    r.susTotal?.toFixed(1) ?? '',
    getSUSGradeLabel(r.susTotal ?? 0),
    new Date(r.submittedAt).toISOString().split('T')[0],
    ...(r.susScores || []),
    `"${(r.openEndedQ1 || '').replace(/"/g, '""')}"`,
    `"${(r.openEndedQ2 || '').replace(/"/g, '""')}"`,
    `"${(r.openEndedQ3 || '').replace(/"/g, '""')}"`,
  ].join(','));
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pylearn_survey_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── User Detail Dialog ───────────────────────────────────────────────────────
function UserDetailDialog({ userId, open, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setDetail(null);
    getUserDetail(userId)
      .then((res) => setDetail(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, userId]);

  const TOTAL_LESSONS = 10;

  return (
    <MuiThemeProvider theme={standardTheme}>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, background: detail?.user?.mode === 'gamified' ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : 'linear-gradient(135deg,#1E40AF,#3B82F6)', fontSize: '0.9rem', fontWeight: 700 }}>
            {detail?.user?.fullName?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Typography fontWeight={800}>{detail?.user?.fullName || '...'}</Typography>
            <Typography variant="caption" color="text.secondary">{detail?.user?.email}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && detail && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Summary cards */}
            <Grid container spacing={2}>
              {[
                {
                  label: 'Lessons Completed',
                  value: `${detail.progress.length} / ${TOTAL_LESSONS}`,
                  icon: <CheckCircleIcon sx={{ color: '#16a34a' }} />,
                  sub: `${Math.round((detail.progress.length / TOTAL_LESSONS) * 100)}% complete`,
                },
                {
                  label: 'Total Time on Lessons',
                  value: fmtDuration(detail.progress.reduce((s, p) => s + (p.timeSpentSeconds || 0), 0)),
                  icon: <TimerIcon sx={{ color: '#2563EB' }} />,
                  sub: 'across all completed lessons',
                },
                {
                  label: 'Avg Exercise Score',
                  value: detail.progress.length
                    ? `${Math.round(detail.progress.reduce((s, p) => s + (p.exerciseScore || 0), 0) / detail.progress.length)}%`
                    : '—',
                  icon: <QuizIcon sx={{ color: '#7C3AED' }} />,
                  sub: 'average across completed lessons',
                },
                {
                  label: 'Sessions',
                  value: detail.sessions.total,
                  icon: <TrendingUpIcon sx={{ color: '#d97706' }} />,
                  sub: `Total: ${fmtDuration(detail.sessions.totalDurationSeconds)}`,
                },
              ].map(({ label, value, icon, sub }) => (
                <Grid item xs={6} sm={3} key={label}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', background: '#FAFAFA', textAlign: 'center' }}>
                    {icon}
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>{value}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: '0.65rem' }}>{sub}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Mode + last active */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={detail.user.mode === 'gamified' ? 'Gamified Mode' : 'Standard Mode'}
                size="small"
                sx={{
                  fontWeight: 700,
                  background: detail.user.mode === 'gamified' ? 'rgba(124,58,237,0.1)' : 'rgba(37,99,235,0.1)',
                  color: detail.user.mode === 'gamified' ? '#7C3AED' : '#2563EB',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Joined: {fmtDate(detail.user.createdAt)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last active: {fmtDateTime(detail.sessions.lastActiveAt)}
              </Typography>
            </Box>

            {/* Gamification stats (if available) */}
            {detail.gamification && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Gamification Stats</Typography>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Total XP', value: detail.gamification.totalXP, color: '#7C3AED' },
                    { label: 'Current Streak', value: `${detail.gamification.currentStreak} days`, color: '#f97316' },
                    { label: 'Longest Streak', value: `${detail.gamification.longestStreak} days`, color: '#d97706' },
                    { label: 'Badges', value: `${detail.gamification.badgesEarned} / 7`, color: '#b45309' },
                  ].map(({ label, value, color }) => (
                    <Grid item xs={6} sm={3} key={label}>
                      <Box sx={{ p: 1.5, borderRadius: 2, background: color + '12', border: `1px solid ${color}30`, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={800} sx={{ color }}>{value}</Typography>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Divider />

            {/* Per-lesson breakdown */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Lesson-by-Lesson Performance
              </Typography>
              {detail.progress.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No lessons completed yet.</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(0,0,0,0.03)' }}>
                        {['#', 'Lesson', 'Score', 'Q Correct', 'Attempts', 'Time Spent', 'Completed'].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.progress.map((p) => {
                        const scoreColor = p.exerciseScore >= 80 ? '#16a34a' : p.exerciseScore >= 50 ? '#d97706' : '#dc2626';
                        return (
                          <TableRow key={p.lessonOrder} hover>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{p.lessonOrder}</TableCell>
                            <TableCell sx={{ fontWeight: 600, maxWidth: 160 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>{p.lessonTitle}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 40, height: 6, borderRadius: 99, background: '#f0f0f0', overflow: 'hidden' }}>
                                  <Box sx={{ height: '100%', width: `${p.exerciseScore || 0}%`, background: scoreColor, borderRadius: 99 }} />
                                </Box>
                                <Typography variant="body2" fontWeight={700} sx={{ color: scoreColor }}>
                                  {p.exerciseScore ?? '—'}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {p.correctAnswers} / {p.totalQuestions}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={p.exerciseAttempts}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  background: p.exerciseAttempts > 1 ? 'rgba(234,179,8,0.15)' : 'rgba(22,163,74,0.12)',
                                  color: p.exerciseAttempts > 1 ? '#b45309' : '#16a34a',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.85rem' }}>
                              {fmtDuration(p.timeSpentSeconds)}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.8rem' }}>
                              {fmtDate(p.completedAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            {/* Current lesson status */}
            {detail.progress.length < TOTAL_LESSONS && (
              <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
                <Typography variant="body2" fontWeight={600} color="primary">
                  Currently on: Lesson {detail.progress.length + 1} of {TOTAL_LESSONS}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(detail.progress.length / TOTAL_LESSONS) * 100}
                  sx={{ mt: 1, borderRadius: 4, height: 6 }}
                />
              </Box>
            )}
            {detail.progress.length === TOTAL_LESSONS && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                This participant has completed all {TOTAL_LESSONS} lessons!
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
    </MuiThemeProvider>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(0);

  // User management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, newMode: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // User detail state
  const [detailDialog, setDetailDialog] = useState({ open: false, userId: null });

  useEffect(() => {
    Promise.all([getSummary(), getSurveyResults()])
      .then(([s, sv]) => { setSummary(s.data); setSurveyData(sv.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadUsers = () => {
    setUsersLoading(true);
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setUsersLoading(false));
  };

  useEffect(() => {
    if (activeTab === 1) loadUsers();
  }, [activeTab]);

  const handleModeSwitch = (user) => {
    const newMode = user.mode === 'standard' ? 'gamified' : 'standard';
    setConfirmDialog({ open: true, user, newMode });
  };

  const confirmModeSwitch = async () => {
    const { user, newMode } = confirmDialog;
    setConfirmDialog({ open: false, user: null, newMode: null });
    try {
      const res = await changeUserMode(user._id, newMode);
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
      loadUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Mode change failed', severity: 'error' });
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={48} />
    </Box>
  );

  const lessonChart = summary?.lessonCompletions ? {
    labels: summary.lessonCompletions.map((l) => `L${l.order}`),
    datasets: [
      { label: 'Standard', data: summary.lessonCompletions.map((l) => l.standard), backgroundColor: 'rgba(37,99,235,0.75)', borderRadius: 6 },
      { label: 'Gamified', data: summary.lessonCompletions.map((l) => l.gamified), backgroundColor: 'rgba(124,58,237,0.75)', borderRadius: 6 },
    ],
  } : null;

  const dau = summary?.dailyActiveUsers || {};
  const dauLabels = Object.keys(dau).sort().slice(-14);
  const dauChart = {
    labels: dauLabels.map((d) => d.slice(5)),
    datasets: [
      { label: 'Standard', data: dauLabels.map((d) => dau[d]?.standard || 0), borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.08)', tension: 0.4, fill: true },
      { label: 'Gamified', data: dauLabels.map((d) => dau[d]?.gamified || 0), borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.08)', tension: 0.4, fill: true },
    ],
  };

  const surveyResults = surveyData?.results || [];
  const surveySummary = surveyData?.summary;

  // User counts from users list (computed on demand when tab 1 is active)
  const standardCount = users.filter((u) => u.mode === 'standard').length;
  const gamifiedCount = users.filter((u) => u.mode === 'gamified').length;

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 3 } }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Chip label="Admin" color="primary" sx={{ mb: 1.5, fontWeight: 700 }} />
          <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
          <Typography color="text.secondary">Research data, participant activity, and mode management</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {activeTab === 0 && (
            <>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportAnalyticsCSV} size="small">
                Export Analytics CSV
              </Button>
              {surveyResults.length > 0 && (
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportToCSV(surveyResults)} size="small">
                  Export Survey CSV
                </Button>
              )}
            </>
          )}
          {activeTab === 1 && (
            <Tooltip title="Refresh participant list">
              <IconButton onClick={loadUsers} disabled={usersLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Analytics" />
          <Tab icon={<PersonSearchIcon />} iconPosition="start" label="Participant Activity" />
          <Tab icon={<ManageAccountsIcon />} iconPosition="start" label="Mode Management" />
        </Tabs>
      </Box>

      {/* ── TAB 0: Analytics ── */}
      {activeTab === 0 && <>

        {/* Registered user counts */}
        {summary?.userCounts && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Registered Participants', value: summary.userCounts.total, color: '#374151', bg: 'rgba(0,0,0,0.04)' },
              { label: 'Standard Mode Users', value: summary.userCounts.standard, color: '#2563EB', bg: 'rgba(37,99,235,0.07)' },
              { label: 'Gamified Mode Users', value: summary.userCounts.gamified, color: '#7C3AED', bg: 'rgba(124,58,237,0.07)' },
            ].map(({ label, value, color, bg }) => (
              <Grid item xs={12} sm={4} key={label}>
                <Card sx={{ p: 2.5, textAlign: 'center', background: bg, border: `1px solid ${color}25` }}>
                  <Typography variant="h3" fontWeight={800} sx={{ color }}>{value}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard icon={<AccessTimeIcon />} label="Avg Session Duration"
              standard={Math.round((summary?.avgSessionDuration?.standard || 0) / 60)}
              gamified={Math.round((summary?.avgSessionDuration?.gamified || 0) / 60)}
              unit=" min" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard icon={<PeopleIcon />} label="Survey Participants"
              standard={surveySummary?.standard || 0}
              gamified={surveySummary?.gamified || 0} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard icon={<AssignmentIcon />} label="Avg SUS Score"
              standard={surveySummary ? Math.round(surveySummary.avgSUSStandard) : 0}
              gamified={surveySummary ? Math.round(surveySummary.avgSUSGamified) : 0}
              unit="/100" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard icon={<BarChartIcon />} label="Total Responses"
              standard={surveySummary?.standard || 0}
              gamified={surveySummary?.gamified || 0} />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Lesson Completion by Mode</Typography>
              {lessonChart
                ? <Bar data={lessonChart} options={chartOptions} />
                : <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No data yet.</Typography></Box>}
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>SUS Score Comparison</Typography>
              {surveySummary && (surveySummary.standard > 0 || surveySummary.gamified > 0) ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { label: 'Standard', value: surveySummary.avgSUSStandard, color: '#2563EB' },
                    { label: 'Gamified', value: surveySummary.avgSUSGamified, color: '#7C3AED' },
                  ].map(({ label, value, color }) => (
                    <Box key={label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color }}>{label}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight={800}>{Math.round(value)}/100</Typography>
                          <Chip label={getSUSGradeLabel(value)} size="small"
                            sx={{ background: getSUSGradeColor(value) + '20', color: getSUSGradeColor(value), fontWeight: 700, fontSize: '0.7rem' }} />
                        </Box>
                      </Box>
                      <Box sx={{ height: 10, borderRadius: 99, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', borderRadius: 99, background: color, width: `${value}%`, transition: 'width 1s ease' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No survey data yet.</Typography></Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Daily Active Users — Last 14 Days</Typography>
              <Line data={dauChart} options={chartOptions} />
            </Card>
          </Grid>
        </Grid>

        {/* Survey submissions table */}
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Survey Submissions</Typography>
              <Typography variant="body2" color="text.secondary">
                {surveyResults.length} response{surveyResults.length !== 1 ? 's' : ''} — anonymised, no personal data shown
              </Typography>
            </Box>
            {surveyResults.length > 0 && (
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportToCSV(surveyResults)}>
                Export CSV
              </Button>
            )}
          </Box>

          {surveyResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1.5 }} />
              <Typography color="text.secondary">No survey responses collected yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: 'rgba(0,0,0,0.03)' }}>
                    {['#', 'Mode', 'SUS Score', 'Grade', 'Date', 'Responses'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {surveyResults.map((r, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Chip label={r.mode === 'gamified' ? 'Gamified' : 'Standard'} size="small"
                          sx={{ fontWeight: 700, background: r.mode === 'gamified' ? 'rgba(124,58,237,0.1)' : 'rgba(37,99,235,0.1)', color: r.mode === 'gamified' ? '#7C3AED' : '#2563EB' }} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={800} sx={{ color: getSUSGradeColor(r.susTotal) }}>
                          {r.susTotal?.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={getSUSGradeLabel(r.susTotal)} size="small"
                          sx={{ background: getSUSGradeColor(r.susTotal) + '20', color: getSUSGradeColor(r.susTotal), fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(r.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Accordion disableGutters elevation={0}
                          sx={{ background: 'transparent', '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}
                            sx={{ p: 0, minHeight: 'unset', '& .MuiAccordionSummary-content': { my: 0 } }}>
                            <Typography variant="caption" color="primary" fontWeight={600}>View</Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0, pt: 1.5 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              Item scores (1–5):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                              {(r.susScores || []).map((score, qi) => (
                                <Box key={qi} sx={{ textAlign: 'center', minWidth: 36, p: '4px 6px', borderRadius: 1, background: 'rgba(0,0,0,0.05)' }}>
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Q{qi + 1}</Typography>
                                  <Typography variant="caption" display="block" fontWeight={700}>{score}</Typography>
                                </Box>
                              ))}
                            </Box>
                            {[
                              { label: 'What did you enjoy most?', value: r.openEndedQ1 },
                              { label: 'What frustrated you or could be improved?', value: r.openEndedQ2 },
                              { label: 'Would you return to this platform?', value: r.openEndedQ3 },
                            ].map(({ label, value }) => value ? (
                              <Box key={label} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>"{value}"</Typography>
                              </Box>
                            ) : null)}
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

      </> /* end TAB 0 */}

      {/* ── TAB 1: Participant Activity ── */}
      {activeTab === 1 && (
        <ParticipantActivityTab
          onViewDetail={(userId) => setDetailDialog({ open: true, userId })}
        />
      )}

      {/* ── TAB 2: Mode Management ── */}
      {activeTab === 2 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Participant Mode Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Change an individual participant's mode between Standard and Gamified. Changes apply to one user at a time.
            </Typography>
          </Box>

          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PeopleIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1.5 }} />
              <Typography color="text.secondary">No participants registered yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: 'rgba(0,0,0,0.03)' }}>
                    {['#', 'Username', 'Email', 'Mode', 'XP', 'Streak', 'Badges', 'Registered', 'Action'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u, i) => {
                    const gs = u.gamification;
                    return (
                      <TableRow key={u._id} hover>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{u.fullName}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{u.email}</TableCell>
                        <TableCell>
                          <Chip label={u.mode === 'gamified' ? 'Gamified' : 'Standard'} size="small"
                            sx={{ fontWeight: 700, background: u.mode === 'gamified' ? 'rgba(124,58,237,0.1)' : 'rgba(37,99,235,0.1)', color: u.mode === 'gamified' ? '#7C3AED' : '#2563EB' }} />
                        </TableCell>
                        <TableCell>
                          {gs ? <Typography variant="body2" fontWeight={700} sx={{ color: '#7C3AED' }}>{gs.totalXP} XP</Typography>
                            : <Typography variant="body2" color="text.disabled">—</Typography>}
                        </TableCell>
                        <TableCell>
                          {gs ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ color: gs.currentStreak >= 3 ? '#f97316' : 'text.primary' }}>
                                🔥 {gs.currentStreak}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">/ best {gs.longestStreak}</Typography>
                            </Box>
                          ) : <Typography variant="body2" color="text.disabled">—</Typography>}
                        </TableCell>
                        <TableCell>
                          {gs ? (
                            <Chip label={`${gs.badgesEarned} / 7`} size="small"
                              sx={{ fontWeight: 700, background: gs.badgesEarned > 0 ? 'rgba(234,179,8,0.15)' : 'rgba(0,0,0,0.05)', color: gs.badgesEarned > 0 ? '#b45309' : 'text.secondary' }} />
                          ) : <Typography variant="body2" color="text.disabled">—</Typography>}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" startIcon={<SwapHorizIcon />}
                            onClick={() => handleModeSwitch(u)}
                            sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                            Switch to {u.mode === 'standard' ? 'Gamified' : 'Standard'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* User Detail Dialog */}
      <UserDetailDialog
        open={detailDialog.open}
        userId={detailDialog.userId}
        onClose={() => setDetailDialog({ open: false, userId: null })}
      />

      {/* Confirm mode-switch dialog */}
      <MuiThemeProvider theme={standardTheme}>
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null, newMode: null })}>
        <DialogTitle fontWeight={700}>Confirm Mode Change</DialogTitle>
        <DialogContent>
          <Typography>
            Switch <strong>{confirmDialog.user?.fullName}</strong> from{' '}
            <strong>{confirmDialog.user?.mode}</strong> to{' '}
            <strong>{confirmDialog.newMode}</strong> mode?
          </Typography>
          {confirmDialog.newMode === 'gamified' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              A new Gamification State record will be created for this user if one does not already exist.
            </Alert>
          )}
          {confirmDialog.newMode === 'standard' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              The user's gamification data (XP, streaks, badges) will be preserved but hidden from their view.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, user: null, newMode: null })}>Cancel</Button>
          <Button variant="contained" onClick={confirmModeSwitch} startIcon={<SwapHorizIcon />}>Confirm Switch</Button>
        </DialogActions>
      </Dialog>
      </MuiThemeProvider>

      {/* Snackbar feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Container>
  );
}

// ── Single expandable participant row ────────────────────────────────────────
function ParticipantRow({ user, index, onViewDetail }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const TOTAL_LESSONS = 10;

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && !detail) {
        setLoadingDetail(true);
        getUserDetail(user._id)
          .then((res) => setDetail(res.data))
          .catch(console.error)
          .finally(() => setLoadingDetail(false));
      }
      return next;
    });
  };

  const done = detail?.progress?.length ?? null;
  const score = detail?.progress?.length
    ? Math.round(detail.progress.reduce((s, p) => s + (p.exerciseScore || 0), 0) / detail.progress.length)
    : null;
  const time = detail?.progress
    ? detail.progress.reduce((s, p) => s + (p.timeSpentSeconds || 0), 0)
    : null;

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: open ? 'none' : undefined }, cursor: 'pointer' }} onClick={handleToggle}>
        <TableCell sx={{ width: 40, py: 1 }}>
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{index + 1}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, background: user.mode === 'gamified' ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : 'linear-gradient(135deg,#1E40AF,#3B82F6)' }}>
              {user.fullName[0].toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>{user.email}</TableCell>
        <TableCell>
          <Chip label={user.mode === 'gamified' ? 'Gamified' : 'Standard'} size="small"
            sx={{ fontWeight: 700, fontSize: '0.7rem', background: user.mode === 'gamified' ? 'rgba(124,58,237,0.1)' : 'rgba(37,99,235,0.1)', color: user.mode === 'gamified' ? '#7C3AED' : '#2563EB' }} />
        </TableCell>
        <TableCell sx={{ minWidth: 140 }}>
          {done !== null ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress variant="determinate" value={(done / TOTAL_LESSONS) * 100}
                sx={{ flex: 1, borderRadius: 4, height: 6, minWidth: 60 }} />
              <Typography variant="caption" fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>{done}/{TOTAL_LESSONS}</Typography>
            </Box>
          ) : <Typography variant="caption" color="text.disabled">expand to load</Typography>}
        </TableCell>
        <TableCell>
          {score !== null
            ? <Typography variant="body2" fontWeight={700} sx={{ color: score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626' }}>{score}%</Typography>
            : <Typography variant="caption" color="text.disabled">—</Typography>}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.82rem' }}>
          {time !== null ? fmtDuration(time) : '—'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.8rem' }}>
          {detail ? fmtDateTime(detail.sessions?.lastActiveAt) : '—'}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Open full detail dialog">
            <IconButton size="small" onClick={() => onViewDetail(user._id)}>
              <PersonSearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Expanded detail row */}
      <TableRow>
        <TableCell colSpan={10} sx={{ py: 0, border: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {loadingDetail && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              )}
              {detail && (
                <Box>
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[
                      { label: 'Lessons Done', value: `${detail.progress.length}/${TOTAL_LESSONS}` },
                      { label: 'Avg Score', value: score !== null ? `${score}%` : '—' },
                      { label: 'Total Time', value: fmtDuration(time) },
                      { label: 'Sessions', value: detail.sessions.total },
                      { label: 'Total Session Time', value: fmtDuration(detail.sessions.totalDurationSeconds) },
                      { label: 'Last Active', value: fmtDateTime(detail.sessions.lastActiveAt) },
                    ].map(({ label, value }) => (
                      <Grid item xs={6} sm={4} md={2} key={label}>
                        <Box sx={{ p: 1.5, borderRadius: 2, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight={800}>{value}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {detail.gamification && (
                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                      {[
                        { label: 'XP', value: detail.gamification.totalXP, color: '#7C3AED' },
                        { label: 'Streak', value: `${detail.gamification.currentStreak}d`, color: '#f97316' },
                        { label: 'Best Streak', value: `${detail.gamification.longestStreak}d`, color: '#d97706' },
                        { label: 'Badges', value: `${detail.gamification.badgesEarned}/7`, color: '#b45309' },
                      ].map(({ label, value, color }) => (
                        <Grid item xs={6} sm={3} key={label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, background: color + '12', border: `1px solid ${color}30`, textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight={800} sx={{ color }}>{value}</Typography>
                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {detail.progress.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: 'rgba(0,0,0,0.03)' }}>
                            {['#', 'Lesson', 'Score', 'Correct / Total', 'Attempts', 'Time Spent', 'Completed'].map((h) => (
                              <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {detail.progress.map((p) => {
                            const sc = p.exerciseScore ?? 0;
                            const scoreColor = sc >= 80 ? '#16a34a' : sc >= 50 ? '#d97706' : '#dc2626';
                            return (
                              <TableRow key={p.lessonOrder} hover>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>{p.lessonOrder}</TableCell>
                                <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>
                                  <Typography variant="body2" fontWeight={600}>{p.lessonTitle}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 36, height: 5, borderRadius: 99, background: '#f0f0f0', overflow: 'hidden' }}>
                                      <Box sx={{ height: '100%', width: `${sc}%`, background: scoreColor }} />
                                    </Box>
                                    <Typography variant="body2" fontWeight={700} sx={{ color: scoreColor }}>{sc}%</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>{p.correctAnswers} / {p.totalQuestions}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={p.exerciseAttempts} size="small"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem', background: p.exerciseAttempts > 1 ? 'rgba(234,179,8,0.15)' : 'rgba(22,163,74,0.12)', color: p.exerciseAttempts > 1 ? '#b45309' : '#16a34a' }} />
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmtDuration(p.timeSpentSeconds)}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{fmtDate(p.completedAt)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No lessons completed yet.</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ── Participant Activity Tab ───────────────────────────────────────────────────
function ParticipantActivityTab({ onViewDetail }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (users.length === 0) return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <PeopleIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1.5 }} />
      <Typography color="text.secondary">No participants registered yet.</Typography>
    </Box>
  );

  const standardCount = users.filter((u) => u.mode === 'standard').length;
  const gamifiedCount = users.filter((u) => u.mode === 'gamified').length;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Participants', value: users.length, color: '#374151' },
          { label: 'Standard Mode', value: standardCount, color: '#2563EB' },
          { label: 'Gamified Mode', value: gamifiedCount, color: '#7C3AED' },
        ].map(({ label, value, color }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={800} sx={{ color }}>{value}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>All Participants</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Click a row to expand per-lesson timing, scores, and quiz performance.
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: 'rgba(0,0,0,0.03)' }}>
                {['', '#', 'Username', 'Email', 'Mode', 'Progress', 'Avg Score', 'Time', 'Last Active', 'Detail'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, i) => (
                <ParticipantRow key={u._id} user={u} index={i} onViewDetail={onViewDetail} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
