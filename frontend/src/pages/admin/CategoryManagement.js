import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Fab,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: '',
    description: '',
    imageUrl: '',
    icon: '',
    bgcolor: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('images', file);
    
    try {
      console.log('Uploading image:', file);
      const response = await adminApi.uploadImage(formData);
      console.log('Upload response:', response);
      // Add the backend base URL to the image path
      return `http://localhost:3000${response.data.urls[0]}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setCurrentCategory({
        _id: category._id,
        name: category.name || '',
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        icon: category.icon || '',
        bgcolor: category.bgcolor || ''
      });
      // Add the backend base URL to the image preview if it's not already a full URL
      setImagePreview(category.imageUrl ? 
        (category.imageUrl.startsWith('http') ? category.imageUrl : `http://localhost:3000${category.imageUrl}`) 
        : '');
      setIsEditing(true);
    } else {
      setCurrentCategory({
        name: '',
        description: '',
        imageUrl: '',
        icon: '',
        bgcolor: ''
      });
      setImagePreview('');
      setIsEditing(false);
    }
    setSelectedImage(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCategory = async () => {
    try {
      setUploadingImage(true);
      let imageUrl = currentCategory.imageUrl;
      console.log('Current category:', currentCategory);
      console.log('Selected image:', selectedImage);

      // If there's a new image selected, upload it
      if (selectedImage) {
        console.log('Uploading new image...');
        imageUrl = await uploadImage(selectedImage);
        console.log('New image URL:', imageUrl);
      }

      const categoryData = {
        ...currentCategory,
        imageUrl
      };
      console.log('Saving category with data:', categoryData);

      if (isEditing) {
        console.log('Updating category:', currentCategory._id);
        await adminApi.updateCategory(currentCategory._id, categoryData);
      } else {
        console.log('Creating new category');
        await adminApi.createCategory(categoryData);
      }
      
      fetchCategories();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminApi.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredCategories.length) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: -4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Category Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mr: 1 }}
          >
            Add Category
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCategories}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2, p: 2, boxShadow: 'none' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {filteredCategories
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category._id || Math.random()}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    borderColor: 'transparent'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={category.imageUrl ? 
                      (category.imageUrl.startsWith('http') ? category.imageUrl : `http://localhost:3000${category.imageUrl}`) 
                      : 'https://placehold.co/300x140/e9ecef/495057?text=No+Image'}
                    alt={category.name}
                    sx={{ 
                      objectFit: 'cover',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <CardContent sx={{ 
                    flexGrow: 1,
                    '&:last-child': {
                      pb: 2
                    }
                  }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {category.name || 'Unnamed Category'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description || 'No description available'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
          {filteredCategories.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">No categories found</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={filteredCategories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentCategory.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={currentCategory.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            {/* Image Upload Section */}
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="category-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="category-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {selectedImage ? 'Change Image' : 'Upload Image'}
                </Button>
              </label>
              
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              )}
            </Box>

            <TextField
              margin="dense"
              name="icon"
              label="Icon Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentCategory.icon}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              helperText="Enter a Material-UI icon name (e.g., 'Restaurant', 'ShoppingCart')"
            />
            <TextField
              margin="dense"
              name="bgcolor"
              label="Background Color"
              type="text"
              fullWidth
              variant="outlined"
              value={currentCategory.bgcolor}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              helperText="Enter a hex color code (e.g., '#FF5733')"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            color="primary"
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Update' : 'Add'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryManagement; 