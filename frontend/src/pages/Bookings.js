import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { format, isAfter, subHours } from 'date-fns';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingApi.getUserBookings();
        console.log('Bookings API Response:', response);
        // Ensure we have an array of bookings
        const bookingsData = Array.isArray(response.data) ? response.data : 
                           Array.isArray(response.data?.bookings) ? response.data.bookings : [];
        console.log('Processed bookings data:', bookingsData);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.message || 'Échec de la récupération des réservations');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await bookingApi.updateStatus(bookingToCancel._id, { 
        status: 'cancelled',
        cancellationReason: 'Annulé par l\'utilisateur'
      });
      // Refresh bookings after cancellation
      const response = await bookingApi.getUserBookings();
      const bookingsData = Array.isArray(response.data) ? response.data : 
                         Array.isArray(response.data?.bookings) ? response.data.bookings : [];
      setBookings(bookingsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de l\'annulation de la réservation');
    } finally {
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== 'pending') return false;
    
    const bookingTime = new Date(booking.createdAt);
    const twelveHoursAgo = subHours(new Date(), 12);
    
    return isAfter(bookingTime, twelveHoursAgo);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mes Réservations
        </Typography>
        {bookings.length === 0 ? (
          <Typography align="center" color="textSecondary">
            Aucune réservation trouvée
          </Typography>
        ) : (
          <List>
            {bookings.map((booking, index) => (
              <Box key={booking._id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    canCancelBooking(booking) && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancelClick(booking)}
                      >
                        Annuler
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" component="span">
                          {booking.business?.name || 'Entreprise Inconnue'}
                        </Typography>
                        <Chip
                          label={booking.status === 'pending' ? 'En attente' : 
                                booking.status === 'confirmed' ? 'Confirmée' : 
                                booking.status === 'cancelled' ? 'Annulée' : 
                                booking.status || 'En attente'}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Service: {booking.service?.name || 'Service Inconnu'}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Date: {new Date(booking.date).toLocaleDateString()}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Heure: {booking.startTime} - {booking.endTime}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Total: {booking.totalPrice} TND
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < bookings.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Annuler la Réservation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Êtes-vous sûr de vouloir annuler votre réservation pour {bookingToCancel?.service?.name || 'Service Inconnu'} chez {bookingToCancel?.business?.name || 'Entreprise Inconnue'} ?
            Cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            Conserver la Réservation
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Annuler la Réservation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bookings;
