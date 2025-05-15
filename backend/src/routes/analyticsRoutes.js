import express from 'express';
import { protect, businessOwner } from '../middleware/authMiddleware.js';
import {
  getBusinessAnalytics,
  getSystemAnalytics,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);

router.get('/business/:id', businessOwner, getBusinessAnalytics);
router.get('/system', getSystemAnalytics);

export default router;
