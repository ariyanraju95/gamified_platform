import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // On every app load, refresh user from DB so mode changes made by admin take effect immediately
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthReady(true);
      return;
    }
    getMe()
      .then(({ data }) => {
        const fresh = { id: data.id, fullName: data.fullName, email: data.email, mode: data.mode, role: data.role, demographics: data.demographics || {}, createdAt: data.createdAt };
        localStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
      })
      .catch(() => {
        // Token expired or invalid — clear session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionId');
        setUser(null);
      })
      .finally(() => setAuthReady(true));
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await apiLogin({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('sessionId', data.sessionId);
      setUser(data.user);
      setSessionId(data.sessionId);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await apiRegister(formData);
      const fullUser = { id: data.user.id, fullName: data.user.fullName, email: data.user.email, mode: data.user.mode, role: data.user.role, demographics: data.user.demographics || {}, createdAt: data.user.createdAt };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setUser(fullUser);
      return { success: true, mode: data.user.mode };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await apiLogout(sessionId);
    } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    setUser(null);
    setSessionId(null);
  }, [sessionId]);

  const isAdmin = user?.role === 'admin';
  const isGamified = user?.mode === 'gamified';

  return (
    <AuthContext.Provider value={{ user, loading, authReady, login, register, logout, isAdmin, isGamified, sessionId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
