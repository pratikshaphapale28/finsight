const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Budget category is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [1, 'Budget amount must be positive'],
  },
  month: {
    type: Number,
    required: [true, 'Month is required (1-12)'],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user has only one budget per category for a given month and year
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
