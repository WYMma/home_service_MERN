import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { userApi } from '../services/api';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSnackbar } from 'notistack';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
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
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await userApi.getSettings();
      setSettings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch settings');
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
      setError('New passwords do not match');
      return;
    }

    if (profileData.newPassword && !profileData.currentPassword) {
      setError('Current password is required to change password');
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
      setSuccess('Profile updated successfully');
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });

      // Refresh the profile data to ensure everything is in sync
      await fetchProfile();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleNotificationChange = (type) => (event) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: event.target.checked,
      },
    }));
  };

  const handlePrivacyChange = (type) => (event) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: event.target.checked,
      },
    }));
  };

  const handlePreferenceChange = (type) => (event) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: event.target.value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await userApi.updateSettings(settings);
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return undefined;
    return imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Profile" />
          <Tab label="General Settings" />
        </Tabs>

        {activeTab === 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
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
                          Change Photo
                        </Button>
                      </label>
                      {tempImageUrl && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                          Click "Save Profile" to apply changes
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
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
                    value={profileData.email}
                    onChange={handleProfileChange}
                    type="email"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Leave blank if you don't want to change your password
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    name="currentPassword"
                    value={profileData.currentPassword}
                    onChange={handleProfileChange}
                    required={!!profileData.newPassword}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Save Profile
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={handleNotificationChange('email')}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={handleNotificationChange('push')}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={handleNotificationChange('sms')}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Privacy
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showProfile}
                      onChange={handlePrivacyChange('showProfile')}
                    />
                  }
                  label="Show Profile to Others"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showBookings}
                      onChange={handlePrivacyChange('showBookings')}
                    />
                  }
                  label="Show Booking History"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showReviews}
                      onChange={handlePrivacyChange('showReviews')}
                    />
                  }
                  label="Show Reviews"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Preferences
                </Typography>
                <TextField
                  fullWidth
                  label="Language"
                  name="language"
                  value={settings.preferences.language}
                  onChange={handlePreferenceChange('language')}
                />
                <TextField
                  fullWidth
                  label="Theme"
                  name="theme"
                  value={settings.preferences.theme}
                  onChange={handlePreferenceChange('theme')}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Settings'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Settings; 