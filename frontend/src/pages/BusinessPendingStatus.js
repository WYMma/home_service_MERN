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
          Business Profile Pending Approval
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Your business profile is currently under review. We will notify you once it has been approved.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This process typically takes 1-2 business days.
        </Typography>
      </Paper>
    </Container>
  );
};

export default BusinessPendingStatus; 