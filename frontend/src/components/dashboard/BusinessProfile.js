import { useState, useEffect } from 'react';
import {
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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { businessApi, categoryApi } from '../../services/api';
import ImageUpload from '../ImageUpload';

const BusinessProfile = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessRes, categoriesRes] = await Promise.all([
          businessApi.getProfile(),
          categoryApi.getAll()
        ]);
        setBusiness(businessRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: business?.name || '',
      description: business?.description || '',
      categories: business?.categories.map(c => c._id) || [],
      phone: business?.phone || '',
      email: business?.email || '',
      address: {
        street: business?.address?.street || '',
        city: business?.address?.city || '',
        state: business?.address?.state || '',
        zipCode: business?.address?.zipCode || '',
      },
      hours: business?.hours || {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: { open: 'closed', close: 'closed' },
      },
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Business name is required'),
      description: Yup.string().required('Description is required'),
      categories: Yup.array().min(1, 'Select at least one category'),
      phone: Yup.string().required('Phone number is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      address: Yup.object({
        street: Yup.string().required('Street address is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        zipCode: Yup.string().required('ZIP code is required'),
      }),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await businessApi.updateProfile(values);
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error updating profile');
      }
    },
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Business Profile
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
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
            <FormControl fullWidth>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                name="categories"
                value={formik.values.categories}
                onChange={formik.handleChange}
                error={
                  formik.touched.categories && Boolean(formik.errors.categories)
                }
                label="Categories"
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
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
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
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

          {/* Address */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
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
              error={
                formik.touched.address?.street &&
                Boolean(formik.errors.address?.street)
              }
              helperText={
                formik.touched.address?.street && formik.errors.address?.street
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="address.city"
              label="City"
              value={formik.values.address.city}
              onChange={formik.handleChange}
              error={
                formik.touched.address?.city &&
                Boolean(formik.errors.address?.city)
              }
              helperText={
                formik.touched.address?.city && formik.errors.address?.city
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="address.state"
              label="State"
              value={formik.values.address.state}
              onChange={formik.handleChange}
              error={
                formik.touched.address?.state &&
                Boolean(formik.errors.address?.state)
              }
              helperText={
                formik.touched.address?.state && formik.errors.address?.state
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              name="address.zipCode"
              label="ZIP Code"
              value={formik.values.address.zipCode}
              onChange={formik.handleChange}
              error={
                formik.touched.address?.zipCode &&
                Boolean(formik.errors.address?.zipCode)
              }
              helperText={
                formik.touched.address?.zipCode && formik.errors.address?.zipCode
              }
            />
          </Grid>

          {/* Business Hours */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Business Hours
            </Typography>
          </Grid>
          {Object.entries(formik.values.hours).map(([day, hours]) => (
            <Grid item xs={12} sm={6} md={4} key={day}>
              <Typography variant="subtitle2" gutterBottom>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name={`hours.${day}.open`}
                    label="Open"
                    type="time"
                    value={hours.open}
                    onChange={formik.handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name={`hours.${day}.close`}
                    label="Close"
                    type="time"
                    value={hours.close}
                    onChange={formik.handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}

          {/* Images */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Business Images
            </Typography>
            <ImageUpload
              images={business.images}
              onImagesChange={(images) => {
                // Handle image changes
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BusinessProfile;
