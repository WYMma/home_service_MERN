import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { businessApi } from '../services/api';
import { formatImageUrl } from '../utils/urlUtils';

const ReviewList = ({ businessId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await businessApi.getReviews(businessId);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const formik = useFormik({
    initialValues: {
      rating: 5,
      comment: '',
    },
    validationSchema: Yup.object({
      rating: Yup.number().required().min(1).max(5),
      comment: Yup.string().required('Review comment is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await businessApi.addReview(businessId, values);
        toast.success('Review added successfully!');
        setOpenReviewDialog(false);
        resetForm();
        fetchReviews();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error adding review');
      }
    },
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Reviews</Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenReviewDialog(true)}
          >
            Write a Review
          </Button>
        )}
      </Box>

      {reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews yet</Typography>
      ) : (
        reviews.map((review, index) => (
          <Box key={review._id}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Avatar 
                src={review.user?.profileImage ? formatImageUrl(review.user.profileImage) : undefined} 
                alt={review.user?.name || 'User'}
              >
                {review.user?.name ? review.user.name.charAt(0) : 'U'}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1">{review.user?.name || 'Anonymous User'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {review.comment}
                </Typography>
              </Box>
            </Box>
            {index < reviews.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))
      )}

      {/* Review Dialog */}
      <Dialog
        open={openReviewDialog}
        onClose={() => setOpenReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={formik.values.rating}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rating', newValue);
                }}
              />
            </Box>
            <TextField
              fullWidth
              name="comment"
              label="Your Review"
              multiline
              rows={4}
              value={formik.values.comment}
              onChange={formik.handleChange}
              error={formik.touched.comment && Boolean(formik.errors.comment)}
              helperText={formik.touched.comment && formik.errors.comment}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Submit Review
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReviewList;
