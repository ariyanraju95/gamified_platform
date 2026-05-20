import { Box, CircularProgress, Typography } from '@mui/material';

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
      <CircularProgress size={48} thickness={4} />
      <Typography color="text.secondary" variant="body2">{message}</Typography>
    </Box>
  );
}
