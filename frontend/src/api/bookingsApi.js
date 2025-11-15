import api from './axios';

export const bookingsApi = {
  requestBooking: async (bookingData) => {
    const response = await api.post('/bookings/request', bookingData);
    return response.data;
  },

  getMyBookings: async (status) => {
    const response = await api.get('/bookings/my-bookings', {
      params: status ? { status } : {}
    });
    return response.data;
  },

  getRideBookings: async (rideId) => {
    const response = await api.get(`/bookings/ride/${rideId}`);
    return response.data;
  },

  approveBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/approve`);
    return response.data;
  },

  rejectBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/reject`);
    return response.data;
  },

  cancelBooking: async (id, reason) => {
    const response = await api.delete(`/bookings/${id}/cancel`, {
      data: { reason }
    });
    return response.data;
  },

  markPayment: async (id) => {
    const response = await api.put(`/bookings/${id}/payment`);
    return response.data;
  },
};
