import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import Business from '../models/businessModel.js';

// @desc    Get business analytics
// @route   GET /api/analytics/business/:id
// @access  Private/Business
const getBusinessAnalytics = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (!business) {
    res.status(404);
    throw new Error('Business not found');
  }

  // Get total bookings
  const totalBookings = await Booking.countDocuments({ business: req.params.id });

  // Get total revenue
  const bookings = await Booking.find({ business: req.params.id });
  const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

  // Get average rating
  const ratedBookings = bookings.filter(booking => booking.rating);
  const averageRating = ratedBookings.length > 0
    ? ratedBookings.reduce((acc, booking) => acc + booking.rating, 0) / ratedBookings.length
    : 0;

  // Get monthly stats for the last 12 months
  const monthlyStats = await getMonthlyStats(req.params.id);

  res.json({
    totalBookings,
    totalRevenue,
    averageRating,
    monthlyStats,
  });
});

// @desc    Get system analytics
// @route   GET /api/analytics/system
// @access  Private/Admin
const getSystemAnalytics = asyncHandler(async (req, res) => {
  // Get total businesses
  const totalBusinesses = await Business.countDocuments();

  // Get total bookings
  const totalBookings = await Booking.countDocuments();

  // Get total revenue
  const bookings = await Booking.find();
  const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

  // Get monthly stats for the last 12 months
  const monthlyStats = await getSystemMonthlyStats();

  res.json({
    totalBusinesses,
    totalBookings,
    totalRevenue,
    monthlyStats,
  });
});

// Helper function to get monthly stats
const getMonthlyStats = async (businessId) => {
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth());

  const monthlyStats = await Booking.aggregate([
    {
      $match: {
        business: businessId,
        createdAt: { $gte: lastYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return monthlyStats;
};

// Helper function to get system monthly stats
const getSystemMonthlyStats = async () => {
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth());

  const monthlyStats = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: lastYear },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return monthlyStats;
};

export { getBusinessAnalytics, getSystemAnalytics };
