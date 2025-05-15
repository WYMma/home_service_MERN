import { Box, Typography, Grid, Paper, Stack, Button } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const plans = [
  {
    title: 'Starter',
    price: '49',
    features: [
      'List up to 3 Services',
      'Basic Profile Page',
      'Customer Reviews',
      'Basic Analytics',
      'Email Support',
      'Standard Listing Visibility',
    ],
    recommended: false,
  },
  {
    title: 'Professional',
    price: '99',
    features: [
      'List up to 10 Services',
      'Enhanced Profile Page',
      'Priority Customer Reviews',
      'Advanced Analytics Dashboard',
      'Priority Support',
      'Featured Listing Visibility',
      'Service Promotion Tools',
      'Booking Management System',
    ],
    recommended: true,
  },
  {
    title: 'Enterprise',
    price: '249',
    features: [
      'Unlimited Services',
      'Custom Profile Page',
      'Premium Customer Reviews',
      'Full Analytics Suite',
      '24/7 Priority Support',
      'Top Listing Visibility',
      'Advanced Marketing Tools',
      'Team Management',
      'Custom Service Categories',
      'API Access',
    ],
    recommended: false,
  },
];

const PricingPlansSection = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Grow Your Service Business
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          Choose the perfect plan to showcase your services and reach more customers
        </Typography>
      </Box>
      <Grid container spacing={6} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.title}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: '1px solid',
                borderColor: plan.recommended ? 'primary.main' : 'divider',
                background: plan.recommended ? theme.palette.primary.light : 'background.paper',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {plan.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {plan.price} TND
                  <Typography component="span" variant="subtitle1" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
              </Box>
              <Stack spacing={2} sx={{ mb: 4, flex: 1 }}>
                {plan.features.map((feature) => (
                  <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                variant={plan.recommended ? 'contained' : 'outlined'}
                color="primary"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Start Listing
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default PricingPlansSection; 