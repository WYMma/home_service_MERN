import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  Chip,
  Box,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  CheckCircle as ConfirmedIcon,
  Cancel as CancelledIcon,
  Pending as PendingIcon,
  Done as CompletedIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
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

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllBookings();
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Filter bookings based on search term and status filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredBookings.length) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ mt: 5, mb: 10, px: 4 }}>
      <Box sx={{ py: 3, px: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            component={Link} 
            to="/admin/dashboard" 
            startIcon={<BackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1">
            Booking Management
          </Typography>
          <IconButton 
            color="primary" 
            sx={{ ml: 'auto' }} 
            onClick={fetchBookings}
            title="Refresh"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by customer, business or service"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              variant="outlined"
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="bookingsTable">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                    <TableRow key={booking._id || Math.random()}>
                      <TableCell>{booking._id?.substring(0, 8) || 'N/A'}</TableCell>
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
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          variant="outlined"
                          sx={{ minWidth: 100 }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={8} />
                  </TableRow>
                )}
                {filteredBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredBookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default BookingManagement; 