import { Card, CardContent, Avatar, Box, Typography, Chip, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BoltIcon from '@mui/icons-material/Bolt';

/**
 * Lesson row card — used on the Dashboard lesson list.
 * Props:
 *  lesson      — lesson object from API
 *  isCompleted — user has finished this lesson
 *  isNext      — this is the next lesson to do (highlighted CTA)
 *  isLocked    — cannot be accessed yet
 *  isGamified  — whether the user is in gamified mode (shows XP)
 *  onClick     — called when card is clicked (only if not locked)
 */
export default function LessonCard({ lesson, isCompleted, isNext, isLocked, isGamified, onClick }) {
  const cardBg = isGamified
    ? 'linear-gradient(145deg,rgba(30,24,60,0.95),rgba(22,17,48,0.98))'
    : '#ffffff';
  const cardBorder = isGamified
    ? '1px solid rgba(168,85,247,0.18)'
    : '1px solid rgba(0,0,0,0.08)';
  const textPrimary = isGamified ? '#F1F5F9' : '#0F172A';
  const textSecondary = isGamified ? 'rgba(255,255,255,0.55)' : '#475569';

  return (
    <Card
      onClick={isLocked ? undefined : onClick}
      sx={{
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.5 : 1,
        background: cardBg,
        border: cardBorder,
        transition: 'box-shadow 0.2s',
        '&:hover': !isLocked ? {
          boxShadow: isGamified
            ? '0 4px 20px rgba(168,85,247,0.2)'
            : '0 4px 12px rgba(0,0,0,0.1)',
        } : {},
      }}
    >
      <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Lesson number / status avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
            opacity: isLocked ? 0.5 : 1,
            background: isCompleted
              ? 'linear-gradient(135deg,#16a34a,#22c55e)'
              : isLocked
                ? '#9CA3AF'
                : isGamified
                  ? 'linear-gradient(135deg,#7C3AED,#A855F7)'
                  : 'linear-gradient(135deg,#1E40AF,#3B82F6)',
          }}
        >
          {isCompleted ? (
            <CheckCircleIcon sx={{ fontSize: 20 }} />
          ) : isLocked ? (
            <LockIcon sx={{ fontSize: 18 }} />
          ) : (
            lesson.order
          )}
        </Avatar>

        {/* Title + meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={600} noWrap sx={{ color: textPrimary }}>
            {lesson.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            <AccessTimeIcon sx={{ fontSize: 13, color: textSecondary }} />
            <Typography variant="caption" sx={{ color: textSecondary }}>
              {lesson.estimatedMinutes} min
            </Typography>
            {isGamified && (
              <>
                <BoltIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                <Typography variant="caption" sx={{ color: '#FCD34D', fontWeight: 700 }}>
                  {lesson.xpReward} XP
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* Status badge / CTA */}
        <Box sx={{ flexShrink: 0 }}>
          {isCompleted ? (
            <Chip label="Done" color="success" size="small" sx={{ fontWeight: 700 }} />
          ) : isNext ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrowIcon />}
              sx={{
                fontWeight: 700,
                ...(isGamified && {
                  background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
                  '&:hover': { background: 'linear-gradient(135deg,#6D28D9,#9333EA)' },
                }),
              }}
            >
              Start
            </Button>
          ) : isLocked ? (
            <Chip
              icon={<LockIcon sx={{ fontSize: 14 }} />}
              label="Locked"
              size="small"
              variant="outlined"
              sx={{ opacity: 0.5 }}
            />
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}
