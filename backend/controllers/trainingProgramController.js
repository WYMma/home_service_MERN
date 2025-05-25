import TrainingProgram from '../src/models/TrainingProgram.js';

// Get all training programs
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await TrainingProgram.find().sort({ createdAt: -1 });
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching training programs', error: error.message });
  }
};

// Get a single training program
exports.getProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Training program not found' });
    }
    res.status(200).json(program);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching training program', error: error.message });
  }
};

// Create a new training program
exports.createProgram = async (req, res) => {
  try {
    const program = new TrainingProgram(req.body);
    await program.save();
    res.status(201).json(program);
  } catch (error) {
    res.status(400).json({ message: 'Error creating training program', error: error.message });
  }
};

// Update a training program
exports.updateProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) {
      return res.status(404).json({ message: 'Training program not found' });
    }
    res.status(200).json(program);
  } catch (error) {
    res.status(400).json({ message: 'Error updating training program', error: error.message });
  }
};

// Delete a training program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Training program not found' });
    }
    res.status(200).json({ message: 'Training program deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting training program', error: error.message });
  }
}; 