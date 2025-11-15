import api from './axios';

export const authApi = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  sendOTP: async () => {
    const response = await api.post('/auth/send-otp');
    return response.data;
  },

  verifyPhone: async (otp) => {
    const response = await api.post('/auth/verify-phone', { otp });
    return response.data;
  },
};
