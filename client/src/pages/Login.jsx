import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Card, Typography, TextField, Button,
  Alert, CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';

export default function Login() {
  const { login, loading } = useAuth();
  const { refresh } = useGamification();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      await refresh();
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg,#0D0B1E,#1a1035,#0D0B1E)',
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            p: { xs: 3, sm: 5 },
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: 3, mb: 2,
                background: 'linear-gradient(135deg,#7C3AED,#F59E0B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
              }}
            >
              <SchoolIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#0F172A' }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
              Sign in to continue your learning journey
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                fullWidth
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', mt: 0.5 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
            New here?{' '}
            <Link to="/register" style={{ color: '#A855F7', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
