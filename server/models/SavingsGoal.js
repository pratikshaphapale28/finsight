const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be greater than 0'],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative'],
  },
  deadline: {
    type: Date,
    required: [true, 'Target deadline is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
