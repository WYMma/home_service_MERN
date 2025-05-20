import TrainingProgram from '../models/TrainingProgram.js';

// Get all training programs
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await TrainingProgram.find().sort({ createdAt: -1 });
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching training programs', error: error.message });
  }
};

// Get a single training program
export const getProgram = async (req, res) => {
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
export const createProgram = async (req, res) => {
  try {
    const programData = { ...req.body };
    
    // If an image was uploaded, add its path to the program data
    if (req.file) {
      programData.image = `/uploads/${req.file.filename}`;
    }

    const program = new TrainingProgram(programData);
    await program.save();
    res.status(201).json(program);
  } catch (error) {
    res.status(400).json({ message: 'Error creating training program', error: error.message });
  }
};

// Update a training program
export const updateProgram = async (req, res) => {
  try {
    console.log('Update request received');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const programData = { ...req.body };
    
    // If an image was uploaded, add its path to the program data
    if (req.file) {
      console.log('New image uploaded:', req.file);
      programData.image = `/uploads/${req.file.filename}`;
    } else {
      console.log('No new image uploaded, keeping existing image');
    }

    console.log('Program data to update:', programData);

    const program = await TrainingProgram.findByIdAndUpdate(
      req.params.id,
      programData,
      { new: true, runValidators: true }
    );
    
    if (!program) {
      console.log('Program not found with id:', req.params.id);
      return res.status(404).json({ message: 'Training program not found' });
    }

    console.log('Program updated successfully:', program);
    res.status(200).json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(400).json({ message: 'Error updating training program', error: error.message });
  }
};

// Delete a training program
export const deleteProgram = async (req, res) => {
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