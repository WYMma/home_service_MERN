import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Stack, Button } from '@mui/material';
import { categoryApi } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import useTheme from '@mui/material/styles/useTheme';
import * as Icons from '@mui/icons-material';

const CategoryGrid = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, background: 'transparent' }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Découvrez Notre Gamme de Services
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          Parcourez notre large gamme de services professionnels pour trouver exactement ce dont vous avez besoin.
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        {categories.map((category) => {
          // Convert icon name to PascalCase for Material Icons
          const IconName = category.icon
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
          const IconComponent = Icons[IconName] || Icons.Category; // Fallback to Category icon if not found

          return (
            <Grid item xs={6} sm={4} md={2} key={category._id}>
              <Stack alignItems="center" spacing={2}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: category.bgcolor?.hex || theme.palette.primary.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 2,
                  },
                }}>
                  <IconComponent sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {category.name}
                </Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          href="/categories"
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Voir Toutes les Catégories
        </Button>
      </Box>
    </Paper>
  );
};

export default CategoryGrid; 