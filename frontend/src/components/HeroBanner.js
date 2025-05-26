import { Box, Typography, useTheme } from '@mui/material';

const HeroBanner = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: 0,
        height: '50vh',
        pt: { xs: 16, md: 20 },
        pb: { xs: 8, md: 12 },
        px: { xs: 4, md: 8 },
        mb: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxShadow: 3,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(8px)',
          zIndex: 0,
        },
      }}
    >
      {/* Content wrapper with higher z-index to appear above blur */}
      <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px' }}>
        <Typography variant="h1" sx={{ fontWeight: 800, mb: 3, color: '#fff', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
          Besoin d'aide ? <br />
          <Box component="span" sx={{ color: theme.palette.secondary.main }}>
          Réservez en une minute.
          </Box>
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: '#fff', opacity: 0.95 }}>
          La plateforme n°1 en Tunisie pour réserver des professionnels de confiance
        </Typography>
        {children && <Box sx={{ mt: 6 }}>{children}</Box>}
      </Box>

      {/* Repair Man Image - Positioned in bottom right */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: { xs: '5%', md: '25%' },
          width: { xs: '100%', md: '60%' }, // increased from 50% to 60%
          height: { xs: '70%', md: '90%' }, // increased from 80% to 90%
          background: `url('${process.env.PUBLIC_URL}/images/man.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          opacity: 0.95, // slightly more visible
          transform: 'translateX(5%)'
        }}
      />
    </Box>
  );
};

export default HeroBanner; 