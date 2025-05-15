import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if the error message indicates an invalid token
      if (error.response.data?.message?.includes('token failed') || 
          error.response.data?.message?.includes('no token')) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const businessApi = {
  getAll: (params) => api.get('/businesses', { params }),
  getById: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
  getProfile: () => api.get('/businesses/profile'),
  updateProfile: (data) => api.put('/businesses/profile', data),
  getServices: (id) => api.get(`/businesses/${id}/services`),
  createService: (id, data) => api.post(`/businesses/${id}/services`, data),
  updateService: (businessId, serviceId, data) => 
    api.put(`/businesses/${businessId}/services/${serviceId}`, data),
  deleteService: (businessId, serviceId) => 
    api.delete(`/businesses/${businessId}/services/${serviceId}`),
  getBookings: (id) => api.get(`/businesses/${id}/bookings`),
  getAnalytics: (id) => api.get(`/businesses/${id}/analytics`),
  getReviews: (id) => api.get(`/businesses/${id}/reviews`),
  addReview: (id, data) => api.post(`/businesses/${id}/reviews`, data),
  
  // Employee management
  getBusinessEmployees: (id) => api.get(`/businesses/${id}/employees`),
  addBusinessEmployee: (id, data) => api.post(`/businesses/${id}/employees`, data),
  updateEmployeePermissions: (businessId, employeeId, data) => 
    api.put(`/businesses/${businessId}/employees/${employeeId}`, data),
  removeBusinessEmployee: (businessId, employeeId) => 
    api.delete(`/businesses/${businessId}/employees/${employeeId}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/user'),
  getBusinessBookings: (businessId) => api.get(`/bookings/business/${businessId}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  getAvailableSlots: (businessId, date) =>
    api.get(`/bookings/${businessId}/slots`, { params: { date } }),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (data) => api.put('/users/settings', data),
};

export const adminApi = {
  // Dashboard statistics
  getStats: () => api.get('/admin/stats'),

  // User management
  getUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  blockUser: (userId) => api.post(`/admin/users/${userId}/block`),
  unblockUser: (userId) => api.post(`/admin/users/${userId}/unblock`),

  // Service management
  getServices: () => api.get('/admin/services'),
  createService: (serviceData) => api.post('/admin/services', serviceData),
  updateService: (serviceId, serviceData) => api.put(`/admin/services/${serviceId}`, serviceData),
  deleteService: (serviceId) => api.delete(`/admin/services/${serviceId}`),
  approveService: (serviceId) => api.post(`/admin/services/${serviceId}/approve`),
  rejectService: (serviceId) => api.post(`/admin/services/${serviceId}/reject`),

  // Business management
  getBusinesses: () => api.get('/admin/businesses'),
  createBusiness: (businessData) => api.post('/admin/businesses', businessData),
  updateBusiness: (businessId, businessData) => api.put(`/admin/businesses/${businessId}`, businessData),
  deleteBusiness: (businessId) => api.delete(`/admin/businesses/${businessId}`),
  approveBusiness: (businessId) => api.post(`/admin/businesses/${businessId}/approve`),
  rejectBusiness: (businessId) => api.post(`/admin/businesses/${businessId}/reject`),

  // Category management
  getCategories: () => api.get('/admin/categories'),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),

  // Booking management
  getBookings: () => api.get('/admin/bookings'),
  updateBooking: (bookingId, bookingData) => api.put(`/admin/bookings/${bookingId}`, bookingData),
  deleteBooking: (bookingId) => api.delete(`/admin/bookings/${bookingId}`),
};

export default api;
