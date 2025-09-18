const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');

// GET /api/loans/overdue - Get overdue loans (must be before /:id route)
router.get('/overdue', async (req, res) => {
  try {
    const overdueLoans = await Loan.find({
      returned: false,
      dueDate: { $lt: new Date() }
    })
    .populate('book', 'title author identifier')
    .populate('user', 'name email type')
    .sort({ dueDate: 1 });
    
    res.json(overdueLoans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/loans - Get all loans with populated book and user info
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('book', 'title author identifier')
      .populate('user', 'name email type')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/loans - Create a new loan
router.post('/', async (req, res) => {
  try {
    const { user, book, dueDate } = req.body;
    
    // Check if book exists and is available
    const bookDoc = await Book.findById(book);
    if (!bookDoc) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Check if book is already on loan
    const existingLoan = await Loan.findOne({ book, returned: false });
    if (existingLoan) {
      return res.status(400).json({ error: 'Book is already on loan' });
    }
    
    // Check if user exists
    const userDoc = await User.findById(user);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const loan = new Loan({
      user,
      book,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default 14 days
    });
    
    await loan.save();
    await loan.populate('book', 'title author identifier');
    await loan.populate('user', 'name email type');
    
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/loans/:id - Get a specific loan
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('book', 'title author identifier')
      .populate('user', 'name email type');
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/loans/:id/return - Mark a loan as returned
router.put('/:id/return', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    if (loan.returned) {
      return res.status(400).json({ error: 'Loan is already returned' });
    }
    
    loan.returned = true;
    loan.returnDate = new Date();
    loan.isOverdue = false;
    
    await loan.save();
    await loan.populate('book', 'title author identifier');
    await loan.populate('user', 'name email type');
    
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;