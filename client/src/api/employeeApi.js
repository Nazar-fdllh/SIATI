import api from './axiosInstance';

export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  getDepartments: () => api.get('/employees/departments'),
  getPositions: () => api.get('/employees/positions'),
};
