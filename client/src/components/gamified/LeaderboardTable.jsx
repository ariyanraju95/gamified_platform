import { Box, Typography, Avatar, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const RANK_STYLES = {
  1: { bg: 'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(245,158,11,0.15))', border: 'rgba(255,215,0,0.5)', color: '#FFD700', emoji: '🥇' },
  2: { bg: 'linear-gradient(135deg,rgba(192,192,192,0.2),rgba(148,163,184,0.1))', border: 'rgba(192,192,192,0.4)', color: '#C0C0C0', emoji: '🥈' },
  3: { bg: 'linear-gradient(135deg,rgba(205,127,50,0.2),rgba(180,120,40,0.1))', border: 'rgba(205,127,50,0.4)', color: '#CD7F32', emoji: '🥉' },
};

const Row = ({ entry, isCurrentUser }) => {
  const rankStyle = RANK_STYLES[entry.rank];
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        background: isCurrentUser
          ? 'rgba(168,85,247,0.15)'
          : rankStyle?.bg || 'rgba(255,255,255,0.03)',
        border: isCurrentUser
          ? '1px solid rgba(168,85,247,0.4)'
          : `1px solid ${rankStyle?.border || 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.2s',
        '&:hover': { background: isCurrentUser ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)' },
      }}
    >
      {/* Rank */}
      <Typography
        sx={{ fontWeight: 800, minWidth: 28, fontSize: rankStyle ? '1.2rem' : '0.95rem', color: rankStyle?.color || 'text.secondary' }}
      >
        {rankStyle?.emoji || `#${entry.rank}`}
      </Typography>

      {/* Avatar */}
      <Avatar
        sx={{
          width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700,
          background: isCurrentUser
            ? 'linear-gradient(135deg,#7C3AED,#A855F7)'
            : 'rgba(255,255,255,0.08)',
        }}
      >
        {entry.fullName?.[0]?.toUpperCase() || '?'}
      </Avatar>

      {/* Name */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: isCurrentUser ? '#C084FC' : 'text.primary' }}>
          {entry.fullName} {isCurrentUser && <Chip label="You" size="small" color="primary" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 700 }} />}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WhatshotIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
          <Typography variant="caption" color="text.secondary">{entry.currentStreak} day streak</Typography>
        </Box>
      </Box>

      {/* XP */}
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={800} sx={{ color: rankStyle?.color || '#A855F7' }}>
          {entry.totalXP.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="text.secondary">XP</Typography>
      </Box>
    </Box>
  );
};

export default function LeaderboardTable({ entries = [] }) {
  if (!entries.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography color="text.secondary">No entries yet — complete a lesson to appear!</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {entries.map((entry) => (
        <Row key={entry.rank} entry={entry} isCurrentUser={entry.isCurrentUser} />
      ))}
    </Box>
  );
}
