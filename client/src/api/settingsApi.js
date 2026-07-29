import axiosInstance from './axiosInstance';

export const reportApi = {
  downloadAttendanceExcel: (params) => axiosInstance.get('/reports/attendance/excel', { params, responseType: 'blob' }),
  downloadAttendancePDF: (params) => axiosInstance.get('/reports/attendance/pdf', { params, responseType: 'blob' }),
  downloadLeaveExcel: (params) => axiosInstance.get('/reports/leave/excel', { params, responseType: 'blob' }),
};

export const settingsApi = {
  // Holidays
  getHolidays: (year) => axiosInstance.get('/settings/holidays', { params: { year } }),
  createHoliday: (data) => axiosInstance.post('/settings/holidays', data),
  deleteHoliday: (id) => axiosInstance.delete(`/settings/holidays/${id}`),

  // Shifts
  getShifts: () => axiosInstance.get('/settings/shifts'),
  createShift: (data) => axiosInstance.post('/settings/shifts', data),
  updateShift: (id, data) => axiosInstance.put(`/settings/shifts/${id}`, data),

  // Audit Logs
  getAuditLogs: (params) => axiosInstance.get('/settings/audit-logs', { params }),

  // System Config
  getConfig: () => axiosInstance.get('/settings/config'),
  updateConfig: (data) => axiosInstance.put('/settings/config', data),
};
