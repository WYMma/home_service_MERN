import api from './config';

const bookingApi = {
  create: (bookingData) => {
    return api.post('/bookings', bookingData);
  },

  getUserBookings: () => {
    return api.get('/bookings/user');
  },

  getBusinessBookings: (businessId, { page = 1, limit = 10 } = {}) => {
    return api.get(`/bookings/business/${businessId}`, {
      params: { page, limit }
    });
  },

  updateStatus: (bookingId, { status, cancellationReason }) => {
    return api.put(`/bookings/${bookingId}`, { status, cancellationReason });
  },

  getAvailableSlots: (businessId, date) => {
    return api.get(`/bookings/slots/${businessId}`, {
      params: { date }
    });
  }
};

export default bookingApi;
