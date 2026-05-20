import { Box, LinearProgress, Typography } from '@mui/material';

/**
 * Reusable labeled progress bar.
 * Props:
 *  value        — 0–100 percentage
 *  label        — optional text shown above bar (left side)
 *  rightLabel   — optional text shown above bar (right side)
 *  height       — bar height in px (default 8)
 *  color        — MUI color or hex string (default 'primary')
 *  showPercent  — append % to rightLabel automatically if no rightLabel given
 */
export default function ProgressBar({
  value = 0,
  label,
  rightLabel,
  height = 8,
  color = 'primary',
  showPercent = false,
  sx = {},
}) {
  const displayRight = rightLabel ?? (showPercent ? `${Math.round(value)}%` : undefined);
  const isCustomColor = color && !['primary', 'secondary', 'error', 'warning', 'info', 'success', 'inherit'].includes(color);

  return (
    <Box sx={sx}>
      {(label || displayRight) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          {label && (
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          )}
          {displayRight && (
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {displayRight}
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        color={isCustomColor ? 'primary' : color}
        sx={{
          height,
          borderRadius: height,
          ...(isCustomColor && {
            '& .MuiLinearProgress-bar': { backgroundColor: color },
          }),
        }}
      />
    </Box>
  );
}
