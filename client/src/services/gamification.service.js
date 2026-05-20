import api from './api';

export const getMyGamificationState = () => api.get('/gamification/me');
export const getLeaderboard = () => api.get('/leaderboard');
