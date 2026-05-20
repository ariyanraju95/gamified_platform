import { Box, LinearProgress, Typography, Chip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';

// XP thresholds per level
const getLevelInfo = (xp) => {
  const thresholds = [0, 200, 500, 1000, 1800, 3000];
  const labels = ['Rookie', 'Learner', 'Coder', 'Developer', 'Expert', 'Master'];
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i; break; }
  }
  const current = thresholds[level];
  const next = thresholds[level + 1] || thresholds[level] + 1000;
  const progress = ((xp - current) / (next - current)) * 100;
  return { level: level + 1, label: labels[level], progress: Math.min(progress, 100), next, current };
};

export default function XPBar({ totalXP = 0 }) {
  const { level, label, progress, next, current } = getLevelInfo(totalXP);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<BoltIcon sx={{ fontSize: 14, color: '#F59E0B !important' }} />}
            label={`Lv.${level} ${label}`}
            size="small"
            sx={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#FCD34D',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
          <Typography variant="caption" sx={{ color: '#A855F7', fontWeight: 700 }}>
            {totalXP.toLocaleString()} XP
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {next.toLocaleString()} XP to next level
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 10,
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #7C3AED, #A855F7, #F59E0B)',
            boxShadow: '0 0 12px rgba(168,85,247,0.7)',
            transition: 'width 1s ease',
          },
        }}
      />
    </Box>
  );
}
