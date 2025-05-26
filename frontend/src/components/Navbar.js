import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';
import useAuth from '../hooks/useAuth';
import { logout } from '../store/slices/authSlice';
import logo from '../logo.svg';
import { scroller } from 'react-scroll';
import { userApi } from '../services/api';
import { formatImageUrl } from '../utils/urlUtils';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = () => {
      if (isAuthenticated) {
        userApi.getProfile()
          .then(res => setProfile(res.data))
          .catch(() => setProfile(null));
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
    const handler = () => fetchProfile();
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, [isAuthenticated]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
    navigate('/');
    // Clear any cached data
    localStorage.removeItem('user');
    // Reload the page to clear all state
    window.location.reload();
  };

  const handleMenuClick = (path) => {
    navigate(path);
    handleCloseUserMenu();
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
  };

  const handleNavigateAndScrollTop = (path) => {
    navigate(path);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100); // Give React Router time to update the page
  };

  const menuItems = [
    { text: 'Accueil', action: () => handleNavigateAndScrollTop('/') },
    {
      text: 'Comment ça marche',
      action: () => {
        navigate('/');
        setTimeout(() => {
          scroller.scrollTo('how-it-works-wrapper', {
            duration: 800,
            smooth: 'easeInOutQuart',
            offset: -150,
          });
        }, 100);
      }
    },
    { text: 'Nos Services', action: () => handleNavigateAndScrollTop('/categories') },
    { text: 'Réserver', action: () => handleNavigateAndScrollTop('/businesses') },
    { text: 'À propos', action: () => handleNavigateAndScrollTop('/about') },
  ];

  // Consistent helper for profile image URLs
  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
  };

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {/* Main Navigation Items */}
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={item.action}
            sx={{
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.main,
              }
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}

        {/* Auth Section */}
        {isAuthenticated ? (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText 
                primary="Compte" 
                primaryTypographyProps={{ 
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }} 
              />
            </ListItem>

            {/* Admin menu items */}
            {profile?.role === 'admin' && (
              <>
                <ListItem 
                  button 
                  onClick={() => handleNavigateAndScrollTop('/admin/dashboard')}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  <ListItemIcon>
                    <AdminPanelSettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Tableau de bord Admin" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => handleNavigateAndScrollTop('/bookings')}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  <ListItemIcon>
                    <BookOnlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Mes Réservations" />
                </ListItem>
              </>
            )}

            {/* Business menu items */}
            {profile?.role === 'business' && (
              <ListItem 
                button 
                onClick={() => handleNavigateAndScrollTop('/business/dashboard')}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Tableau de bord Entreprise" />
              </ListItem>
            )}

            {/* Regular user menu items */}
            {profile?.role === 'user' && (
              <>
                <ListItem 
                  button 
                  onClick={() => handleNavigateAndScrollTop('/bookings')}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  <ListItemIcon>
                    <BookOnlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Mes Réservations" />
                </ListItem>
                <ListItem 
                  button 
                  onClick={() => handleNavigateAndScrollTop('/favorites')}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  <ListItemIcon>
                    <FavoriteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Favoris" />
                </ListItem>
              </>
            )}

            {/* Common menu items for all users */}
            <ListItem 
              button 
              onClick={() => handleNavigateAndScrollTop('/settings')}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                }
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem 
              button 
              onClick={() => handleNavigateAndScrollTop('/login')}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleNavigateAndScrollTop('/register')}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  const renderUserMenu = () => {
    if (!profile) return null;

    const menuItems = [];

    // Admin menu items
    if (profile.role === 'admin') {
      menuItems.push(
        <MenuItem key="admin-dashboard" onClick={() => handleMenuClick('/admin/dashboard')}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Admin Dashboard</ListItemText>
        </MenuItem>,
      );
    }

    // Business menu items
    if (profile.role === 'business') {
      menuItems.push(
        <MenuItem key="business-dashboard" onClick={() => handleMenuClick('/business/dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
      );
    }


    // Common menu items for all users
    menuItems.push(
      <MenuItem key="my-bookings" onClick={() => handleMenuClick('/bookings')}>
      <ListItemIcon>
        <BookOnlineIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>My Bookings</ListItemText>
    </MenuItem>,
    <MenuItem key="favorites" onClick={() => handleMenuClick('/favorites')}>
      <ListItemIcon>
        <FavoriteIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Favorite Services</ListItemText>
    </MenuItem>,
      <MenuItem key="settings" onClick={() => handleMenuClick('/settings')}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>,
      <Divider key="divider" />,
      <MenuItem key="logout" onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    );

    return menuItems;
  };

  return (
    <Paper 
      elevation={3} 
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(60,179,113,0.08)',
        border: `2px solid ${theme.palette.primary.main}`,
        m: 2,
        borderRadius: 4,
      }}
    >
      <AppBar position="static" color="transparent" elevation={0} sx={{ background: 'transparent', boxShadow: 'none', borderRadius: 4 }}>
        <Toolbar sx={{ minHeight: 72, px: { xs: 1, md: 3 } }}>
          {/* Logo Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src={logo} alt="Logo" style={{ height: 40, marginRight: 8 }} />
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 800, letterSpacing: 1 }}>
              LaGhazala
              </Typography>
            </Box>
          </Box>

          {/* Nav Links Center */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 3 }}>
              {menuItems.map((item) =>
                item.action ? (
                  <Button key={item.text} onClick={item.action} sx={{ fontWeight: 600 }}>
                    {item.text}
                  </Button>
                ) : (
                  <Button key={item.text} component={Link} to={item.path} sx={{ fontWeight: 600 }}>
                    {item.text}
                  </Button>
                )
              )}
            </Box>
          )}

          {/* User Menu Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            {isMobile && (
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="end"
                onClick={toggleDrawer(true)}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && isAuthenticated && (
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenUserMenu}
                color="primary"
              >
                <Avatar 
                  src={getImageUrl(profile?.profileImage)}
                  alt={`${profile?.firstName} ${profile?.lastName}`}
                  sx={{ width: 32, height: 32 }}
                >
                  {!profile?.profileImage && profile?.firstName?.[0]}
                </Avatar>
              </IconButton>
            )}
            {!isMobile && !isAuthenticated && (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  sx={{ fontWeight: 600 }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 20, px: 3, fontWeight: 700 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        disableScrollLock
      >
        {renderUserMenu()}
      </Menu>
    </Paper>
  );
};

export default Navbar;
