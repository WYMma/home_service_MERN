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
} from '@mui/icons-material';
import { businessApi } from '../services/api';
import BookingForm from '../components/BookingForm';
import LoginPromptDialog from '../components/LoginPromptDialog';
import ReviewList from '../components/ReviewList';
import useAuth from '../hooks/useAuth';
import { formatImageUrl } from '../utils/urlUtils';

const SLIDE_INTERVAL = 3000; // 3 seconds per image

const getImageUrl = (imagePath) => {
  return formatImageUrl(imagePath);
};

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchBusinessAndServices = async () => {
      try {
        const [businessResponse, servicesResponse] = await Promise.all([
          businessApi.getById(id),
          businessApi.getServices(id)
        ]);
        setBusiness(businessResponse.data);
        setServices(servicesResponse.data);
      } catch (error) {
        console.error('Error fetching business data:', error);
        navigate('/businesses');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessAndServices();
  }, [id, navigate]);

  // Image slideshow effect
  useEffect(() => {
    if (!business?.images?.length) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % (business.images.length || 1)
      );
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [business?.images]);

  const handleBookNowClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    } else {
      setShowBookingForm(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!business) return null;

  // Get all images, including the main image and additional images
  const allImages = [
    business.image,
    ...(business.images || [])
  ].filter(Boolean);

  // If no images, use placeholder
  const images = allImages.length > 0 ? allImages : ['/business-placeholder.png'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section with Background Image */}
        <Box
          sx={{
            position: 'relative',
            height: '400px',
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Background Image */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${getImageUrl(images[currentImageIndex])})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 0.5s ease-in-out',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
              },
            }}
          />

          {/* Content Overlay */}
          <Box
            sx={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 4,
              color: 'white',
            }}
          >
            {/* Book Now Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBookNowClick}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Réserver
              </Button>
            </Box>

            {/* Business Info */}
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  color: 'primary.main'
                }}
              >
                {business.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={business.rating} readOnly precision={0.5} sx={{ color: 'white' }} />
                <Typography variant="body2" sx={{ ml: 1, color: 'white' }}>
                  ({business.reviewCount} avis)
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                {(business.categories || []).map((category) => (
                  <Chip
                    key={category._id}
                    label={category.name}
                    sx={{ 
                      mr: 1, 
                      mb: 1,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Image Counter */}
            {images.length > 1 && (
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.875rem',
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(2px)',
              }}>
                {currentImageIndex + 1}/{images.length}
              </Box>
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Description */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  À propos
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
                  {services.length > 0 ? (
                    services.map((service) => (
                      <Grid item xs={12} key={service._id}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle1">{service.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            {service.price} TND
                          </Typography>
                        </Paper>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary" align="center">
                        No services available at the moment.
                      </Typography>
                    </Grid>
                  )}
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
                    {Object.entries(business.workingHours || {}).map(([day, hours]) => (
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
          open={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          business={business}
          services={services}
        />
      )}

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </Container>
  );
};

export default BusinessDetails;
