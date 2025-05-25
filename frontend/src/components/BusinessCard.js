import { Card, CardContent, CardMedia, Typography, Box, Rating, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import useTheme from '@mui/material/styles/useTheme';
import { useState, useEffect } from 'react';
import { businessApi } from '../services/api';
import FavoriteButton from './FavoriteButton';
import { formatImageUrl } from '../utils/urlUtils';

const CARD_HEIGHT = 360;
const IMAGE_HEIGHT = CARD_HEIGHT * 0.6;
const SLIDE_INTERVAL = 3000; // 3 seconds per image

const getImageUrl = (imagePath) => {
  return formatImageUrl(imagePath);
};

const BusinessCard = ({ business }) => {
  const theme = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startingPrice, setStartingPrice] = useState(null);
  
  // Get all images, including the main image and additional images
  const allImages = business ? [
    business.image,
    ...(business.images || [])
  ].filter(Boolean) : ['/business-placeholder.png']; // Remove any null/undefined values

  // If no images, use placeholder
  const images = allImages.length > 0 ? allImages : ['/business-placeholder.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!business?._id) return;
      try {
        const response = await businessApi.getServices(business._id);
        const services = response.data;
        if (services && services.length > 0) {
          const cheapestService = services.reduce((min, service) => 
            service.price < min.price ? service : min
          , services[0]);
          setStartingPrice(cheapestService.price);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, [business?._id]);

  if (!business) return null;

  return (
    <Card sx={{ 
      width: '100%', 
      height: CARD_HEIGHT, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'flex-start', 
      position: 'relative',
      transition: 'all 0.3s ease-in-out',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }
    }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
        <FavoriteButton businessId={business._id} size="small" />
      </Box>
      <CardActionArea 
        component={Link} 
        to={`/businesses/${business._id}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            sx={{ 
              height: IMAGE_HEIGHT, 
              objectFit: 'cover',
              transition: 'opacity 0.5s ease-in-out'
            }}
            image={getImageUrl(images[currentImageIndex])}
            alt={`${business.name || 'Business'} - Image ${currentImageIndex + 1}`}
          />
          {images.length > 1 && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              px: 1,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.75rem',
              color: '#fff',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(2px)',
            }}>
              {currentImageIndex + 1}/{images.length}
            </Box>
          )}
          {startingPrice !== null && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.9rem',
              zIndex: 2,
              color: '#000',
              background: theme.palette.primary.light,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(2px)',
            }}>
              Starting from {startingPrice} TND
            </Box>
          )}
        </Box>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', p: 1.5 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
            {business.name || 'Unnamed Business'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Rating value={business.rating || 0} readOnly precision={0.5} size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.75rem' }}>
              ({business.reviewCount || 0} reviews)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
              {business.address?.city || 'Location not specified'}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: '2.6em',
              fontSize: '0.75rem',
            }}
          >
            {business.description || 'No description available'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BusinessCard;
