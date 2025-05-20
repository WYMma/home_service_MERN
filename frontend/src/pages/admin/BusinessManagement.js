import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Business as BusinessIcon } from '@mui/icons-material';

const BusinessManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businessOwners, setBusinessOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    phone: '',
    email: '',
    status: 'active',
    category: '',
    user: '',
    images: []
  });
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    phone: '',
    email: '',
    status: 'active',
    category: '',
    user: '',
    images: []
  });

  const [noImagesDialogOpen, setNoImagesDialogOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        // First fetch categories
        await fetchCategories();
        // Then fetch businesses and business owners
        await Promise.all([
          fetchBusinesses(),
          fetchBusinessOwners()
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
        enqueueSnackbar('Failed to initialize data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      console.log('Categories fetched:', response.data);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await adminApi.getBusinesses();
      console.log('Businesses fetched:', response.data);
      
      // Make sure we have the categories loaded before continuing
      if (categories.length === 0) {
        await fetchCategories();
      }
      
      // Ensure businesses have populated category objects
      const enhancedBusinesses = response.data.map(business => {
        // If category is just an ID (not populated), add a placeholder object
        if (business.category && typeof business.category === 'string') {
          // Find the category in our categories array
          const matchingCategory = categories.find(c => c._id === business.category);
          if (matchingCategory) {
            business.category = matchingCategory;
          }
        }
        return business;
      });
      
      setBusinesses(enhancedBusinesses);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      enqueueSnackbar('Failed to fetch businesses', { variant: 'error' });
    }
  };

  const fetchBusinessOwners = async () => {
    try {
      const response = await adminApi.getUsers();
      setBusinessOwners(response.data.filter(u => u.role === 'business'));
    } catch (err) {
      enqueueSnackbar('Failed to fetch business owners', { variant: 'error' });
    }
  };

  const handleEditBusiness = (business) => {
    console.log('Editing business:', business);
    setSelectedBusiness(business);
    
    // Extract category from business object
    let categoryValue = '';
    if (business.category) {
      categoryValue = typeof business.category === 'object' 
        ? business.category._id 
        : business.category;
    }
    
    console.log('Setting category value:', categoryValue);
    console.log('Business images:', business.images);
    
    setEditForm({
      name: business.name || '',
      description: business.description || '',
      address: business.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      phone: business.phone || '',
      email: business.email || '',
      status: business.status || 'active',
      category: categoryValue,
      user: business.user?._id || business.user || '',
      images: business.images || []
    });
  };

  const handleDeleteBusiness = (business) => {
    setSelectedBusiness(business);
    setDeleteDialogOpen(true);
  };

  const handleUpdateBusiness = async () => {
    try {
      // Validate required fields
      if (!editForm.name || !editForm.email || !editForm.phone) {
        enqueueSnackbar('Please fill in all required fields', { 
          variant: 'error',
          autoHideDuration: 4000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        return;
      }
      if (!editForm.user) {
        enqueueSnackbar('Please select a business owner.', { 
          variant: 'error',
          autoHideDuration: 4000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        return;
      }
      if (!editForm.images || editForm.images.length === 0) {
        console.log('No images found, showing error message');
        enqueueSnackbar('Cannot save changes: At least one image is required', { 
          variant: 'error',
          autoHideDuration: 4000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          },
          preventDuplicate: false
        });
        return;
      }
      
      // Make sure user is sent as a string ID
      const userId = typeof editForm.user === 'object' 
        ? (editForm.user._id || '') 
        : editForm.user;
        
      if (!userId) {
        enqueueSnackbar('Invalid business owner selection', { 
          variant: 'error',
          autoHideDuration: 4000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
        return;
      }
      
      // Make sure category is sent as a string ID if present
      const categoryId = editForm.category
        ? (typeof editForm.category === 'object' 
            ? editForm.category._id 
            : editForm.category)
        : '';
      
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        address: editForm.address,
        phone: editForm.phone,
        email: editForm.email,
        status: editForm.status,
        category: categoryId || undefined,
        user: userId,
        images: editForm.images
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await adminApi.updateBusiness(selectedBusiness._id, updateData);
      console.log('Update response:', response.data);
      
      // Update the local state with the response data
      const updatedBusiness = response.data;
      setBusinesses(prevBusinesses => 
        prevBusinesses.map(business => 
          business._id === updatedBusiness._id ? updatedBusiness : business
        )
      );
      
      // Update the selected business with the new data
      setSelectedBusiness(updatedBusiness);
      
      enqueueSnackbar('Business updated successfully', { 
        variant: 'success',
        autoHideDuration: 4000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response?.data);
      enqueueSnackbar(err.response?.data?.message || 'Failed to update business', { 
        variant: 'error',
        autoHideDuration: 4000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteBusiness(selectedBusiness._id);
      fetchBusinesses();
      setDeleteDialogOpen(false);
      setSelectedBusiness(null);
      setEditForm({
        name: '',
        description: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        phone: '',
        email: '',
        status: 'active',
        category: '',
        user: '',
        images: []
      });
      enqueueSnackbar('Business deleted successfully', { variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete business');
      enqueueSnackbar('Failed to delete business', { variant: 'error' });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCreateBusiness = async () => {
    try {
      // Validate required fields
      if (!createForm.name || !createForm.email || !createForm.phone) {
        enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
        return;
      }
      if (!createForm.user) {
        enqueueSnackbar('Please select a business owner.', { variant: 'error' });
        return;
      }
      if (createForm.images.length === 0) {
        enqueueSnackbar('Please upload at least one image.', { variant: 'error' });
        return;
      }
      
      // Make sure user is sent as a string ID
      const userId = typeof createForm.user === 'object' 
        ? (createForm.user._id || '') 
        : createForm.user;
        
      if (!userId) {
        enqueueSnackbar('Invalid business owner selection', { variant: 'error' });
        return;
      }

      // Make sure category is sent as a string ID if present
      const categoryId = createForm.category
        ? (typeof createForm.category === 'object' 
            ? createForm.category._id 
            : createForm.category)
        : '';

      const createData = {
        name: createForm.name,
        description: createForm.description,
        address: createForm.address,
        phone: createForm.phone,
        email: createForm.email,
        status: createForm.status,
        category: categoryId || undefined,
        user: userId,
        images: createForm.images
      };

      console.log('Creating business with data:', createData);

      const response = await adminApi.createBusiness(createData);
      console.log('Create response:', response.data);

      await fetchBusinesses();
      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        description: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        phone: '',
        email: '',
        status: 'active',
        category: '',
        user: '',
        images: []
      });
      enqueueSnackbar('Business created successfully', { variant: 'success' });
    } catch (err) {
      console.error('Create error:', err);
      console.error('Error response:', err.response?.data);
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to create business. Please try again.',
        { variant: 'error' }
      );
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCreateForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCreateForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFilterChange = (e, value) => {
    if (e && e.target) {
      const { name, value: eventValue } = e.target;
      setFilters(prev => ({
        ...prev,
        [name]: eventValue
      }));
    } else if (typeof e === 'string') {
      setFilters(prev => ({
        ...prev,
        [e]: value
      }));
    }
  };

  const handleApplyFilters = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: ''
    });
    setFilterAnchorEl(null);
  };

  // Utility function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'None';
    
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Loading...';
  };

  const filterBusinesses = () => {
    return businesses.filter(business => {
      // Filter by search term
      const matchesSearch = 
        !searchTerm || 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = !filters.status || business.status === filters.status;
      
      // Filter by category
      const matchesCategory = !filters.category || 
        (business.category && (
          (typeof business.category === 'string' && business.category === filters.category) ||
          (business.category._id === filters.category)
        ));
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  const filteredBusinesses = filterBusinesses();

  const handleImageUpload = async (e, isCreate = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await adminApi.uploadImage(formData);
      console.log('Upload response:', response.data);

      if (response.data.success && response.data.urls) {
        const imageUrls = response.data.urls;
        
        if (isCreate) {
          setCreateForm(prev => ({
            ...prev,
            images: [...prev.images, ...imageUrls].slice(0, 10)
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            images: [...prev.images, ...imageUrls].slice(0, 10)
          }));
        }

        enqueueSnackbar('Images uploaded successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to upload images', { variant: 'error' });
    }
  };

  const handleRemoveImage = (index, isCreate = false) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSetMainImage = (index, isCreate = false) => {
    if (isCreate) {
      setCreateForm(prev => {
        const newImages = [...prev.images];
        const oldMain = prev.image;
        const newMain = newImages[index];
        newImages[index] = oldMain;
        return {
          ...prev,
          image: newMain,
          images: newImages
        };
      });
    } else {
      setEditForm(prev => {
        const newImages = [...prev.images];
        const oldMain = prev.image;
        const newMain = newImages[index];
        newImages[index] = oldMain;
        return {
          ...prev,
          image: newMain,
          images: newImages
        };
      });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return undefined;
    return imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchBusinesses}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: -4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Business Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Add Business
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBusinesses}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              height: '100%',
              border: 'none',
              backgroundColor: 'transparent'
            }}
          >
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                color={filters.status || filters.category ? 'primary' : 'inherit'}
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  minWidth: '120px',
                  borderColor: filters.status || filters.category ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                Filters
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => setFilterAnchorEl(null)}
                PaperProps={{
                  sx: { width: 300, maxWidth: '100%' }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {['', 'active', 'inactive', 'pending'].map((status) => (
                      <MenuItem
                        key={status || 'all'}
                        onClick={() => {
                          handleFilterChange('status', status);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.status === status}
                      >
                        <ListItemIcon>
                          {filters.status === status && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Statuses'}
                        </ListItemText>
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <MenuItem
                      key={'all-categories'}
                      onClick={() => {
                        handleFilterChange('category', '');
                        setFilterAnchorEl(null);
                      }}
                      selected={filters.category === ''}
                    >
                      <ListItemIcon>
                        {filters.category === '' && <CheckIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>All Categories</ListItemText>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem
                        key={category._id}
                        onClick={() => {
                          handleFilterChange('category', category._id);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.category === category._id}
                      >
                        <ListItemIcon>
                          {filters.category === category._id && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{category.name}</ListItemText>
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    onClick={() => {
                      handleClearFilters();
                      setFilterAnchorEl(null);
                    }}
                    color="inherit"
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Menu>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow 
                      key={business._id}
                      selected={selectedBusiness?._id === business._id}
                      onClick={() => handleEditBusiness(business)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <TableCell>{business.name}</TableCell>
                      <TableCell>{business.user?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {business.category
                          ? (typeof business.category === 'object' 
                              ? business.category.name 
                              : getCategoryName(business.category))
                          : 'None'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={business.status}
                          color={business.status === 'active' ? 'success' : business.status === 'pending' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%',
              border: 'none',
              backgroundColor: 'transparent'
            }}
          >
            {selectedBusiness ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Edit Business
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Images ({editForm.images.length}/10)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="business-image-upload"
                          type="file"
                          multiple
                          onChange={(e) => handleImageUpload(e, false)}
                        />
                        <label htmlFor="business-image-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<PhotoCameraIcon />}
                          >
                            Add Images
                          </Button>
                        </label>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {editForm.images.map((image, index) => (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <Avatar
                            src={getImageUrl(image)}
                            alt={`Image ${index + 1}`}
                            sx={{ width: 64, height: 64 }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: 'background.paper' }
                            }}
                            onClick={() => handleRemoveImage(index, false)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    name="name"
                    label="Name"
                    value={editForm.name}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    value={editForm.description}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="address.street"
                    label="Street"
                    value={editForm.address?.street || ''}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="address.city"
                    label="City"
                    value={editForm.address?.city || ''}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone"
                    value={editForm.phone}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    value={editForm.email}
                    onChange={handleFormChange}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={editForm.status}
                      onChange={handleFormChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={editForm.category || ''}
                      onChange={handleFormChange}
                      label="Category"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Business Owner</InputLabel>
                    <Select
                      name="user"
                      value={editForm.user || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, user: e.target.value }))}
                      label="Business Owner"
                      required
                    >
                      {businessOwners.map(owner => (
                        <MenuItem key={owner._id} value={owner._id}>
                          {owner.name} ({owner.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateBusiness}
                      fullWidth
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteBusiness(selectedBusiness)}
                      fullWidth
                    >
                      Delete Business
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 8
                }}
              >
                <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a Business to Edit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a business from the list to view and edit its details
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Business</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this business? All associated services will also be deleted. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Business Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Business</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Images ({createForm.images.length}/10)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="create-business-image-upload"
                    type="file"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  <label htmlFor="create-business-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Add Images
                    </Button>
                  </label>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {createForm.images.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Avatar
                      src={getImageUrl(image)}
                      alt={`Image ${index + 1}`}
                      sx={{ width: 64, height: 64 }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                      onClick={() => handleRemoveImage(index, true)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
            <TextField
              fullWidth
              name="name"
              label="Name"
              value={createForm.name}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={createForm.description}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="address.street"
              label="Street"
              value={createForm.address?.street || ''}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="address.city"
              label="City"
              value={createForm.address?.city || ''}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="phone"
              label="Phone"
              value={createForm.phone}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="email"
              label="Email"
              value={createForm.email}
              onChange={handleCreateFormChange}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={createForm.status}
                onChange={handleCreateFormChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={createForm.category || ''}
                onChange={handleCreateFormChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Business Owner</InputLabel>
              <Select
                name="user"
                value={createForm.user}
                onChange={e => setCreateForm(prev => ({ ...prev, user: e.target.value }))}
                label="Business Owner"
              >
                {businessOwners.map(owner => (
                  <MenuItem key={owner._id} value={owner._id}>
                    {owner.name} ({owner.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBusiness} variant="contained" color="primary">
            Create Business
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BusinessManagement; 