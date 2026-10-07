const SavingsGoal = require('../models/SavingsGoal');

// Helper to calculate months difference
const getMonthsRemaining = (deadlineDate) => {
  const now = new Date();
  const target = new Date(deadlineDate);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 0;
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(1, months);
};

// @desc    Get all savings goals with calculated progress
// @route   GET /api/savings
// @access  Private
const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ deadline: 1 });

    const enrichedGoals = goals.map((g) => {
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);
      const progressPercentage = g.targetAmount > 0
        ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 1000) / 10)
        : 0;
      const monthsLeft = getMonthsRemaining(g.deadline);
      const monthlySavingRequired = remainingAmount > 0
        ? Math.round(remainingAmount / monthsLeft)
        : 0;
      const isCompleted = g.currentAmount >= g.targetAmount;

      return {
        _id: g._id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remainingAmount,
        progressPercentage,
        deadline: g.deadline,
        monthsLeft,
        monthlySavingRequired,
        isCompleted,
        createdAt: g.createdAt,
      };
    });

    const totalTarget = enrichedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = enrichedGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalRemaining = Math.max(0, totalTarget - totalSaved);
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 1000) / 10 : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalGoals: enrichedGoals.length,
        completedGoals: enrichedGoals.filter((g) => g.isCompleted).length,
        totalTarget,
        totalSaved,
        totalRemaining,
        overallProgress,
      },
      goals: enrichedGoals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new savings goal
// @route   POST /api/savings
// @access  Private
const createSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, target amount, and target deadline date.',
      });
    }

    const parsedTarget = Number(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be a number greater than 0.',
      });
    }

    const parsedCurrent = Number(currentAmount) || 0;
    if (parsedCurrent < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current amount cannot be negative.',
      });
    }

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title: title.trim(),
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      deadline: new Date(deadline),
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully.',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a savings goal
// @route   PUT /api/savings/:id
// @access  Private
const updateSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found or unauthorized.' });
    }

    if (title) goal.title = title.trim();
    if (targetAmount !== undefined) {
      const parsedTarget = Number(targetAmount);
      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        return res.status(400).json({ success: false, message: 'Target amount must be greater than 0.' });
      }
      goal.targetAmount = parsedTarget;
    }
    if (currentAmount !== undefined) {
      const parsedCurrent = Number(currentAmount);
      if (isNaN(parsedCurrent) || parsedCurrent < 0) {
        return res.status(400).json({ success: false, message: 'Current amount cannot be negative.' });
      }
      goal.currentAmount = parsedCurrent;
    }
    if (deadline) goal.deadline = new Date(deadline);

    const updatedGoal = await goal.save();

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully.',
      goal: updatedGoal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deposit / Add funds into savings goal
// @route   PATCH /api/savings/:id/deposit
// @access  Private
const depositToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount === 0) {
      return res.status(400).json({ success: false, message: 'Deposit amount must be a non-zero number.' });
    }

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found or unauthorized.' });
    }

    goal.currentAmount = Math.max(0, goal.currentAmount + parsedAmount);
    await goal.save();

    res.status(200).json({
      success: true,
      message: `Updated savings balance by ${parsedAmount >= 0 ? '+' : ''}${parsedAmount}.`,
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
// @access  Private
const deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Savings goal removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  depositToGoal,
  deleteSavingsGoal,
};
