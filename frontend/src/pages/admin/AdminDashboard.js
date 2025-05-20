import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Business as BusinessIcon,
  BookOnline as BookingIcon,
  Star as StarIcon,
  ManageAccounts as ManageAccountsIcon,
  CleaningServices as ServiceIcon,
  Category as CategoryIcon,
  VerifiedUser as AdminIcon,
  Person as UserIcon,
  Store as BizUserIcon,
  CheckCircle as ConfirmedIcon,
  Cancel as CancelledIcon,
  Pending as PendingIcon,
  Done as CompletedIcon,
  Payment as PaymentIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdminSidebar from '../../components/AdminSidebar';
import { Outlet } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { useDispatch } from 'react-redux';

// Status icon mapping
const StatusIcon = ({ status }) => {
  switch(status) {
    case 'confirmed':
      return <ConfirmedIcon sx={{ color: 'success.main' }} />;
    case 'cancelled':
      return <CancelledIcon sx={{ color: 'error.main' }} />;
    case 'completed':
      return <CompletedIcon sx={{ color: 'info.main' }} />;
    case 'pending':
    default:
      return <PendingIcon sx={{ color: 'warning.main' }} />;
  }
};

// Role icon mapping
const RoleIcon = ({ role }) => {
  switch(role) {
    case 'admin':
      return <AdminIcon sx={{ color: 'error.main' }} />;
    case 'business':
      return <BizUserIcon sx={{ color: 'success.main' }} />;
    case 'user':
    default:
      return <UserIcon sx={{ color: 'primary.main' }} />;
  }
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ color, fontSize: 40, mr: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      position: 'relative'
    }}>
      <AdminSidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${isMobile ? 0 : 240}px)` },
          ml: { xs: 0, md: '240px' },
          p: { xs: 2, sm: 3, md: 4 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminDashboard; 