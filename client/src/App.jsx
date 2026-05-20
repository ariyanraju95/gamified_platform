import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';
import standardTheme from './theme/standardTheme';
import gamifiedTheme from './theme/gamifiedTheme';
import Navbar from './components/common/Navbar';
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/common/ProtectedRoute';
import XPPopup from './components/gamified/XPPopup';
import useSession from './hooks/useSession';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LessonPage from './pages/LessonPage';
import Survey from './pages/Survey';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// Inner app — has access to AuthContext so can read user.mode for theme switching
function ThemedApp() {
  const { user, authReady } = useAuth();
  const theme = useMemo(
    () => (user?.mode === 'gamified' ? gamifiedTheme : standardTheme),
    [user?.mode]
  );
  useSession();

  // Wait for getMe() to resolve before rendering — ensures correct mode/theme from the start
  if (!authReady) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GamificationProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/lessons/:slug" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <XPPopup />
        </Box>
      </GamificationProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
