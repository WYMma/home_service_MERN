import api from '../api';

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/my'),
  getBusinessBookings: (businessId) => api.get(`/bookings/business/${businessId}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}`, data),
  getAvailableSlots: (businessId, date) =>
    api.get(`/bookings/${businessId}/slots`, { params: { date } }),
};

export default bookingApi;
