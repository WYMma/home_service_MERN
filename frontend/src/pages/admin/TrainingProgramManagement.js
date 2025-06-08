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
  ArrowBack as BackIcon,
  Star as StarIcon,
  CloudUpload as CloudUploadIcon,
  School as TrainingProgramIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { trainingProgramApi, adminApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { formatImageUrl } from '../../utils/urlUtils';

// Helper to get full image URL
const getImageUrl = (url) => {
  return formatImageUrl(url);
};

const TrainingProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    isPopular: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    image: '',
    duration: '',
    rating: 0,
    reviews: 0,
    price: 0,
    description: '',
    isPopular: false
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    image: '',
    duration: '',
    rating: 0,
    reviews: 0,
    price: 0,
    description: '',
    isPopular: false
  });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await trainingProgramApi.getAll();
      setPrograms(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la récupération des programmes de formation');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = (program) => {
    setSelectedProgram(program);
    setEditForm({
      name: program.name || '',
      image: program.image || '',
      duration: program.duration || '',
      rating: program.rating || 0,
      reviews: program.reviews || 0,
      price: program.price || 0,
      description: program.description || '',
      isPopular: program.isPopular || false
    });
  };

  const handleDeleteProgram = (program) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  const handleUpdateProgram = async () => {
    try {
      const updateData = { ...editForm };
      delete updateData.imageFile;
      updateData.image = editForm.image;
      const response = await trainingProgramApi.update(selectedProgram._id, updateData);
      setPrograms(prevPrograms => 
        prevPrograms.map(program => 
          program._id === selectedProgram._id ? response.data : program
        )
      );
      setSelectedProgram(response.data);
      setEditForm(prev => ({ ...prev, image: response.data.image }));
      enqueueSnackbar('Programme mis à jour avec succès', { variant: 'success' });
      await fetchPrograms();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la mise à jour du programme', { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await trainingProgramApi.delete(selectedProgram._id);
      setPrograms(prevPrograms => 
        prevPrograms.filter(program => program._id !== selectedProgram._id)
      );
      setDeleteDialogOpen(false);
      setSelectedProgram(null);
      enqueueSnackbar('Programme supprimé avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la suppression du programme', { variant: 'error' });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateProgram = async () => {
    try {
      const formData = new FormData();
      Object.keys(createForm).forEach(key => {
        if (key === 'imageFile' && createForm[key]) {
          formData.append('image', createForm[key]);
        } else if (key !== 'imageFile') {
          formData.append(key, createForm[key]);
        }
      });

      const response = await trainingProgramApi.create(formData);
      setPrograms(prevPrograms => [...prevPrograms, response.data]);
      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        image: '',
        duration: '',
        rating: 0,
        reviews: 0,
        price: 0,
        description: '',
        isPopular: false
      });
      enqueueSnackbar('Programme créé avec succès', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Échec de la création du programme', { variant: 'error' });
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleApplyFilters = () => {
    setFilterAnchorEl(null);
  };

  const handleClearFilters = () => {
    setFilters({
      isPopular: ''
    });
    setFilterAnchorEl(null);
  };

  const handleImageUpload = async (e, isCreate = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('images', file);
    try {
      const response = await adminApi.uploadImage(formData);
      if (response.data.success && response.data.urls && response.data.urls[0]) {
        const imageUrl = response.data.urls[0];
        if (isCreate) {
          setCreateForm(prev => ({ ...prev, image: imageUrl }));
        } else {
          setEditForm(prev => ({ ...prev, image: imageUrl }));
        }
        enqueueSnackbar('Images téléchargées avec succès', { variant: 'success' });
      } else {
        enqueueSnackbar('Échec du téléchargement de l\'image', { variant: 'error' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Échec du téléchargement des images', { variant: 'error' });
    }
  };

  const handleRemoveImage = (isCreate = false) => {
    if (isCreate) {
      setCreateForm(prev => ({ ...prev, image: '' }));
    } else {
      setEditForm(prev => ({ ...prev, image: '' }));
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filters.isPopular === '' || program.isPopular === (filters.isPopular === 'true'))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, ml: -4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des Programmes de Formation
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Ajouter un Programme
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPrograms}
          >
            Actualiser
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {/* Left side - Program List */}
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
                placeholder="Rechercher des programmes..."
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
                color={filters.isPopular ? 'primary' : 'inherit'}
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ 
                  minWidth: '120px',
                  borderColor: filters.isPopular ? 'primary.main' : 'divider',
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
                    Statut de Popularité
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {['', 'true', 'false'].map((status) => (
                      <MenuItem
                        key={status || 'all'}
                        onClick={() => {
                          handleFilterChange('isPopular', status);
                          setFilterAnchorEl(null);
                        }}
                        selected={filters.isPopular === status}
                      >
                        <ListItemIcon>
                          {filters.isPopular === status && <CheckIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>
                          {status === '' ? 'Tous les programmes' : 
                           status === 'true' ? 'Populaires uniquement' : 'Non populaires'}
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
                    <TableCell>Programme</TableCell>
                    <TableCell>Durée</TableCell>
                    <TableCell>Prix</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow 
                      key={program._id}
                      selected={selectedProgram?._id === program._id}
                      onClick={() => handleEditProgram(program)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{program.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{program.duration}</TableCell>
                      <TableCell>TND {program.price}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.isPopular ? 'Populaire' : 'Standard'}
                          color={program.isPopular ? 'success' : 'default'}
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
            {selectedProgram ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Modifier le Programme de Formation
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                      type="file"
                      onChange={e => {
                        console.log('Edit form: file selected', e.target.files[0]);
                        handleImageUpload(e, false);
                      }}
                    />
                    <label htmlFor="edit-image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                      >
                        Télécharger une Image
                      </Button>
                    </label>
                    {editForm.image && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Avatar
                          src={getImageUrl(editForm.image)}
                          alt="Aperçu du programme"
                          sx={{ width: 100, height: 100 }}
                          variant="rounded"
                        />
                        <Button
                          color="error"
                          onClick={() => {
                            console.log('Edit form: remove image');
                            handleRemoveImage(false);
                          }}
                        >
                          Supprimer l'Image
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    name="duration"
                    label="Durée"
                    value={editForm.duration}
                    onChange={handleFormChange}
                  />
                  <TextField
                    fullWidth
                    name="rating"
                    label="Note"
                    type="number"
                    value={editForm.rating}
                    onChange={handleFormChange}
                    InputProps={{
                      inputProps: { min: 0, max: 5, step: 0.1 }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="reviews"
                    label="Nombre d'avis"
                    type="number"
                    value={editForm.reviews}
                    onChange={handleFormChange}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="price"
                    label="Prix (TND)"
                    type="number"
                    value={editForm.price}
                    onChange={handleFormChange}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    value={editForm.description}
                    onChange={handleFormChange}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Statut de Popularité</InputLabel>
                    <Select
                      name="isPopular"
                      value={editForm.isPopular}
                      onChange={handleFormChange}
                      label="Statut de Popularité"
                    >
                      <MenuItem value={true}>Populaire</MenuItem>
                      <MenuItem value={false}>Standard</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateProgram}
                      fullWidth
                    >
                      Enregistrer les Modifications
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteProgram(selectedProgram)}
                      fullWidth
                    >
                      Supprimer le Programme
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
                <TrainingProgramIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sélectionnez un programme à modifier
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choisissez un programme dans la liste pour voir et modifier ses détails
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer le Programme de Formation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce programme de formation ? Cette action ne peut pas être annulée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Program Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un Nouveau Programme de Formation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              name="name"
              label="Nom"
              value={createForm.name}
              onChange={handleCreateFormChange}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="create-image-upload"
                type="file"
                onChange={e => {
                  console.log('Create form: file selected', e.target.files[0]);
                  handleImageUpload(e, true);
                }}
              />
              <label htmlFor="create-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Télécharger une Image
                </Button>
              </label>
              {createForm.image && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Avatar
                    src={getImageUrl(createForm.image)}
                    alt="Aperçu du programme"
                    sx={{ width: 100, height: 100 }}
                    variant="rounded"
                  />
                  <Button
                    color="error"
                    onClick={() => {
                      console.log('Create form: remove image');
                      handleRemoveImage(true);
                    }}
                  >
                    Supprimer l'Image
                  </Button>
                </Box>
              )}
            </Box>
            <TextField
              fullWidth
              name="duration"
              label="Durée"
              value={createForm.duration}
              onChange={handleCreateFormChange}
            />
            <TextField
              fullWidth
              name="rating"
              label="Note"
              type="number"
              value={createForm.rating}
              onChange={handleCreateFormChange}
              InputProps={{
                inputProps: { min: 0, max: 5, step: 0.1 }
              }}
            />
            <TextField
              fullWidth
              name="reviews"
              label="Nombre d'avis"
              type="number"
              value={createForm.reviews}
              onChange={handleCreateFormChange}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
            <TextField
              fullWidth
              name="price"
              label="Prix (TND)"
              type="number"
              value={createForm.price}
              onChange={handleCreateFormChange}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
            <TextField
              fullWidth
              name="description"
              label="Description"
              multiline
              rows={4}
              value={createForm.description}
              onChange={handleCreateFormChange}
            />
            <FormControl fullWidth>
              <InputLabel>Statut de Popularité</InputLabel>
              <Select
                name="isPopular"
                value={createForm.isPopular}
                onChange={handleCreateFormChange}
                label="Statut de Popularité"
              >
                <MenuItem value={true}>Populaire</MenuItem>
                <MenuItem value={false}>Standard</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateProgram} variant="contained" color="primary">
            Créer le Programme
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TrainingProgramManagement; 