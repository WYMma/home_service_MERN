import { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, CardHeader, Divider, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Container } from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Business as BusinessIcon,
  BookOnline as BookingIcon,
  Star as StarIcon,
  CleaningServices as ServiceIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card 
    sx={{ 
      height: '100%',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ color, fontSize: { xs: 32, sm: 40 }, mr: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatMonthName = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
    } catch (err) {
      return 'Invalid';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Container><Typography color="error" align="center">{error}</Typography></Container>;

  const userRoleData = stats?.userRoleData || [];
  const bookingStatusData = stats?.bookingStatusData || [];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          Admin Dashboard
        </Typography>
        <Typography color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Overview of your platform's performance and statistics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={PeopleIcon} color="primary.main" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Businesses" value={stats?.totalBusinesses || 0} icon={BusinessIcon} color="success.main" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Services" value={stats?.totalServices || 0} icon={ServiceIcon} color="secondary.main" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Bookings" value={stats?.totalBookings || 0} icon={BookingIcon} color="warning.main" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Categories" value={stats?.totalCategories || 0} icon={CategoryIcon} color="#9C27B0" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard 
                title="Avg Rating" 
                value={stats?.averageRating !== undefined && stats?.averageRating !== null ? Number(stats.averageRating).toFixed(1) : 'N/A'} 
                icon={StarIcon} 
                color="error.main" 
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="User Growth" 
                  titleTypographyProps={{ variant: 'h6', sx: { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
                />
                <CardContent sx={{ height: { xs: 250, sm: 300 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={(stats?.userGrowthData || []).map(item => ({ ...item, month: formatMonthName(item.date || '') }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="New Users" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Booking Growth" 
                  titleTypographyProps={{ variant: 'h6', sx: { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
                />
                <CardContent sx={{ height: { xs: 250, sm: 300 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={(stats?.bookingGrowthData || []).map(item => ({ ...item, month: formatMonthName(item.date || '') }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="New Bookings" stroke="#82ca9d" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="User Roles" 
                  titleTypographyProps={{ variant: 'h6', sx: { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
                />
                <CardContent sx={{ height: { xs: 250, sm: 300 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="role"
                        label={({ role, count, percent }) => `${role || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      >
                        {userRoleData.map((entry, index) => (
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

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader 
                  title="Booking Status" 
                  titleTypographyProps={{ variant: 'h6', sx: { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
                />
                <CardContent sx={{ height: { xs: 250, sm: 300 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ status, count, percent }) => `${status || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      >
                        {bookingStatusData.map((entry, index) => (
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
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome; 