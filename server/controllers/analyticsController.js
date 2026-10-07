const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get detailed financial analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Overall Aggregates
    const overallAgg = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransactions = 0;

    overallAgg.forEach((item) => {
      totalTransactions += item.count;
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10 : 0;

    // 2. Category-wise Spending (All-time and percentages)
    const categorySpending = await Transaction.aggregate([
      { $match: { userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const categoryBreakdown = categorySpending.map((item) => ({
      category: item._id,
      amount: item.totalAmount,
      count: item.count,
      percentage: totalExpenses > 0 ? Math.round((item.totalAmount / totalExpenses) * 1000) / 10 : 0,
    }));

    const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    // 3. Payment Method Distribution
    const paymentMethods = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // 4. Monthly Trend (Past 12 months)
    const twelveMonthsAgo = new Date(currentYear, currentMonth - 12, 1);
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: twelveMonthsAgo },
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

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 11; i >= 0; i--) {
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
        net: 0,
      };
    }

    monthlyData.forEach((item) => {
      const key = `${item._id.year}-${item._id.month < 10 ? '0' + item._id.month : item._id.month}`;
      if (trendMap[key]) {
        if (item._id.type === 'income') trendMap[key].income = item.total;
        if (item._id.type === 'expense') trendMap[key].expense = item.total;
        trendMap[key].net = trendMap[key].income - trendMap[key].expense;
      }
    });

    const monthlyTrends = Object.values(trendMap);

    // Active months count with expense > 0
    const activeExpenseMonths = monthlyTrends.filter((m) => m.expense > 0);
    const averageMonthlyExpense = activeExpenseMonths.length > 0
      ? Math.round(activeExpenseMonths.reduce((acc, m) => acc + m.expense, 0) / activeExpenseMonths.length)
      : 0;

    // 5. Budget Utilization Summary
    const budgets = await Budget.find({ userId, month: currentMonth, year: currentYear });
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const currentMonthExpenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const currentMonthSpent = currentMonthExpenses[0]?.total || 0;
    const budgetUtilization = totalBudget > 0 ? Math.round((currentMonthSpent / totalBudget) * 1000) / 10 : 0;

    // 6. Savings Goals summary
    const savingsGoals = await SavingsGoal.find({ userId });
    const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSavingsSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    res.status(200).json({
      success: true,
      metrics: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
        totalTransactions,
        averageMonthlyExpense,
        highestCategory: highestCategory ? highestCategory.category : 'None',
        highestCategoryAmount: highestCategory ? highestCategory.amount : 0,
        budgetUtilization,
        activeMonthsCount: activeExpenseMonths.length,
      },
      categoryBreakdown,
      paymentMethods: paymentMethods.map((p) => ({
        method: p._id || 'Other',
        amount: p.totalAmount,
        count: p.count,
      })),
      monthlyTrends,
      savingsSummary: {
        totalTarget: totalSavingsTarget,
        totalSaved: totalSavingsSaved,
        overallProgress: totalSavingsTarget > 0 ? Math.round((totalSavingsSaved / totalSavingsTarget) * 1000) / 10 : 0,
        goalsCount: savingsGoals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
};
