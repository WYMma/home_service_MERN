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

// Business creation route
router.post('/', createBusiness);

// Business profile routes
router.route('/profile')
  .get(business, getBusinessProfile)
  .put(business, updateBusinessProfile);

// Business service routes
router.route('/:id/services')
  .get(protect, businessOwner, getBusinessServices)
  .post(protect, businessOwner, checkEmployeePermission('manageServices'), createBusinessService);

router.route('/:id/services/:serviceId')
  .put(protect, businessOwner, checkEmployeePermission('manageServices'), updateBusinessService)
  .delete(protect, businessOwner, checkEmployeePermission('manageServices'), deleteBusinessService);

// Review routes
router.route('/:id/reviews')
  .get(getBusinessReviews)
  .post(protect, addBusinessReview);

// Image upload route
router.post('/upload', business, upload.array('images', 5), uploadBusinessImages);

// Add new route for deleting business images
router.delete('/images/:imageId', protect, business, deleteBusinessImage);

// ID-based routes
router.get('/:id', getBusinessById);
router.get('/:id/bookings', protect, businessOwner, checkEmployeePermission('manageBookings'), getBusinessBookings);
router.get('/:id/analytics', protect, businessOwner, checkEmployeePermission('viewAnalytics'), getBusinessAnalytics);

// Business profile update (owners and employees with edit profile permissions)
router
  .route('/:id')
  .put(protect, businessOwner, checkEmployeePermission('editProfile'), updateBusiness);

// Employee management (only owners can manage employees)
router
  .route('/:id/employees')
  .get(protect, businessOwner, getBusinessEmployees)
  .post(protect, businessOwner, addBusinessEmployee);

router
  .route('/:id/employees/:employeeId')
  .put(protect, businessOwner, updateEmployeePermissions)
  .delete(protect, businessOwner, removeBusinessEmployee);

export default router;
