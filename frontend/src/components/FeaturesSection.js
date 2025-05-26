import { Box, Typography, Grid, Paper, Stack } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';

const features = [
  {
    icon: <StarIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Découvrez les Meilleurs Prestataires',
    desc: 'Trouvez les professionnels les mieux notés et les plus fiables de votre région pour tous vos services à domicile.'
  },
  {
    icon: <MobileScreenShareIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Consultez vos Services Favoris',
    desc: 'Accédez et gérez facilement vos services et prestataires favoris depuis votre tableau de bord.'
  },
  {
    icon: <ChatIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Chat & Appel en Direct',
    desc: 'Connectez-vous instantanément avec les prestataires de services pour des devis, des questions et du support.'
  },
];

const FeaturesSection = () => (
  <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: '#222', color: '#fff' }}>
    <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center', color: '#fff' }}>
        Fonctionnalités de l'Application de Services
      </Typography>
      <Typography color="#bdbdbd" sx={{ textAlign: 'center' }}>
        Découvrez ce qui fait de notre application le meilleur choix pour vos besoins en services à domicile.
      </Typography>
    </Box>
    <Grid container spacing={6} justifyContent="center">
      {features.map((feature, idx) => (
        <Grid item xs={12} md={4} key={feature.title}>
          <Stack alignItems="center" spacing={3}>
            <Box sx={{
              width: 100,
              height: 100,
              borderRadius: 4,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 4,
              },
            }}>
              {feature.icon}
            </Box>
            <Box sx={{ textAlign: 'center', maxWidth: '90%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>{feature.title}</Typography>
              <Typography variant="body2" color="#bdbdbd">{feature.desc}</Typography>
            </Box>
          </Stack>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

export default FeaturesSection; 