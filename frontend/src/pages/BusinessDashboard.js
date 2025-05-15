import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { businessApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import EmployeeManagement from '../components/dashboard/EmployeeManagement';

// Dashboard Components
const Overview = ({ business }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Total Bookings</Typography>
        <Typography variant="h4">{business?.totalBookings || 0}</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Total Revenue</Typography>
        <Typography variant="h4">${business?.totalRevenue?.toFixed(2) || '0.00'}</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Average Rating</Typography>
        <Typography variant="h4">{business?.averageRating?.toFixed(1) || 'N/A'}</Typography>
      </Paper>
    </Grid>
  </Grid>
);

const Services = ({ business }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!business?._id) return;
      
      try {
        setLoading(true);
        const response = await businessApi.getServices(business._id);
        setServices(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [business?._id]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewService(prev => ({
        ...prev,
        image: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewService(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!business?._id) {
        setError('Business ID is required');
        return;
      }

      // Validate required fields
      if (!newService.name || !newService.description || !newService.price || !newService.duration || !newService.category) {
        setError('Please fill in all required fields');
        return;
      }

      const formData = new FormData();
      formData.append('name', newService.name);
      formData.append('description', newService.description);
      formData.append('price', newService.price);
      formData.append('duration', newService.duration);
      formData.append('category', newService.category);
      
      if (newService.image) {
        formData.append('image', newService.image);
      }

      const response = await businessApi.createService(business._id, formData);
      setServices(prev => [...prev, response.data]);
      setNewService({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        image: null
      });
      setImagePreview(null);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error creating service:', error);
      setError(error.response?.data?.message || 'Error creating service');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !services.length) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Services</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Service
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Array.isArray(services) && services.length > 0 ? (
          services.map((service) => (
            <Grid item xs={12} md={6} key={service._id}>
              <Paper sx={{ p: 3 }}>
                {service.image && (
                  <Box sx={{ mb: 2 }}>
                    <img
                      src={service.image}
                      alt={service.name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </Box>
                )}
                <Typography variant="h6">{service.name}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  ${service.price} - {service.duration} minutes
                </Typography>
                <Typography>{service.description}</Typography>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography>No services available. Add your first service to get started.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog 
        open={showAddDialog} 
        onClose={() => {
          setShowAddDialog(false);
          setNewService({
            name: '',
            description: '',
            price: '',
            duration: '',
            category: '',
            image: null,
          });
          setImagePreview(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
              onClick={() => document.getElementById('service-image-upload').click()}
            >
              {imagePreview ? (
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body1" color="text.secondary">
                    Click to upload service image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Max size: 5MB)
                  </Typography>
                </Box>
              )}
              <input
                id="service-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </Box>

            <TextField
              fullWidth
              label="Service Name"
              name="name"
              value={newService.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newService.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              required
            />
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={newService.price}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: <Typography>$</Typography>
              }}
            />
            <TextField
              fullWidth
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={newService.duration}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={newService.category}
                onChange={handleInputChange}
                label="Category"
                required
              >
                <MenuItem value="haircut">Haircut</MenuItem>
                <MenuItem value="coloring">Coloring</MenuItem>
                <MenuItem value="styling">Styling</MenuItem>
                <MenuItem value="treatment">Treatment</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddDialog(false);
            setNewService({
              name: '',
              description: '',
              price: '',
              duration: '',
              category: '',
              image: null,
            });
            setImagePreview(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddService} 
            variant="contained" 
            color="primary"
            disabled={!newService.name || !newService.description || !newService.price || !newService.duration || !newService.category || loading}
          >
            {loading ? 'Adding...' : 'Add Service'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const Bookings = ({ business }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await businessApi.getBookings(business._id);
        setBookings(response.data.bookings);
        setError(null);
      } catch (err) {
        setError('Failed to load bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (business?._id) {
      fetchBookings();
    }
  }, [business?._id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      {bookings.map((booking) => (
        <Grid item xs={12} key={booking._id}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">{booking.service.name}</Typography>
            <Typography color="textSecondary">
              {new Date(booking.date).toLocaleString()}
            </Typography>
            <Typography>Customer: {booking.customer.name}</Typography>
            <Typography>Status: {booking.status}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

const Analytics = ({ business }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await businessApi.getAnalytics(business._id);
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load analytics');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (business?._id) {
      fetchAnalytics();
    }
  }, [business?._id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Revenue by Month</Typography>
          {/* Add charts here */}
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Popular Services</Typography>
          {/* Add charts here */}
        </Paper>
      </Grid>
    </Grid>
  );
};

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        const response = await businessApi.getProfile();
        setBusiness(response.data);
        setError(null);
      } catch (err) {
        if (err.response?.status === 404) {
          setShowCreateDialog(true);
        } else {
          setError('Failed to load business profile');
          console.error('Error fetching business profile:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchBusinessProfile();
    }
  }, [user?._id]);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      category: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Tunisia',
      },
      workingHours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: { open: 'closed', close: 'closed' },
      },
      services: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Business name is required'),
      description: Yup.string().required('Description is required'),
      category: Yup.string().required('Category is required'),
      contactPerson: Yup.string().required('Contact person is required'),
      phone: Yup.string().required('Phone number is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      address: Yup.object({
        street: Yup.string().required('Street address is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        zipCode: Yup.string().required('ZIP code is required'),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const response = await businessApi.create(values);
        setBusiness(response.data);
        setShowCreateDialog(false);
        setError(null);
      } catch (err) {
        setError('Failed to create business profile');
        console.error('Error creating business profile:', err);
      }
    },
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!business) {
    return (
      <Dialog open={showCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create Business Profile</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Business Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="category"
                  label="Category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="contactPerson"
                  label="Contact Person"
                  value={formik.values.contactPerson}
                  onChange={formik.handleChange}
                  error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                  helperText={formik.touched.contactPerson && formik.errors.contactPerson}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address.street"
                  label="Street Address"
                  value={formik.values.address.street}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                  helperText={formik.touched.address?.street && formik.errors.address?.street}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="address.city"
                  label="City"
                  value={formik.values.address.city}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                  helperText={formik.touched.address?.city && formik.errors.address?.city}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="address.state"
                  label="State"
                  value={formik.values.address.state}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                  helperText={formik.touched.address?.state && formik.errors.address?.state}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="address.zipCode"
                  label="ZIP Code"
                  value={formik.values.address.zipCode}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.zipCode && Boolean(formik.errors.address?.zipCode)}
                  helperText={formik.touched.address?.zipCode && formik.errors.address?.zipCode}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create Business
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {business?.name} Dashboard
        </Typography>
        <Typography color="textSecondary">
          Manage your business services, bookings, and analytics
        </Typography>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<BusinessIcon />} label="Services" />
          <Tab icon={<EventNoteIcon />} label="Bookings" />
          <Tab icon={<AssessmentIcon />} label="Analytics" />
          <Tab icon={<PeopleIcon />} label="Team" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <Overview business={business} />}
        {activeTab === 1 && <Services business={business} />}
        {activeTab === 2 && <Bookings business={business} />}
        {activeTab === 3 && <Analytics business={business} />}
        {activeTab === 4 && <EmployeeManagement business={business} />}
        {activeTab === 5 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Business Settings</Typography>
            {/* Add settings form here */}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default BusinessDashboard; 