import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import favoriteApi from '../services/api/favoriteApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const FavoriteButton = ({ businessId, size = 'medium' }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !businessId) return;
      
      try {
        const response = await favoriteApi.checkFavorite(businessId);
        setIsFavorited(response.isFavorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [businessId, isAuthenticated]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await favoriteApi.removeFromFavorites(businessId);
        setIsFavorited(false);
      } else {
        await favoriteApi.addToFavorites(businessId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Tooltip title="Login to add to favorites">
        <IconButton
          onClick={() => navigate('/login')}
          color="primary"
          size={size}
        >
          <FavoriteBorderIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={isFavorited ? "Remove from favorites" : "Add to favorites"}>
      <IconButton
        onClick={handleFavoriteClick}
        disabled={isLoading}
        color="primary"
        size={size}
      >
        {isLoading ? (
          <CircularProgress size={20} />
        ) : isFavorited ? (
          <FavoriteIcon color="error" />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton; 