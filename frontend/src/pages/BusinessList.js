import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { businessApi, categoryApi } from '../services/api';
import BusinessCard from '../components/BusinessCard';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'rating',
    search: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const response = await businessApi.getAll({
          page,
          limit: 9,
          ...filters,
        });
        setBusinesses(response.data.businesses);
        setTotalPages(Math.ceil(response.data.total / 9));
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [page, filters]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
    setPage(1);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Prestataires de Services
        </Typography>

        <Box sx={{ my: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Rechercher des entreprises..."
            value={filters.search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              name="category"
              value={filters.category}
              label="Catégorie"
              onChange={handleFilterChange}
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Trier par</InputLabel>
            <Select
              name="sortBy"
              value={filters.sortBy}
              label="Trier par"
              onChange={handleFilterChange}
            >
              <MenuItem value="rating">Note</MenuItem>
              <MenuItem value="reviewCount">Plus d'avis</MenuItem>
              <MenuItem value="newest">Plus récent</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {businesses.map((business) => (
                <Grid item xs={12} sm={6} md={3} key={business._id}>
                  <BusinessCard business={business} />
                </Grid>
              ))}
            </Grid>

            {businesses.length === 0 && (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Aucun prestataire de service trouvé
                </Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default BusinessList;
