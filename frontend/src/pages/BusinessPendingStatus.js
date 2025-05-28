import React from 'react';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import PendingIcon from '@mui/icons-material/Pending';

const BusinessPendingStatus = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <PendingIcon sx={{ fontSize: 60, color: 'warning.main' }} />
        </Box>
        <Typography variant="h4" gutterBottom>
          Profil d'Entreprise en Attente d'Approbation
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Votre profil d'entreprise est actuellement en cours d'examen. Nous vous notifierons une fois qu'il aura été approuvé.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ce processus prend généralement 1 à 2 jours ouvrables.
        </Typography>
      </Paper>
    </Container>
  );
};

export default BusinessPendingStatus; 