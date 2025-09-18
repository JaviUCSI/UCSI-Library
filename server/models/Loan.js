const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  loanDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
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
  }
}, {
  timestamps: true
});

// Middleware to update overdue status
loanSchema.pre('save', function(next) {
  if (!this.returned && this.dueDate < new Date()) {
    this.isOverdue = true;
  } else {
    this.isOverdue = false;
  }
  next();
});

// Index for efficient queries
loanSchema.index({ user: 1, returned: 1 });
loanSchema.index({ book: 1, returned: 1 });
loanSchema.index({ dueDate: 1, returned: 1 });

module.exports = mongoose.model('Loan', loanSchema);