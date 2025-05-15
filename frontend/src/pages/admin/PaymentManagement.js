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
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  Pending as PendingIcon,
  MoneyOff as RefundedIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileCopy as ReceiptIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// Payment status icon mapping
const StatusIcon = ({ status }) => {
  switch(status) {
    case 'completed':
      return <SuccessIcon sx={{ color: 'success.main' }} />;
    case 'failed':
      return <FailedIcon sx={{ color: 'error.main' }} />;
    case 'refunded':
      return <RefundedIcon sx={{ color: 'info.main' }} />;
    case 'pending':
    default:
      return <PendingIcon sx={{ color: 'warning.main' }} />;
  }
};

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllPayments();
      setPayments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid Date';
    }
  };

  // Filter payments based on search term and status filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.amount && payment.amount.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredPayments.length) : 0;

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
            Payment Management
          </Typography>
          <IconButton 
            color="primary" 
            sx={{ ml: 'auto' }} 
            onClick={fetchPayments}
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
              placeholder="Search by transaction ID, user, or business"
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
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </TextField>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="paymentsTable">
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((payment) => (
                    <TableRow key={payment._id || payment.transactionId || Math.random()}>
                      <TableCell>{payment.transactionId || 'N/A'}</TableCell>
                      <TableCell>{payment.userName || 'N/A'}</TableCell>
                      <TableCell>{payment.businessName || 'N/A'}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<StatusIcon status={payment.status} />}
                          label={payment.status || 'Unknown'}
                          color={
                            payment.status === 'completed' ? 'success' :
                            payment.status === 'failed' ? 'error' :
                            payment.status === 'refunded' ? 'info' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {payment.amount !== undefined && payment.amount !== null 
                          ? `$${Number(payment.amount).toFixed(2)}` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{payment.paymentMethod || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<ReceiptIcon />}
                          sx={{ minWidth: 120 }}
                        >
                          View Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={8} />
                  </TableRow>
                )}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPayments.length}
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

export default PaymentManagement; 