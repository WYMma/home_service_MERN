import { Box, Container, Typography, Link, Grid, Stack, Button, TextField, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#222', color: 'white', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Home Cleaning
            </Typography>
            <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
              The best home cleaning and services app for all your needs. Trusted by millions worldwide.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" href="#"><FacebookIcon /></IconButton>
              <IconButton color="inherit" href="#"><TwitterIcon /></IconButton>
              <IconButton color="inherit" href="#"><InstagramIcon /></IconButton>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Company
            </Typography>
            <Stack spacing={1}>
              <Link color="inherit" href="/about">About</Link>
              <Link color="inherit" href="/privacy">Privacy Policy</Link>
              <Link color="inherit" href="/terms">Terms of Service</Link>
              <Link color="inherit" href="/contact">Contact</Link>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" color="#bdbdbd" sx={{ mb: 2 }}>
              Subscribe to get the latest updates and offers.
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                variant="filled"
                size="small"
                placeholder="Your email"
                sx={{ bgcolor: '#fff', borderRadius: 1, flex: 1 }}
                InputProps={{ disableUnderline: true }}
              />
              <Button variant="contained" color="secondary" sx={{ borderRadius: 1, fontWeight: 700 }}>
                Subscribe
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <Box sx={{ borderTop: '1px solid #444', mt: 6, pt: 3 }}>
          <Typography variant="body2" align="center" color="#bdbdbd">
            © {new Date().getFullYear()} Home Services. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
