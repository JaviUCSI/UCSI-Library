const express = require('express');
const { body, param, query } = require('express-validator');
const Book = require('../models/Book');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Validation rules
const bookValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('author')
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('isbn')
    .optional()
    .matches(/^(?:\d{10}|\d{13})$/)
    .withMessage('ISBN must be 10 or 13 digits'),
  body('publisher')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Publisher name cannot exceed 100 characters'),
  body('year')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid book ID format')
];

// @desc    Get all books
// @route   GET /api/books
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    available,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Search functionality
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  if (category) {
    query.category = new RegExp(category, 'i');
  }

  // Filter by availability
  if (available !== undefined) {
    query.isAvailable = available === 'true';
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
  };

  const books = await Book.find(query)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit)
    .exec();

  const total = await Book.countDocuments(query);

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    pagination: {
      currentPage: options.page,
      totalPages: Math.ceil(total / options.limit),
      hasNext: options.page < Math.ceil(total / options.limit),
      hasPrev: options.page > 1
    },
    data: books
  });
}));

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ApiError('Book not found', 404);
  }

  res.status(200).json({
    success: true,
    data: book
  });
}));

// @desc    Create new book
// @route   POST /api/books
// @access  Public
router.post('/', bookValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: book
  });
}));

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Public
router.put('/:id', [...idValidation, ...bookValidation], handleValidationErrors, asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!book) {
    throw new ApiError('Book not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: book
  });
}));

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Public
router.delete('/:id', idValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new ApiError('Book not found', 404);
  }

  // Check if book is currently on loan
  const Loan = require('../models/Loan');
  const activeLoan = await Loan.findOne({ book: req.params.id, returned: false });
  
  if (activeLoan) {
    throw new ApiError('Cannot delete book that is currently on loan', 400);
  }

  await Book.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully',
    data: {}
  });
}));

// @desc    Get book statistics
// @route   GET /api/books/stats/overview
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const totalBooks = await Book.countDocuments();
  const availableBooks = await Book.countDocuments({ isAvailable: true });
  const borrowedBooks = totalBooks - availableBooks;

  const categoryStats = await Book.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalBooks,
      availableBooks,
      borrowedBooks,
      categoryStats
    }
  });
}));

module.exports = router;