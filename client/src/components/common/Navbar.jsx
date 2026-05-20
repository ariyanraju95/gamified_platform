import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Avatar, Menu, MenuItem, Divider, Chip, Tooltip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';

export default function Navbar() {
  const { user, logout, isAdmin, isGamified } = useAuth();
  const { state } = useGamification();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  const handleLogout = async () => {
    setAnchor(null);
    await logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1, minHeight: { xs: 64 } }}>
        {/* Logo */}
        <Box
          component={Link}
          to={user ? '/dashboard' : '/'}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexGrow: 1 }}
        >
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 2,
              background: isGamified
                ? 'linear-gradient(135deg,#7C3AED,#F59E0B)'
                : 'linear-gradient(135deg,#1E40AF,#3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <SchoolIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: isGamified
                ? 'linear-gradient(90deg,#C084FC,#F59E0B)'
                : 'linear-gradient(90deg,#1E40AF,#3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            PyLearn
          </Typography>
        </Box>

        {user ? (
          <>
            {/* Gamification quick stats */}
            {isGamified && state && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<WhatshotIcon sx={{ color: '#F59E0B !important', fontSize: 16 }} />}
                  label={state.currentStreak}
                  size="small"
                  sx={{
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    color: '#FCD34D',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                />
                <Chip
                  label={`${state.totalXP} XP`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                />
              </Box>
            )}

            {isAdmin && (
              <Tooltip title="Admin Dashboard">
                <IconButton onClick={() => navigate('/admin')} size="small">
                  <BarChartIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Avatar menu */}
            <Tooltip title={user.fullName}>
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
                <Avatar
                  sx={{
                    width: 36, height: 36,
                    background: isGamified
                      ? 'linear-gradient(135deg,#7C3AED,#A855F7)'
                      : 'linear-gradient(135deg,#1E40AF,#3B82F6)',
                    fontSize: '0.9rem', fontWeight: 700,
                  }}
                >
                  {user.fullName?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              PaperProps={{ sx: { minWidth: 180, borderRadius: 2, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" fontWeight={700}>{user.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { navigate('/profile'); setAnchor(null); }}>
                <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={Link} to="/login" variant="outlined" size="small">Login</Button>
            <Button component={Link} to="/register" variant="contained" size="small">Get Started</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
