import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Card>
      <CardActionArea component={Link} to={`/categories/${category._id}`}>
        <CardMedia
          component="img"
          height="140"
          image={category.icon || '/placeholder.png'}
          alt={category.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {category.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {category.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryCard;
