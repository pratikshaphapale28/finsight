const Transaction = require('../models/Transaction');

// @desc    Get all transactions for logged in user (with filters)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, limit = 100, page = 1 } = req.query;

    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized.' });
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, paymentMethod, date } = req.body;

    if (!type || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, amount, and category.',
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0.',
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: parsedAmount,
      category: category.trim(),
      description: description ? description.trim() : '',
      paymentMethod: paymentMethod || 'UPI',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, paymentMethod, date } = req.body;

    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized.' });
    }

    if (type) transaction.type = type;
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
      }
      transaction.amount = parsedAmount;
    }
    if (category) transaction.category = category.trim();
    if (description !== undefined) transaction.description = description.trim();
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (date) transaction.date = new Date(date);

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
