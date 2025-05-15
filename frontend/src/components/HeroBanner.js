import { Box, Typography, Button, Stack, Avatar, useTheme, AvatarGroup } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';

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
        height: '90vh',
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
          The Best Home <br />
          <Box component="span" sx={{ color: theme.palette.secondary.main }}>
            Cleaning and Services App
          </Box>
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: '#fff', opacity: 0.95 }}>
          The Ultimate Home Cleaning & Services App
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AppleIcon />}
            sx={{ minWidth: 200, fontWeight: 700, py: 1.5 }}
          >
            Download for iOS
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AndroidIcon />}
            sx={{ minWidth: 200, fontWeight: 700, py: 1.5 }}
          >
            Download for Android
          </Button>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={3}>
          <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 40, height: 40, fontSize: 18 } }}>
            <Avatar alt="User 1" src="/static/images/avatar/1.jpg" />
            <Avatar alt="User 2" src="/static/images/avatar/2.jpg" />
            <Avatar alt="User 3" src="/static/images/avatar/3.jpg" />
            <Avatar alt="User 4" src="/static/images/avatar/4.jpg" />
            <Avatar alt="User 5" src="/static/images/avatar/5.jpg" />
          </AvatarGroup>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>
            5M+ Active Users
          </Typography>
        </Stack>
        {children && <Box sx={{ mt: 6 }}>{children}</Box>}
      </Box>

      {/* Repair Man Image - Positioned in bottom right */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: { xs: '5%', md: '10%' },
          width: { xs: '100%', md: '50%' },
          height: { xs: '40%', md: '80%' },
          background: `url('${process.env.PUBLIC_URL}/images/man.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          opacity: 0.9,
          transform: 'translateX(5%)'
        }}
      />
    </Box>
  );
};

export default HeroBanner; 