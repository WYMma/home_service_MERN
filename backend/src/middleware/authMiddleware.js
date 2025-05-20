import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Business from '../models/businessModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Set user in request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
});

const business = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'business' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as business');
  }
});

const businessOwner = asyncHandler(async (req, res, next) => {
  const business = await Business.findById(req.params.id);
  if (!business) {
    res.status(404);
    throw new Error('Business not found');
  }

  // Allow admin or business owner access
  if (req.user.role === 'admin' || business.user.toString() === req.user._id.toString()) {
    req.business = business;
    return next();
  }

  // Check if user is an employee of the business
  const isEmployee = business.employees && business.employees.some(
    emp => emp.user && emp.user.toString() === req.user._id.toString()
  );

  if (isEmployee) {
    // Store business in request for future middleware
    req.business = business;
    req.isEmployee = true;
    return next();
  }

  res.status(401);
  throw new Error('Not authorized to access this business');
});

const checkEmployeePermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    // If user is admin or business owner, always allow
    if (req.user.role === 'admin' || req.business.user.toString() === req.user._id.toString()) {
      return next();
    }

    // If not employee, deny access
    if (!req.isEmployee) {
      res.status(401);
      throw new Error('Not authorized to perform this action');
    }

    // Find the employee record
    const employee = req.business.employees.find(
      emp => emp.user && emp.user.toString() === req.user._id.toString()
    );

    // Check if employee has the required permission
    if (employee && employee.permissions && employee.permissions[permissionName]) {
      return next();
    }

    res.status(401);
    throw new Error(`You don't have permission to ${permissionName}`);
  });
};

export { protect, admin, business, businessOwner, checkEmployeePermission };
