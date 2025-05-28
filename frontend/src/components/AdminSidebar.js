import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Tooltip, 
  useTheme,
  useMediaQuery,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PeopleIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PaymentIcon from '@mui/icons-material/Payment';
import CategoryIcon from '@mui/icons-material/Category';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';

const navItems = [
  { label: 'Tableau de bord', icon: <DashboardIcon />, path: '' },
  { label: 'Utilisateurs', icon: <PeopleIcon />, path: 'users' },
  { label: 'Entreprises', icon: <BusinessIcon />, path: 'businesses' },
  { label: 'Services', icon: <CleaningServicesIcon />, path: 'services' },
  { label: 'Réservations', icon: <BookOnlineIcon />, path: 'bookings' },
  { label: 'Paiements', icon: <PaymentIcon />, path: 'payments' },
  { label: 'Catégories', icon: <CategoryIcon />, path: 'categories' },
  { label: 'Programmes de formation', icon: <SchoolIcon />, path: 'training-programs' },
];

const drawerWidth = 240;

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.drawer,
      }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={!collapsed}
        sx={{
          width: collapsed ? 72 : drawerWidth,
          flexShrink: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          '& .MuiDrawer-paper': {
            width: collapsed ? 72 : drawerWidth,
            boxSizing: 'border-box',
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: 'auto',
            maxHeight: '80vh',
            position: 'relative',
            borderRadius: '0 16px 16px 0',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            py: 3,
          },
        }}
      >
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 3
        }}>
          <IconButton 
            onClick={() => setCollapsed(!collapsed)} 
            size="small" 
            sx={{ 
              mb: 2,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
              }
            }}
          >
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
          {!collapsed && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
                mb: 2
              }}
            >
              Panneau Admin
            </Typography>
          )}
        </Box>

        <List sx={{ 
          width: '100%', 
          px: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: 1,
          justifyContent: 'center'
        }}>
          {navItems.map((item) => (
            <Tooltip 
              key={item.label} 
              title={collapsed ? item.label : ''} 
              placement="right"
              arrow
            >
              <ListItem
                button
                component={Link}
                to={item.path}
                selected={location.pathname === `/admin/${item.path}`}
                sx={{
                  borderRadius: 2,
                  width: '100%',
                  bgcolor: location.pathname === `/admin/${item.path}` 
                    ? theme.palette.primary.main 
                    : 'transparent',
                  color: location.pathname === `/admin/${item.path}` 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.primary,
                  '&:hover': {
                    bgcolor: location.pathname === `/admin/${item.path}`
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                  },
                  minHeight: 48,
                  px: collapsed ? 1 : 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === `/admin/${item.path}` 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.primary.main,
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }} 
                  />
                )}
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default AdminSidebar; 