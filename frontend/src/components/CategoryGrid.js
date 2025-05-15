import { Box, Typography, Grid, Paper, Stack, Button } from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import useTheme from '@mui/material/styles/useTheme';

const categories = [
  { icon: <CleaningServicesIcon fontSize="large" color="primary" />, label: 'Appliance Repair' },
  { icon: <ElectricalServicesIcon fontSize="large" color="primary" />, label: 'Laundry Services' },
  { icon: <LocalShippingIcon fontSize="large" color="primary" />, label: 'Home Shifting' },
  { icon: <FormatPaintIcon fontSize="large" color="primary" />, label: 'Painting' },
  { icon: <PlumbingIcon fontSize="large" color="primary" />, label: 'Plumbing' },
  { icon: <HomeRepairServiceIcon fontSize="large" color="primary" />, label: 'Home Cleaning' },
];

const CategoryGrid = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Discover Our Range of Services
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        {categories.map((cat, idx) => (
          <Grid item xs={6} sm={4} md={2} key={cat.label}>
            <Stack alignItems="center" spacing={2}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: theme.palette.primary.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 2,
                },
              }}>
                {cat.icon}
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>{cat.label}</Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          href="/categories"
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Browse All Categories
        </Button>
      </Box>
    </Paper>
  );
};

export default CategoryGrid; 