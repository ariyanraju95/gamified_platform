import { createTheme } from '@mui/material/styles';

const gamifiedTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#A855F7', light: '#C084FC', dark: '#7C3AED' },
    secondary: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
    background: { default: '#0D0B1E', paper: '#161130' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    success: { main: '#22c55e' },
    warning: { main: '#F59E0B' },
    error: { main: '#f87171' },
    // Custom XP colour
    xp: { main: '#F59E0B' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 800, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 10,
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)',
          boxShadow: '0 4px 20px rgba(168,85,247,0.45)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)',
            boxShadow: '0 6px 28px rgba(168,85,247,0.6)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
          boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          '&:hover': {
            boxShadow: '0 6px 28px rgba(245,158,11,0.55)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'linear-gradient(145deg, rgba(30,24,60,0.9) 0%, rgba(22,17,48,0.95) 100%)',
          border: '1px solid rgba(168,85,247,0.15)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 40px rgba(168,85,247,0.25)',
            borderColor: 'rgba(168,85,247,0.35)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 8 },
        colorPrimary: {
          background: 'rgba(168,85,247,0.2)',
          border: '1px solid rgba(168,85,247,0.4)',
          color: '#C084FC',
        },
        colorSecondary: {
          background: 'rgba(245,158,11,0.2)',
          border: '1px solid rgba(245,158,11,0.4)',
          color: '#FCD34D',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 10,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        bar: {
          borderRadius: 999,
          background: 'linear-gradient(90deg, #7C3AED, #A855F7, #F59E0B)',
          boxShadow: '0 0 12px rgba(168,85,247,0.6)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(13,11,30,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(168,85,247,0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            '& fieldset': { borderColor: 'rgba(168,85,247,0.25)' },
            '&:hover fieldset': { borderColor: 'rgba(168,85,247,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#A855F7' },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(168,85,247,0.15)' },
      },
    },
  },
});

export default gamifiedTheme;
