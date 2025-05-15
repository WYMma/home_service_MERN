import { Box, Typography, Grid, Paper, Avatar, Stack, Rating } from '@mui/material';

const providers = [
  {
    name: 'Eleanor Pena',
    role: 'Home Cleaning',
    avatar: '/static/images/avatar/1.jpg',
    rating: 4.9,
  },
  {
    name: 'Jenny Wilson',
    role: 'Laundry Service',
    avatar: '/static/images/avatar/2.jpg',
    rating: 4.8,
  },
  {
    name: 'Leslie Alexander',
    role: 'Appliance Cleaning',
    avatar: '/static/images/avatar/3.jpg',
    rating: 4.7,
  },
];

const ProvidersSection = () => (
  <Box sx={{ my: 6 }}>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
      Experienced Service Providers at Your Service
    </Typography>
    <Grid container spacing={4} justifyContent="center">
      {providers.map((p) => (
        <Grid item xs={12} md={4} key={p.name}>
          <Paper elevation={2} sx={{ borderRadius: 4, p: 4, textAlign: 'center', height: '100%' }}>
            <Stack alignItems="center" spacing={2}>
              <Avatar src={p.avatar} alt={p.name} sx={{ width: 64, height: 64, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.name}</Typography>
              <Typography variant="body2" color="text.secondary">{p.role}</Typography>
              <Rating value={p.rating} precision={0.1} readOnly sx={{ mt: 1 }} />
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default ProvidersSection; 