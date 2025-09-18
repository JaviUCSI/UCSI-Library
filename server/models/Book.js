const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  identifier: {
    type: String,
    trim: true,
    index: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear() + 10
  },
  category: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({ 
  title: 'text', 
  author: 'text', 
  identifier: 'text', 
  category: 'text' 
});

module.exports = mongoose.model('Book', bookSchema);