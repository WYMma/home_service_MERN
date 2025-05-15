import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, InputBase, IconButton, Box, Autocomplete, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SearchBar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (location) params.append('location', location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSearch}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        mb: 2,
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search for services..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Box sx={{ height: '24px', mx: 1, bgcolor: 'divider', width: '1px' }} />
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        startAdornment={<LocationOnIcon color="action" />}
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;
