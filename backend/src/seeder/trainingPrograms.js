import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import TrainingProgram from '../models/TrainingProgram.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const trainingPrograms = [
  {
    name: 'Nail Care (Onglerie)',
    image: '/images/nail-care.jpg',
    duration: '6 weeks',
    rating: 4.8,
    reviews: 24,
    price: 299,
    description: 'Learn professional nail care techniques and modern nail art designs.',
    isPopular: true
  },
  {
    name: 'Plumbing',
    image: '/images/plumbing.jpg',
    duration: '8 weeks',
    rating: 4.5,
    reviews: 18,
    price: 349,
    description: 'Master essential plumbing skills and repair techniques.',
    isPopular: false
  },
  {
    name: "Men's Hairdressing",
    image: '/images/hairdressing.jpg',
    duration: '5 weeks',
    rating: 4.9,
    reviews: 32,
    price: 279,
    description: 'Professional men\'s haircutting and styling techniques.',
    isPopular: true
  },
  {
    name: 'Pastry and Catering',
    image: '/images/pastry.jpg',
    duration: '7 weeks',
    rating: 4.7,
    reviews: 21,
    price: 329,
    description: 'Learn the art of pastry making and professional catering.',
    isPopular: false
  },
  {
    name: 'Auto Diagnostics',
    image: '/images/auto-diagnostics.jpg',
    duration: '10 weeks',
    rating: 4.6,
    reviews: 15,
    price: 499,
    description: 'Modern vehicle diagnostics and repair techniques.',
    isPopular: true
  },
  {
    name: 'Coffee Machine Repair',
    image: '/images/coffee-repair.jpg',
    duration: '4 weeks',
    rating: 4.4,
    reviews: 12,
    price: 249,
    description: 'Specialized training in coffee machine maintenance and repair.',
    isPopular: false
  },
  {
    name: 'Building Electricity & Surveillance',
    image: '/images/electricity.jpg',
    duration: '9 weeks',
    rating: 4.8,
    reviews: 19,
    price: 449,
    description: 'Comprehensive electrical and security system installation.',
    isPopular: true
  },
  {
    name: 'Makeup',
    image: '/images/makeup.jpg',
    duration: '6 weeks',
    rating: 4.9,
    reviews: 28,
    price: 299,
    description: 'Professional makeup techniques and artistry.',
    isPopular: false
  }
];

const seedTrainingPrograms = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI); // Debug line
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing programs
    await TrainingProgram.deleteMany({});
    
    // Insert new programs
    await TrainingProgram.insertMany(trainingPrograms);
    
    console.log('Training programs seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding training programs:', error);
    process.exit(1);
  }
};

seedTrainingPrograms(); 