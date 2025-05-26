import { Box, Typography, Grid, Paper, Stack } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';

const steps = [
  {
    title: 'Rechercher',
    desc: 'Trouvez le service dont vous avez besoin parmi notre large gamme d\'options.',
    icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Réserver',
    desc: 'Choisissez votre horaire préféré et réservez le service instantanément.',
    icon: <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Recevoir le Service',
    desc: 'Nos professionnels arriveront à votre porte à l\'heure prévue.',
    icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Évaluer & Commenter',
    desc: 'Partagez votre expérience et aidez les autres à faire de meilleurs choix.',
    icon: <RateReviewIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
];

const HowItWorksSection = () => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Guide étape par étape pour utiliser notre application
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          Comment ça marche
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