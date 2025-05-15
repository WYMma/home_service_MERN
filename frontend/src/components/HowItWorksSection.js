import { Box, Typography, Grid, Paper, Stack } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';

const steps = [
  {
    title: 'Search',
    desc: 'Find the service you need from our wide range of options.',
    icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Book',
    desc: 'Choose your preferred time and book the service instantly.',
    icon: <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Get Service',
    desc: 'Our professionals will arrive at your doorstep on time.',
    icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Rate & Review',
    desc: 'Share your experience and help others make better choices.',
    icon: <RateReviewIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
];

const HowItWorksSection = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Step-by-Step Guide to Using Our App
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          How it Works
        </Typography>
      </Box>
      <Grid container spacing={6} justifyContent="center">
        {steps.map((step, idx) => (
          <Grid item xs={12} sm={6} md={3} key={step.title}>
            <Stack alignItems="center" spacing={3}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: theme.palette.primary.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `2px solid ${theme.palette.primary.light}`,
                  animation: 'pulse 2s infinite',
                },
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(1.5)',
                    opacity: 0,
                  },
                },
              }}>
                {step.icon}
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{`${idx + 1}. ${step.title}`}</Typography>
                <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
              </Box>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default HowItWorksSection; 