import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import Business from '../models/businessModel.js';
import ServiceModel from '../models/serviceModel.js';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import mongoose from 'mongoose';

// @desc    Get business analytics
// @route   GET /api/analytics/business/:id
// @access  Private/Business
const getBusinessAnalytics = asyncHandler(async (req, res) => {
  try {
    console.log('Getting analytics for business:', req.params.id);
    
    // Validate business ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid business ID format');
    }
    
    const businessId = new mongoose.Types.ObjectId(req.params.id);
    console.log('Converted businessId:', businessId);
    
    const business = await Business.findById(businessId);
    console.log('Found business:', business ? 'yes' : 'no');
    
    if (!business) {
      res.status(404);
      throw new Error('Business not found');
    }

    // Get total bookings
    const totalBookings = await Booking.countDocuments({ business: businessId });
    console.log('Total bookings:', totalBookings);

    // Get total revenue (only from completed bookings)
    const bookings = await Booking.find({ 
      business: businessId,
      status: 'completed' // Only count completed bookings
    }).populate('service', 'name price');
    console.log('Found completed bookings:', bookings.length);
    
    const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.totalPrice || 0), 0);
    console.log('Total revenue:', totalRevenue);

    // Get average rating
    const ratedBookings = bookings.filter(booking => booking.rating);
    const averageRating = ratedBookings.length > 0
      ? ratedBookings.reduce((acc, booking) => acc + booking.rating, 0) / ratedBookings.length
      : 0;
    console.log('Average rating:', averageRating);

    // Get bookings by month (last 6 months)
    const bookingsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const count = await Booking.countDocuments({
        business: businessId,
        date: { $gte: start, $lte: end },
      });

      bookingsByMonth.push({
        date: format(date, 'yyyy-MM'),
        count,
      });
    }
    console.log('Bookings by month:', bookingsByMonth);

    // Get revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthlyBookings = await Booking.find({
        business: businessId,
        date: { $gte: start, $lte: end },
        status: 'completed' // Only count completed bookings
      });

      const amount = monthlyBookings.reduce(
        (acc, booking) => acc + (booking.totalPrice || 0),
        0
      );

      revenueByMonth.push({
        date: format(date, 'yyyy-MM'),
        revenue: amount,
      });
    }
    console.log('Revenue by month:', revenueByMonth);

    // Get booking status distribution
    const bookingStatusData = await Booking.aggregate([
      { $match: { business: businessId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);
    console.log('Booking status data:', bookingStatusData);

    // Get rating distribution
    const ratingDistribution = await Booking.aggregate([
      { 
        $match: { 
          business: businessId,
          rating: { $exists: true, $ne: null }
        } 
      },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { rating: '$_id', count: 1, _id: 0 } },
      { $sort: { rating: 1 } }
    ]);
    console.log('Rating distribution:', ratingDistribution);

    // Get popular services
    const popularServices = await Booking.aggregate([
      { 
        $match: { 
          business: businessId,
          status: 'completed' // Only count completed bookings
        } 
      },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    console.log('Popular services before population:', popularServices);

    // Populate service details
    const servicesWithDetails = await ServiceModel.populate(popularServices, {
      path: '_id',
      select: 'name',
    });
    console.log('Services with details:', servicesWithDetails);

    const formattedPopularServices = servicesWithDetails.map((item) => ({
      name: item._id?.name || 'Unknown Service',
      bookings: item.count,
    }));
    console.log('Formatted popular services:', formattedPopularServices);

    res.json({
      totalBookings,
      totalRevenue,
      averageRating,
      bookingsByMonth,
      revenueByMonth,
      bookingStatusData,
      ratingDistribution,
      popularServices: formattedPopularServices,
    });
  } catch (error) {
    console.error('Error in getBusinessAnalytics:', error);
    res.status(500).json({ 
      message: 'Error fetching business analytics',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
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
