import { authAxios } from '../../services/api/axiosInstance';

export const authService = {
  // Register user
  async register(userData) {
    const response = await authAxios.post('/users/register', userData);
    if (response.data) {
      const userData = {
        ...response.data,
        token: response.data.token
      };
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
  },

  // Login user
  async login(credentials) {
    const response = await authAxios.post('/users/login', credentials);
    if (response.data) {
      const userData = {
        ...response.data,
        token: response.data.token
      };
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem('user');
      return null;
    }
  }
};
