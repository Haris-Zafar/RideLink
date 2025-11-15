import api from './axios';

export const ridesApi = {
  createRide: async (rideData) => {
    const response = await api.post('/rides', rideData);
    return response.data;
  },

  searchRides: async (params) => {
    const response = await api.get('/rides/search', { params });
    return response.data;
  },

  getRide: async (id) => {
    const response = await api.get(`/rides/${id}`);
    return response.data;
  },

  getMyRides: async (status) => {
    const response = await api.get('/rides/my-rides', {
      params: status ? { status } : {}
    });
    return response.data;
  },

  updateRide: async (id, updates) => {
    const response = await api.put(`/rides/${id}`, updates);
    return response.data;
  },

  cancelRide: async (id) => {
    const response = await api.delete(`/rides/${id}`);
    return response.data;
  },

  completeRide: async (id) => {
    const response = await api.post(`/rides/${id}/complete`);
    return response.data;
  },
};
