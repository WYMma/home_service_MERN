import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  ImageList,
  ImageListItem,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Schedule,
  Star,
} from '@mui/icons-material';
import { businessApi } from '../services/api';
import BookingForm from '../components/BookingForm';
import ReviewList from '../components/ReviewList';
import useAuth from '../hooks/useAuth';

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await businessApi.getById(id);
        setBusiness(response.data);
      } catch (error) {
        console.error('Error fetching business:', error);
        navigate('/businesses');
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!business) return null;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {business.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={business.rating} readOnly precision={0.5} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({business.reviewCount} reviews)
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              {(business.categories || []).map((category) => (
                <Chip
                  key={category._id}
                  label={category.name}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: `/businesses/${id}` } });
                  return;
                }
                setShowBookingForm(true);
              }}
            >
              Book Now
            </Button>
          </Grid>
        </Grid>

        {/* Images Section */}
        <Box sx={{ my: 4 }}>
          <ImageList cols={3} gap={16}>
            {(business.images || []).map((image, index) => (
              <ImageListItem key={index}>
                <img
                  src={image}
                  alt={`${business.name} - ${index + 1}`}
                  loading="lazy"
                  style={{ borderRadius: 8 }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>

        {/* Main Content */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Description */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {business.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Services */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Services
                </Typography>
                <Grid container spacing={2}>
                  {(business.services || []).map((service) => (
                    <Grid item xs={12} key={service._id}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1">{service.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.description}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          ${service.price}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Reviews */}
            <ReviewList businessId={id} />
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {business.address?.street}, {business.address?.city}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">{business.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">{business.email}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Business Hours
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule color="action" sx={{ mr: 1 }} />
                  <Box>
                    {Object.entries(business.hours || {}).map(([day, hours]) => (
                      <Typography key={day} variant="body2" sx={{ mb: 1 }}>
                        <strong>{day}:</strong> {hours.open} - {hours.close}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Booking Form Dialog */}
      {showBookingForm && (
        <BookingForm
          business={business}
          open={showBookingForm}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </Container>
  );
};

export default BusinessDetails;
