import api from './api';

export const getAllUsers = () => api.get('/admin/users');
export const changeUserMode = (userId, mode) =>
  api.put(`/admin/users/${userId}/mode`, { mode });
export const getUserDetail = (userId) => api.get(`/admin/users/${userId}/detail`);
