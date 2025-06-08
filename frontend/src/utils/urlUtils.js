export const formatImageUrl = (imagePath) => {
  if (!imagePath) return '';
  const baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3000';
  // If the path already starts with http, return it as is
  if (imagePath.startsWith('http')) return imagePath;
  // If the path starts with /uploads, it's already a full path
  if (imagePath.startsWith('/uploads')) return `${baseUrl}${imagePath}`;
  // Otherwise, assume it's a relative path and prepend /uploads
  return `${baseUrl}/uploads/${imagePath}`;
}; 