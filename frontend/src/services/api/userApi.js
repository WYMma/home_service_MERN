import axiosInstance from './axiosInstance';

// Get user profile
const getProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

// Update user profile
const updateProfile = async (userData) => {
  const response = await axiosInstance.put('/users/profile', userData);
  return response.data;
};

// Upload profile image
const uploadProfileImage = async (formData) => {
  const response = await axiosInstance.post('/users/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const userApi = {
  getProfile,
  updateProfile,
  uploadProfileImage,
};

export default userApi; 