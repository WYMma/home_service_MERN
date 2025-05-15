import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import Business from '../models/businessModel.js';
import User from '../models/User.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    business,
    service,
    date,
    startTime,
    endTime,
    totalPrice,
    notes,
    paymentMethod,
  } = req.body;

  const businessDoc = await Business.findById(business);
  if (!businessDoc) {
    res.status(404);
    throw new Error('Business not found');
  }

  const booking = await Booking.create({
    user: req.user._id,
    business,
    service,
    date,
    startTime,
    endTime,
    totalPrice,
    notes,
    paymentMethod,
  });

  res.status(201).json(booking);
});

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const bookings = await Booking.find({ user: req.user._id })
    .populate('business', 'name')
    .populate('service', 'name price')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments({ user: req.user._id });

  res.json({
    bookings,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('business', 'name')
    .populate('service', 'name price')
    .populate('user', 'name email');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Make sure user owns the booking or is business owner
  if (
    booking.user.toString() !== req.user._id.toString() &&
    booking.business.user.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json(booking);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Make sure user owns the booking or is business owner
  if (
    booking.user.toString() !== req.user._id.toString() &&
    booking.business.user.toString() !== req.user._id.toString()
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  booking.status = req.body.status || booking.status;
  if (req.body.cancellationReason) {
    booking.cancellationReason = req.body.cancellationReason;
  }

  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

// @desc    Add booking review
// @route   POST /api/bookings/:id/review
// @access  Private
const addBookingReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (booking.status !== 'completed') {
    res.status(400);
    throw new Error('Booking must be completed before review');
  }

  booking.rating = rating;
  booking.review = review;

  const updatedBooking = await booking.save();

  // Update business rating
  const businessBookings = await Booking.find({
    business: booking.business,
    rating: { $exists: true },
  });

  const business = await Business.findById(booking.business);
  business.rating =
    businessBookings.reduce((acc, item) => item.rating + acc, 0) /
    businessBookings.length;
  business.numReviews = businessBookings.length;

  await business.save();

  res.json(updatedBooking);
});

// @desc    Get available booking slots
// @route   GET /api/bookings/slots/:businessId
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Get all bookings for the specified date
    const bookings = await Booking.find({
      business: businessId,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      }
    });

    // Get business opening hours
    const { openingHours } = business;
    const dayOfWeek = new Date(date).getDay();
    const daySchedule = openingHours[dayOfWeek];

    if (!daySchedule || !daySchedule.isOpen) {
      return res.json({ slots: [] });
    }

    // Generate available time slots
    const slots = [];
    const startTime = new Date(`${date}T${daySchedule.open}`);
    const endTime = new Date(`${date}T${daySchedule.close}`);
    const slotDuration = 30; // 30 minutes per slot

    for (let time = startTime; time < endTime; time.setMinutes(time.getMinutes() + slotDuration)) {
      const slotTime = time.toISOString();
      const isBooked = bookings.some(booking => 
        new Date(booking.date).toISOString() === slotTime
      );

      if (!isBooked) {
        slots.push(slotTime);
      }
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  addBookingReview,
  getAvailableSlots
};
