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
  
  // États des dialogues
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // États du formulaire
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
      setError(err.response?.data?.message || 'Échec du chargement des employés');
      enqueueSnackbar('Échec du chargement des employés', { variant: 'error' });
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
        console.error('Erreur lors de la récupération des permissions:', err);
      }
    };

    if (business?._id && user?._id) {
      fetchEmployeePermissions();
    }
  }, [business?._id, user?._id]);

  const handleAddEmployee = async () => {
    try {
      if (!email) {
        enqueueSnackbar('L\'email est requis', { variant: 'error' });
        return;
      }

      const data = {
        email,
        role,
        permissions
      };

      await businessApi.addBusinessEmployee(business._id, data);
      enqueueSnackbar('Employé ajouté avec succès', { variant: 'success' });
      fetchEmployees();
      setAddDialogOpen(false);
      resetForm();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de l\'ajout de l\'employé', { variant: 'error' });
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
      enqueueSnackbar('Employé mis à jour avec succès', { variant: 'success' });
      fetchEmployees();
      setEditDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la mise à jour de l\'employé', { variant: 'error' });
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      if (!selectedEmployee) return;
      
      await businessApi.removeBusinessEmployee(business._id, selectedEmployee._id);
      enqueueSnackbar('Employé supprimé avec succès', { variant: 'success' });
      fetchEmployees();
      setConfirmDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la suppression de l\'employé', { variant: 'error' });
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
        <Typography>Chargement des employés...</Typography>
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
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Gestion de l'équipe (Propriétaire + {employees.length}/4 Employés)
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
          Ajouter un employé
        </Button>
      </Box>

      {employees.length >= 4 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Vous avez atteint la limite maximale de 4 employés.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Propriétaire de l'entreprise</Typography>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle2">{owner?.name || 'Propriétaire'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {owner?.email || 'Aucun email'} (Accès complet)
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>Employés</Typography>
      
      {employees.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Aucun employé ajouté pour le moment. Ajoutez des employés pour vous aider à gérer votre entreprise.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
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
                      label={employee.role === 'admin' ? 'Administrateur' : 'Staff'} 
                      color={employee.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {Object.entries(employee.permissions || {}).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={
                          key === 'manageBookings' ? 'Gérer les réservations' :
                          key === 'manageServices' ? 'Gérer les services' :
                          key === 'manageEmployees' ? 'Gérer les employés' : key
                        }
                        color={value ? 'success' : 'default'}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(employee)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
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

      {/* Dialogue d'ajout d'employé */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Ajouter un nouvel employé</DialogTitle>
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
            <InputLabel>Rôle</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Rôle"
            >
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
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
              label="Gérer les réservations"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageServices || false}
                  onChange={handlePermissionChange('manageServices')}
                />
              }
              label="Gérer les services"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageEmployees || false}
                  onChange={handlePermissionChange('manageEmployees')}
                />
              }
              label="Gérer les employés"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleAddEmployee} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de modification d'employé */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Modifier l'employé</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Rôle</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Rôle"
            >
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
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
              label="Gérer les réservations"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageServices || false}
                  onChange={handlePermissionChange('manageServices')}
                />
              }
              label="Gérer les services"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={permissions?.manageEmployees || false}
                  onChange={handlePermissionChange('manageEmployees')}
                />
              }
              label="Gérer les employés"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdateEmployee} variant="contained">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteEmployee} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement;