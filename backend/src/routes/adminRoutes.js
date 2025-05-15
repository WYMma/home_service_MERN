import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getServices,
  updateService,
  deleteService,
  approveService,
  rejectService,
  getBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  approveBusiness,
  rejectBusiness,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBookings,
  updateBooking,
  deleteBooking,
  createUser,
  createService,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/stats', getStats);

// User management
router.route('/users')
  .get(getUsers)
  .post(createUser);
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

// Service management
router.route('/services')
  .get(getServices)
  .post(createService);
router.route('/services/:id')
  .put(updateService)
  .delete(deleteService);
router.post('/services/:id/approve', approveService);
router.post('/services/:id/reject', rejectService);

// Business management
router.route('/businesses')
  .get(getBusinesses)
  .post(createBusiness);
router.route('/businesses/:id')
  .put(updateBusiness)
  .delete(deleteBusiness);
router.post('/businesses/:id/approve', approveBusiness);
router.post('/businesses/:id/reject', rejectBusiness);

// Category management
router.route('/categories')
  .get(getCategories)
  .post(createCategory);
router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Booking management
router.route('/bookings')
  .get(getBookings);
router.route('/bookings/:id')
  .put(updateBooking)
  .delete(deleteBooking);

export default router; 