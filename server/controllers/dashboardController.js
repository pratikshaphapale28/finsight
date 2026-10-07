const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const User = require('../models/User');

// @desc    Get complete dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // 1. Overall Income & Expenses (All-time)
    const totals = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    totals.forEach((item) => {
      if (item._id === 'income') totalIncome = item.totalAmount;
      if (item._id === 'expense') totalExpenses = item.totalAmount;
    });

    const balance = totalIncome - totalExpenses;

    // 2. Current Month Income & Expenses
    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const currentMonthTotals = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    let thisMonthIncome = 0;
    let thisMonthExpenses = 0;
    currentMonthTotals.forEach((item) => {
      if (item._id === 'income') thisMonthIncome = item.totalAmount;
      if (item._id === 'expense') thisMonthExpenses = item.totalAmount;
    });

    // 3. Total Savings Accumulated
    const savingsGoals = await SavingsGoal.find({ userId });
    const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    // 4. Category-wise Spending (Current Month)
    const categorySpending = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // Format for charts
    const categoryData = categorySpending.map((c) => ({
      category: c._id,
      amount: c.amount,
      count: c.count,
    }));

    // 5. Monthly History (Past 6 months trend)
    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
    const monthlyHistoryRaw = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build chronological 6-month array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${m < 10 ? '0' + m : m}`;
      trendMap[key] = {
        key,
        label: `${monthNames[m - 1]} ${y}`,
        month: m,
        year: y,
        income: 0,
        expense: 0,
      };
    }

    monthlyHistoryRaw.forEach((item) => {
      const key = `${item._id.year}-${item._id.month < 10 ? '0' + item._id.month : item._id.month}`;
      if (trendMap[key]) {
        if (item._id.type === 'income') trendMap[key].income = item.total;
        if (item._id.type === 'expense') trendMap[key].expense = item.total;
      }
    });

    const monthlyTrends = Object.values(trendMap);

    // 6. Current Month Budgets vs Actual
    const budgets = await Budget.find({
      userId,
      month: currentMonth,
      year: currentYear,
    });

    const totalBudgetAmount = budgets.reduce((acc, b) => acc + b.amount, 0);
    const budgetMap = {};
    budgets.forEach((b) => {
      budgetMap[b.category] = b.amount;
    });

    let overspentCount = 0;
    const budgetUsageList = budgets.map((b) => {
      const spent = categoryData.find((c) => c.category === b.category)?.amount || 0;
      const isOverspent = spent > b.amount;
      if (isOverspent) overspentCount++;
      return {
        category: b.category,
        budget: b.amount,
        spent,
        remaining: b.amount - spent,
        percent: b.amount > 0 ? Math.round((spent / b.amount) * 1000) / 10 : 0,
        isOverspent,
      };
    });

    // 7. Recent Transactions (last 6)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      summaryCards: {
        totalIncome,
        totalExpenses,
        balance,
        totalSavings,
        thisMonthIncome,
        thisMonthExpenses,
        thisMonthNet: thisMonthIncome - thisMonthExpenses,
      },
      categoryData,
      monthlyTrends,
      budgetOverview: {
        totalBudget: totalBudgetAmount,
        totalSpent: thisMonthExpenses,
        usagePercentage: totalBudgetAmount > 0 ? Math.round((thisMonthExpenses / totalBudgetAmount) * 1000) / 10 : 0,
        overspentCount,
        budgets: budgetUsageList,
      },
      activeSavingsGoals: savingsGoals.slice(0, 4).map((g) => ({
        _id: g._id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline,
        percent: g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 1000) / 10) : 0,
      })),
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
