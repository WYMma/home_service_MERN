export const formatImageUrl = (imagePath) => {
  if (!imagePath) return '';
  const baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3000';
  return imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`;
}; 