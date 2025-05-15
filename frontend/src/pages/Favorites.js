import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Chip,
  Rating,
  Divider,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  BookOnline as BookOnlineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await userApi.getFavorites();
      setFavorites(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (serviceId) => {
    try {
      await userApi.removeFavorite(serviceId);
      setFavorites(favorites.filter(fav => fav._id !== serviceId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from favorites');
    }
  };

  const handleBookNow = (serviceId) => {
    navigate(`/bookings/new?service=${serviceId}`);
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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Favorite Services
        </Typography>

        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't added any services to your favorites yet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/services')}
            >
              Browse Services
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={service.image || '/placeholder.jpg'}
                    alt={service.name}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {service.name}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveFavorite(service._id)}
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={service.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({service.reviewCount} reviews)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {service.business.address.city}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {service.business.phone}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        ${service.price}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<BookOnlineIcon />}
                        onClick={() => handleBookNow(service._id)}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Favorites; 