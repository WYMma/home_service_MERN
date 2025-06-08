import User from '../models/User.js';
import Service from '../models/serviceModel.js';
import Business from '../models/businessModel.js';
import Category from '../models/Category.js';
import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalServices = await Service.countDocuments();
    
    // Calculate average rating
    const bookings = await Booking.find({ rating: { $exists: true, $ne: null } });
    const totalRating = bookings.reduce((acc, booking) => acc + (booking.rating || 0), 0);
    const averageRating = bookings.length > 0 ? totalRating / bookings.length : 0;

    // User role distribution
    const userRoleData = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } }
    ]);

    // User status distribution
    const userStatusData = await User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Booking status distribution
    const bookingStatusData = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Payment status distribution
    const paymentStatusData = await Booking.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
      { $project: { paymentStatus: '$_id', count: 1, _id: 0 } }
    ]);

    // Get user registration by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowthData = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { 
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1 
        } 
      },
      {
        $project: {
          date: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Get booking creation by month (last 6 months)
    const bookingGrowthData = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { 
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1 
        } 
      },
      {
        $project: {
          date: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Top 5 categories with most businesses
    const popularCategories = await Business.aggregate([
      { $match: { category: { $exists: true, $ne: null } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          category: { $arrayElemAt: ['$categoryInfo.name', 0] },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Recent bookings (last 5)
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('business', 'name')
      .populate('service', 'name price');

    // Format recent bookings for frontend
    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking._id,
      userName: booking.user ? booking.user.name : 'Unknown',
      businessName: booking.business ? booking.business.name : 'Unknown',
      serviceName: booking.service ? booking.service.name : 'Unknown',
      date: booking.date,
      status: booking.status,
      price: booking.totalPrice
    }));

    res.json({
      // Basic stats
      totalUsers,
      totalBusinesses,
      totalBookings,
      totalCategories,
      totalServices,
      averageRating,
      
      // Detailed stats
      userRoleData,
      userStatusData,
      bookingStatusData,
      paymentStatusData,
      userGrowthData,
      bookingGrowthData,
      popularCategories,
      recentBookings: formattedRecentBookings
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, email, phone, role, status, profileImage } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.status = status || user.status;
    user.profileImage = profileImage || user.profileImage;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    // Check if trying to delete the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Block user
// @route   POST /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'blocked';
    await user.save();
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Unblock user
// @route   POST /api/admin/users/:id/unblock
// @access  Private/Admin
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    await user.save();
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all services
// @route   GET /api/admin/services
// @access  Private/Admin
const getServices = async (req, res) => {
  try {
    const services = await Service.find({})
      .populate('business', 'name')
      .populate('category', 'name');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create service
// @route   POST /api/admin/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { name, description, price, category, status, duration, business } = req.body;

    // Create new service
    const service = new Service({
      name,
      description,
      price,
      category,
      status,
      business,
      duration: duration || 60, // Default duration of 60 minutes
      isAvailable: true
    });

    const createdService = await service.save();
    
    // Populate the business and category fields before sending response
    await createdService.populate('business', 'name');
    await createdService.populate('category', 'name');
    
    res.status(201).json(createdService);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/admin/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const { name, description, price, category, status, business } = req.body;

    // Update all fields
    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;
    service.category = category || service.category;
    service.status = status || service.status;
    service.business = business || service.business;

    const updatedService = await service.save();
    
    // Populate the business and category fields before sending response
    await updatedService.populate('business', 'name');
    await updatedService.populate('category', 'name');
    
    res.json(updatedService);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/admin/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve service
// @route   POST /api/admin/services/:id/approve
// @access  Private/Admin
const approveService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.status = 'active';
    await service.save();
    res.json({ message: 'Service approved successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reject service
// @route   POST /api/admin/services/:id/reject
// @access  Private/Admin
const rejectService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.status = 'rejected';
    await service.save();
    res.json({ message: 'Service rejected successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all businesses
// @route   GET /api/admin/businesses
// @access  Private/Admin
const getBusinesses = async (req, res) => {
  try {
    // Populate both user and category fields for complete business data
    const businesses = await Business.find({})
      .populate('user', 'firstName lastName email')
      .populate('category', 'name');
    
    console.log(`Fetched ${businesses.length} businesses with populated fields`);
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a business
// @route   POST /api/admin/businesses
// @access  Private/Admin
const createBusiness = async (req, res) => {
  try {
    const { name, description, address, phone, email, status, category, user, images } = req.body;

    if (!user) {
      return res.status(400).json({ message: 'User is required' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const newBusiness = new Business({
      name,
      description,
      address,
      phone,
      email,
      status: status || 'pending',
      category: category || undefined,
      user,
      images
    });

    const createdBusiness = await newBusiness.save();
    await createdBusiness.populate('user', 'name email');
    if (category) {
      await createdBusiness.populate('category', 'name');
    }
    
    res.status(201).json(createdBusiness);
  } catch (error) {
    console.error('Create business error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update business
// @route   PUT /api/admin/businesses/:id
// @access  Private/Admin
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const { name, description, address, phone, status, email, user, category, images } = req.body;
    
    if (!user) {
      return res.status(400).json({ message: 'User is required' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    
    // Update basic fields
    business.name = name || business.name;
    business.description = description || business.description;
    business.address = address || business.address;
    business.phone = phone || business.phone;
    business.status = status || business.status;
    business.email = email || business.email;
    business.user = user || business.user;
    business.images = images;
    
    // Only update category if provided and not empty
    if (category) {
      business.category = category;
    }

    const updatedBusiness = await business.save();
    
    // Populate the user field and category field before sending response
    await updatedBusiness.populate('user', 'name email');
    if (updatedBusiness.category) {
      await updatedBusiness.populate('category', 'name');
    }
    
    res.json(updatedBusiness);
  } catch (error) {
    console.error('Update business error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete business
// @route   DELETE /api/admin/businesses/:id
// @access  Private/Admin
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    await Business.findByIdAndDelete(req.params.id);
    res.json({ message: 'Business removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve business
// @route   POST /api/admin/businesses/:id/approve
// @access  Private/Admin
const approveBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.status = 'active';
    await business.save();
    res.json({ message: 'Business approved successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reject business
// @route   POST /api/admin/businesses/:id/reject
// @access  Private/Admin
const rejectBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    business.status = 'rejected';
    await business.save();
    res.json({ message: 'Business rejected successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, bgcolor, imageUrl } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description,
      icon,
      bgcolor,
      imageUrl
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    console.log('Update category request:', req.params.id, req.body);
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      console.error('Category not found:', req.params.id);
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, icon, bgcolor, imageUrl } = req.body;
    category.name = name || category.name;
    category.description = description || category.description;
    category.icon = icon || category.icon;
    category.bgcolor = bgcolor || category.bgcolor;
    category.imageUrl = imageUrl || category.imageUrl;

    console.log('Updated category data:', category);
    const updatedCategory = await category.save();
    console.log('Category saved successfully');
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .populate('business', 'name')
      .populate('service', 'name price')
      .sort({ createdAt: -1 });

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      userName: booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Unknown',
      userEmail: booking.user ? booking.user.email : 'Unknown',
      businessName: booking.business ? booking.business.name : 'Unknown',
      serviceName: booking.service ? booking.service.name : 'Unknown',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      price: booking.totalPrice,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error in getBookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const { status, notes } = req.body;
    booking.status = status || booking.status;
    booking.notes = notes || booking.notes;

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, status } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'user',
      status: status || 'active'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Upload image
// @route   POST /api/admin/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  console.log('Upload request received:', req.files);
  
  if (!req.files || req.files.length === 0) {
    console.error('No files uploaded');
    res.status(400);
    throw new Error('Please upload at least one image file');
  }

  // Create the image URLs
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  console.log('Generated image URLs:', imageUrls);

  res.status(200).json({
    success: true,
    urls: imageUrls
  });
});

// @desc    Get all subscription payments
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate('user', 'name email')
    .populate('business', 'name')
    .sort({ createdAt: -1 });

  // Transform the data to include user and business names
  const transformedPayments = payments.map(payment => ({
    ...payment.toObject(),
    userName: payment.user?.name || 'N/A',
    businessName: payment.business?.name || 'N/A'
  }));

  res.json(transformedPayments);
});

// @desc    Update payment status
// @route   PUT /api/admin/payments/:id/status
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  const { status } = req.body;
  if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
    res.status(400);
    throw new Error('Invalid payment status');
  }

  payment.status = status;
  const updatedPayment = await payment.save();

  // Populate user and business details
  await updatedPayment.populate('user', 'name email');
  await updatedPayment.populate('business', 'name');

  res.json(updatedPayment);
});

// @desc    Get payment details
// @route   GET /api/admin/payments/:id
// @access  Private/Admin
const getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email')
    .populate('business', 'name');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.json(payment);
});

// @desc    Get payment report
// @route   GET /api/admin/payments/report
// @access  Private/Admin
const getPaymentReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  
  // Build query
  const query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate('user', 'name email')
    .populate('business', 'name')
    .sort({ createdAt: -1 });

  // Calculate report statistics
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const statusCounts = payments.reduce((acc, payment) => {
    acc[payment.status] = (acc[payment.status] || 0) + 1;
    return acc;
  }, {});

  const report = {
    totalPayments: payments.length,
    totalAmount,
    statusCounts,
    payments: payments.map(payment => ({
      ...payment.toObject(),
      userName: payment.user?.name || 'N/A',
      businessName: payment.business?.name || 'N/A'
    }))
  };

  res.json(report);
});

// @desc    Get booking details
// @route   GET /api/admin/bookings/:id
// @access  Private/Admin
const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('business', 'name address phone')
      .populate('service', 'name description price');

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Format the response
    const formattedBooking = {
      _id: booking._id,
      userName: booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Unknown',
      userEmail: booking.user?.email || 'N/A',
      userPhone: booking.user?.phone || 'N/A',
      businessName: booking.business?.name || 'Unknown',
      businessAddress: booking.business?.address || 'N/A',
      businessPhone: booking.business?.phone || 'N/A',
      serviceName: booking.service?.name || 'Unknown',
      serviceDescription: booking.service?.description || 'N/A',
      price: booking.totalPrice,
      date: booking.date,
      time: booking.startTime,
      duration: booking.duration,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      rating: booking.rating,
      review: booking.review,
      notes: booking.notes,
      createdAt: booking.createdAt
    };

    res.json(formattedBooking);
  } catch (error) {
    console.error('Error in getBookingDetails:', error);
    res.status(500).json({ message: error.message });
  }
};

export {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getServices,
  createService,
  updateService,
  deleteService,
  approveService,
  rejectService,
  getBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  approveBusiness,
  rejectBusiness,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBookings,
  updateBooking,
  deleteBooking,
  createUser,
  uploadImage,
  getAllPayments,
  updatePaymentStatus,
  getPaymentDetails,
  getPaymentReport,
  getBookingDetails,
}; 