import { Box, Container, Typography, Link, Grid, Stack, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#222',
        color: 'white',
        pt: 4,
        pb: 2,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              LaGhazala
            </Typography>
            <Typography variant="body2" color="#bdbdbd" sx={{ mb: 1 }}>
              Votre partenaire de confiance pour la formation et les services professionnels.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" href="#" size="small"><FacebookIcon /></IconButton>
              <IconButton color="inherit" href="#" size="small"><TwitterIcon /></IconButton>
              <IconButton color="inherit" href="#" size="small"><InstagramIcon /></IconButton>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Contact
            </Typography>
            <Stack spacing={0.5}>
              <Link color="inherit" href="/about">À propos</Link>
              <Link color="inherit" href="/contact">Contact</Link>
            </Stack>
          </Grid>
        </Grid>
        <Box sx={{ borderTop: '1px solid #444', mt: 3, pt: 2 }}>
          <Typography variant="body2" align="center" color="#bdbdbd">
            © {new Date().getFullYear()} LaGhazala. Tous droits réservés.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
