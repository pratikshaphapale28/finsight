const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const User = require('../models/User');

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

// @desc    Process natural language financial assistant queries
// @route   POST /api/assistant/chat
// @access  Private
const askAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please ask a valid question about your finances.',
      });
    }

    const userId = req.user._id;
    const query = message.trim().toLowerCase();

    // 1. Gather all real data for this user
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const [allTransactions, currentBudgets, savingsGoals, userProfile] = await Promise.all([
      Transaction.find({ userId }).sort({ date: -1 }),
      Budget.find({ userId, month: currentMonth, year: currentYear }),
      SavingsGoal.find({ userId }),
      User.findById(userId).select('name monthlyIncome'),
    ]);

    // Current month transactions
    const thisMonthTx = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return d >= startOfCurrentMonth && d <= endOfCurrentMonth;
    });

    const thisMonthIncome = thisMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpenses = thisMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Current month category spending
    const categoryTotals = {};
    const categoryCounts = {};
    thisMonthTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      });

    // Monthly historical trends for expenses (last 6 months)
    const monthlyExpenseMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenseMap[key] = {
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        amount: 0,
      };
    }

    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyExpenseMap[key]) {
          monthlyExpenseMap[key].amount += t.amount;
        }
      });

    const monthlyHistory = Object.values(monthlyExpenseMap);
    const monthsWithSpend = monthlyHistory.filter((m) => m.amount > 0);

    // Compute intelligent forecast
    let predictedExpense = 0;
    if (monthsWithSpend.length >= 2) {
      // Weighted moving average giving higher weight to recent months
      let totalWeights = 0;
      let weightedSum = 0;
      monthsWithSpend.forEach((m, idx) => {
        const weight = idx + 1;
        weightedSum += m.amount * weight;
        totalWeights += weight;
      });
      predictedExpense = Math.round(weightedSum / totalWeights);
    } else if (monthsWithSpend.length === 1) {
      predictedExpense = monthsWithSpend[0].amount;
    } else {
      predictedExpense = userProfile?.monthlyIncome ? Math.round(userProfile.monthlyIncome * 0.45) : 0;
    }

    // Identify top historical expense categories
    const allExpenseCategories = {};
    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        allExpenseCategories[t.category] = (allExpenseCategories[t.category] || 0) + t.amount;
      });
    const sortedCategories = Object.entries(allExpenseCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
    const topCat1 = sortedCategories[0] || 'Food';
    const topCat2 = sortedCategories[1] || 'Bills';

    let reply = '';
    let categoryFound = null;

    // Category dictionary mapping
    const categoryKeywords = {
      Food: ['food', 'grocery', 'groceries', 'dining', 'restaurant', 'eating', 'cafe', 'swiggy', 'zomato', 'snack'],
      Transport: ['transport', 'commute', 'metro', 'fuel', 'petrol', 'diesel', 'cab', 'uber', 'ola', 'travel'],
      Bills: ['bill', 'bills', 'electricity', 'wifi', 'broadband', 'water', 'gas', 'utility', 'recharge', 'phone'],
      Shopping: ['shopping', 'clothes', 'clothing', 'retail', 'amazon', 'flipkart', 'gadget'],
      Entertainment: ['entertainment', 'movie', 'movies', 'cinema', 'netflix', 'spotify', 'leisure', 'game', 'gaming'],
      Healthcare: ['healthcare', 'health', 'medical', 'medicine', 'pharmacy', 'doctor', 'hospital'],
      Education: ['education', 'course', 'tuition', 'books', 'school', 'college'],
    };

    // Check if query is asking about a specific category
    for (const [catName, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((k) => query.includes(k))) {
        categoryFound = catName;
        break;
      }
    }

    // 2. Intent Matching & Plain-Language Response Generation

    // INTENT A: Forecast / Future Spending ("next month", "likely spend", "predict", "forecast", "future")
    if (
      query.includes('next month') ||
      query.includes('forecast') ||
      query.includes('predict') ||
      query.includes('likely spend') ||
      query.includes('will i spend') ||
      query.includes('future spend')
    ) {
      if (monthsWithSpend.length >= 2) {
        const top1Amount = Math.round(predictedExpense * 0.32);
        const top2Amount = Math.round(predictedExpense * 0.22);
        reply = `Based on your spending across the last ${monthsWithSpend.length} months (averaging around ${formatCurrency(
          Math.round(monthsWithSpend.reduce((acc, m) => acc + m.amount, 0) / monthsWithSpend.length)
        )} per month), you're likely to spend around ${formatCurrency(
          predictedExpense
        )} next month, mostly on ${topCat1} (~${formatCurrency(top1Amount)}) and ${topCat2} (~${formatCurrency(
          top2Amount
        )}).\n\nKeeping non-essential shopping and dining moderate during the first two weeks will be the easiest way to finish next month with a comfortable surplus.`;
      } else if (thisMonthExpenses > 0) {
        reply = `Based on your current month's recorded activity (${formatCurrency(
          thisMonthExpenses
        )} so far), you're likely to spend approximately ${formatCurrency(
          thisMonthExpenses * 1.1
        )} next month, with most of your expenses focused in ${topCat1}.\n\nAs you continue recording transactions, your forecast estimates will become even more precise.`;
      } else {
        reply = `You don't have enough spending history recorded yet for a full monthly estimate. Once you record transactions across at least two months, I'll be able to give you a personalized estimate of your upcoming monthly expenses!`;
      }
    }
    // INTENT B: Specific Category Spending ("how much did i spend on food", "transport", etc.)
    else if (categoryFound) {
      const spent = categoryTotals[categoryFound] || 0;
      const count = categoryCounts[categoryFound] || 0;
      const budgetForCat = currentBudgets.find((b) => b.category.toLowerCase() === categoryFound.toLowerCase());

      if (spent > 0) {
        let budgetContext = '';
        if (budgetForCat) {
          const remaining = budgetForCat.amount - spent;
          if (remaining >= 0) {
            budgetContext = ` You have a monthly budget of ${formatCurrency(
              budgetForCat.amount
            )} for ${categoryFound}, leaving ${formatCurrency(remaining)} (${Math.round(
              (remaining / budgetForCat.amount) * 100
            )}%) remaining for the rest of the month.`;
          } else {
            budgetContext = ` You've exceeded your monthly budget of ${formatCurrency(
              budgetForCat.amount
            )} by ${formatCurrency(Math.abs(remaining))}.`;
          }
        } else {
          budgetContext = ` You haven't set a budget limit for ${categoryFound} yet.`;
        }

        reply = `You have spent ${formatCurrency(spent)} on ${categoryFound} this month across ${count} transaction${
          count !== 1 ? 's' : ''
        }.${budgetContext}`;
      } else {
        reply = `You haven't recorded any expenses for ${categoryFound} yet this month. ${
          budgetForCat ? `Your monthly budget for this category is ${formatCurrency(budgetForCat.amount)}.` : ''
        }`;
      }
    }
    // INTENT C: Budget Tracking ("on track", "budget", "limits", "over budget")
    else if (
      query.includes('budget') ||
      query.includes('on track') ||
      query.includes('limits') ||
      query.includes('threshold')
    ) {
      if (currentBudgets.length === 0) {
        reply = `You haven't set any category budgets for this month yet. You can visit the Budgets page to set monthly spending limits for categories like Food, Transport, and Bills.`;
      } else {
        const totalBudget = currentBudgets.reduce((sum, b) => sum + b.amount, 0);
        let overspent = [];
        let onTrack = [];

        currentBudgets.forEach((b) => {
          const spent = categoryTotals[b.category] || 0;
          if (spent > b.amount) {
            overspent.push(`${b.category} (exceeded by ${formatCurrency(spent - b.amount)})`);
          } else {
            const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
            onTrack.push(`${b.category} (${pct}% used)`);
          }
        });

        const overallPct = totalBudget > 0 ? Math.round((thisMonthExpenses / totalBudget) * 100) : 0;

        if (overspent.length === 0) {
          reply = `Great news — you're completely on track with your budgets this month!\n\n• Total Budget: ${formatCurrency(
            totalBudget
          )}\n• Total Spent: ${formatCurrency(thisMonthExpenses)} (${overallPct}% used)\n• Active Limits: ${onTrack.join(
            ', '
          )}`;
        } else {
          reply = `You're currently over your budget limit in ${overspent.join(
            ', '
          )}.\n\nHowever, your other categories are in good shape: ${onTrack.join(
            ', '
          )}.\n\nTotal budget utilized is ${formatCurrency(thisMonthExpenses)} of ${formatCurrency(
            totalBudget
          )} (${overallPct}%).`;
        }
      }
    }
    // INTENT D: Savings Goals ("savings", "goal", "emergency fund", "targets")
    else if (query.includes('saving') || query.includes('goal') || query.includes('target')) {
      if (savingsGoals.length === 0) {
        reply = `You don't have any active savings goals yet. You can create targets like an Emergency Fund or Gadget purchase in the Savings Goals tab.`;
      } else {
        const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
        const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
        const goalsList = savingsGoals
          .map((g) => {
            const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
            return `• ${g.title}: ${formatCurrency(g.currentAmount)} of ${formatCurrency(g.targetAmount)} (${pct}%)`;
          })
          .join('\n');

        reply = `You have saved ${formatCurrency(totalSaved)} across ${savingsGoals.length} goal${
          savingsGoals.length !== 1 ? 's' : ''
        } (out of ${formatCurrency(totalTarget)} total target):\n\n${goalsList}`;
      }
    }
    // INTENT E: Total spending this month / Cashflow / Inflow
    else if (
      query.includes('total spend') ||
      query.includes('how much have i spent') ||
      query.includes('spend this month') ||
      query.includes('expense this month') ||
      query.includes('outflow')
    ) {
      const topCategoriesFormatted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amt]) => `${cat} (${formatCurrency(amt)})`)
        .join(', ');

      reply = `You have spent ${formatCurrency(thisMonthExpenses)} so far this month across ${
        thisMonthTx.filter((t) => t.type === 'expense').length
      } transactions.${
        topCategoriesFormatted ? `\n\nYour top spending areas are: ${topCategoriesFormatted}.` : ''
      }`;
    }
    // INTENT F: Total Income / Balance / Earnings
    else if (query.includes('income') || query.includes('earned') || query.includes('balance') || query.includes('net')) {
      const balance = thisMonthIncome - thisMonthExpenses;
      reply = `Here is your current monthly overview:\n\n• Recorded Inflow: ${formatCurrency(
        thisMonthIncome
      )}\n• Total Outflow: ${formatCurrency(thisMonthExpenses)}\n• Current Month Net Balance: ${formatCurrency(
        balance
      )} (${balance >= 0 ? 'Surplus' : 'Deficit'})`;
    }
    // INTENT G: Recent transactions / Purchases
    else if (query.includes('recent') || query.includes('latest') || query.includes('last transaction')) {
      const recent = allTransactions.slice(0, 4);
      if (recent.length === 0) {
        reply = `No transactions have been recorded in your account yet.`;
      } else {
        const list = recent
          .map(
            (t) =>
              `• ${new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}: ${
                t.description || t.category
              } (${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)})`
          )
          .join('\n');
        reply = `Here are your most recent transactions:\n\n${list}`;
      }
    }
    // INTENT H: General Financial Summary / Greetings / Help
    else {
      const balance = thisMonthIncome - thisMonthExpenses;
      const topCategoriesFormatted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amt]) => `${cat}: ${formatCurrency(amt)}`)
        .join(', ');

      reply = `Here is a summary of your financial status:\n\n• Current Month Spending: ${formatCurrency(
        thisMonthExpenses
      )}\n• Current Month Inflow: ${formatCurrency(thisMonthIncome)}\n• Net Balance: ${formatCurrency(
        balance
      )}\n• Total Active Savings: ${formatCurrency(
        savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0)
      )}${topCategoriesFormatted ? `\n• Top Expenses: ${topCategoriesFormatted}` : ''}\n\nYou can ask me specific questions like "How much did I spend on food this month?", "What will I likely spend next month?", or "Am I on track with my budgets?"`;
    }

    res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askAssistant,
};
