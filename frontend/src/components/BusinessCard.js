import { Card, CardContent, CardMedia, Typography, Box, Rating, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import useTheme from '@mui/material/styles/useTheme';

const CARD_HEIGHT = 300;
const IMAGE_HEIGHT = CARD_HEIGHT / 2;

const BusinessCard = ({ business }) => {
  const theme = useTheme();
  if (!business) return null;

  return (
    <Card sx={{ width: 320, height: CARD_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative' }}>
      <CardActionArea component={Link} to={`/businesses/${business._id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            sx={{ height: IMAGE_HEIGHT, objectFit: 'cover' }}
            image={business.images?.[0] || '/business-placeholder.png'}
            alt={business.name || 'Business'}
          />
          {typeof business.serviceFee === 'number' && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '1rem',
              zIndex: 2,
              color: '#000',
              background: theme.palette.primary.light,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(2px)',
            }}>
              {business.serviceFee} {business.serviceFeeCurrency || 'TND'}
            </Box>
          )}
        </Box>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', p: 2 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
            {business.name || 'Unnamed Business'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Rating value={business.rating || 0} readOnly precision={0.5} size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({business.reviewCount || 0} reviews)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
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
