import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  uploadProfileImage
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/profile/image')
  .post(upload.single('image'), uploadProfileImage);

router.route('/settings')
  .get(getUserSettings)
  .put(updateUserSettings);

export default router;
