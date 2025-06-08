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
    // List of public routes that don't require authentication
    const publicRoutes = [
      '/businesses',
      '/categories',
      '/login',
      '/register',
      '/about',
      '/services'
    ];

    // Check if the current request is for a public route
    const isPublicRoute = 
      // Check if it's a GET request to a public base route
      (publicRoutes.some(route => 
        config.url.startsWith(route) && 
        !config.url.includes('/profile') && 
        !config.url.includes('/bookings') &&
        !config.url.includes('/analytics') &&
        config.method === 'GET'
      )) ||
      // Check if it's a business details or services request
      (config.method === 'GET' && (
        /^\/businesses\/[^/]+$/.test(config.url) || // Business details
        /^\/businesses\/[^/]+\/services$/.test(config.url) // Business services
      ));

    // Only add token if it's not a public route
    if (!isPublicRoute) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
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
      // Get the current path
      const currentPath = window.location.pathname;
      // List of public routes that don't require authentication
      const publicRoutes = ['/', '/login', '/register', '/about', '/categories', '/businesses'];
      
      // Only redirect to login if the current route is not public
      if (!publicRoutes.some(route => 
        currentPath === route || 
        currentPath.startsWith(route + '/') ||
        /^\/businesses\/[^/]+$/.test(currentPath) || // Business details
        /^\/businesses\/[^/]+\/services$/.test(currentPath) // Business services
      )) {
        // Only redirect if the error message indicates an invalid token
        if (error.response.data?.message?.includes('token failed') || 
            error.response.data?.message?.includes('no token')) {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const businessApi = {
  // Public endpoints
  getAll: (params) => {
    // If we have a token, use the protected endpoint
    const token = localStorage.getItem('token');
    if (token) {
      return api.get('/businesses', { 
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    // Otherwise use the public endpoint
    return api.get('/businesses/public', { params });
  },
  getById: (id) => api.get(`/businesses/public/${id}`),
  getServices: (id) => api.get(`/businesses/public/${id}/services`),
  getReviews: (id) => api.get(`/businesses/public/${id}/reviews`),

  // Protected endpoints
  create: (data) => {
    // If data is FormData, set the correct content type
    if (data instanceof FormData) {
      return api.post('/businesses', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Otherwise, use default JSON content type
    return api.post('/businesses', data);
  },
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
  getProfile: () => api.get('/businesses/profile'),
  updateProfile: (data) => api.put('/businesses/profile', data),
  createService: (id, data) => api.post(`/businesses/${id}/services`, data),
  updateService: (businessId, serviceId, data) => 
    api.put(`/businesses/${businessId}/services/${serviceId}`, data),
  deleteService: (businessId, serviceId) => 
    api.delete(`/businesses/${businessId}/services/${serviceId}`),
  getBookings: (id) => api.get(`/businesses/${id}/bookings`),
  getAnalytics: (id) => api.get(`/businesses/${id}/analytics`),
  addReview: (id, data) => api.post(`/businesses/${id}/reviews`, data),
  uploadImages: (formData) => api.post('/businesses/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteImage: (imageUrl) => api.delete(`/businesses/images/${encodeURIComponent(imageUrl)}`),
  
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
  getUserBookings: () => api.get('/bookings/my'),
  getBusinessBookings: (businessId) => api.get(`/bookings/business/${businessId}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}`, data),
  getAvailableSlots: (businessId, date) =>
    api.get(`/bookings/${businessId}/slots`, { params: { date } }),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (data) => api.put('/users/settings', data),
  uploadProfileImage: (formData) => api.post('/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
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
  getAllCategories: () => api.get('/admin/categories'),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
  uploadImage: (formData) => api.post('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Booking management
  getAllBookings: () => api.get('/admin/bookings'),
  getBookings: () => api.get('/admin/bookings'),
  getBookingDetails: (bookingId) => api.get(`/admin/bookings/${bookingId}`),
  updateBooking: (bookingId, bookingData) => api.put(`/admin/bookings/${bookingId}`, bookingData),
  deleteBooking: (bookingId) => api.delete(`/admin/bookings/${bookingId}`),

  // Payment management
  getAllPayments: () => api.get('/admin/payments'),
  getPaymentDetails: (paymentId) => api.get(`/admin/payments/${paymentId}`),
  updatePaymentStatus: (paymentId, status) => api.put(`/admin/payments/${paymentId}/status`, { status }),
  getPaymentReport: (params) => api.get('/admin/payments/report', { params }),
  exportPayments: (params) => api.get('/admin/payments/report', { 
    params,
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.ms-excel'
    }
  }),
};

export const trainingProgramApi = {
  getAll: () => api.get('/training-programs'),
  getById: (id) => api.get(`/training-programs/${id}`),
  create: (data) => api.post('/training-programs', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, data) => api.put(`/training-programs/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/training-programs/${id}`),
};

export default api;
