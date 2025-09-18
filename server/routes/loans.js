const express = require('express');
const { body, param } = require('express-validator');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Validation rules
const loanValidation = [
  body('book')
    .isMongoId()
    .withMessage('Valid book ID is required'),
  body('user')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required')
    .custom((value, { req }) => {
      const dueDate = new Date(value);
      const loanDate = req.body.loanDate ? new Date(req.body.loanDate) : new Date();
      if (dueDate <= loanDate) {
        throw new Error('Due date must be after loan date');
      }
      return true;
    }),
  body('loanDate')
    .optional()
    .isISO8601()
    .withMessage('Valid loan date is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid loan ID format')
];

// @desc    Get all loans
// @route   GET /api/loans
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    overdue,
    user,
    book,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Filter by status
  if (status === 'active') {
    query.returned = false;
  } else if (status === 'returned') {
    query.returned = true;
  }

  // Filter by overdue status
  if (overdue === 'true') {
    query.returned = false;
    query.dueDate = { $lt: new Date() };
  }

  // Filter by user
  if (user) {
    query.user = user;
  }

  // Filter by book
  if (book) {
    query.book = book;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  };

  const loans = await Loan.find(query)
    .populate('book', 'title author isbn category')
    .populate('user', 'name email type department')
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit)
    .exec();

  const total = await Loan.countDocuments(query);

  res.status(200).json({
    success: true,
    count: loans.length,
    total,
    pagination: {
      currentPage: options.page,
      totalPages: Math.ceil(total / options.limit),
      hasNext: options.page < Math.ceil(total / options.limit),
      hasPrev: options.page > 1
    },
    data: loans
  });
}));

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Public
router.get('/:id', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id)
    .populate('book', 'title author isbn category location')
    .populate('user', 'name email type department phone');

  if (!loan) {
    throw new ApiError('Loan not found', 404);
  }

  res.status(200).json({
    success: true,
    data: loan
  });
}));

// @desc    Create new loan
// @route   POST /api/loans
// @access  Public
router.post('/', loanValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const { book: bookId, user: userId } = req.body;

  // Check if book exists and is available
  const book = await Book.findById(bookId);
  if (!book) {
    throw new ApiError('Book not found', 404);
  }
  if (!book.isAvailable) {
    throw new ApiError('Book is not available for loan', 400);
  }

  // Check if user exists and is active
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  if (!user.isActive) {
    throw new ApiError('User account is not active', 400);
  }

  // Check if user already has this book on loan
  const existingLoan = await Loan.findOne({
    book: bookId,
    user: userId,
    returned: false
  });
  if (existingLoan) {
    throw new ApiError('User already has this book on loan', 400);
  }

  // Create the loan
  const loan = await Loan.create(req.body);

  // Populate the response
  const populatedLoan = await Loan.findById(loan._id)
    .populate('book', 'title author isbn')
    .populate('user', 'name email type');

  res.status(201).json({
    success: true,
    message: 'Loan created successfully',
    data: populatedLoan
  });
}));

// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Public
router.put('/:id', [...idValidation, ...loanValidation], handleValidationErrors, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  
  if (!loan) {
    throw new ApiError('Loan not found', 404);
  }

  // If loan is already returned, don't allow updates except notes
  if (loan.returned && Object.keys(req.body).some(key => key !== 'notes')) {
    throw new ApiError('Cannot modify returned loan (except notes)', 400);
  }

  const updatedLoan = await Loan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('book', 'title author isbn')
   .populate('user', 'name email type');

  res.status(200).json({
    success: true,
    message: 'Loan updated successfully',
    data: updatedLoan
  });
}));

// @desc    Return a book (mark loan as returned)
// @route   PUT /api/loans/:id/return
// @access  Public
router.put('/:id/return', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  
  if (!loan) {
    throw new ApiError('Loan not found', 404);
  }

  if (loan.returned) {
    throw new ApiError('This loan has already been returned', 400);
  }

  // Update loan as returned
  loan.returned = true;
  loan.returnDate = new Date();
  if (req.body.notes) {
    loan.notes = req.body.notes;
  }
  
  await loan.save();

  const populatedLoan = await Loan.findById(loan._id)
    .populate('book', 'title author isbn')
    .populate('user', 'name email type');

  res.status(200).json({
    success: true,
    message: 'Book returned successfully',
    data: populatedLoan
  });
}));

// @desc    Delete loan
// @route   DELETE /api/loans/:id
// @access  Public
router.delete('/:id', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    throw new ApiError('Loan not found', 404);
  }

  await Loan.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Loan deleted successfully',
    data: {}
  });
}));

// @desc    Get overdue loans
// @route   GET /api/loans/overdue
// @access  Public
router.get('/overdue/list', asyncHandler(async (req, res) => {
  const overdueLoans = await Loan.find({
    returned: false,
    dueDate: { $lt: new Date() }
  })
  .populate('book', 'title author isbn')
  .populate('user', 'name email type department')
  .sort({ dueDate: 1 });

  res.status(200).json({
    success: true,
    count: overdueLoans.length,
    data: overdueLoans
  });
}));

// @desc    Get loan statistics
// @route   GET /api/loans/stats/overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const totalLoans = await Loan.countDocuments();
  const activeLoans = await Loan.countDocuments({ returned: false });
  const returnedLoans = await Loan.countDocuments({ returned: true });
  const overdueLoans = await Loan.countDocuments({
    returned: false,
    dueDate: { $lt: new Date() }
  });

  // Most borrowed books
  const popularBooks = await Loan.aggregate([
    {
      $group: {
        _id: '$book',
        loanCount: { $sum: 1 }
      }
    },
    {
      $sort: { loanCount: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookInfo'
      }
    },
    {
      $unwind: '$bookInfo'
    },
    {
      $project: {
        title: '$bookInfo.title',
        author: '$bookInfo.author',
        loanCount: 1
      }
    }
  ]);

  // Active users with most loans
  const activeUsers = await Loan.aggregate([
    {
      $match: { returned: false }
    },
    {
      $group: {
        _id: '$user',
        activeLoanCount: { $sum: 1 }
      }
    },
    {
      $sort: { activeLoanCount: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: '$userInfo'
    },
    {
      $project: {
        name: '$userInfo.name',
        email: '$userInfo.email',
        type: '$userInfo.type',
        activeLoanCount: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalLoans,
      activeLoans,
      returnedLoans,
      overdueLoans,
      popularBooks,
      activeUsers
    }
  });
}));

module.exports = router;