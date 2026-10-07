const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for logged-in user with dynamic spending calculations
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1-12
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // Find all budgets for this user in specified month and year
    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year,
    }).sort({ category: 1 });

    // Date range for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate expenses for the month grouped by category
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    // Create a lookup map for category spending
    const spendingMap = {};
    categorySpending.forEach((item) => {
      spendingMap[item._id] = item.totalSpent;
    });

    // Augment budgets with calculated actual spending
    const enrichedBudgets = budgets.map((b) => {
      const spent = spendingMap[b.category] || 0;
      const remaining = b.amount - spent;
      const percentageUsed = b.amount > 0 ? Math.round((spent / b.amount) * 1000) / 10 : 0;
      const isOverspent = spent > b.amount;
      const overspentAmount = isOverspent ? spent - b.amount : 0;

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        month: b.month,
        year: b.year,
        createdAt: b.createdAt,
        spent,
        remaining,
        percentageUsed,
        isOverspent,
        overspentAmount,
      };
    });

    const totalBudget = enrichedBudgets.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSpent = enrichedBudgets.reduce((acc, curr) => acc + curr.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0;

    res.status(200).json({
      success: true,
      month,
      year,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentage,
        overspentCount: enrichedBudgets.filter((b) => b.isOverspent).length,
      },
      budgets: enrichedBudgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget
// @route   POST /api/budgets
// @access  Private
const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide category and amount.' });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be a positive number.' });
    }

    const now = new Date();
    const budgetMonth = parseInt(month, 10) || now.getMonth() + 1;
    const budgetYear = parseInt(year, 10) || now.getFullYear();

    // Upsert budget for the category, month, and year
    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category: category.trim(),
        month: budgetMonth,
        year: budgetYear,
      },
      {
        amount: parsedAmount,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Budget saved successfully.',
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget by ID
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const { amount, category, month, year } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found or unauthorized.' });
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Budget amount must be positive.' });
      }
      budget.amount = parsedAmount;
    }
    if (category) budget.category = category.trim();
    if (month) budget.month = parseInt(month, 10);
    if (year) budget.year = parseInt(year, 10);

    const updatedBudget = await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      budget: updatedBudget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget by ID
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
};
