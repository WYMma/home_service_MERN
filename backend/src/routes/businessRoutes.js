import express from 'express';
import { protect, business, businessOwner, checkEmployeePermission } from '../middleware/authMiddleware.js';
import {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessServices,
  createBusinessService,
  updateBusinessService,
  deleteBusinessService,
  getBusinessBookings,
  getBusinessAnalytics,
  uploadBusinessImages,
  getBusinessProfile,
  updateBusinessProfile,
  deleteBusinessImage,
  getBusinessReviews,
  addBusinessReview,
  getBusinessEmployees,
  addBusinessEmployee,
  updateEmployeePermissions,
  removeBusinessEmployee
} from '../controllers/businessController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/', getBusinesses);

// Protected routes
router.use(protect);

// Business profile routes - must come before /:id routes
router.route('/profile')
  .get(business, getBusinessProfile)
  .put(business, updateBusinessProfile);

// Image management routes
router.post('/upload', business, upload.array('images', 10), uploadBusinessImages);
router.delete('/images/:imageId', business, deleteBusinessImage);

// Create business route - protected by business middleware
router.post('/', business, createBusiness);

// Public routes that need to come after /profile
router.get('/:id', getBusinessById);
router.get('/:id/services', getBusinessServices);
router.get('/:id/reviews', getBusinessReviews);

// Business service routes
router.route('/:id/services')
  .post(businessOwner, checkEmployeePermission('manageServices'), createBusinessService);

router.route('/:id/services/:serviceId')
  .put(businessOwner, checkEmployeePermission('manageServices'), updateBusinessService)
  .delete(businessOwner, checkEmployeePermission('manageServices'), deleteBusinessService);

// Review routes
router.route('/:id/reviews')
  .post(addBusinessReview);

router.get('/:id/bookings', businessOwner, checkEmployeePermission('manageBookings'), getBusinessBookings);
router.get('/:id/analytics', businessOwner, checkEmployeePermission('viewAnalytics'), getBusinessAnalytics);

// Business profile update (owners and employees with edit profile permissions)
router
  .route('/:id')
  .put(businessOwner, checkEmployeePermission('editProfile'), updateBusiness);

// Employee management (only owners can manage employees)
router
  .route('/:id/employees')
  .get(businessOwner, getBusinessEmployees)
  .post(businessOwner, addBusinessEmployee);

router
  .route('/:id/employees/:employeeId')
  .put(businessOwner, updateEmployeePermissions)
  .delete(businessOwner, removeBusinessEmployee);

export default router;
