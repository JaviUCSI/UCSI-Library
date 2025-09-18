const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    trim: true,
    validate: {
      validator: function(v) {
        // Basic ISBN validation (10 or 13 digits)
        return !v || /^(?:\d{10}|\d{13})$/.test(v.replace(/-/g, ''));
      },
      message: 'Invalid ISBN format'
    }
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot be more than 100 characters']
  },
  year: {
    type: Number,
    min: [1000, 'Year must be a valid year'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
BookSchema.index({ title: 'text', author: 'text', category: 'text' });
BookSchema.index({ category: 1 });
BookSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Book', BookSchema);