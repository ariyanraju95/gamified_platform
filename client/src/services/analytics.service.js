import api from './api';

export const getSummary = () => api.get('/analytics/summary');
export const exportData = () => api.get('/analytics/export');
export const submitSurvey = (data) => api.post('/survey', data);
export const getSurveyResults = () => api.get('/survey/results');
export const getMySurvey = () => api.get('/survey/me');

// Client-side event logging — fires page_visit / lesson_start / quiz_attempt events
export const logClientEvent = (eventType, metadata = {}) =>
  api.post('/analytics/event', { eventType, metadata });
