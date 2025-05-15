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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        console.log('Dashboard stats:', response.data);
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  // Format month names for charts
  const formatMonthName = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid';
    }
  };

  // Prepare data for user role pie chart
  const userRoleData = stats?.userRoleData || [];
  
  // Prepare data for booking status pie chart
  const bookingStatusData = stats?.bookingStatusData || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 5, mb: 10, px: 4 }}>
      <Box sx={{ py: 3, px: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Main content grid with analytics on left, management options on right */}
        <Grid container spacing={4}>
          {/* Left side: Analytics and data charts */}
          <Grid item xs={12} md={9}>
            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={PeopleIcon}
              color="primary.main"
            />
          </Grid>
              <Grid item xs={12} sm={6} md={4}>
            <StatCard
                  title="Businesses"
              value={stats?.totalBusinesses || 0}
              icon={BusinessIcon}
              color="success.main"
            />
          </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Services"
                  value={stats?.totalServices || 0}
                  icon={ServiceIcon}
                  color="secondary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
            <StatCard
                  title="Bookings"
              value={stats?.totalBookings || 0}
              icon={BookingIcon}
              color="warning.main"
            />
          </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Categories"
                  value={stats?.totalCategories || 0}
                  icon={CategoryIcon}
                  color="#9C27B0"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
            <StatCard
                  title="Avg Rating"
                  value={stats?.averageRating !== undefined && stats?.averageRating !== null 
                    ? Number(stats.averageRating).toFixed(1) 
                    : 'N/A'}
              icon={StarIcon}
              color="error.main"
            />
          </Grid>
        </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* User Growth Chart */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="User Growth" />
                  <CardContent sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={(stats?.userGrowthData || []).map(item => ({
                          ...item,
                          month: formatMonthName(item.date || '')
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="New Users" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Booking Growth Chart */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Booking Growth" />
                  <CardContent sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={(stats?.bookingGrowthData || []).map(item => ({
                          ...item,
                          month: formatMonthName(item.date || '')
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="New Bookings" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* User Roles Pie Chart */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="User Roles" />
                  <CardContent sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userRoleData || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="role"
                          label={({ role, count, percent }) => 
                            `${role || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                          }
                        >
                          {(userRoleData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} users`, props.payload.role]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Booking Status Pie Chart */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Booking Status" />
                  <CardContent sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                          label={({ status, count, percent }) => 
                            `${status || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                          }
                        >
                          {(bookingStatusData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} bookings`, props.payload.status]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Popular Categories Bar Chart */}
              <Grid item xs={12}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Popular Categories" />
                  <CardContent sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats?.popularCategories || []}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Businesses" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Bookings Table */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Recent Bookings" 
                    action={
                      <Button 
                        component={Link} 
                        to="/admin/bookings" 
                        color="primary"
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: '#FFB800',
                          '&:hover': { bgcolor: '#E6A600' },
                        }}
                      >
                        View All
                      </Button>
                    }
                  />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell>Business</TableCell>
                          <TableCell>Service</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(stats?.recentBookings || []).map((booking) => (
                          <TableRow key={booking.id || Math.random()}>
                            <TableCell>{booking.userName || 'N/A'}</TableCell>
                            <TableCell>{booking.businessName || 'N/A'}</TableCell>
                            <TableCell>{booking.serviceName || 'N/A'}</TableCell>
                            <TableCell>
                              {booking.date 
                                ? new Date(booking.date).toLocaleDateString() 
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<StatusIcon status={booking.status} />}
                                label={booking.status || 'Unknown'}
                                color={
                                  booking.status === 'completed' ? 'info' :
                                  booking.status === 'confirmed' ? 'success' :
                                  booking.status === 'cancelled' ? 'error' : 'warning'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {booking.price !== undefined && booking.price !== null 
                                ? `$${Number(booking.price).toFixed(2)}` 
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">No recent bookings found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Right side: Management Options */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Management Options
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/users"
                  startIcon={<PeopleIcon />}
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    width: 240, 
                    alignSelf: 'center',
                    bgcolor: '#FFB800',
                    '&:hover': { bgcolor: '#E6A600' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Manage Users
                </Button>

                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/businesses"
                  startIcon={<BusinessIcon />}
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    width: 240, 
                    alignSelf: 'center',
                    bgcolor: '#FFB800',
                    '&:hover': { bgcolor: '#E6A600' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Manage Businesses
                </Button>

                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/services"
                  startIcon={<ServiceIcon />}
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    width: 240, 
                    alignSelf: 'center',
                    bgcolor: '#FFB800',
                    '&:hover': { bgcolor: '#E6A600' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Manage Services
                </Button>

                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/bookings"
                  startIcon={<BookingIcon />}
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    width: 240, 
                    alignSelf: 'center',
                    bgcolor: '#FFB800',
                    '&:hover': { bgcolor: '#E6A600' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Manage Bookings
                </Button>

                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/payments"
                  startIcon={<PaymentIcon />}
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    width: 240, 
                    alignSelf: 'center',
                    bgcolor: '#FFB800',
                    '&:hover': { bgcolor: '#E6A600' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Manage Payments
                </Button>

                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/admin/categories"
                  startIcon={<CategoryIcon />}
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    width: 240, 
                    alignSelf: 'center',
                    bgcolor: '#FFB800',
                    '&:hover': { bgcolor: '#E6A600' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Manage Categories
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 