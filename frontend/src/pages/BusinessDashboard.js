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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Avatar,
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
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { businessApi } from '../services/api';
import { bookingApi } from '../services/api/bookingApi';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import EmployeeManagement from '../components/dashboard/EmployeeManagement';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

// Dashboard Components
const Overview = ({ business }) => {
  console.log('Overview business data:', business);
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">Total Bookings</Typography>
          <Typography variant="h4" color="primary.main">{business?.totalBookings || 0}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">Total Revenue</Typography>
          <Typography variant="h4" color="success.main">{business?.totalRevenue?.toFixed(2) || '0.00'} TND</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">Average Rating</Typography>
          <Typography variant="h4" color="warning.main">{business?.averageRating?.toFixed(1) || 'N/A'}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">Active Services</Typography>
          <Typography variant="h4" color="info.main">{business?.activeServices || 0}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

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

const Bookings = ({ businessId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [businessId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings for businessId:', businessId);
      const response = await businessApi.getBookings(businessId);
      console.log('Bookings API response:', response);
      console.log('Response data:', response.data);
      setBookings(Array.isArray(response.data.bookings) ? response.data.bookings : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingApi.updateStatus(bookingId, { status: newStatus });
      await fetchBookings();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to update booking status');
      console.error('Error updating booking status:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Bookings
      </Typography>
      {bookings.length === 0 ? (
        <Alert severity="info">No bookings found</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>{booking.customer?.name || 'N/A'}</TableCell>
                <TableCell>{booking.service?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={
                      booking.status === 'confirmed'
                        ? 'success'
                        : booking.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(booking)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Booking Details
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Booking Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(selectedBooking.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {selectedBooking.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {selectedBooking.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Service: {selectedBooking.service?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name: {selectedBooking.customer?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {selectedBooking.customer?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {selectedBooking.customer?.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                {selectedBooking.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedBooking.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedBooking.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')}
                  >
                    Confirm Booking
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleStatusUpdate(selectedBooking._id, 'rejected')}
                  >
                    Reject Booking
                  </Button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'completed')}
                >
                  Mark as Completed
                </Button>
              )}
              {selectedBooking.status === 'completed' && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<AssessmentIcon />}
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'reviewed')}
                >
                  Mark as Reviewed
                </Button>
              )}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                >
                  Cancel Booking
                </Button>
              )}
              <Button 
                variant="outlined" 
                onClick={handleCloseDialog}
                sx={{ ml: 'auto' }}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
};

const Analytics = ({ business }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log('Fetching analytics for business:', business._id);
        const response = await businessApi.getAnalytics(business._id);
        console.log('Analytics response:', response.data);
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics');
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
  if (!analytics) return <Alert severity="info">No analytics data available</Alert>;

  const formatMonthName = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
    } catch (err) {
      return 'Invalid';
    }
  };

  // Ensure all required data exists
  const revenueData = analytics.revenueByMonth || [];
  const statusData = analytics.bookingStatusData || [];
  const popularServicesData = analytics.popularServices || [];
  const ratingData = analytics.ratingDistribution || [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Revenue by Month</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData.map(item => ({
                  ...item,
                  month: formatMonthName(item.date)
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`${value} TND`, 'Revenue']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Bookings by Status</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value, name, props) => [`${value} bookings`, props.payload.status]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Popular Services</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={popularServicesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="bookings" name="Bookings" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Customer Ratings</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ratingData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Ratings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const BusinessSettings = ({ business, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (business?.images) {
      setImages(business.images);
    }
  }, [business]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const uploadResponse = await businessApi.uploadImages(formData);
      console.log('Upload response:', uploadResponse.data);

      if (uploadResponse.data.images) {
        const imageUrls = uploadResponse.data.images;
        const updatedImages = [...images, ...imageUrls].slice(0, 10);
        setImages(updatedImages);
        
        // Update the business profile with new images
        const profileResponse = await businessApi.updateProfile({
          ...formik.values,
          images: updatedImages
        });
        
        if (onUpdate) {
          onUpdate(profileResponse.data);
        }
        setSuccess(true);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload images');
    }
  };

  const handleRemoveImage = async (imageUrl) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the API to delete the image
      await businessApi.deleteImage(imageUrl);
      
      // Update local state
      const updatedImages = images.filter(img => img !== imageUrl);
      setImages(updatedImages);
      
      // Update the business profile with the new images array
      const response = await businessApi.updateProfile({
        ...formik.values,
        images: updatedImages
      });
      
      // Update parent component
      if (onUpdate) {
        onUpdate(response.data);
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
      // Revert local state on error
      setImages(business.images);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return undefined;
    return imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
  };

  const formik = useFormik({
    initialValues: {
      name: business?.name || '',
      description: business?.description || '',
      address: (() => {
        if (!business?.address) {
          return {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          };
        }
        try {
          // If it's already an object, return it
          if (typeof business.address === 'object') {
            return business.address;
          }
          // If it's a string, try to parse it
          return JSON.parse(business.address);
        } catch (e) {
          // If parsing fails, return empty object
          console.error('Error parsing address:', e);
          return {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          };
        }
      })(),
      phone: business?.phone || '',
      email: business?.email || '',
      website: business?.website || '',
      images: business?.images || [],
      workingHours: business?.workingHours || {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: { open: 'closed', close: 'closed' },
      }
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Business name is required'),
      description: Yup.string().required('Description is required'),
      address: Yup.object().shape({
        street: Yup.string().required('Street is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        zipCode: Yup.string().required('ZIP code is required'),
        country: Yup.string().required('Country is required')
      }),
      phone: Yup.string().required('Phone number is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      website: Yup.string().url('Invalid website URL'),
      images: Yup.array().min(1, 'At least one image is required')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        // Check if there are any images
        if (images.length === 0) {
          setError('At least one image is required');
          return;
        }
        
        // Format address as a string
        const formattedAddress = JSON.stringify(values.address);
        
        // Include the current images in the update
        const response = await businessApi.updateProfile({
          ...values,
          address: formattedAddress,
          images: images
        });
        
        setSuccess(true);
        if (onUpdate) {
          onUpdate(response.data);
        }
      } catch (err) {
        console.error('Error updating business profile:', err);
        setError(err.response?.data?.message || 'Failed to update business profile');
      } finally {
        setLoading(false);
      }
    },
  });

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Business Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Business profile updated successfully!
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  multiline
                  rows={4}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formik.values.address.street}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                  helperText={formik.touched.address?.street && formik.errors.address?.street}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formik.values.address.city}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                  helperText={formik.touched.address?.city && formik.errors.address?.city}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formik.values.address.state}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                  helperText={formik.touched.address?.state && formik.errors.address?.state}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="address.zipCode"
                  value={formik.values.address.zipCode}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.zipCode && Boolean(formik.errors.address?.zipCode)}
                  helperText={formik.touched.address?.zipCode && formik.errors.address?.zipCode}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formik.values.address.country}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.country && Boolean(formik.errors.address?.country)}
                  helperText={formik.touched.address?.country && formik.errors.address?.country}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={formik.touched.website && formik.errors.website}
                />
              </Grid>

              {/* Business Images Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Images ({images.length}/10)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="business-image-upload"
                        type="file"
                        multiple
                        onChange={handleImageUpload}
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
                    {images.map((image, index) => (
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
                          onClick={() => handleRemoveImage(image)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Working Hours
            </Typography>
            <Paper sx={{ p: 2, boxShadow: 'none', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Grid container spacing={2}>
                {days.map((day) => (
                  <Grid item xs={12} key={day}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 2,
                      borderBottom: day !== 'sunday' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                      pb: day !== 'sunday' ? 2 : 0
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          width: '100px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {day}
                      </Typography>
                      <TextField
                        size="small"
                        label="Open"
                        type="time"
                        name={`workingHours.${day}.open`}
                        value={formik.values.workingHours[day].open}
                        onChange={formik.handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: '150px' }}
                      />
                      <TextField
                        size="small"
                        label="Close"
                        type="time"
                        name={`workingHours.${day}.close`}
                        value={formik.values.workingHours[day].close}
                        onChange={formik.handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: '150px' }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

const BusinessDashboard = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);
        if (!user || !user.token) {
          setError('You must be logged in to access this dashboard');
          return;
        }
        if (user.role !== 'business' && user.role !== 'admin') {
          setError('You must be a business user to access this dashboard');
          return;
        }
        console.log('Fetching business profile...');
        const response = await businessApi.getProfile();
        console.log('Business profile response:', response);
        setBusiness(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching business profile:', err);
        if (err.response?.status === 404) {
          // No business profile found, redirect to creation
          navigate('/business/profile/create');
        } else if (err.response?.status === 401) {
          // Unauthorized, redirect to login
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (err.response?.status === 400) {
          // Bad request, likely no business profile
          navigate('/business/profile/create');
        } else {
          setError('Failed to load business profile. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBusinessProfile();
    }
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBusinessUpdate = (updatedBusiness) => {
    setBusiness(updatedBusiness);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!business) return <Alert severity="warning">No business profile found</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          fontWeight: 'bold',
          color: 'primary.main'
        }}>
          {business.name} Dashboard
        </Typography>
        <Typography color="textSecondary" sx={{ 
          fontSize: { xs: '0.875rem', sm: '1rem' },
          mb: 2
        }}>
          Manage your business services, bookings, and analytics
        </Typography>
      </Box>

      <Paper 
        sx={{ 
          mb: 4,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          <Tab 
            icon={<DashboardIcon />} 
            label="Overview" 
            iconPosition="start"
          />
          <Tab 
            icon={<BusinessIcon />} 
            label="Services" 
            iconPosition="start"
          />
          <Tab 
            icon={<EventNoteIcon />} 
            label="Bookings" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="Analytics" 
            iconPosition="start"
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="Team" 
            iconPosition="start"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="Settings" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <Overview business={business} />}
        {activeTab === 1 && <Services business={business} />}
        {activeTab === 2 && <Bookings businessId={business._id} />}
        {activeTab === 3 && <Analytics business={business} />}
        {activeTab === 4 && <EmployeeManagement business={business} />}
        {activeTab === 5 && (
          <Paper sx={{ p: 3 }}>
            <BusinessSettings business={business} onUpdate={handleBusinessUpdate} />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default BusinessDashboard; 