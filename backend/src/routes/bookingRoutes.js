import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  addBookingReview,
  getAvailableSlots
} from '../controllers/bookingController.js';

const router = express.Router();

router.use(protect); // All booking routes are protected

router.route('/')
  .post(createBooking);

router.get('/my', getMyBookings);

router.route('/:id')
  .get(getBookingById)
  .put(updateBookingStatus);

router.post('/:id/review', addBookingReview);

router.get('/slots/:businessId', getAvailableSlots);

export default router;
