import { Box, Typography, Stack, Button, Grid, Paper } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';

const AppDownloadSection = () => (
  <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
    <Grid container spacing={6} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={4}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Download Our Home Cleaning & Service App
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: '90%' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
        </Typography>
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AppleIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            For iOS
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AndroidIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            For Android
          </Button>
        </Stack>
        <Stack direction="row" spacing={6} sx={{ maxWidth: '90%' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>5 Million+</Typography>
            <Typography color="text.secondary" variant="body2">Worldwide Active Users</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>5000+</Typography>
            <Typography color="text.secondary" variant="body2">Services</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>60+</Typography>
            <Typography color="text.secondary" variant="body2">Countries</Typography>
          </Box>
        </Stack>
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Box sx={{ 
          p: 3, 
          borderRadius: 4, 
          bgcolor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <img src="/qr-ios.png" alt="iOS QR" style={{ width: 120, height: 120 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>For iOS 15+</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Box sx={{ 
          p: 3, 
          borderRadius: 4, 
          bgcolor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <img src="/qr-android.png" alt="Android QR" style={{ width: 120, height: 120 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>For Android 8.0+</Typography>
        </Box>
      </Grid>
    </Grid>
  </Paper>
);

export default AppDownloadSection; 