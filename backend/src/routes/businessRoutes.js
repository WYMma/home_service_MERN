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
import path from 'path';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use forward slashes in the path
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.get('/public', getBusinesses);
router.get('/public/:id', getBusinessById);
router.get('/public/:id/services', getBusinessServices);
router.get('/public/:id/reviews', getBusinessReviews);

// Protected routes
router.use(protect);

// Business profile routes
router.route('/profile')
  .get(protect, getBusinessProfile)
  .put(business, updateBusinessProfile);

// Create business route - protected by business middleware and handles file uploads
router.post('/', business, upload.array('images', 10), createBusiness);

// Image management routes
router.post('/upload', business, upload.array('images', 10), uploadBusinessImages);
router.delete('/images/:imageId', business, deleteBusinessImage);

// Business service routes
router.route('/:id/services')
  .post(businessOwner, checkEmployeePermission('manageServices'), createBusinessService);

router.route('/:id/services/:serviceId')
  .put(businessOwner, checkEmployeePermission('manageServices'), updateBusinessService)
  .delete(businessOwner, checkEmployeePermission('manageServices'), deleteBusinessService);

// Review routes
router.route('/:id/reviews')
  .post(addBusinessReview);

router.get('/:id/bookings', protect, getBusinessBookings);
router.get('/:id/analytics', checkEmployeePermission('viewAnalytics'), getBusinessAnalytics);

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
