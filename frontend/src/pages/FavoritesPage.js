import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Alert } from '@mui/material';
import BusinessCard from '../components/BusinessCard';
import { favoriteApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await favoriteApi.getFavorites();
        setFavorites(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Échec du chargement des favoris. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          Veuillez vous connecter pour voir vos entreprises favorites.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Chargement des favoris...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mes Entreprises Favorites
      </Typography>

      {favorites.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Vous n'avez pas encore ajouté d'entreprises à vos favoris.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {favorites.map((business) => (
            <Grid item xs={12} sm={6} md={4} key={business._id}>
              <BusinessCard business={business} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage; 