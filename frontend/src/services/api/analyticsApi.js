import api from '../api';

const analyticsApi = {
  getBusinessAnalytics: (businessId) => {
    return api.get(`/analytics/business/${businessId}`);
  },

  getBusinessInsights: (businessId) => {
    return api.get(`/analytics/business/${businessId}/insights`);
  }
};

export default analyticsApi;
