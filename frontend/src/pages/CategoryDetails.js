import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Box } from '@mui/material';
import { categoryApi, businessApi } from '../services/api';
import BusinessCard from '../components/BusinessCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CategoryDetails = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, businessesRes] = await Promise.all([
          categoryApi.getById(id),
          businessApi.getAll({ category: id })
        ]);
        setCategory(categoryRes.data);
        setBusinesses(businessesRes.data.businesses);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch category details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!category) {
    return (
      <Container>
        <Typography align="center">Category not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {category.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {category.description}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Service Providers in {category.name}
          </Typography>
          <Grid container spacing={4}>
            {businesses.map((business) => (
              <Grid item xs={12} sm={6} md={4} key={business._id}>
                <BusinessCard business={business} />
              </Grid>
            ))}
            {businesses.length === 0 && (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">
                  No service providers found in this category
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default CategoryDetails;
