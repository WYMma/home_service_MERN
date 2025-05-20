import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PhotoCamera as PhotoCameraIcon,
  CleaningServices as ServiceIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { formatImageUrl } from '../../utils/urlUtils';

const ServiceManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    business: ''
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    status: 'active',
    category: '',
    business: '',
    images: []
  });
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    status: 'active',
    category: '',
    business: '',
    images: []
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchServices(),
          fetchBusinesses(),
          fetchCategories()
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

  const fetchServices = async () => {
    try {
      const response = await adminApi.getServices();
      setServices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await adminApi.getBusinesses();
      setBusinesses(response.data);
    } catch (err) {
      enqueueSnackbar('Failed to fetch businesses', { variant: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setEditForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || '',
      status: service.status || 'active',
      category: service.category?._id || service.category || '',
      business: service.business?._id || service.business || '',
      images: service.images || []
    });
  };

  const handleDeleteService = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleUpdateService = async () => {
    try {
      const response = await adminApi.updateService(selectedService._id, editForm);
      setServices(prevServices => 
        prevServices.map(service => 
          service._id === response.data._id ? response.data : service
        )
      );
      setSelectedService(null);
      enqueueSnackbar('Service updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to update service', { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteService(selectedService._id);
      setServices(prevServices => 
        prevServices.filter(service => service._id !== selectedService._id)
      );
      setDeleteDialogOpen(false);
      setSelectedService(null);
      enqueueSnackbar('Service deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete service', { variant: 'error' });
    }
  };

  const handleCreateService = async () => {
    try {
      const response = await adminApi.createService(createForm);
      setServices(prevServices => [...prevServices, response.data]);
      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        description: '',
        price: '',
        duration: '',
        status: 'active',
        category: '',
        business: '',
        images: []
      });
      enqueueSnackbar('Service created successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to create service', { variant: 'error' });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: '',
      business: ''
    });
    setFilterAnchorEl(null);
  };

  const filterServices = () => {
    return services.filter(service => {
      const matchesSearch = 
        !searchTerm || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filters.status || service.status === filters.status;
      
      const matchesCategory = !filters.category || 
        (service.category && (
          (typeof service.category === 'string' && service.category === filters.category) ||
          (service.category._id === filters.category)
        ));
      
      const matchesBusiness = !filters.business || 
        (service.business && (
          (typeof service.business === 'string' && service.business === filters.business) ||
          (service.business._id === filters.business)
        ));
      
      return matchesSearch && matchesStatus && matchesCategory && matchesBusiness;
    });
  };

  const filteredServices = filterServices();

  const handleImageUpload = async (e, isCreate = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await adminApi.uploadImage(formData);

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

  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
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
            onClick={fetchServices}
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
          Service Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Add Service
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchServices}
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
                placeholder="Search services..."
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
                color={filters.status || filters.category || filters.business ? 'primary' : 'inherit'}
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  minWidth: '120px',
                  borderColor: filters.status || filters.category || filters.business ? 'primary.main' : 'divider',
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
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Business
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <MenuItem
                      key={'all-businesses'}
                      onClick={() => {
                        handleFilterChange('business', '');
                        setFilterAnchorEl(null);
                      }}
                      selected={filters.business === ''}
                    >
                      <ListItemIcon>
                        {filters.business === '' && <CheckIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>All Businesses</ListItemText>
                    </MenuItem>
                    {businesses.map((business) => (
                      <MenuItem
                        key={business._id}
                        onClick={() => {
                          handleFilterChange('business', business._id);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.business === business._id}
                      >
                        <ListItemIcon>
                          {filters.business === business._id && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{business.name}</ListItemText>
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
                    <TableCell>Business</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow 
                      key={service._id}
                      selected={selectedService?._id === service._id}
                      onClick={() => handleEditService(service)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.business?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {service.category
                          ? (typeof service.category === 'object' 
                              ? service.category.name 
                              : categories.find(c => c._id === service.category)?.name)
                          : 'None'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.status}
                          color={service.status === 'active' ? 'success' : service.status === 'pending' ? 'warning' : 'default'}
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
            {selectedService ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Edit Service
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
                          id="service-image-upload"
                          type="file"
                          multiple
                          onChange={(e) => handleImageUpload(e, false)}
                        />
                        <label htmlFor="service-image-upload">
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
                    multiline
                    rows={3}
                  />
                  <TextField
                    fullWidth
                    name="price"
                    label="Price"
                    value={editForm.price}
                    onChange={handleFormChange}
                    type="number"
                  />
                  <TextField
                    fullWidth
                    name="duration"
                    label="Duration (minutes)"
                    value={editForm.duration}
                    onChange={handleFormChange}
                    type="number"
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
                    <InputLabel>Business</InputLabel>
                    <Select
                      name="business"
                      value={editForm.business || ''}
                      onChange={handleFormChange}
                      label="Business"
                      required
                    >
                      {businesses.map(business => (
                        <MenuItem key={business._id} value={business._id}>
                          {business.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateService}
                      fullWidth
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteService(selectedService)}
                      fullWidth
                    >
                      Delete Service
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
                <ServiceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a Service to Edit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a service from the list to view and edit its details
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this service? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Service Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Service</DialogTitle>
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
                    id="create-service-image-upload"
                    type="file"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  <label htmlFor="create-service-image-upload">
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
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              name="price"
              label="Price"
              value={createForm.price}
              onChange={handleCreateFormChange}
              type="number"
            />
            <TextField
              fullWidth
              name="duration"
              label="Duration (minutes)"
              value={createForm.duration}
              onChange={handleCreateFormChange}
              type="number"
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
              <InputLabel>Business</InputLabel>
              <Select
                name="business"
                value={createForm.business || ''}
                onChange={handleCreateFormChange}
                label="Business"
                required
              >
                {businesses.map(business => (
                  <MenuItem key={business._id} value={business._id}>
                    {business.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateService} variant="contained" color="primary">
            Create Service
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceManagement; 