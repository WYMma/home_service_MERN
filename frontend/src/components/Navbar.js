import { useState } from 'react';
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
  Container,
  Paper,
  Tooltip,
  Divider,
  ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import useAuth from '../hooks/useAuth';
import { logout } from '../features/auth/authSlice';
import logo from '../logo.svg';

const Navbar = () => {
  const { user, isAuthenticated, isBusiness } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Features', path: '/features' },
    { text: 'How It Works', path: '/how-it-works' },
    { text: 'About Us', path: '/about' },
    { text: 'Testimonial', path: '/testimonial' },
    { text: 'Blog', path: '/blog' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isAuthenticated ? (
          <>
            {isBusiness ? (
              <ListItem button component={Link} to="/dashboard">
                <ListItemText primary="Dashboard" />
              </ListItem>
            ) : (
              <ListItem button component={Link} to="/bookings">
                <ListItemText primary="My Bookings" />
              </ListItem>
            )}
            <ListItem button component={Link} to="/profile">
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register">
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  const renderUserMenu = () => {
    if (!user) return null;

    const menuItems = [];

    // Admin menu items
    if (user.role === 'admin') {
      menuItems.push(
        <MenuItem key="admin-dashboard" onClick={() => handleMenuClick('/admin/dashboard')}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Admin Dashboard</ListItemText>
        </MenuItem>,
        <MenuItem key="manage-users" onClick={() => handleMenuClick('/admin/users')}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Users</ListItemText>
        </MenuItem>,
        <MenuItem key="manage-services" onClick={() => handleMenuClick('/admin/services')}>
          <ListItemIcon>
            <CleaningServicesIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Services</ListItemText>
        </MenuItem>,
        <MenuItem key="manage-businesses" onClick={() => handleMenuClick('/admin/businesses')}>
          <ListItemIcon>
            <BusinessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Businesses</ListItemText>
        </MenuItem>
      );
    }

    // Business menu items
    if (user.role === 'business') {
      menuItems.push(
        <MenuItem key="business-dashboard" onClick={() => handleMenuClick('/dashboard')}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Business Dashboard</ListItemText>
        </MenuItem>
      );
    }

    // Regular user menu items
    if (user.role === 'user') {
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
        </MenuItem>
      );
    }

    // Common menu items for all users
    menuItems.push(
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
                Home Cleaning
              </Typography>
            </Box>
          </Box>

          {/* Nav Links Center */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 3 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  color="inherit" 
                  sx={{ fontWeight: 600 }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* User Menu Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="end"
                onClick={toggleDrawer(true)}
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
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.name?.charAt(0)}
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
