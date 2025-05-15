import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update basic info
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // Handle password change
      if (req.body.currentPassword && req.body.newPassword) {
        // Verify current password
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Set new password
        user.password = req.body.newPassword;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        populate: {
          path: 'business',
          select: 'name description address phone rating'
        }
      });
    
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add service to favorites
// @route   POST /api/users/favorites
// @access  Private
const addFavorite = async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.favorites.includes(serviceId)) {
      return res.status(400).json({ message: 'Service already in favorites' });
    }

    user.favorites.push(serviceId);
    await user.save();

    res.status(201).json({ message: 'Service added to favorites' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove service from favorites
// @route   DELETE /api/users/favorites
// @access  Private
const removeFavorite = async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favorites = user.favorites.filter(
      favorite => favorite.toString() !== serviceId
    );
    await user.save();

    res.json({ message: 'Service removed from favorites' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
const getUserSettings = asyncHandler(async (req, res) => {
  console.log('Getting user settings for user:', req.user._id);
  
  const user = await User.findById(req.user._id).select('settings');
  console.log('Found user:', user ? 'yes' : 'no');
  
  if (!user) {
    console.log('User not found');
    res.status(404);
    throw new Error('User not found');
  }

  console.log('User settings:', user.settings);
  res.json(user.settings || {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showProfile: true,
      showBookings: true,
      showReviews: true,
    },
    preferences: {
      language: 'en',
      theme: 'light',
      currency: 'USD',
    },
  });
});

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateUserSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.settings = {
    ...user.settings,
    ...req.body,
  };

  const updatedUser = await user.save();
  res.json(updatedUser.settings);
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getUserSettings,
  updateUserSettings
};
