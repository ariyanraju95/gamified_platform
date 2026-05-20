import { Box, Typography, Tooltip } from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';

export default function StreakDisplay({ currentStreak = 0, longestStreak = 0, size = 'medium' }) {
  const isOnFire = currentStreak >= 3;
  const isSmall = size === 'small';

  return (
    <Tooltip title={`Longest streak: ${longestStreak} days`} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isSmall ? 0.5 : 1,
          px: isSmall ? 1.5 : 2,
          py: isSmall ? 0.5 : 1,
          borderRadius: 3,
          background: currentStreak > 0
            ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))'
            : 'rgba(255,255,255,0.05)',
          border: currentStreak > 0
            ? '1px solid rgba(245,158,11,0.35)'
            : '1px solid rgba(255,255,255,0.08)',
          cursor: 'default',
          transition: 'all 0.3s ease',
          ...(isOnFire && {
            animation: 'pulseStreak 2s ease-in-out infinite',
            '@keyframes pulseStreak': {
              '0%,100%': { boxShadow: '0 0 8px rgba(245,158,11,0.3)' },
              '50%': { boxShadow: '0 0 20px rgba(245,158,11,0.6)' },
            },
          }),
        }}
      >
        <WhatshotIcon
          sx={{
            fontSize: isSmall ? 18 : 24,
            color: currentStreak > 0 ? '#F59E0B' : '#475569',
            filter: isOnFire ? 'drop-shadow(0 0 6px #F59E0B)' : 'none',
            transition: 'all 0.3s ease',
          }}
        />
        <Box>
          <Typography
            variant={isSmall ? 'body2' : 'h6'}
            sx={{
              fontWeight: 800,
              color: currentStreak > 0 ? '#FCD34D' : 'text.secondary',
              lineHeight: 1,
            }}
          >
            {currentStreak}
          </Typography>
          {!isSmall && (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              day streak
            </Typography>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}
