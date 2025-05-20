const express = require('express');
const router = express.Router();
const trainingProgramController = require('../controllers/trainingProgramController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', trainingProgramController.getAllPrograms);
router.get('/:id', trainingProgramController.getProgram);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), trainingProgramController.createProgram);
router.put('/:id', protect, authorize('admin'), trainingProgramController.updateProgram);
router.delete('/:id', protect, authorize('admin'), trainingProgramController.deleteProgram);

module.exports = router; 