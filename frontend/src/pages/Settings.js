import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { userApi } from '../services/api';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSnackbar } from 'notistack';
import { formatImageUrl } from '../utils/urlUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: '',
  });
  const [tempImageFile, setTempImageFile] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showProfile: true,
      showBookings: true,
      showReviews: true,
    },
    preferences: {
      language: 'en',
      theme: 'light',
    },
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userApi.getProfile();
      const profile = response.data;
      setProfileData((prev) => ({
        ...prev,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        profileImage: profile.profileImage || '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Échec du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await userApi.getSettings();
      setSettings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Échec du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    setTempImageUrl(tempUrl);
    setTempImageFile(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (profileData.newPassword && !profileData.currentPassword) {
      setError('Le mot de passe actuel est requis pour changer le mot de passe');
      return;
    }

    try {
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      };

      if (profileData.currentPassword && profileData.newPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }

      // If there's a new image file, upload it first
      if (tempImageFile) {
        const formData = new FormData();
        formData.append('image', tempImageFile);
        const imageResponse = await userApi.uploadProfileImage(formData);
        if (imageResponse.data.success && imageResponse.data.url) {
          updateData.profileImage = imageResponse.data.url;
        }
      }

      const response = await userApi.updateProfile(updateData);

      // Update the global user state with the new data
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      
      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update the form state
      setProfileData(prev => ({
        ...prev,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profileImage: response.data.profileImage || updateData.profileImage
      }));

      // Clear temporary image states
      setTempImageFile(null);
      setTempImageUrl(null);

      // Show success message
      setSuccess('Profil mis à jour avec succès');
      enqueueSnackbar('Profil mis à jour avec succès', { variant: 'success' });

      // Refresh the profile data to ensure everything is in sync
      await fetchProfile();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec de la mise à jour du profil';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const getImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paramètres du Profil
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={tempImageUrl || getImageUrl(profileData.profileImage)}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    sx={{ width: 100, height: 100 }}
                  >
                    {!profileData.profileImage && !tempImageUrl && profileData.firstName?.[0]}
                  </Avatar>
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCameraIcon />}
                      >
                        Changer la Photo
                      </Button>
                    </label>
                    {tempImageUrl && (
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Cliquez sur "Enregistrer le Profil" pour appliquer les modifications
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Changer le mot de passe
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Leave blank if you don't want to change your password
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mot de passe actuel"
                  name="currentPassword"
                  type="password"
                  value={profileData.currentPassword}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nouveau mot de passe"
                  name="newPassword"
                  type="password"
                  value={profileData.newPassword}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirmer le nouveau mot de passe"
                  name="confirmPassword"
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  sx={{ mt: 2 }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings; 