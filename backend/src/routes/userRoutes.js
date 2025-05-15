import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getUserSettings,
  updateUserSettings
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/settings')
  .get(getUserSettings)
  .put(updateUserSettings);

router.route('/favorites')
  .get(getFavorites)
  .post(addFavorite)
  .delete(removeFavorite);

export default router;
