import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { businessApi, categoryApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const BusinessProfileCreate = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Erreur lors du chargement des catégories');
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Store the files locally
    setImageFiles(prev => [...prev, ...files].slice(0, 10));
    
    // Create local URLs for preview
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImageUrls].slice(0, 10));
  };

  const handleRemoveImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(images[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      category: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      workingHours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: { open: 'closed', close: 'closed' },
      },
      website: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Le nom de l\'entreprise est requis'),
      description: Yup.string().required('La description est requise'),
      category: Yup.string().required('La catégorie est requise'),
      phone: Yup.string().required('Le numéro de téléphone est requis'),
      email: Yup.string().email('Email invalide').required('L\'email est requis'),
      address: Yup.object({
        street: Yup.string().required('L\'adresse est requise'),
        city: Yup.string().required('La ville est requise'),
        state: Yup.string().required('Le département est requis'),
        zipCode: Yup.string().required('Le code postal est requis'),
        country: Yup.string().required('Le pays est requis'),
      }),
      website: Yup.string().url('URL du site web invalide')
    }),
    onSubmit: async (values) => {
      if (imageFiles.length === 0) {
        toast.error('Veuillez télécharger au moins une image');
        return;
      }

      setLoading(true);
      try {
        const formData = new FormData();
        
        // Append basic fields
        Object.keys(values).forEach(key => {
          if (key === 'address') {
            formData.append('address', JSON.stringify(values.address));
          } else if (key === 'workingHours') {
            formData.append('workingHours', JSON.stringify(values.workingHours));
          } else {
            formData.append(key, values[key]);
          }
        });

        // Append image files
        imageFiles.forEach(file => {
          formData.append('images', file);
        });

        console.log('Submitting form data:', {
          values,
          imageCount: imageFiles.length,
          formDataEntries: Array.from(formData.entries())
        });

        const response = await businessApi.create(formData);
        console.log('Create business response:', response);
        
        toast.success('Profil d\'entreprise créé avec succès !');
        navigate('/business/dashboard');
      } catch (error) {
        console.error('Error creating business profile:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error(error.response?.data?.message || 'Erreur lors de la création du profil d\'entreprise');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Créer Votre Profil d'Entreprise
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Veuillez remplir les détails de votre entreprise pour commencer
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations de Base
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Nom de l'Entreprise"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  label="Catégorie"
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <Typography color="error" variant="caption">
                    {formik.errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            {/* Business Images Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Images ({images.length}/10)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="business-image-upload"
                      type="file"
                      multiple
                      onChange={handleImageUpload}
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
                  {images.map((image, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <Avatar
                        src={image}
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
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations de Contact
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="phone"
                label="Téléphone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="website"
                label="Site Web (optionnel)"
                value={formik.values.website}
                onChange={formik.handleChange}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Adresse
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address.street"
                label="Adresse"
                value={formik.values.address.street}
                onChange={formik.handleChange}
                error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                helperText={formik.touched.address?.street && formik.errors.address?.street}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="address.city"
                label="Ville"
                value={formik.values.address.city}
                onChange={formik.handleChange}
                error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                helperText={formik.touched.address?.city && formik.errors.address?.city}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="address.state"
                label="Département"
                value={formik.values.address.state}
                onChange={formik.handleChange}
                error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                helperText={formik.touched.address?.state && formik.errors.address?.state}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="address.zipCode"
                label="Code Postal"
                value={formik.values.address.zipCode}
                onChange={formik.handleChange}
                error={formik.touched.address?.zipCode && Boolean(formik.errors.address?.zipCode)}
                helperText={formik.touched.address?.zipCode && formik.errors.address?.zipCode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address.country"
                label="Pays"
                value={formik.values.address.country}
                onChange={formik.handleChange}
                error={formik.touched.address?.country && Boolean(formik.errors.address?.country)}
                helperText={formik.touched.address?.country && formik.errors.address?.country}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Créer le Profil d\'Entreprise'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default BusinessProfileCreate; 