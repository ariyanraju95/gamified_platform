import { Box, Card, Typography, Button, Chip, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';

/**
 * Standard mode sidebar panel — shown for control-group users.
 * Provides a clean progress summary without any gamification elements.
 * Mirrors the layout space occupied by the gamified sidebar so both
 * groups have an equivalent two-column dashboard layout.
 *
 * Props:
 *  completedCount  — number of lessons completed
 *  totalCount      — total number of lessons
 *  lessons         — full lesson list (array)
 *  completedIds    — Set of completed lesson _id values
 *  mySurvey        — survey response object | null (not submitted) | undefined (loading)
 */
export default function StandardProgressPanel({ completedCount, totalCount, lessons, completedIds, mySurvey }) {
  const navigate = useNavigate();
  const progressPct = totalCount ? (completedCount / totalCount) * 100 : 0;

  // Three most recently completed lessons
  const recentlyCompleted = lessons
    .filter((l) => completedIds.has(l._id))
    .slice(-3)
    .reverse();

  // Next lesson to do
  const nextLesson = lessons.find((l) => !completedIds.has(l._id));

  return (
    <Box>
      {/* Progress summary */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUpIcon sx={{ color: '#2563EB', fontSize: 22 }} />
          <Typography variant="h6" fontWeight={700}>
            Your Progress
          </Typography>
        </Box>

        <ProgressBar
          value={progressPct}
          label={`${completedCount} of ${totalCount} lessons completed`}
          showPercent
          height={10}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Box
            sx={{
              flex: 1, textAlign: 'center', p: 2, borderRadius: 2,
              background: 'rgba(30,64,175,0.06)',
              border: '1px solid rgba(30,64,175,0.15)',
            }}
          >
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1E40AF' }}>
              {completedCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completed
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1, textAlign: 'center', p: 2, borderRadius: 2,
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <Typography variant="h4" fontWeight={800} color="text.primary">
              {totalCount - completedCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Remaining
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Next lesson CTA */}
      {nextLesson && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Continue Learning
          </Typography>
          <Box
            sx={{
              p: 2, borderRadius: 2, mb: 2,
              background: 'rgba(30,64,175,0.04)',
              border: '1px solid rgba(30,64,175,0.12)',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Lesson {nextLesson.order} of {totalCount}
            </Typography>
            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.25 }}>
              {nextLesson.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                ~{nextLesson.estimatedMinutes} minutes
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate(`/lessons/${nextLesson.slug}`)}
          >
            Start Lesson
          </Button>
        </Card>
      )}

      {/* Recent completions */}
      {recentlyCompleted.length > 0 && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Recently Completed
          </Typography>
          <List dense disablePadding>
            {recentlyCompleted.map((lesson, idx) => (
              <Box key={lesson._id}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={lesson.title}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                </ListItem>
                {idx < recentlyCompleted.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Card>
      )}

      {/* Survey CTA */}
      {mySurvey === null && completedCount > 0 && (
        <Card
          sx={{
            p: 3,
            background: 'rgba(30,64,175,0.04)',
            border: '1px solid rgba(30,64,175,0.15)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <AssignmentTurnedInIcon sx={{ color: '#2563EB', fontSize: 22 }} />
            <Typography variant="h6" fontWeight={700}>
              Usability Survey
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {completedCount === totalCount
              ? 'You have finished all lessons! Please take the usability survey — your feedback is vital for this research.'
              : 'You can complete the survey at any point during your learning journey.'}
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AssignmentTurnedInIcon />}
            onClick={() => navigate('/survey')}
          >
            Take the Survey (~5 min)
          </Button>
        </Card>
      )}

      {mySurvey && (
        <Card
          sx={{
            p: 2.5,
            background: 'rgba(22,163,74,0.04)',
            border: '1px solid rgba(22,163,74,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentTurnedInIcon sx={{ color: '#16a34a', fontSize: 20 }} />
            <Typography variant="body2" fontWeight={700} sx={{ color: '#16a34a' }}>
              Survey submitted — thank you!
            </Typography>
          </Box>
          {mySurvey.susTotal !== undefined && (
            <Box sx={{ mt: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Your SUS Score
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ color: '#16a34a' }}>
                {Math.round(mySurvey.susTotal)}
              </Typography>
              <Chip label="out of 100" size="small" color="success" variant="outlined" sx={{ mt: 0.5 }} />
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
