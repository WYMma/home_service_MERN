import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite
} from '../controllers/favoriteController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getFavorites);

router.route('/check/:businessId')
  .get(checkFavorite);

router.route('/:businessId')
  .post(addToFavorites)
  .delete(removeFromFavorites);

export default router; 