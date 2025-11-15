import api from './axios';

export const adminApi = {
  getAllUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  getAllReports: async (params) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  resolveReport: async (reportId, status, adminNotes) => {
    const response = await api.put(`/admin/reports/${reportId}/resolve`, {
      status,
      adminNotes,
    });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  submitReport: async (reportData) => {
    const response = await api.post('/admin/reports', reportData);
    return response.data;
  },
};
