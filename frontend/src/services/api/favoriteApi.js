import api from '../api';

// Get user's favorites
const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

// Add to favorites
const addToFavorites = async (businessId) => {
  const response = await api.post(`/favorites/${businessId}`);
  return response.data;
};

// Remove from favorites
const removeFromFavorites = async (businessId) => {
  const response = await api.delete(`/favorites/${businessId}`);
  return response.data;
};

// Check if business is favorited
const checkFavorite = async (businessId) => {
  const response = await api.get(`/favorites/check/${businessId}`);
  return response.data;
};

const favoriteApi = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
};

export default favoriteApi; 