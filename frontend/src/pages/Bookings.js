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
        setBookings(response.bookings || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
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
        cancellationReason: 'Cancelled by user'
      });
      // Refresh bookings after cancellation
      const response = await bookingApi.getUserBookings();
      setBookings(response.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
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
          My Bookings
        </Typography>
        {bookings.length === 0 ? (
          <Typography align="center" color="textSecondary">
            No bookings found
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
                        Cancel
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" component="span">
                          {booking.business?.name || 'Unknown Business'}
                        </Typography>
                        <Chip
                          label={booking.status || 'pending'}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Service: {booking.service?.name || 'Unknown Service'}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Date: {new Date(booking.date).toLocaleDateString()}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Time: {booking.startTime} - {booking.endTime}
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
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel your booking for {bookingToCancel?.service?.name || 'Unknown Service'} at {bookingToCancel?.business?.name || 'Unknown Business'}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            Keep Booking
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Bookings;
