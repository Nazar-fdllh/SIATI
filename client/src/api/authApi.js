import api from './axiosInstance';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};
