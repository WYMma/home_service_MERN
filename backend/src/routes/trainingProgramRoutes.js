import express from 'express';
import {
  getAllPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram
} from '../controllers/trainingProgramController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public routes
router.get('/', getAllPrograms);
router.get('/:id', getProgram);

// Protected routes (admin only)
router.post('/', protect, admin, upload.single('image'), createProgram);
router.put('/:id', protect, admin, upload.single('image'), updateProgram);
router.delete('/:id', protect, admin, deleteProgram);

export default router; 