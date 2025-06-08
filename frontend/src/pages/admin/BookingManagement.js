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
  Chip,
  Box,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  CheckCircle as ConfirmedIcon,
  Cancel as CancelledIcon,
  Pending as PendingIcon,
  Done as CompletedIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CleaningServices as ServiceIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSnackbar } from 'notistack';

// Status icon mapping
const StatusIcon = ({ status }) => {
  switch(status) {
    case 'confirmed':
      return <ConfirmedIcon sx={{ color: 'success.main' }} />;
    case 'cancelled':
      return <CancelledIcon sx={{ color: 'error.main' }} />;
    case 'completed':
      return <CompletedIcon sx={{ color: 'info.main' }} />;
    case 'pending':
    default:
      return <PendingIcon sx={{ color: 'warning.main' }} />;
  }
};

const BookingManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllBookings();
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la récupération des réservations');
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

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleViewDetails = async (booking) => {
    try {
      const response = await adminApi.getBookingDetails(booking._id);
      setSelectedBooking(response.data);
      setDetailsDialogOpen(true);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la récupération des détails de la réservation', { variant: 'error' });
    }
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await adminApi.updateBooking(bookingId, { status: newStatus });
      await fetchBookings(); // Refresh the bookings list
      handleCloseDetails();
      enqueueSnackbar('Statut de la réservation mis à jour avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la mise à jour du statut', { variant: 'error' });
    }
  };

  // Filter bookings based on search term and status filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredBookings.length) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: -4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des Réservations
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBookings}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2, p: 2, boxShadow: 'none' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Rechercher des réservations..."
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
          <TextField
            select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="confirmed">Confirmé</MenuItem>
            <MenuItem value="completed">Terminé</MenuItem>
            <MenuItem value="cancelled">Annulé</MenuItem>
          </TextField>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="bookingsTable">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Entreprise</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Prix</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
                  <TableRow key={booking._id || Math.random()}>
                    <TableCell>{booking._id?.substring(0, 8) || 'N/A'}</TableCell>
                    <TableCell>{booking.userName || 'N/A'}</TableCell>
                    <TableCell>{booking.businessName || 'N/A'}</TableCell>
                    <TableCell>{booking.serviceName || 'N/A'}</TableCell>
                    <TableCell>
                      {booking.date 
                        ? new Date(booking.date).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<StatusIcon status={booking.status} />}
                        label={
                          booking.status === 'completed' ? 'Terminé' :
                          booking.status === 'confirmed' ? 'Confirmé' :
                          booking.status === 'cancelled' ? 'Annulé' :
                          booking.status === 'pending' ? 'En attente' : 'Inconnu'
                        }
                        color={
                          booking.status === 'completed' ? 'info' :
                          booking.status === 'confirmed' ? 'success' :
                          booking.status === 'cancelled' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {booking.price !== undefined && booking.price !== null 
                        ? `${Number(booking.price).toFixed(2)} TND` 
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ minWidth: 100 }}
                        onClick={() => handleViewDetails(booking)}
                      >
                        Voir les détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={8} />
                </TableRow>
              )}
              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Aucune réservation trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      {/* Booking Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Détails de la Réservation
              <IconButton
                aria-label="close"
                onClick={handleCloseDetails}
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
                      Service: {selectedBooking.serviceName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prix: {selectedBooking.price} TND
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Informations Client
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nom: {selectedBooking.userName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {selectedBooking.userEmail || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Téléphone: {selectedBooking.userPhone || 'N/A'}
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
                    startIcon={<ConfirmedIcon />}
                    onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')}
                  >
                    Confirmer la Réservation
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelledIcon />}
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
                  startIcon={<ConfirmedIcon />}
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'completed')}
                >
                  Marquer comme Terminé
                </Button>
              )}
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelledIcon />}
                  onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                >
                  Annuler la Réservation
                </Button>
              )}
              <Button 
                variant="outlined" 
                onClick={handleCloseDetails}
                sx={{ ml: 'auto' }}
              >
                Fermer
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default BookingManagement; 