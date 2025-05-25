import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Tooltip,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { businessApi } from '../../services/api';

const EmployeeManagement = ({ business }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [permissions, setPermissions] = useState({
    manageBookings: true,
    manageServices: false,
    viewAnalytics: true,
    editProfile: false
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await businessApi.getBusinessEmployees(business._id);
      setEmployees(response.data.employees || []);
      setOwner(response.data.owner || null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
      enqueueSnackbar('Failed to load employees', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [business._id, enqueueSnackbar]);

  useEffect(() => {
    if (business?._id) {
      fetchEmployees();
    }
  }, [business?._id, fetchEmployees]);

  const handleAddEmployee = async () => {
    try {
      if (!email) {
        enqueueSnackbar('Email is required', { variant: 'error' });
        return;
      }

      const data = {
        email,
        role,
        permissions
      };

      await businessApi.addBusinessEmployee(business._id, data);
      enqueueSnackbar('Employee added successfully', { variant: 'success' });
      fetchEmployees();
      setAddDialogOpen(false);
      resetForm();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to add employee', { variant: 'error' });
    }
  };

  const handleUpdateEmployee = async () => {
    try {
      if (!selectedEmployee) return;

      const data = {
        role,
        permissions
      };

      await businessApi.updateEmployeePermissions(business._id, selectedEmployee._id, data);
      enqueueSnackbar('Employee updated successfully', { variant: 'success' });
      fetchEmployees();
      setEditDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to update employee', { variant: 'error' });
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      if (!selectedEmployee) return;
      
      await businessApi.removeBusinessEmployee(business._id, selectedEmployee._id);
      enqueueSnackbar('Employee removed successfully', { variant: 'success' });
      fetchEmployees();
      setConfirmDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to remove employee', { variant: 'error' });
    }
  };

  const openEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setRole(employee.role);
    setPermissions(employee.permissions);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (employee) => {
    setSelectedEmployee(employee);
    setConfirmDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setEmail('');
    setRole('staff');
    setPermissions({
      manageBookings: true,
      manageServices: false,
      viewAnalytics: true,
      editProfile: false
    });
  };

  const handlePermissionChange = (permission) => (event) => {
    setPermissions({
      ...permissions,
      [permission]: event.target.checked
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading employees...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={fetchEmployees}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Team Management (Owner + {employees.length}/4 Employees)
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setAddDialogOpen(true);
          }}
          disabled={employees.length >= 4}
        >
          Add Employee
        </Button>
      </Box>

      {employees.length >= 4 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You've reached the maximum limit of 4 employees.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Business Owner</Typography>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle2">{owner?.name || 'Owner'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {owner?.email || 'No email'} (Full Access)
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>Employees</Typography>
      
      {employees.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No employees added yet. Add employees to help manage your business.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{`${employee.user?.firstName || ''} ${employee.user?.lastName || ''}` || 'N/A'}</TableCell>
                  <TableCell>{employee.user?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.role === 'manager' ? 'Manager' : 'Staff'} 
                      color={employee.role === 'manager' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {employee.permissions?.manageBookings && (
                        <Chip label="Bookings" size="small" color="info" />
                      )}
                      {employee.permissions?.manageServices && (
                        <Chip label="Services" size="small" color="success" />
                      )}
                      {employee.permissions?.viewAnalytics && (
                        <Chip label="Analytics" size="small" color="warning" />
                      )}
                      {employee.permissions?.editProfile && (
                        <Chip label="Edit Profile" size="small" color="error" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Permissions">
                      <IconButton size="small" onClick={() => openEditDialog(employee)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove Employee">
                      <IconButton size="small" color="error" onClick={() => openDeleteDialog(employee)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email Address"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter employee's email address"
              helperText="User must already have an account in the system"
            />
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Permissions</Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.manageBookings} 
                  onChange={handlePermissionChange('manageBookings')}
                />
              }
              label="Manage Bookings"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.manageServices} 
                  onChange={handlePermissionChange('manageServices')}
                />
              }
              label="Manage Services"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.viewAnalytics} 
                  onChange={handlePermissionChange('viewAnalytics')}
                />
              }
              label="View Analytics"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.editProfile} 
                  onChange={handlePermissionChange('editProfile')}
                />
              }
              label="Edit Business Profile"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee}>Add Employee</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee Permissions</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">
              {selectedEmployee?.user?.name} ({selectedEmployee?.user?.email})
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Permissions</Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.manageBookings} 
                  onChange={handlePermissionChange('manageBookings')}
                />
              }
              label="Manage Bookings"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.manageServices} 
                  onChange={handlePermissionChange('manageServices')}
                />
              }
              label="Manage Services"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.viewAnalytics} 
                  onChange={handlePermissionChange('viewAnalytics')}
                />
              }
              label="View Analytics"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={permissions.editProfile} 
                  onChange={handlePermissionChange('editProfile')}
                />
              }
              label="Edit Business Profile"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateEmployee}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Remove Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedEmployee?.user?.name} ({selectedEmployee?.user?.email}) from your business?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteEmployee}>
            Remove Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement; 