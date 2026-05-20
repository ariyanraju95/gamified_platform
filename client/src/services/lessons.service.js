import api from './api';

export const getAllLessons = () => api.get('/lessons');
export const getLessonBySlug = (slug) => api.get(`/lessons/${slug}`);
