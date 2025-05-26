import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, Paper } from '@mui/material';
import BusinessCard from './BusinessCard';
import { businessApi } from '../services/api';

const FeaturedServicesSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await businessApi.getAll({
          featured: true,
          limit: 6
        });
        setServices(response.data.businesses || []);
      } catch (error) {
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Nos Services en Vedette
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          5000+ Services
        </Typography>
      </Box>
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service._id}>
            <BusinessCard business={service} />
          </Grid>
        ))}
      </Grid>
      {services.length === 0 && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucun service en vedette trouvé
          </Typography>
        </Box>
      )}
      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          href="/businesses"
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Voir Tous les Services
        </Button>
      </Box>
    </Paper>
  );
};

export default FeaturedServicesSection; 