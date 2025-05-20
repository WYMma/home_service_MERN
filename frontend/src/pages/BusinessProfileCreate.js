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
import { formatImageUrl } from '../utils/urlUtils';

const BusinessProfileCreate = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error loading categories');
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await businessApi.uploadImages(formData);
      console.log('Upload response:', response.data);

      if (response.data.success && response.data.urls) {
        const imageUrls = response.data.urls;
        setImages(prev => [...prev, ...imageUrls].slice(0, 10));
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload images');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
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
      name: Yup.string().required('Business name is required'),
      description: Yup.string().required('Description is required'),
      category: Yup.string().required('Category is required'),
      phone: Yup.string().required('Phone number is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      address: Yup.object({
        street: Yup.string().required('Street address is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        zipCode: Yup.string().required('ZIP code is required'),
        country: Yup.string().required('Country is required'),
      }),
      website: Yup.string().url('Invalid website URL')
    }),
    onSubmit: async (values) => {
      if (images.length === 0) {
        toast.error('Please upload at least one image');
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

        // Append images
        images.forEach(image => {
          formData.append('images', image);
        });

        await businessApi.createProfile(formData);
        toast.success('Business profile created successfully!');
        navigate('/business/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error creating business profile');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create Your Business Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Please fill in your business details to get started
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Business Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  label="Category"
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
                        Add Images
                      </Button>
                    </label>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {images.map((image, index) => (
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
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="phone"
                label="Phone"
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
                label="Website (optional)"
                value={formik.values.website}
                onChange={formik.handleChange}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address.street"
                label="Street Address"
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
                label="City"
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
                label="State"
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
                label="ZIP Code"
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
                label="Country"
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
                  {loading ? <CircularProgress size={24} /> : 'Create Business Profile'}
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