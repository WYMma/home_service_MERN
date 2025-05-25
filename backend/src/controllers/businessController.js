import BusinessModel from '../models/businessModel.js';
import ServiceModel from '../models/serviceModel.js';
import BookingModel from '../models/bookingModel.js';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import User from '../models/User.js';
import fs from 'fs';

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Public/Private
const getBusinesses = async (req, res) => {
  try {
    let { category, search, page = 1, limit = 10, sortBy, featured } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (featured === 'true') {
      query.isVerified = true;
      query.status = 'active';
    }

    // Determine sort field
    let sortField = { createdAt: -1 };
    if (sortBy === 'rating') {
      sortField = { rating: -1 };
    } else if (sortBy === 'name') {
      sortField = { name: 1 };
    }

    const businesses = await BusinessModel.find(query)
      .populate('category', 'name')
      .sort(sortField)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await BusinessModel.countDocuments(query);

    // If user is authenticated, return full business data
    if (req.user) {
      const populatedBusinesses = await Promise.all(
        businesses.map(async (business) => {
          await business.populate('user', 'name email');
          return business;
        })
      );

      return res.json({
        businesses: populatedBusinesses,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count,
      });
    }

    // For public access, return limited business data
    const publicBusinesses = businesses.map(business => ({
      _id: business._id,
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone,
      category: business.category,
      images: business.images,
      rating: business.rating,
      numReviews: business.numReviews,
      isVerified: business.isVerified,
      status: business.status,
      workingHours: business.workingHours,
      website: business.website
    }));

    res.json({
      businesses: publicBusinesses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    });
  } catch (error) {
    console.error('Error in getBusinesses:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single business
// @route   GET /api/businesses/:id
// @access  Public
const getBusinessById = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id)
      .populate('category', 'name')
      .populate('user', 'name email')
      .populate('employees.user', 'name email');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    console.error('Error in getBusinessById:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid business ID format' });
    }
    res.status(500).json({ message: 'Error fetching business details' });
  }
};

// @desc    Create a business
// @route   POST /api/businesses
// @access  Private
const createBusiness = async (req, res) => {
  try {
    console.log('Creating business with files:', req.files);
    console.log('Request body:', req.body);

    const {
      name,
      description,
      category,
      address,
      phone,
      email,
      workingHours,
      website
    } = req.body;

    // Check if user already has a business
    const existingBusiness = await BusinessModel.findOne({ user: req.user._id });
    if (existingBusiness) {
      return res.status(400).json({ message: 'You already have a business profile' });
    }

    // Parse JSON strings back to objects
    const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
    const parsedWorkingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;

    // Get image paths from uploaded files and ensure forward slashes
    const imagePaths = req.files ? req.files.map(file => {
      // Convert any backslashes to forward slashes and ensure it starts with a forward slash
      const path = file.path.replace(/\\/g, '/');
      return path.startsWith('/') ? path : '/' + path;
    }) : [];
    console.log('Image paths:', imagePaths);

    const business = new BusinessModel({
      name,
      description,
      category,
      user: req.user._id,
      address: parsedAddress,
      phone,
      email,
      workingHours: parsedWorkingHours,
      website,
      images: imagePaths,
      status: 'pending',
      isVerified: false
    });

    console.log('Saving business with data:', {
      name,
      category,
      user: req.user._id,
      imageCount: imagePaths.length
    });

    const createdBusiness = await business.save();
    
    // Populate the category and user fields
    await createdBusiness.populate('category', 'name');
    await createdBusiness.populate('user', 'name email');

    console.log('Business created successfully:', createdBusiness._id);

    res.status(201).json(createdBusiness);
  } catch (error) {
    console.error('Error in createBusiness:', error);
    // If there's an error, delete any uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a business
// @route   PUT /api/businesses/:id
// @access  Private
const updateBusiness = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user is owner or admin
    if (business.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedBusiness = await BusinessModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedBusiness);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a business
// @route   DELETE /api/businesses/:id
// @access  Private
const deleteBusiness = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user is owner or admin
    if (business.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await business.remove();
    res.json({ message: 'Business removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get business services
// @route   GET /api/businesses/:id/services
// @access  Public
const getBusinessServices = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const services = await ServiceModel.find({ business: business._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get business bookings
// @route   GET /api/businesses/:id/bookings
// @access  Private
const getBusinessBookings = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await BookingModel.find({ business: req.params.id })
      .populate('user', 'firstName lastName email phone')
      .populate('service', 'name price')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BookingModel.countDocuments({ business: req.params.id });

    res.json({
      bookings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get business analytics
// @route   GET /api/businesses/:id/analytics
// @access  Private
const getBusinessAnalytics = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get total bookings
    const totalBookings = await BookingModel.countDocuments({
      business: req.params.id,
    });

    // Get total revenue (only from completed bookings)
    const bookings = await BookingModel.find({ 
      business: req.params.id,
      status: 'completed' // Only count completed bookings
    }).populate(
      'service',
      'price'
    );
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + (booking.service?.price || 0),
      0
    );

    // Get average rating
    const ratings = bookings.filter((booking) => booking.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((acc, booking) => acc + booking.rating, 0) /
          ratings.length
        : 0;

    // Get bookings by month (last 6 months)
    const bookingsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const count = await BookingModel.countDocuments({
        business: req.params.id,
        date: { $gte: start, $lte: end },
      });

      bookingsByMonth.push({
        date: format(date, 'yyyy-MM'),
        count,
      });
    }

    // Get revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthlyBookings = await BookingModel.find({
        business: req.params.id,
        date: { $gte: start, $lte: end },
        status: 'completed' // Only count completed bookings
      }).populate('service', 'price');

      const amount = monthlyBookings.reduce(
        (acc, booking) => acc + (booking.service?.price || 0),
        0
      );

      revenueByMonth.push({
        date: format(date, 'yyyy-MM'),
        revenue: amount,
      });
    }

    // Get booking status distribution
    const bookingStatusData = await BookingModel.aggregate([
      { $match: { business: business._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Get rating distribution
    const ratingDistribution = await BookingModel.aggregate([
      { 
        $match: { 
          business: business._id,
          rating: { $exists: true, $ne: null }
        } 
      },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { rating: '$_id', count: 1, _id: 0 } },
      { $sort: { rating: 1 } }
    ]);

    // Get popular services
    const popularServices = await BookingModel.aggregate([
      { 
        $match: { 
          business: business._id,
          status: 'completed' // Only count completed bookings
        } 
      },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const servicesWithDetails = await ServiceModel.populate(popularServices, {
      path: '_id',
      select: 'name',
    });

    const formattedPopularServices = servicesWithDetails.map((item) => ({
      name: item._id.name,
      bookings: item.count,
    }));

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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get business profile
// @route   GET /api/businesses/profile
// @access  Private/Business
const getBusinessProfile = async (req, res) => {
  try {
    const business = await BusinessModel.findOne({ user: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Get total bookings
    const totalBookings = await BookingModel.countDocuments({
      business: business._id,
    });

    // Get total revenue (only from completed bookings)
    const bookings = await BookingModel.find({ 
      business: business._id,
      status: 'completed' // Only count completed bookings
    }).populate(
      'service',
      'price'
    );
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + (booking.service?.price || 0),
      0
    );

    // Get average rating
    const ratedBookings = bookings.filter((booking) => booking.rating);
    const averageRating =
      ratedBookings.length > 0
        ? ratedBookings.reduce((acc, booking) => acc + booking.rating, 0) /
          ratedBookings.length
        : 0;

    // Get active services count
    const activeServices = await ServiceModel.countDocuments({
      business: business._id,
      status: 'active'
    });

    // Add analytics data to the response
    const businessWithAnalytics = {
      ...business.toObject(),
      totalBookings,
      totalRevenue,
      averageRating,
      activeServices
    };

    res.json(businessWithAnalytics);
  } catch (error) {
    console.error('Error in getBusinessProfile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update business profile
// @route   PUT /api/businesses/profile
// @access  Private/Business
const updateBusinessProfile = async (req, res) => {
  try {
    const business = await BusinessModel.findOne({ user: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const {
      name,
      description,
      address,
      phone,
      email,
      website,
      workingHours,
      category,
      images
    } = req.body;

    // Update only provided fields
    if (name) business.name = name;
    if (description) business.description = description;
    if (address) {
      try {
        // If address is a string, parse it to an object
        business.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (error) {
        console.error('Error parsing address:', error);
        return res.status(400).json({ message: 'Invalid address format' });
      }
    }
    if (phone) business.phone = phone;
    if (email) business.email = email;
    if (website) business.website = website;
    if (workingHours) business.workingHours = workingHours;
    if (category) business.category = category;
    if (images) business.images = images;

    const updatedBusiness = await business.save();
    res.json(updatedBusiness);
  } catch (error) {
    console.error('Error in updateBusinessProfile:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create business service
// @route   POST /api/businesses/:id/services
// @access  Private/Business
const createBusinessService = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if the user owns this business
    if (business.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { name, description, price, duration, category } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !duration || !category) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, description, price, duration, and category' 
      });
    }

    // Create service with image if provided
    const serviceData = {
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      category,
      business: business._id
    };

    // Add image if uploaded
    if (req.file) {
      serviceData.image = `/uploads/${req.file.filename}`;
    }

    const service = await ServiceModel.create(serviceData);
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update business service
// @route   PUT /api/businesses/:id/services/:serviceId
// @access  Private/Business
const updateBusinessService = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if the user owns this business
    if (business.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const service = await ServiceModel.findOne({
      _id: req.params.serviceId,
      business: business._id
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const { name, description, price, duration, category } = req.body;
    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;
    service.duration = duration || service.duration;
    service.category = category || service.category;

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete business service
// @route   DELETE /api/businesses/:id/services/:serviceId
// @access  Private/Business
const deleteBusinessService = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if the user owns this business
    if (business.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const service = await ServiceModel.findOne({
      _id: req.params.serviceId,
      business: business._id
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Upload business images
// @route   POST /api/businesses/upload
// @access  Private/Business
const uploadBusinessImages = async (req, res) => {
  try {
    const business = await BusinessModel.findOne({ user: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => {
      const path = file.path.replace(/\\/g, '/');
      return path.startsWith('/') ? path : '/' + path;
    });
    business.images = [...business.images, ...imageUrls];
    await business.save();

    res.json({ images: imageUrls });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete business image
// @route   DELETE /api/businesses/images/:imageId
// @access  Private/Business
const deleteBusinessImage = async (req, res) => {
  try {
    const business = await BusinessModel.findOne({ user: req.user._id });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const imageUrl = decodeURIComponent(req.params.imageId);
    
    // Remove the image from the business's images array
    business.images = business.images.filter(img => img !== imageUrl);
    await business.save();

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    console.error('Error deleting business image:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get business reviews
// @route   GET /api/businesses/:id/reviews
// @access  Public
const getBusinessReviews = async (req, res) => {
  try {
    console.log('Fetching reviews for business ID:', req.params.id);
    
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      console.log('Business not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Business not found' });
    }

    console.log('Found business:', business.name);
    
    const reviews = await BookingModel.find({
      business: req.params.id,
      rating: { $exists: true, $ne: null }
    })
    .populate({
      path: 'user',
      select: 'firstName lastName profileImage',
      model: 'User'
    })
    .sort({ createdAt: -1 });

    console.log('Found reviews count:', reviews.length);
    
    // Debug log for user data
    reviews.forEach((review, index) => {
      console.log(`Review ${index + 1} user data:`, {
        userId: review.user?._id,
        firstName: review.user?.firstName,
        lastName: review.user?.lastName,
        profileImage: review.user?.profileImage,
        hasUser: !!review.user
      });
    });

    // Transform the data to match the expected format
    const formattedReviews = reviews.map(review => {
      const userName = review.user ? 
        `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() : 
        'Anonymous User';
      
      return {
        _id: review._id,
        rating: review.rating,
        comment: review.review,
        user: review.user ? {
          _id: review.user._id,
          name: userName,
          profileImage: review.user.profileImage || null
        } : {
          name: 'Anonymous User',
          profileImage: null
        },
        createdAt: review.createdAt
      };
    });

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error in getBusinessReviews:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a review to a business
// @route   POST /api/businesses/:id/reviews
// @access  Private
const addBusinessReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const business = await BusinessModel.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user has a completed booking with this business
    const booking = await BookingModel.findOne({
      business: req.params.id,
      user: req.user._id,
      status: 'completed'
    });

    if (!booking) {
      return res.status(400).json({ message: 'You must have a completed booking to review this business' });
    }

    // Update booking with review
    booking.rating = rating;
    booking.review = comment;
    await booking.save();

    // Update business rating
    const businessBookings = await BookingModel.find({
      business: req.params.id,
      rating: { $exists: true }
    });

    const totalRating = businessBookings.reduce((acc, item) => acc + item.rating, 0);
    business.rating = totalRating / businessBookings.length;
    business.numReviews = businessBookings.length;
    await business.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error in addBusinessReview:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get business employees
// @route   GET /api/businesses/:id/employees
// @access  Private/Business Owner
const getBusinessEmployees = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id)
      .populate('user', 'name email')
      .populate('employees.user', 'name email');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user is owner or admin
    if (business.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, only the business owner can view employees' });
    }

    res.json({
      owner: business.user,
      employees: business.employees || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add business employee
// @route   POST /api/businesses/:id/employees
// @access  Private/Business Owner
const addBusinessEmployee = async (req, res) => {
  try {
    const { email, role, permissions } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user is owner
    if (business.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, only the business owner can add employees' });
    }

    // Check if employee already exists
    const employeeExists = business.employees.find(
      emp => emp.user.toString() === user._id.toString()
    );
    
    if (employeeExists) {
      return res.status(400).json({ message: 'User is already an employee of this business' });
    }

    // Check if max employees reached (maximum 4 employees)
    if (business.employees.length >= 4) {
      return res.status(400).json({ message: 'Maximum employee limit reached (4)' });
    }

    // Add employee to business
    business.employees.push({
      user: user._id,
      role: role || 'staff',
      permissions: permissions || {
        manageBookings: true,
        manageServices: false,
        viewAnalytics: true,
        editProfile: false
      }
    });

    await business.save();

    // Return updated employees list with populated user data
    const updatedBusiness = await BusinessModel.findById(req.params.id)
      .populate('employees.user', 'name email');

    res.status(201).json({
      message: 'Employee added successfully',
      employees: updatedBusiness.employees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update business employee permissions
// @route   PUT /api/businesses/:id/employees/:employeeId
// @access  Private/Business Owner
const updateEmployeePermissions = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user is owner
    if (business.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, only the business owner can update employees' });
    }

    // Find employee in the array
    const employeeIndex = business.employees.findIndex(
      emp => emp._id.toString() === req.params.employeeId
    );
    
    if (employeeIndex === -1) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee data
    if (role) {
      business.employees[employeeIndex].role = role;
    }
    
    if (permissions) {
      business.employees[employeeIndex].permissions = {
        ...business.employees[employeeIndex].permissions,
        ...permissions
      };
    }

    await business.save();

    // Return updated employees list with populated user data
    const updatedBusiness = await BusinessModel.findById(req.params.id)
      .populate('employees.user', 'name email');

    res.json({
      message: 'Employee updated successfully',
      employees: updatedBusiness.employees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove business employee
// @route   DELETE /api/businesses/:id/employees/:employeeId
// @access  Private/Business Owner
const removeBusinessEmployee = async (req, res) => {
  try {
    const business = await BusinessModel.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user is owner
    if (business.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, only the business owner can remove employees' });
    }

    // Find employee index
    const employeeIndex = business.employees.findIndex(
      emp => emp._id.toString() === req.params.employeeId
    );
    
    if (employeeIndex === -1) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Remove employee
    business.employees.splice(employeeIndex, 1);
    await business.save();

    res.json({
      message: 'Employee removed successfully',
      employees: business.employees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessServices,
  createBusinessService,
  updateBusinessService,
  deleteBusinessService,
  getBusinessBookings,
  getBusinessAnalytics,
  uploadBusinessImages,
  getBusinessProfile,
  updateBusinessProfile,
  deleteBusinessImage,
  getBusinessReviews,
  addBusinessReview,
  getBusinessEmployees,
  addBusinessEmployee,
  updateEmployeePermissions,
  removeBusinessEmployee,
};
