const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student', 'Staff', 'Manager'],
    default: 'Student'
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ 
  name: 'text', 
  email: 'text', 
  type: 'text',
  department: 'text'
});

module.exports = mongoose.model('User', userSchema);