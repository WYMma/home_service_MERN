import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import favoriteApi from '../services/api/favoriteApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import BusinessCard from '../components/BusinessCard';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteApi.getFavorites();
      setFavorites(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Échec de la récupération des favoris. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (businessId) => {
    try {
      await favoriteApi.removeFromFavorites(businessId);
      setFavorites(favorites.filter(fav => fav._id !== businessId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Échec de la suppression des favoris. Veuillez réessayer.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          Veuillez vous connecter pour voir vos entreprises favorites.
        </Alert>
      </Container>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Mes Entreprises Favorites
        </Typography>

        {favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Vous n'avez pas encore ajouté d'entreprises à vos favoris
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/businesses')}
            >
              Parcourir les Entreprises
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {favorites.map((business) => (
              <Grid item xs={12} sm={6} md={3} key={business._id}>
                <BusinessCard
                  business={business}
                  onFavoriteClick={() => handleRemoveFavorite(business._id)}
                  isFavorited={true}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Favorites; 