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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSnackbar } from 'notistack';

const ServiceManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [services, setServices] = useState([]);
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
    category: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
    business: ''
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
    business: ''
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchServices(), fetchCategories()]);
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

  const fetchServices = async () => {
    try {
      const response = await adminApi.getServices();
      console.log('Services fetched:', response.data);
      setServices(response.data);
      if (response.data.length > 0 && response.data[0].business?._id) {
        setCreateForm(prev => ({
          ...prev,
          business: response.data[0].business._id
        }));
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      enqueueSnackbar('Failed to fetch services', { variant: 'error' });
    }
  };

  const handleEditService = (service) => {
    console.log('Editing service:', service);
    setSelectedService(service);
    setEditForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      category: service.category?._id || service.category || '',
      status: service.status || 'active',
      business: service.business?._id || service.business || ''
    });
  };

  const handleDeleteService = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleUpdateService = async () => {
    try {
      // Validate required fields
      if (!editForm.name || !editForm.business || !editForm.category) {
        enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
        return;
      }

      // Ensure price is a number
      const price = parseFloat(editForm.price);
      if (isNaN(price)) {
        enqueueSnackbar('Price must be a valid number', { variant: 'error' });
        return;
      }

      const updateData = {
        name: editForm.name,
        description: editForm.description,
        price: price,
        category: editForm.category,
        status: editForm.status,
        business: editForm.business,
        duration: 60 // Adding default duration
      };

      console.log('Updating service with data:', updateData);
      console.log('Service ID:', selectedService._id);

      const response = await adminApi.updateService(selectedService._id, updateData);
      console.log('Update response:', response.data);

      await fetchServices();
      
      // Keep the same service selected after update
      const updatedService = { ...selectedService, ...updateData };
      setSelectedService(updatedService);
      
      enqueueSnackbar('Service updated successfully', { variant: 'success' });
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response?.data);
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to update service. Please try again.',
        { variant: 'error' }
      );
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteService(selectedService._id);
      fetchServices();
      setDeleteDialogOpen(false);
      setSelectedService(null);
      setEditForm({
        name: '',
        description: '',
        price: '',
        category: '',
        status: 'active',
        business: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateService = async () => {
    try {
      // Validate required fields
      if (!createForm.name || !createForm.business || !createForm.category) {
        enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
        return;
      }

      // Ensure price is a number
      const price = parseFloat(createForm.price);
      if (isNaN(price)) {
        enqueueSnackbar('Price must be a valid number', { variant: 'error' });
        return;
      }

      const createData = {
        name: createForm.name,
        description: createForm.description,
        price: price,
        category: createForm.category,
        status: createForm.status,
        business: createForm.business,
        duration: 60
      };

      console.log('Creating service with data:', createData);

      const response = await adminApi.createService(createData);
      console.log('Create response:', response.data);

      await fetchServices();
      setCreateDialogOpen(false);
      setCreateForm(prev => ({
        name: '',
        description: '',
        price: '',
        category: '',
        status: 'active',
        business: prev.business
      }));
      enqueueSnackbar('Service created successfully', { variant: 'success' });
    } catch (err) {
      console.error('Create error:', err);
      console.error('Error response:', err.response?.data);
      enqueueSnackbar(
        err.response?.data?.message || 'Failed to create service. Please try again.',
        { variant: 'error' }
      );
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e, value) => {
    // If called with an event object
    if (e && e.target) {
      const { name, value: eventValue } = e.target;
      setFilters(prev => ({
        ...prev,
        [name]: eventValue
      }));
    } 
    // If called directly with name and value
    else if (typeof e === 'string') {
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

  const filteredServices = services.filter(service =>
    (service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filters.status || service.status === filters.status) &&
    (!filters.category || service.category?._id === filters.category)
  );

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
            onClick={() => {
              setError(null);
              fetchServices();
              fetchCategories();
            }}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Service Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Service
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left side - Service List */}
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
                      onClick={() => {
                        handleFilterChange('category', '');
                        setFilterAnchorEl(null);
                      }}
                      selected={!filters.category}
                    >
                      <ListItemIcon>
                        {!filters.category && <CheckIcon fontSize="small" />}
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
                    <TableCell>Business</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
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
                      <TableCell>{service.business?.name}</TableCell>
                      <TableCell>{service.category?.name}</TableCell>
                      <TableCell>${service.price}</TableCell>
                      <TableCell>
                        <Chip
                          label={service.status}
                          color={service.status === 'active' ? 'success' : 'error'}
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

        {/* Right side - Edit Form */}
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
                  <FormControl fullWidth>
                    <InputLabel>Business</InputLabel>
                    <Select
                      name="business"
                      value={editForm.business}
                      onChange={handleFormChange}
                      label="Business"
                    >
                      {services.map((service) => (
                        <MenuItem key={service.business._id} value={service.business._id}>
                          {service.business.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={editForm.category}
                      onChange={handleFormChange}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                    multiline
                    rows={4}
                    value={editForm.description}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="price"
                    label="Price"
                    type="number"
                    value={editForm.price}
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
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography variant="h6" color="text.secondary">
                  Select a service to edit
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
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Service</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Business</InputLabel>
              <Select
                name="business"
                value={createForm.business}
                onChange={handleCreateFormChange}
                label="Business"
                required
              >
                {services.map((service) => (
                  <MenuItem key={service.business._id} value={service.business._id}>
                    {service.business.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={createForm.category}
                onChange={handleCreateFormChange}
                label="Category"
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              multiline
              rows={4}
              value={createForm.description}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="price"
              label="Price"
              type="number"
              value={createForm.price}
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