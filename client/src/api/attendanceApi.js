import api from './axiosInstance';

export const attendanceApi = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getToday: () => api.get('/attendance/today'),
  getHistory: (params) => api.get('/attendance/history', { params }),
  getAll: (params) => api.get('/attendance/all', { params }),
  getTeam: (params) => api.get('/attendance/team', { params }),
  getMonthlySummary: (params) => api.get('/attendance/monthly-summary', { params }),
  getMonitor: (params) => api.get('/attendance/monitor', { params }),
};
