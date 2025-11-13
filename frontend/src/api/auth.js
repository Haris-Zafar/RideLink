import apiClient from './client';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  // Get current user
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  // Logout user
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },
};