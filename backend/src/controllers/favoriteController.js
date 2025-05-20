import Favorite from '../models/favoriteModel.js';
import Business from '../models/businessModel.js';
import mongoose from 'mongoose';

// @desc    Get user's favorite businesses
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'business',
        select: 'name description image images rating reviewCount address services'
      });

    res.json(favorites.map(fav => fav.business));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add business to favorites
// @route   POST /api/favorites/:businessId
// @access  Private
export const addToFavorites = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      business: businessId
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Business already in favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      business: businessId
    });

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove business from favorites
// @route   DELETE /api/favorites/:businessId
// @access  Private
export const removeFromFavorites = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      business: businessId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Business removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if business is favorited
// @route   GET /api/favorites/check/:businessId
// @access  Private
export const checkFavorite = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    const favorite = await Favorite.findOne({
      user: req.user._id,
      business: businessId
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 