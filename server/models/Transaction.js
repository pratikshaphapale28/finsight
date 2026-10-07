const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense',
    },
    required: [true, 'Transaction type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'],
    default: 'UPI',
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
