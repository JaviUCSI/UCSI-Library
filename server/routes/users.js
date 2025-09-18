const express = require('express');
const { body, param } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Validation rules
const userValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('type')
    .isIn(['student', 'teacher', 'staff'])
    .withMessage('User type must be student, teacher, or staff'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department/Class cannot exceed 100 characters'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

// @desc    Get all users
// @route   GET /api/users
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    active,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Search functionality
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by user type
  if (type) {
    query.type = type;
  }

  // Filter by active status
  if (active !== undefined) {
    query.isActive = active === 'true';
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  };

  const users = await User.find(query)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit)
    .exec();

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      currentPage: options.page,
      totalPages: Math.ceil(total / options.limit),
      hasNext: options.page < Math.ceil(total / options.limit),
      hasPrev: options.page > 1
    },
    data: users
  });
}));

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user
  });
}));

// @desc    Create new user
// @route   POST /api/users
// @access  Public
router.post('/', userValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  // Check if user with email already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    throw new ApiError('User with this email already exists', 400);
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
}));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
router.put('/:id', [...idValidation, ...userValidation], handleValidationErrors, asyncHandler(async (req, res) => {
  // Check if email is being changed and if it already exists
  if (req.body.email) {
    const existingUser = await User.findOne({ 
      email: req.body.email,
      _id: { $ne: req.params.id }
    });
    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
router.delete('/:id', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Check if user has active loans
  const Loan = require('../models/Loan');
  const activeLoans = await Loan.findOne({ user: req.params.id, returned: false });
  
  if (activeLoans) {
    throw new ApiError('Cannot delete user with active loans', 400);
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {}
  });
}));

// @desc    Get user's loan history
// @route   GET /api/users/:id/loans
// @access  Public
router.get('/:id/loans', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const Loan = require('../models/Loan');
  const loans = await Loan.find({ user: req.params.id })
    .populate('book', 'title author isbn')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: loans.length,
    data: loans
  });
}));

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  
  const typeStats = await User.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const Loan = require('../models/Loan');
  const usersWithActiveLoans = await Loan.aggregate([
    {
      $match: { returned: false }
    },
    {
      $group: {
        _id: '$user',
        loanCount: { $sum: 1 }
      }
    },
    {
      $count: 'totalUsers'
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersWithActiveLoans: usersWithActiveLoans[0]?.totalUsers || 0,
      typeStats
    }
  });
}));

module.exports = router;