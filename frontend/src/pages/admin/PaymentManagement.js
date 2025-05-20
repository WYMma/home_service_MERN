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
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  Pending as PendingIcon,
  MoneyOff as RefundedIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FileCopy as ReceiptIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from 'notistack';

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
  const { enqueueSnackbar } = useSnackbar();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

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

  const handleViewDetails = async (payment) => {
    try {
      const response = await adminApi.getPaymentDetails(payment._id);
      setSelectedPayment(response.data);
      setDetailsDialogOpen(true);
    } catch (err) {
      enqueueSnackbar('Failed to fetch payment details', { variant: 'error' });
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await adminApi.updatePaymentStatus(selectedPayment._id, newStatus);
      enqueueSnackbar('Payment status updated successfully', { variant: 'success' });
      setStatusDialogOpen(false);
      fetchPayments();
    } catch (err) {
      enqueueSnackbar('Failed to update payment status', { variant: 'error' });
    }
  };

  const handleGenerateReport = async () => {
    try {
      const params = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminApi.getPaymentReport(params);
      setReportData(response.data);
    } catch (err) {
      enqueueSnackbar('Failed to generate report', { variant: 'error' });
    }
  };

  const handleExportPayments = async () => {
    try {
      const params = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminApi.exportPayments(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payments-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      enqueueSnackbar('Failed to export payments', { variant: 'error' });
    }
  };

  // Filter payments based on search term, status filter, and date range
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.amount && payment.amount.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    const matchesDateRange = (!startDate || new Date(payment.createdAt) >= startDate) &&
                            (!endDate || new Date(payment.createdAt) <= endDate);
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredPayments.length) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: -4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPayments}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {reportData && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Payment Report</Typography>
            <IconButton onClick={() => setReportData(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Payments</Typography>
                  <Typography variant="h4">{reportData.totalPayments}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Amount</Typography>
                  <Typography variant="h4">${reportData.totalAmount.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Status Distribution</Typography>
                  <Stack spacing={1}>
                    {Object.entries(reportData.statusCounts).map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>{status}</Typography>
                        <Typography>{count}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ width: '100%', mb: 2, p: 2, boxShadow: 'none' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search payments..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
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
                    <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
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
                        ? `${Number(payment.amount).toFixed(2)} TND` 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{payment.paymentMethod || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setStatusDialogOpen(true);
                            }}
                          >
                            <FilterIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
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

      {/* Payment Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Transaction ID</Typography>
                <Typography>{selectedPayment.transactionId}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                <Typography>{Number(selectedPayment.amount).toFixed(2)} TND</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip
                  icon={<StatusIcon status={selectedPayment.status} />}
                  label={selectedPayment.status}
                  color={
                    selectedPayment.status === 'completed' ? 'success' :
                    selectedPayment.status === 'failed' ? 'error' :
                    selectedPayment.status === 'refunded' ? 'info' : 'warning'
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Payment Method</Typography>
                <Typography>{selectedPayment.paymentMethod}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">User</Typography>
                <Typography>{selectedPayment.userName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Business</Typography>
                <Typography>{selectedPayment.businessName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Subscription Type</Typography>
                <Typography>{selectedPayment.subscriptionType}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Subscription Period</Typography>
                <Typography>
                  {new Date(selectedPayment.subscriptionStartDate).toLocaleDateString()} - 
                  {new Date(selectedPayment.subscriptionEndDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                <Typography>{new Date(selectedPayment.createdAt).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Current Status</Typography>
            <Chip
              icon={<StatusIcon status={selectedPayment?.status} />}
              label={selectedPayment?.status}
              color={
                selectedPayment?.status === 'completed' ? 'success' :
                selectedPayment?.status === 'failed' ? 'error' :
                selectedPayment?.status === 'refunded' ? 'info' : 'warning'
              }
            />
          </Box>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>New Status</Typography>
            <Stack direction="row" spacing={1}>
              {['pending', 'completed', 'failed', 'refunded'].map((status) => (
                <Chip
                  key={status}
                  icon={<StatusIcon status={status} />}
                  label={status}
                  onClick={() => handleUpdateStatus(status)}
                  color={
                    status === 'completed' ? 'success' :
                    status === 'failed' ? 'error' :
                    status === 'refunded' ? 'info' : 'warning'
                  }
                />
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentManagement; 