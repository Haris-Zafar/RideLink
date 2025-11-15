import api from './axios';

export const reviewsApi = {
  submitReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getUserReviews: async (userId, type) => {
    const response = await api.get(`/reviews/user/${userId}`, {
      params: type ? { type } : {}
    });
    return response.data;
  },

  getRideReviews: async (rideId) => {
    const response = await api.get(`/reviews/ride/${rideId}`);
    return response.data;
  },
};
