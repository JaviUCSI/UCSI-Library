const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Loan = require('../models/Loan');

// GET /api/books/popular - Get popular books based on loan count (must be before /:id route)
router.get('/popular', async (req, res) => {
  try {
    const popularBooks = await Loan.aggregate([
      {
        $group: {
          _id: '$book',
          loanCount: { $sum: 1 }
        }
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
        $sort: { loanCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: '$bookInfo._id',
          title: '$bookInfo.title',
          author: '$bookInfo.author',
          loanCount: 1
        }
      }
    ]);
    
    res.json(popularBooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/books - Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/books - Create a new book
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/books/:id - Get a specific book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/books/:id - Update a book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/books/:id - Delete a book
router.delete('/:id', async (req, res) => {
  try {
    // Check if book has active loans
    const activeLoans = await Loan.find({ book: req.params.id, returned: false });
    if (activeLoans.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete book with active loans' 
      });
    }
    
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;