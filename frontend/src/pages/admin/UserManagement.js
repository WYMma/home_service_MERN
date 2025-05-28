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
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as UserIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSnackbar } from 'notistack';
import { formatImageUrl } from '../../utils/urlUtils';

const UserManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    profileImage: ''
  });
  
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
    profileImage: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      status: user.status || 'active',
      profileImage: user.profileImage || ''
    });
    setImagePreview(user.profileImage ? getImageUrl(user.profileImage) : '');
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Créer une URL de prévisualisation
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('images', file);
    
    try {
      console.log('Téléchargement de l\'image:', file);
      const response = await adminApi.uploadImage(formData);
      console.log('Réponse du téléchargement:', response);
      return response.data.urls[0]; // Retourne juste le chemin, pas l'URL complète
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw error;
    }
  };

  const handleUpdateUser = async () => {
    try {
      setUploadingImage(true);
      let imageUrl = editForm.profileImage;

      // S'il y a une nouvelle image sélectionnée, la télécharger
      if (selectedImage) {
        console.log('Téléchargement de la nouvelle image...');
        imageUrl = await uploadImage(selectedImage);
        console.log('Nouvelle URL de l\'image:', imageUrl);
      }

      const userData = {
        ...editForm,
        profileImage: imageUrl
      };

      const response = await adminApi.updateUser(selectedUser._id, userData);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === response.data._id ? response.data : user
        )
      );
      setSelectedUser(null);
      setSelectedImage(null);
      setImagePreview('');
      enqueueSnackbar('Utilisateur mis à jour avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la mise à jour de l\'utilisateur', { variant: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteUser(selectedUser._id);
      setUsers(prevUsers => 
        prevUsers.filter(user => user._id !== selectedUser._id)
      );
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      enqueueSnackbar('Utilisateur supprimé avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la suppression de l\'utilisateur', { variant: 'error' });
    }
  };

  const handleCreateUser = async () => {
    try {
      setUploadingImage(true);
      let imageUrl = createForm.profileImage;

      // S'il y a une nouvelle image sélectionnée, la télécharger
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const userData = {
        ...createForm,
        profileImage: imageUrl
      };

      const response = await adminApi.createUser(userData);
      setUsers(prevUsers => [...prevUsers, response.data]);
      setCreateDialogOpen(false);
      setSelectedImage(null);
      setImagePreview('');
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        status: 'active',
        profileImage: ''
      });
      enqueueSnackbar('Utilisateur créé avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la création de l\'utilisateur', { variant: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e, value) => {
    if (e && e.target) {
      const { name, value: eventValue } = e.target;
      setFilters(prev => ({
        ...prev,
        [name]: eventValue
      }));
    } else if (typeof e === 'string') {
      setFilters(prev => ({
        ...prev,
        [e]: value
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      role: '',
      status: ''
    });
    setFilterAnchorEl(null);
  };

  const filterUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        !searchTerm || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesStatus = !filters.status || user.status === filters.status;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const filteredUsers = filterUsers();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchUsers}
            sx={{ mt: 2 }}
          >
            Réessayer
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: -4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des utilisateurs
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Ajouter un utilisateur
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
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
                placeholder="Rechercher des utilisateurs..."
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
                Filtres
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
                    Rôle
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {['', 'admin', 'user', 'business'].map((role) => (
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
                          {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Tous les rôles'}
                        </ListItemText>
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Statut
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {['', 'active', 'inactive', 'pending'].map((status) => (
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
                          {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Tous les statuts'}
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
                    Effacer les filtres
                  </Button>
                </Box>
              </Menu>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Statut</TableCell>
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
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={getImageUrl(user.profileImage)}
                            alt={`${user.firstName} ${user.lastName}`}
                            sx={{ width: 32, height: 32 }}
                          >
                            {!user.profileImage && user.firstName?.[0]}{user.lastName?.[0]}
                          </Avatar>
                          <Typography>
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'error' : user.role === 'business' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'default'}
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
                  Modifier l'utilisateur
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={imagePreview || getImageUrl(editForm.profileImage)}
                      alt={`${editForm.firstName} ${editForm.lastName}`}
                      sx={{ width: 100, height: 100 }}
                    >
                      {!editForm.profileImage && !imagePreview && editForm.firstName?.[0]}{editForm.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="user-image-upload"
                        type="file"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="user-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<PhotoCameraIcon />}
                        >
                          Changer la photo
                        </Button>
                      </label>
                      {imagePreview && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                          Cliquez sur "Enregistrer les modifications" pour appliquer la nouvelle photo
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      name="firstName"
                      label="Prénom"
                      value={editForm.firstName}
                      onChange={handleFormChange}
                    />
                    <TextField
                      fullWidth
                      name="lastName"
                      label="Nom"
                      value={editForm.lastName}
                      onChange={handleFormChange}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    value={editForm.email}
                    onChange={handleFormChange}
                    type="email"
                  />
                  <TextField
                    fullWidth
                    name="phone"
                    label="Téléphone"
                    value={editForm.phone}
                    onChange={handleFormChange}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Rôle</InputLabel>
                    <Select
                      name="role"
                      value={editForm.role}
                      onChange={handleFormChange}
                      label="Rôle"
                    >
                      <MenuItem value="user">Utilisateur</MenuItem>
                      <MenuItem value="admin">Administrateur</MenuItem>
                      <MenuItem value="business">Entreprise</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      name="status"
                      value={editForm.status}
                      onChange={handleFormChange}
                      label="Statut"
                    >
                      <MenuItem value="active">Actif</MenuItem>
                      <MenuItem value="inactive">Inactif</MenuItem>
                      <MenuItem value="pending">En attente</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateUser}
                      fullWidth
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <CircularProgress size={24} sx={{ mr: 1 }} />
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteUser(selectedUser)}
                      fullWidth
                    >
                      Supprimer l'utilisateur
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 8
                }}
              >
                <UserIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sélectionnez un utilisateur à modifier
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choisissez un utilisateur dans la liste pour afficher et modifier ses détails
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer l'utilisateur</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de création d'utilisateur */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                name="firstName"
                label="Prénom"
                value={createForm.firstName}
                onChange={handleCreateFormChange}
              />
              <TextField
                fullWidth
                name="lastName"
                label="Nom"
                value={createForm.lastName}
                onChange={handleCreateFormChange}
              />
            </Box>
            <TextField
              fullWidth
              name="email"
              label="Email"
              value={createForm.email}
              onChange={handleCreateFormChange}
              type="email"
            />
            <TextField
              fullWidth
              name="phone"
              label="Téléphone"
              value={createForm.phone}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="password"
              label="Mot de passe"
              value={createForm.password}
              onChange={handleCreateFormChange}
              type="password"
            />
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                name="role"
                value={createForm.role}
                onChange={handleCreateFormChange}
                label="Rôle"
              >
                <MenuItem value="user">Utilisateur</MenuItem>
                <MenuItem value="admin">Administrateur</MenuItem>
                <MenuItem value="business">Entreprise</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={createForm.status}
                onChange={handleCreateFormChange}
                label="Statut"
              >
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateUser} variant="contained" color="primary">
            Créer l'utilisateur
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;