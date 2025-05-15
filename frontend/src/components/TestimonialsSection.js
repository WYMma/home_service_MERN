import { Box, Typography, Grid, Paper, Avatar, Rating, Stack } from '@mui/material';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    rating: 5,
    comment: 'Found the perfect cleaning service for my home. The platform made it easy to compare prices and read reviews.',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Michael Chen',
    role: 'Business Owner',
    rating: 5,
    comment: 'As a service provider, this platform has helped me reach more customers and grow my business significantly.',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Regular User',
    rating: 5,
    comment: 'The variety of services and the quality of providers is outstanding. Highly recommend!',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

const TestimonialsSection = () => (
  <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
    <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
        What Our Users Say
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        Don't just take our word for it - hear from our satisfied customers and service providers.
      </Typography>
    </Box>
    <Grid container spacing={4} justifyContent="center">
      {testimonials.map((testimonial) => (
        <Grid item xs={12} md={4} key={testimonial.name}>
          <Paper elevation={2} sx={{
            borderRadius: 4,
            p: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={testimonial.avatar} sx={{ width: 60, height: 60 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{testimonial.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                </Box>
              </Box>
              <Rating value={testimonial.rating} readOnly />
              <Typography color="text.secondary" sx={{ flex: 1 }}>{testimonial.comment}</Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

export default TestimonialsSection; 