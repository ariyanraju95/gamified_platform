import api from './api';

export const completeLesson = (data) => api.post('/progress', data);
export const getMyProgress = () => api.get('/progress/me');
