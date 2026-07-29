import api from './axiosInstance';

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getAttendanceChart: (days) => api.get('/dashboard/attendance-chart', { params: { days } }),
  getRecentActivities: (limit) => api.get('/dashboard/recent-activities', { params: { limit } }),
};
