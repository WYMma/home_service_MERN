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
import { useAuth } from '../../contexts/AuthContext';

const EmployeeManagement = ({ business }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
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
  const [permissions, setPermissions] = useState(null);

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

  useEffect(() => {
    const fetchEmployeePermissions = async () => {
      try {
        const response = await businessApi.getBusinessEmployees(business._id);
        const employee = response.data.employees.find(emp => emp.user._id === user?._id);
        if (employee) {
          setPermissions(employee.permissions);
        }
      } catch (err) {
        console.error('Error fetching employee permissions:', err);
      }
    };

    if (business?._id && user?._id) {
      fetchEmployeePermissions();
    }
  }, [business?._id, user?._id]);

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
    setPermissions(null);
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee.user?.name || 'N/A'}</TableCell>
                  <TableCell>{employee.user?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={employee.role} 
                      color={employee.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {Object.entries(employee.permissions || {}).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={key}
                        color={value ? 'success' : 'default'}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(employee)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(employee)}
                      >
                        <DeleteIcon />
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
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Permissions
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageBookings || false}
                  onChange={handlePermissionChange('manageBookings')}
                />
              }
              label="Manage Bookings"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageServices || false}
                  onChange={handlePermissionChange('manageServices')}
                />
              }
              label="Manage Services"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageEmployees || false}
                  onChange={handlePermissionChange('manageEmployees')}
                />
              }
              label="Manage Employees"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddEmployee} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Permissions
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageBookings || false}
                  onChange={handlePermissionChange('manageBookings')}
                />
              }
              label="Manage Bookings"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageServices || false}
                  onChange={handlePermissionChange('manageServices')}
                />
              }
              label="Manage Services"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageEmployees || false}
                  onChange={handlePermissionChange('manageEmployees')}
                />
              }
              label="Manage Employees"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateEmployee} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this employee? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteEmployee} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement; 