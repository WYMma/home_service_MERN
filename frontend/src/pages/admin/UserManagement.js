import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSnackbar } from 'notistack';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      await adminApi.updateUser(selectedUser._id, editForm);
      await fetchUsers();
      // Keep the same user selected after update
      const updatedUser = { ...selectedUser, ...editForm };
      setSelectedUser(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteUser(selectedUser._id);
      fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setEditForm({
        name: '',
        email: '',
        role: 'user',
        status: 'active'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async () => {
    try {
      await adminApi.createUser(createForm);
      await fetchUsers();
      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e, value) => {
    // If called with an event object
    if (e && e.target) {
      const { name, value: eventValue } = e.target;
      setFilters(prev => ({
        ...prev,
        [name]: eventValue
      }));
    } 
    // If called directly with name and value
    else if (typeof e === 'string') {
      setFilters(prev => ({
        ...prev,
        [e]: value
      }));
    }
  };

  const handleApplyFilters = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({
      role: '',
      status: ''
    });
    setFilterAnchorEl(null);
  };

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filters.role || user.role === filters.role) &&
    (!filters.status || user.status === filters.status)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add User
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left side - User List */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              height: '100%',
              border: 'none',
              backgroundColor: 'transparent'
            }}
          >
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                color={filters.role || filters.status ? 'primary' : 'inherit'}
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  minWidth: '120px',
                  borderColor: filters.role || filters.status ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                Filters
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => setFilterAnchorEl(null)}
                PaperProps={{
                  sx: { width: 300, maxWidth: '100%' }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Role
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {['', 'user', 'business', 'admin'].map((role) => (
                      <MenuItem
                        key={role || 'all'}
                        onClick={() => {
                          handleFilterChange('role', role);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.role === role}
                      >
                        <ListItemIcon>
                          {filters.role === role && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                          {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'All Roles'}
                        </ListItemText>
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {['', 'active', 'inactive', 'blocked'].map((status) => (
                      <MenuItem
                        key={status || 'all'}
                        onClick={() => {
                          handleFilterChange('status', status);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.status === status}
                      >
                        <ListItemIcon>
                          {filters.status === status && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Statuses'}
                        </ListItemText>
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    onClick={() => {
                      handleClearFilters();
                      setFilterAnchorEl(null);
                    }}
                    color="inherit"
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Menu>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user._id}
                      selected={selectedUser?._id === user._id}
                      onClick={() => handleEditUser(user)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'error' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={user.status === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right side - Edit Form */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%',
              border: 'none',
              backgroundColor: 'transparent'
            }}
          >
            {selectedUser ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Edit User
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Name"
                    value={editForm.name}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    value={editForm.email}
                    onChange={handleFormChange}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={editForm.role}
                      onChange={handleFormChange}
                      label="Role"
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="business">Business</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={editForm.status}
                      onChange={handleFormChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="blocked">Blocked</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateUser}
                      fullWidth
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteUser(selectedUser)}
                      fullWidth
                    >
                      Delete User
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography variant="h6" color="text.secondary">
                  Select a user to edit
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              name="name"
              label="Name"
              value={createForm.name}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={createForm.email}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={createForm.password}
              onChange={handleCreateFormChange}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={createForm.role}
                onChange={handleCreateFormChange}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={createForm.status}
                onChange={handleCreateFormChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" color="primary">
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 