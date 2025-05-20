import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease-in-out',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }
    }}>
      <CardActionArea component={Link} to={`/categories/${category._id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia
          component="img"
          height="200"
          image={category.imageUrl || 'https://placehold.co/300x140/e9ecef/495057?text=No+Image'}
          alt={category.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', p: 2 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {category.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {category.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryCard;
