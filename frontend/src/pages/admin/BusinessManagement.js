import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ListItemIcon,
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
  ArrowBack as BackIcon,
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Business as BusinessIcon } from '@mui/icons-material';
import { formatImageUrl } from '../../utils/urlUtils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema for business forms
const businessValidationSchema = Yup.object({
  name: Yup.string().required('Le nom est requis'),
  description: Yup.string().required('La description est requise'),
  email: Yup.string()
    .email('Adresse email invalide')
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      'Adresse email invalide (exemple: nom@domaine.com)'
    )
    .required('L\'email est requis'),
  phone: Yup.string()
    .matches(
      /^(\+216[0-9]{8}|[0-9]{8})$/,
      'Le numéro de téléphone doit être soit 8 chiffres, soit commencer par +216 suivi de 8 chiffres'
    )
    .required('Le numéro de téléphone est requis'),
  address: Yup.object({
    street: Yup.string().required('La rue est requise'),
    city: Yup.string().required('La ville est requise'),
    state: Yup.string().required('Le département est requis'),
    zipCode: Yup.string().required('Le code postal est requis'),
    country: Yup.string().required('Le pays est requis'),
  }),
  category: Yup.string().required('La catégorie est requise'),
  user: Yup.string().required('Le propriétaire est requis'),
  status: Yup.string().required('Le statut est requis'),
});

const BusinessManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businessOwners, setBusinessOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  
  const editFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      phone: '',
      email: '',
      status: 'active',
      category: '',
      user: '',
      images: []
    },
    validationSchema: businessValidationSchema,
    onSubmit: async (values) => {
      try {
        // Validate required fields
        if (!values.images || values.images.length === 0) {
          enqueueSnackbar('Impossible de sauvegarder : au moins une image est requise', { 
            variant: 'error',
            autoHideDuration: 4000,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center'
            },
            preventDuplicate: false
          });
          return;
        }
        
        // Make sure user is sent as a string ID
        const userId = typeof values.user === 'object' 
          ? (values.user._id || '') 
          : values.user;
          
        if (!userId) {
          enqueueSnackbar('Sélection de propriétaire invalide', { 
            variant: 'error',
            autoHideDuration: 4000,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center'
            }
          });
          return;
        }
        
        // Make sure category is sent as a string ID if present
        const categoryId = values.category
          ? (typeof values.category === 'object' 
              ? values.category._id 
              : values.category)
          : '';

        const businessData = {
          ...values,
          user: userId,
          category: categoryId || undefined
        };

        const response = await adminApi.updateBusiness(selectedBusiness._id, businessData);
        setBusinesses(prevBusinesses => 
          prevBusinesses.map(business => 
            business._id === selectedBusiness._id ? response.data : business
          )
        );
        setSelectedBusiness(null);
        enqueueSnackbar('Entreprise mise à jour avec succès', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(err.response?.data?.message || 'Échec de la mise à jour de l\'entreprise', { variant: 'error' });
      }
    }
  });

  const createFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      phone: '',
      email: '',
      status: 'active',
      category: '',
      user: '',
      images: []
    },
    validationSchema: businessValidationSchema,
    onSubmit: async (values) => {
      try {
        if (values.images.length === 0) {
          enqueueSnackbar('Veuillez télécharger au moins une image.', { variant: 'error' });
          return;
        }
        
        // Make sure user is sent as a string ID
        const userId = typeof values.user === 'object' 
          ? (values.user._id || '') 
          : values.user;
          
        if (!userId) {
          enqueueSnackbar('Sélection de propriétaire invalide', { variant: 'error' });
          return;
        }

        // Make sure category is sent as a string ID if present
        const categoryId = values.category
          ? (typeof values.category === 'object' 
              ? values.category._id 
              : values.category)
          : '';

        const createData = {
          ...values,
          user: userId,
          category: categoryId || undefined
        };

        const response = await adminApi.createBusiness(createData);
        await fetchBusinesses();
        setCreateDialogOpen(false);
        createFormik.resetForm();
        enqueueSnackbar('Entreprise créée avec succès', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(err.response?.data?.message || 'Échec de la création de l\'entreprise', { variant: 'error' });
      }
    }
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        // First fetch categories
        await fetchCategories();
        // Then fetch businesses and business owners
        await Promise.all([
          fetchBusinesses(),
          fetchBusinessOwners()
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
        enqueueSnackbar('Failed to initialize data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      console.log('Categories fetched:', response.data);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await adminApi.getBusinesses();
      console.log('Businesses fetched:', response.data);
      
      // Make sure we have the categories loaded before continuing
      if (categories.length === 0) {
        await fetchCategories();
      }
      
      // Ensure businesses have populated category objects
      const enhancedBusinesses = response.data.map(business => {
        // If category is just an ID (not populated), add a placeholder object
        if (business.category && typeof business.category === 'string') {
          // Find the category in our categories array
          const matchingCategory = categories.find(c => c._id === business.category);
          if (matchingCategory) {
            business.category = matchingCategory;
          }
        }
        return business;
      });
      
      setBusinesses(enhancedBusinesses);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      enqueueSnackbar('Failed to fetch businesses', { variant: 'error' });
    }
  };

  const fetchBusinessOwners = async () => {
    try {
      const response = await adminApi.getUsers();
      setBusinessOwners(response.data.filter(u => u.role === 'business'));
    } catch (err) {
      enqueueSnackbar('Failed to fetch business owners', { variant: 'error' });
    }
  };

  const handleEditBusiness = (business) => {
    setSelectedBusiness(business);
    
    // Extract category ID from business object
    const categoryId = business.category?._id || business.category || '';
    
    // Extract user ID from business object
    const userId = business.user?._id || business.user || '';
    
    editFormik.setValues({
      name: business.name || '',
      description: business.description || '',
      address: business.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      phone: business.phone || '',
      email: business.email || '',
      status: business.status || 'active',
      category: categoryId,
      user: userId,
      images: business.images || []
    });
  };

  const handleDeleteBusiness = (business) => {
    setSelectedBusiness(business);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteBusiness(selectedBusiness._id);
      fetchBusinesses();
      setDeleteDialogOpen(false);
      setSelectedBusiness(null);
      editFormik.resetForm();
      enqueueSnackbar('Entreprise supprimée avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la suppression de l\'entreprise', { variant: 'error' });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      editFormik.setFieldValue(name, value);
    } else {
      editFormik.setFieldValue(name, value);
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      createFormik.setFieldValue(name, value);
    } else {
      createFormik.setFieldValue(name, value);
    }
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

  const handleApplyFilters = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: ''
    });
    setFilterAnchorEl(null);
  };

  // Utility function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'None';
    
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Loading...';
  };

  const filterBusinesses = () => {
    return businesses.filter(business => {
      // Filter by search term
      const matchesSearch = 
        !searchTerm || 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = !filters.status || business.status === filters.status;
      
      // Filter by category
      const matchesCategory = !filters.category || 
        (business.category && (
          (typeof business.category === 'string' && business.category === filters.category) ||
          (business.category._id === filters.category)
        ));
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  const filteredBusinesses = filterBusinesses();

  const handleImageUpload = async (e, isCreate = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await adminApi.uploadImage(formData);
      console.log('Upload response:', response.data);

      if (response.data.success && response.data.urls) {
        const imageUrls = response.data.urls;
        
        if (imageUrls.length === 0) {
          enqueueSnackbar('Échec du téléchargement des images. Veuillez réessayer.', { variant: 'error' });
          return;
        }
        
        if (isCreate) {
          createFormik.setFieldValue('images', [...createFormik.values.images, ...imageUrls].slice(0, 10));
        } else {
          editFormik.setFieldValue('images', [...editFormik.values.images, ...imageUrls].slice(0, 10));
        }

        enqueueSnackbar('Images uploaded successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to upload images', { variant: 'error' });
    }
  };

  const handleRemoveImage = (index, isCreate = false) => {
    if (isCreate) {
      if (createFormik.values.images.length <= 1) {
        enqueueSnackbar('Au moins une image est requise', { variant: 'error' });
        return;
      }
      createFormik.setFieldValue('images', createFormik.values.images.filter((_, i) => i !== index));
    } else {
      if (editFormik.values.images.length <= 1) {
        enqueueSnackbar('Au moins une image est requise', { variant: 'error' });
        return;
      }
      editFormik.setFieldValue('images', editFormik.values.images.filter((_, i) => i !== index));
    }
  };

  const handleSetMainImage = (index, isCreate = false) => {
    if (isCreate) {
      if (createFormik.values.images.length <= 1) {
        enqueueSnackbar('Au moins une image est requise', { variant: 'error' });
        return;
      }
      createFormik.setFieldValue('image', createFormik.values.images[index]);
      createFormik.setFieldValue('images', createFormik.values.images.filter((_, i) => i !== index));
    } else {
      if (editFormik.values.images.length <= 1) {
        enqueueSnackbar('Au moins une image est requise', { variant: 'error' });
        return;
      }
      editFormik.setFieldValue('image', editFormik.values.images[index]);
      editFormik.setFieldValue('images', editFormik.values.images.filter((_, i) => i !== index));
    }
  };

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
            onClick={fetchBusinesses}
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
          Gestion des Entreprises
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Ajouter une Entreprise
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBusinesses}
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
                placeholder="Rechercher des entreprises..."
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
                color={filters.status || filters.category ? 'primary' : 'inherit'}
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  minWidth: '120px',
                  borderColor: filters.status || filters.category ? 'primary.main' : 'divider',
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
                    <TableCell>Propriétaire</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow 
                      key={business._id}
                      selected={selectedBusiness?._id === business._id}
                      onClick={() => handleEditBusiness(business)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <TableCell>{business.name}</TableCell>
                      <TableCell>
                        {business.user ? `${business.user.firstName} ${business.user.lastName}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {business.category
                          ? (typeof business.category === 'object' 
                              ? business.category.name 
                              : getCategoryName(business.category))
                          : 'Aucune'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={business.status === 'active' ? 'Actif' : business.status === 'inactive' ? 'Inactif' : 'En attente'}
                          color={business.status === 'active' ? 'success' : business.status === 'pending' ? 'warning' : 'default'}
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
            {selectedBusiness ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Modifier l'Entreprise
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Images ({editFormik.values.images.length}/10)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="business-image-upload"
                          type="file"
                          multiple
                          onChange={(e) => handleImageUpload(e, false)}
                        />
                        <label htmlFor="business-image-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<PhotoCameraIcon />}
                          >
                            Ajouter des Images
                          </Button>
                        </label>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {editFormik.values.images.map((image, index) => (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <Avatar
                            src={getImageUrl(image)}
                            alt={`Image ${index + 1}`}
                            sx={{ width: 64, height: 64 }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: 'background.paper' }
                            }}
                            onClick={() => handleRemoveImage(index, false)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <form onSubmit={editFormik.handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Nom"
                        value={editFormik.values.name}
                        onChange={handleFormChange}
                        onBlur={editFormik.handleBlur}
                        error={editFormik.touched.name && Boolean(editFormik.errors.name)}
                        helperText={editFormik.touched.name && editFormik.errors.name}
                      />
                      <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        multiline
                        rows={4}
                        value={editFormik.values.description}
                        onChange={handleFormChange}
                        onBlur={editFormik.handleBlur}
                        error={editFormik.touched.description && Boolean(editFormik.errors.description)}
                        helperText={editFormik.touched.description && editFormik.errors.description}
                      />
                      <TextField
                        fullWidth
                        name="email"
                        label="Email"
                        value={editFormik.values.email}
                        onChange={handleFormChange}
                        onBlur={editFormik.handleBlur}
                        error={editFormik.touched.email && Boolean(editFormik.errors.email)}
                        helperText={editFormik.touched.email && editFormik.errors.email}
                        type="email"
                      />
                      <TextField
                        fullWidth
                        name="phone"
                        label="Téléphone"
                        value={editFormik.values.phone}
                        onChange={handleFormChange}
                        onBlur={editFormik.handleBlur}
                        error={editFormik.touched.phone && Boolean(editFormik.errors.phone)}
                        helperText={editFormik.touched.phone && editFormik.errors.phone}
                      />
                      <TextField
                        fullWidth
                        name="address.street"
                        label="Rue"
                        value={editFormik.values.address.street}
                        onChange={handleFormChange}
                        onBlur={editFormik.handleBlur}
                        error={editFormik.touched.address?.street && Boolean(editFormik.errors.address?.street)}
                        helperText={editFormik.touched.address?.street && editFormik.errors.address?.street}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          name="address.city"
                          label="Ville"
                          value={editFormik.values.address.city}
                          onChange={handleFormChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.address?.city && Boolean(editFormik.errors.address?.city)}
                          helperText={editFormik.touched.address?.city && editFormik.errors.address?.city}
                        />
                        <TextField
                          fullWidth
                          name="address.state"
                          label="Département"
                          value={editFormik.values.address.state}
                          onChange={handleFormChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.address?.state && Boolean(editFormik.errors.address?.state)}
                          helperText={editFormik.touched.address?.state && editFormik.errors.address?.state}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          name="address.zipCode"
                          label="Code Postal"
                          value={editFormik.values.address.zipCode}
                          onChange={handleFormChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.address?.zipCode && Boolean(editFormik.errors.address?.zipCode)}
                          helperText={editFormik.touched.address?.zipCode && editFormik.errors.address?.zipCode}
                        />
                        <TextField
                          fullWidth
                          name="address.country"
                          label="Pays"
                          value={editFormik.values.address.country}
                          onChange={handleFormChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.address?.country && Boolean(editFormik.errors.address?.country)}
                          helperText={editFormik.touched.address?.country && editFormik.errors.address?.country}
                        />
                      </Box>
                      <FormControl fullWidth>
                        <InputLabel>Catégorie</InputLabel>
                        <Select
                          name="category"
                          value={editFormik.values.category || ''}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.category && Boolean(editFormik.errors.category)}
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
                        <InputLabel>Propriétaire</InputLabel>
                        <Select
                          name="user"
                          value={editFormik.values.user || ''}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.user && Boolean(editFormik.errors.user)}
                          label="Propriétaire"
                          required
                        >
                          {businessOwners.map(owner => (
                            <MenuItem key={owner._id} value={owner._id}>
                              {`${owner.firstName} ${owner.lastName}`} ({owner.email})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Statut</InputLabel>
                        <Select
                          name="status"
                          value={editFormik.values.status}
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.status && Boolean(editFormik.errors.status)}
                          label="Statut"
                        >
                          <MenuItem value="active">Actif</MenuItem>
                          <MenuItem value="inactive">Inactif</MenuItem>
                          <MenuItem value="pending">En attente</MenuItem>
                        </Select>
                      </FormControl>
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                        >
                          Enregistrer les modifications
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteBusiness(selectedBusiness)}
                          fullWidth
                        >
                          Supprimer l'entreprise
                        </Button>
                      </Box>
                    </Box>
                  </form>
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
                <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sélectionnez une Entreprise
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choisissez une entreprise dans la liste pour voir et modifier ses détails
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer l'Entreprise</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette entreprise ? Tous les services associés seront également supprimés. Cette action ne peut pas être annulée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Business Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une nouvelle entreprise</DialogTitle>
        <DialogContent>
          <form onSubmit={createFormik.handleSubmit}>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                name="name"
                label="Nom"
                value={createFormik.values.name}
                onChange={handleCreateFormChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.name && Boolean(createFormik.errors.name)}
                helperText={createFormik.touched.name && createFormik.errors.name}
              />
              <TextField
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={4}
                value={createFormik.values.description}
                onChange={handleCreateFormChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.description && Boolean(createFormik.errors.description)}
                helperText={createFormik.touched.description && createFormik.errors.description}
              />
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={createFormik.values.email}
                onChange={handleCreateFormChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.email && Boolean(createFormik.errors.email)}
                helperText={createFormik.touched.email && createFormik.errors.email}
                type="email"
              />
              <TextField
                fullWidth
                name="phone"
                label="Téléphone"
                value={createFormik.values.phone}
                onChange={handleCreateFormChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.phone && Boolean(createFormik.errors.phone)}
                helperText={createFormik.touched.phone && createFormik.errors.phone}
              />
              <TextField
                fullWidth
                name="address.street"
                label="Rue"
                value={createFormik.values.address.street}
                onChange={handleCreateFormChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.address?.street && Boolean(createFormik.errors.address?.street)}
                helperText={createFormik.touched.address?.street && createFormik.errors.address?.street}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="address.city"
                  label="Ville"
                  value={createFormik.values.address.city}
                  onChange={handleCreateFormChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.address?.city && Boolean(createFormik.errors.address?.city)}
                  helperText={createFormik.touched.address?.city && createFormik.errors.address?.city}
                />
                <TextField
                  fullWidth
                  name="address.state"
                  label="Département"
                  value={createFormik.values.address.state}
                  onChange={handleCreateFormChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.address?.state && Boolean(createFormik.errors.address?.state)}
                  helperText={createFormik.touched.address?.state && createFormik.errors.address?.state}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  name="address.zipCode"
                  label="Code Postal"
                  value={createFormik.values.address.zipCode}
                  onChange={handleCreateFormChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.address?.zipCode && Boolean(createFormik.errors.address?.zipCode)}
                  helperText={createFormik.touched.address?.zipCode && createFormik.errors.address?.zipCode}
                />
                <TextField
                  fullWidth
                  name="address.country"
                  label="Pays"
                  value={createFormik.values.address.country}
                  onChange={handleCreateFormChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.address?.country && Boolean(createFormik.errors.address?.country)}
                  helperText={createFormik.touched.address?.country && createFormik.errors.address?.country}
                />
              </Box>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={createFormik.values.category || ''}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.category && Boolean(createFormik.errors.category)}
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
                <InputLabel>Propriétaire</InputLabel>
                <Select
                  name="user"
                  value={createFormik.values.user || ''}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.user && Boolean(createFormik.errors.user)}
                  label="Propriétaire"
                >
                  {businessOwners.map(owner => (
                    <MenuItem key={owner._id} value={owner._id}>
                      {`${owner.firstName} ${owner.lastName}`} ({owner.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={createFormik.values.status}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.status && Boolean(createFormik.errors.status)}
                  label="Statut"
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
              <Button type="submit" variant="contained" color="primary">
                Créer l'entreprise
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default BusinessManagement; 