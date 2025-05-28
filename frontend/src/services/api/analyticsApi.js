import api from '../../services/api';

const analyticsApi = {
  getBusinessAnalytics: async (businessId) => {
    try {
      const response = await api.get(`/analytics/business/${businessId}`);
      return response;
    } catch (error) {
      console.error('Error in getBusinessAnalytics:', error);
      throw error;
    }
  },

  getBusinessInsights: async (businessId) => {
    try {
      const response = await api.get(`/analytics/business/${businessId}/insights`);
      return response;
    } catch (error) {
      console.error('Error in getBusinessInsights:', error);
      throw error;
    }
  }
};

export default analyticsApi;
