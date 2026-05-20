import { createTheme } from '@mui/material/styles';

const standardTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1E40AF', light: '#3B82F6', dark: '#1e3a8a' },
    secondary: { main: '#0891b2', light: '#22d3ee', dark: '#0e7490' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0f172a', secondary: '#475569' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
          boxShadow: '0 4px 14px rgba(30,64,175,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
            boxShadow: '0 6px 20px rgba(30,64,175,0.45)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid rgba(226,232,240,0.8)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, height: 8, backgroundColor: '#E2E8F0' },
        bar: { borderRadius: 999 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226,232,240,0.8)',
          boxShadow: 'none',
          color: '#0f172a',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
  },
});

export default standardTheme;
