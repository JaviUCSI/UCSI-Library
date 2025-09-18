const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  loanDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v) {
        return v > this.loanDate;
      },
      message: 'Due date must be after loan date'
    }
  },
  returnDate: {
    type: Date
  },
  returned: {
    type: Boolean,
    default: false
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Virtual field to check if loan is overdue
LoanSchema.virtual('overdue').get(function() {
  return !this.returned && new Date() > this.dueDate;
});

// Indexes for better performance
LoanSchema.index({ book: 1 });
LoanSchema.index({ user: 1 });
LoanSchema.index({ returned: 1 });
LoanSchema.index({ dueDate: 1 });
LoanSchema.index({ loanDate: 1 });

// Update book availability when loan is created or returned
LoanSchema.pre('save', async function(next) {
  try {
    const Book = mongoose.model('Book');
    
    // If this is a new loan or changing the returned status
    if (this.isNew || this.isModified('returned')) {
      await Book.findByIdAndUpdate(
        this.book,
        { isAvailable: this.returned }
      );
    }
    
    // Update overdue status
    this.isOverdue = this.overdue;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Update book availability when loan is deleted
LoanSchema.post('findOneAndDelete', async function(doc) {
  if (doc && !doc.returned) {
    try {
      const Book = mongoose.model('Book');
      await Book.findByIdAndUpdate(doc.book, { isAvailable: true });
    } catch (error) {
      console.error('Error updating book availability:', error);
    }
  }
});

module.exports = mongoose.model('Loan', LoanSchema);