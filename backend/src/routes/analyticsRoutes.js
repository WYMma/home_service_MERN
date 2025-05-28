import express from 'express';
import { protect, businessOwner, checkEmployeePermission } from '../middleware/authMiddleware.js';
import {
  getBusinessAnalytics,
  getSystemAnalytics,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);

// First check if user has access to the business, then check specific permissions
router.get('/business/:id', businessOwner, checkEmployeePermission('viewAnalytics'), getBusinessAnalytics);
router.get('/system', getSystemAnalytics);

export default router;
