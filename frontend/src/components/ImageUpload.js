import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const ImageUpload = ({ images = [], onImagesChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    try {
      // Here you would typically upload the files to your server
      // and get back the URLs
      const newImages = await Promise.all(
        files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result);
            };
            reader.readAsDataURL(file);
          });
        })
      );

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        multiple
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label htmlFor="image-upload">
        <Button
          component="span"
          variant="outlined"
          startIcon={<AddIcon />}
          disabled={uploading || images.length >= maxImages}
        >
          Add Images
        </Button>
      </label>

      {images.length > 0 && (
        <ImageList sx={{ mt: 2 }} cols={3} rowHeight={200}>
          {images.map((image, index) => (
            <ImageListItem key={index}>
              <img
                src={image}
                alt={`Business image ${index + 1}`}
                loading="lazy"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <ImageListItemBar
                actionIcon={
                  <IconButton
                    sx={{ color: 'white' }}
                    onClick={() => handleDelete(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};

export default ImageUpload;
