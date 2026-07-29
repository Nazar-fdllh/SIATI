import api from './axiosInstance';

export const leaveApi = {
  createRequest: (data) => api.post('/leaves', data),
  getMyRequests: (params) => api.get('/leaves/my-requests', { params }),
  getApprovals: (params) => api.get('/leaves/approvals', { params }),
  approve: (id, remarks) => api.post(`/leaves/${id}/approve`, { remarks }),
  reject: (id, remarks) => api.post(`/leaves/${id}/reject`, { remarks }),
  getBalances: (params) => api.get('/leaves/balances', { params }),
  getTypes: () => api.get('/leaves/types'),
  getDetail: (id) => api.get(`/leaves/${id}`),
};
