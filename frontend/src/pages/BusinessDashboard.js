import React, { useState, useEffect, useCallback } from 'react';
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
  Edit as EditIcon,
} from '@mui/icons-material';
import { businessApi, categoryApi } from '../services/api';
import { bookingApi } from '../services/api/bookingApi';
import analyticsApi from '../services/api/analyticsApi';
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
import { formatImageUrl } from '../utils/urlUtils';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

// Dashboard Components
const Overview = ({ business }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log('Fetching analytics for business:', business._id);
        const response = await analyticsApi.getBusinessAnalytics(business._id);
        console.log('Analytics response:', response.data);
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || 'Échec du chargement des analyses');
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
  if (!analytics) return <Alert severity="info">Aucune donnée d'analyse disponible</Alert>;

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
          <Typography variant="h6" gutterBottom color="text.secondary">Réservations Totales</Typography>
          <Typography variant="h4" color="primary.main">{analytics.totalBookings || 0}</Typography>
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
          <Typography variant="h6" gutterBottom color="text.secondary">Revenu Total</Typography>
          <Typography variant="h4" color="success.main">{analytics.totalRevenue?.toFixed(2) || '0.00'} TND</Typography>
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
          <Typography variant="h6" gutterBottom color="text.secondary">Note Moyenne</Typography>
          <Typography variant="h4" color="warning.main">{analytics.averageRating?.toFixed(1) || 'N/A'}</Typography>
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
          <Typography variant="h6" gutterBottom color="text.secondary">Services Actifs</Typography>
          <Typography variant="h4" color="info.main">{analytics.totalServices || 0}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

const Services = ({ business }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!business?._id) return;
      
      try {
        setLoading(true);
        const [servicesResponse, categoriesResponse] = await Promise.all([
          businessApi.getServices(business._id),
          categoryApi.getAll()
        ]);
        setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Échec du chargement des données');
        setServices([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [business?._id]);

  const handleDeleteService = async (serviceId) => {
    try {
      setLoading(true);
      await businessApi.deleteService(business._id, serviceId);
      // Refresh services list after deletion
      const response = await businessApi.getServices(business._id);
      setServices(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Échec de la suppression du service');
    } finally {
      setLoading(false);
    }
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
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newService.name);
      formData.append('description', newService.description);
      formData.append('price', newService.price);
      formData.append('duration', newService.duration);
      formData.append('category', newService.category);

      await businessApi.createService(business._id, formData);
      const response = await businessApi.getServices(business._id);
      setServices(Array.isArray(response.data) ? response.data : []);
      setShowAddDialog(false);
      setNewService({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
      });
    } catch (err) {
      console.error('Error adding service:', err);
      setError('Échec de l\'ajout du service');
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category._id || service.category,
    });
    setShowEditDialog(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newService.name);
      formData.append('description', newService.description);
      formData.append('price', newService.price);
      formData.append('duration', newService.duration);
      formData.append('category', newService.category);

      await businessApi.updateService(business._id, editingService._id, formData);
      const response = await businessApi.getServices(business._id);
      setServices(Array.isArray(response.data) ? response.data : []);
      setShowEditDialog(false);
      setEditingService(null);
      setNewService({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
      });
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Échec de la mise à jour du service');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Services</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Ajouter un service
        </Button>
      </Box>

      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un nouveau service</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddService} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nom du service"
              name="name"
              value={newService.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newService.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              required
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prix (TND)"
                  name="price"
                  type="number"
                  value={newService.price}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Durée (minutes)"
                  name="duration"
                  type="number"
                  value={newService.duration}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                name="category"
                value={newService.category}
                onChange={handleInputChange}
                required
                label="Catégorie"
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Annuler</Button>
          <Button onClick={handleAddService} variant="contained" color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier le service</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdateService} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nom du service"
              name="name"
              value={newService.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newService.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              required
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prix (TND)"
                  name="price"
                  type="number"
                  value={newService.price}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Durée (minutes)"
                  name="duration"
                  type="number"
                  value={newService.duration}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                name="category"
                value={newService.category}
                onChange={handleInputChange}
                required
                label="Catégorie"
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Annuler</Button>
          <Button onClick={handleUpdateService} variant="contained" color="primary">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service._id}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {service.price} TND
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.duration} min
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                display: 'flex', 
                gap: 1 
              }}>
                <IconButton
                  onClick={() => handleEditService(service)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteService(service._id)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const Bookings = ({ businessId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getBusinessBookings(businessId);
      // Ensure we have an array of bookings
      const bookingsData = Array.isArray(response.data) ? response.data : 
                         Array.isArray(response.data?.bookings) ? response.data.bookings : [];
      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      setError('Échec du chargement des réservations');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleViewDetails = (booking) => {
    console.log('Selected booking:', booking);
    console.log('User data:', booking.user);
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingApi.updateStatus(bookingId, { status: newStatus });
      await fetchBookings();
      handleCloseDialog();
    } catch (err) {
      setError('Échec de la mise à jour de l\'état de la réservation');
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
        Réservations Récentes
      </Typography>
      {bookings.length === 0 ? (
        <Alert severity="info">Aucune réservation trouvée</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                <TableCell>{booking.startTime}</TableCell>
                <TableCell>
                  {booking.user ? (
                    <>
                      {booking.user.firstName} {booking.user.lastName}
                      {booking.user.email && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          {booking.user.email}
                        </Typography>
                      )}
                    </>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>{booking.service?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={booking.status === 'confirmed' ? 'Confirmé' : 
                           booking.status === 'pending' ? 'En attente' : 
                           booking.status === 'cancelled' ? 'Annulé' : 
                           booking.status === 'completed' ? 'Terminé' : 
                           booking.status === 'rejected' ? 'Rejeté' : 
                           booking.status}
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
                    Voir Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Détails de la Réservation
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
                    Informations de Réservation
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(selectedBooking.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Heure: {selectedBooking.startTime} - {selectedBooking.endTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Statut: {selectedBooking.status === 'confirmed' ? 'Confirmé' : 
                              selectedBooking.status === 'pending' ? 'En attente' : 
                              selectedBooking.status === 'cancelled' ? 'Annulé' : 
                              selectedBooking.status === 'completed' ? 'Terminé' : 
                              selectedBooking.status === 'rejected' ? 'Rejeté' : 
                              selectedBooking.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Service: {selectedBooking.service?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prix: {selectedBooking.totalPrice} TND
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Informations Client
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nom: {selectedBooking.user?.firstName && selectedBooking.user?.lastName 
                        ? `${selectedBooking.user.firstName} ${selectedBooking.user.lastName}`
                        : selectedBooking.user?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {selectedBooking.user?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Téléphone: {selectedBooking.user?.phone || 'N/A'}
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
                    Confirmer la Réservation
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                  >
                    Rejeter la Réservation
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
                  Marquer comme Terminé
                </Button>
              )}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                >
                  Annuler la Réservation
                </Button>
              )}
              <Button 
                variant="outlined" 
                onClick={handleCloseDialog}
                sx={{ ml: 'auto' }}
              >
                Fermer
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
        const response = await analyticsApi.getBusinessAnalytics(business._id);
        console.log('Analytics response:', response.data);
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Échec du chargement des analyses');
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
  if (!analytics) return <Alert severity="info">Aucune donnée d'analyse disponible</Alert>;

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
          <Typography variant="h6" gutterBottom>Revenu par Mois</Typography>
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
                <RechartsTooltip formatter={(value) => [`${value} TND`, 'Revenu']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenu" 
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
          <Typography variant="h6" gutterBottom>Réservations par Statut</Typography>
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
                <RechartsTooltip formatter={(value, name, props) => [`${value} réservations`, props.payload.status]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Services Populaires</Typography>
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
                <Bar dataKey="bookings" name="Réservations" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Évaluations Clients</Typography>
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
                <Bar dataKey="count" name="Nombre d'Évaluations" fill="#8884d8" />
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
      setError(error.response?.data?.message || 'Échec de la mise à jour des images');
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
      setError('Échec de la suppression de l\'image');
      // Revert local state on error
      setImages(business.images);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
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
          setError('Au moins une image est requise');
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
        setError(err.response?.data?.message || 'Échec de la mise à jour du profil de l\'entreprise');
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
        Paramètres de l'Entreprise
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profil de l'entreprise mis à jour avec succès !
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de l'Entreprise"
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
                  label="Adresse"
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
                  label="Ville"
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
                  label="Région"
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
                  label="Code Postal"
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
                  label="Pays"
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
                  label="Téléphone"
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
                  label="Site Web"
                  name="website"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  error={formik.touched.website && Boolean(formik.errors.website)}
                  helperText={formik.touched.website && formik.errors.website}
                />
              </Grid>

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
                          Ajouter des Images
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
              Heures d'Ouverture
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
                        {day === 'monday' ? 'Lundi' :
                         day === 'tuesday' ? 'Mardi' :
                         day === 'wednesday' ? 'Mercredi' :
                         day === 'thursday' ? 'Jeudi' :
                         day === 'friday' ? 'Vendredi' :
                         day === 'saturday' ? 'Samedi' :
                         'Dimanche'}
                      </Typography>
                      <TextField
                        size="small"
                        label="Ouverture"
                        type="time"
                        name={`workingHours.${day}.open`}
                        value={formik.values.workingHours[day].open}
                        onChange={formik.handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: '150px' }}
                      />
                      <TextField
                        size="small"
                        label="Fermeture"
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
              {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
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
  const [userPermissions, setUserPermissions] = useState({
    manageBookings: false,
    manageServices: false,
    viewAnalytics: false,
    editProfile: false,
    manageEmployees: false
  });
  const [isOwner, setIsOwner] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBusinessUpdate = (updatedBusiness) => {
    setBusiness(updatedBusiness);
  };

  // Define available tabs based on permissions
  const availableTabs = [
    {
      label: 'Aperçu',
      icon: <DashboardIcon />,
      component: <Overview business={business} />,
      show: true
    },
    {
      label: 'Services',
      icon: <BusinessIcon />,
      component: <Services business={business} />,
      show: isOwner || userPermissions.manageServices
    },
    {
      label: 'Réservations',
      icon: <EventNoteIcon />,
      component: <Bookings businessId={business?._id} />,
      show: isOwner || userPermissions.manageBookings
    },
    {
      label: 'Analyses',
      icon: <AssessmentIcon />,
      component: <Analytics business={business} />,
      show: isOwner || userPermissions.viewAnalytics
    },
    {
      label: 'Équipe',
      icon: <PeopleIcon />,
      component: <EmployeeManagement business={business} />,
      show: isOwner || userPermissions.manageEmployees
    },
    {
      label: 'Paramètres',
      icon: <SettingsIcon />,
      component: <BusinessSettings business={business} onUpdate={handleBusinessUpdate} />,
      show: isOwner || userPermissions.editProfile
    }
  ];

  // Filter tabs based on permissions
  const visibleTabs = availableTabs.filter(tab => tab.show);

  // Reset active tab if it's out of bounds after filtering
  useEffect(() => {
    if (activeTab >= visibleTabs.length) {
      setActiveTab(0);
    }
  }, [activeTab, visibleTabs.length]);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);
        if (!user || !user.token) {
          setError('Vous devez être connecté pour accéder à ce tableau de bord');
          return;
        }

        // First try to get the business profile as a business owner
        try {
          const response = await businessApi.getProfile();
          console.log('Business profile response:', response);
          
          if (response.data.status === 'pending') {
            navigate('/business/pending');
            return;
          }
          
          if (response.data.status === 'active') {
            setBusiness(response.data);
            setIsOwner(true);
            // Business owners have all permissions
            setUserPermissions({
              manageBookings: true,
              manageServices: true,
              viewAnalytics: true,
              editProfile: true,
              manageEmployees: true
            });
            setError(null);
            return;
          }
        } catch (err) {
          // If 404, user might be an employee
          if (err.response?.status === 404) {
            try {
              // Try to find a business where this user is an employee
              const businessesResponse = await businessApi.getAll();
              console.log('Businesses response:', businessesResponse);
              console.log('Current user ID:', user._id);
              
              // Ensure we have an array of businesses
              const businesses = Array.isArray(businessesResponse.data) 
                ? businessesResponse.data 
                : businessesResponse.data?.businesses || [];
              
              // Find the business where this user is an employee
              const businessWithEmployee = businesses.find(b => {
                if (!b || !Array.isArray(b.employees)) return false;
                return b.employees.some(emp => emp && emp.user && emp.user.toString() === user._id);
              });

              if (businessWithEmployee) {
                // Find the employee object for the current user
                const emp = businessWithEmployee.employees.find(emp => emp && emp.user && emp.user.toString() === user._id);
                setUserPermissions({
                  manageBookings: emp?.permissions?.manageBookings || false,
                  manageServices: emp?.permissions?.manageServices || false,
                  viewAnalytics: emp?.permissions?.viewAnalytics || false,
                  editProfile: emp?.permissions?.editProfile || false,
                  manageEmployees: emp?.permissions?.manageEmployees || false
                });
                setBusiness(businessWithEmployee);
                setIsOwner(false);
                setError(null);
                return;
              }
            } catch (searchErr) {
              console.error('Error searching for employee business:', searchErr);
            }
          }
          
          // If we get here, either the user is not an employee or there was another error
          if (err.response?.status === 401) {
            setError('Votre session a expiré. Veuillez vous reconnecter.');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else {
            setError('Aucun profil d\'entreprise trouvé. Veuillez créer un profil d\'entreprise ou contacter votre employeur.');
            setTimeout(() => {
              navigate('/business/profile/create');
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Error in business profile fetch:', err);
        setError('Échec du chargement du profil de l\'entreprise. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBusinessProfile();
    }
  }, [user, navigate]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!business) return <Alert severity="warning">Aucun profil d'entreprise trouvé</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          fontWeight: 'bold',
          color: 'primary.main'
        }}>
          Tableau de Bord {business.name}
        </Typography>
        <Typography color="textSecondary" sx={{ 
          fontSize: { xs: '0.875rem', sm: '1rem' },
          mb: 2
        }}>
          {isOwner ? 'Gérez vos services, réservations et analyses' : 'Consultez et gérez vos tâches assignées'}
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
          {visibleTabs.map((tab, index) => (
            <Tab 
              key={tab.label}
              icon={tab.icon} 
              label={tab.label} 
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {visibleTabs[activeTab]?.component}
      </Box>
    </Container>
  );
};

export default BusinessDashboard; 