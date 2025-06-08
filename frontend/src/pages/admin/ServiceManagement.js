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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PhotoCamera as PhotoCameraIcon,
  CleaningServices as ServiceIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { formatImageUrl } from '../../utils/urlUtils';

const ServiceManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    business: ''
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    status: 'active',
    category: '',
    business: ''
  });
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    status: 'active',
    category: '',
    business: ''
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchServices(),
          fetchBusinesses(),
          fetchCategories()
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
        enqueueSnackbar('Échec de l\'initialisation des données', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await adminApi.getServices();
      setServices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la récupération des services');
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await adminApi.getBusinesses();
      setBusinesses(response.data);
    } catch (err) {
      enqueueSnackbar('Échec de la récupération des entreprises', { variant: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      enqueueSnackbar('Échec de la récupération des catégories', { variant: 'error' });
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setEditForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration: service.duration || '',
      status: service.status || 'active',
      category: service.category?._id || service.category || '',
      business: service.business?._id || service.business || ''
    });
  };

  const handleDeleteService = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleUpdateService = async () => {
    try {
      const response = await adminApi.updateService(selectedService._id, editForm);
      setServices(prevServices => 
        prevServices.map(service => 
          service._id === response.data._id ? response.data : service
        )
      );
      setSelectedService(null);
      enqueueSnackbar('Service mis à jour avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la mise à jour du service', { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteService(selectedService._id);
      setServices(prevServices => 
        prevServices.filter(service => service._id !== selectedService._id)
      );
      setDeleteDialogOpen(false);
      setSelectedService(null);
      enqueueSnackbar('Service supprimé avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la suppression du service', { variant: 'error' });
    }
  };

  const handleCreateService = async () => {
    try {
      const response = await adminApi.createService(createForm);
      setServices(prevServices => [...prevServices, response.data]);
      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        description: '',
        price: '',
        duration: '',
        status: 'active',
        category: '',
        business: ''
      });
      enqueueSnackbar('Service créé avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la création du service', { variant: 'error' });
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
      status: '',
      category: '',
      business: ''
    });
    setFilterAnchorEl(null);
  };

  const filterServices = () => {
    return services.filter(service => {
      const matchesSearch = 
        !searchTerm || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filters.status || service.status === filters.status;
      
      const matchesCategory = !filters.category || 
        (service.category && (
          (typeof service.category === 'string' && service.category === filters.category) ||
          (service.category._id === filters.category)
        ));
      
      const matchesBusiness = !filters.business || 
        (service.business && (
          (typeof service.business === 'string' && service.business === filters.business) ||
          (service.business._id === filters.business)
        ));
      
      return matchesSearch && matchesStatus && matchesCategory && matchesBusiness;
    });
  };

  const filteredServices = filterServices();

  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
  };

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
            onClick={fetchServices}
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
          Gestion des Services
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Ajouter un Service
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchServices}
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
                placeholder="Rechercher des services..."
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
                color={filters.status || filters.category || filters.business ? 'primary' : 'inherit'}
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  minWidth: '120px',
                  borderColor: filters.status || filters.category || filters.business ? 'primary.main' : 'divider',
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
                          {status ? (status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'En attente') : 'Tous les statuts'}
                        </ListItemText>
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Catégorie
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <MenuItem
                      key={'all-categories'}
                      onClick={() => {
                        handleFilterChange('category', '');
                        setFilterAnchorEl(null);
                      }}
                      selected={filters.category === ''}
                    >
                      <ListItemIcon>
                        {filters.category === '' && <CheckIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>Toutes les catégories</ListItemText>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem
                        key={category._id}
                        onClick={() => {
                          handleFilterChange('category', category._id);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.category === category._id}
                      >
                        <ListItemIcon>
                          {filters.category === category._id && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{category.name}</ListItemText>
                      </MenuItem>
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Entreprise
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <MenuItem
                      key={'all-businesses'}
                      onClick={() => {
                        handleFilterChange('business', '');
                        setFilterAnchorEl(null);
                      }}
                      selected={filters.business === ''}
                    >
                      <ListItemIcon>
                        {filters.business === '' && <CheckIcon fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText>Toutes les entreprises</ListItemText>
                    </MenuItem>
                    {businesses.map((business) => (
                      <MenuItem
                        key={business._id}
                        onClick={() => {
                          handleFilterChange('business', business._id);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.business === business._id}
                      >
                        <ListItemIcon>
                          {filters.business === business._id && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{business.name}</ListItemText>
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
                    <TableCell>Entreprise</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow 
                      key={service._id}
                      selected={selectedService?._id === service._id}
                      onClick={() => handleEditService(service)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.business?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {service.category
                          ? (typeof service.category === 'object' 
                              ? service.category.name 
                              : categories.find(c => c._id === service.category)?.name)
                          : 'Aucune'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.status === 'active' ? 'Actif' : service.status === 'inactive' ? 'Inactif' : 'En attente'}
                          color={service.status === 'active' ? 'success' : service.status === 'pending' ? 'warning' : 'default'}
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
            {selectedService ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Modifier le Service
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Nom"
                    value={editForm.name}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    value={editForm.description}
                    onChange={handleFormChange}
                    multiline
                    rows={3}
                  />
                  <TextField
                    fullWidth
                    name="price"
                    label="Prix"
                    value={editForm.price}
                    onChange={handleFormChange}
                    type="number"
                  />
                  <TextField
                    fullWidth
                    name="duration"
                    label="Durée (minutes)"
                    value={editForm.duration}
                    onChange={handleFormChange}
                    type="number"
                  />
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
                  <FormControl fullWidth>
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      name="category"
                      value={editForm.category || ''}
                      onChange={handleFormChange}
                      label="Catégorie"
                    >
                      <MenuItem value="">
                        <em>Aucune</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Entreprise</InputLabel>
                    <Select
                      name="business"
                      value={editForm.business || ''}
                      onChange={handleFormChange}
                      label="Entreprise"
                      required
                    >
                      {businesses.map(business => (
                        <MenuItem key={business._id} value={business._id}>
                          {business.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateService}
                      fullWidth
                    >
                      Enregistrer
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteService(selectedService)}
                      fullWidth
                    >
                      Supprimer
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
                <ServiceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sélectionnez un Service
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choisissez un service dans la liste pour voir et modifier ses détails
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer le Service</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce service ? Cette action ne peut pas être annulée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Service Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un Nouveau Service</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              name="name"
              label="Nom"
              value={createForm.name}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={createForm.description}
              onChange={handleCreateFormChange}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              name="price"
              label="Prix"
              value={createForm.price}
              onChange={handleCreateFormChange}
              type="number"
            />
            <TextField
              fullWidth
              name="duration"
              label="Durée (minutes)"
              value={createForm.duration}
              onChange={handleCreateFormChange}
              type="number"
            />
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
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                name="category"
                value={createForm.category || ''}
                onChange={handleCreateFormChange}
                label="Catégorie"
              >
                <MenuItem value="">
                  <em>Aucune</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Entreprise</InputLabel>
              <Select
                name="business"
                value={createForm.business || ''}
                onChange={handleCreateFormChange}
                label="Entreprise"
                required
              >
                {businesses.map(business => (
                  <MenuItem key={business._id} value={business._id}>
                    {business.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateService} variant="contained" color="primary">
            Créer le Service
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceManagement; 