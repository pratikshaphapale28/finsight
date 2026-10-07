const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finsight');
    console.log('[Seed] Connected to MongoDB');

    // Remove existing demo user data if exists
    const existingDemoUser = await User.findOne({ email: 'demo@finsight.com' });
    if (existingDemoUser) {
      await Transaction.deleteMany({ userId: existingDemoUser._id });
      await Budget.deleteMany({ userId: existingDemoUser._id });
      await SavingsGoal.deleteMany({ userId: existingDemoUser._id });
      await User.deleteOne({ _id: existingDemoUser._id });
      console.log('[Seed] Cleaned previous demo data');
    }

    // Create demo user
    const demoUser = await User.create({
      name: 'Aditya Sharma',
      email: 'demo@finsight.com',
      password: 'Password123',
      monthlyIncome: 65000,
    });
    console.log(`[Seed] Created demo user: ${demoUser.email} (Password: Password123)`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const transactions = [];

    // Helper to generate date
    const getDate = (monthsAgo, day) => {
      const d = new Date(currentYear, currentMonth - monthsAgo, day);
      return d;
    };

    // 4 Months of historical transactions (Months: -3, -2, -1, 0)
    // Month -3
    transactions.push(
      { userId: demoUser._id, type: 'income', amount: 65000, category: 'Salary', description: 'Monthly Tech Salary', paymentMethod: 'Bank Transfer', date: getDate(3, 1) },
      { userId: demoUser._id, type: 'income', amount: 8000, category: 'Freelance', description: 'UI Design Consultation', paymentMethod: 'UPI', date: getDate(3, 14) },
      { userId: demoUser._id, type: 'expense', amount: 6800, category: 'Food', description: 'Supermarket Groceries', paymentMethod: 'UPI', date: getDate(3, 4) },
      { userId: demoUser._id, type: 'expense', amount: 2400, category: 'Transport', description: 'Metro Smart Card & Cabs', paymentMethod: 'UPI', date: getDate(3, 8) },
      { userId: demoUser._id, type: 'expense', amount: 3200, category: 'Bills', description: 'Broadband & Electricity', paymentMethod: 'Card', date: getDate(3, 10) },
      { userId: demoUser._id, type: 'expense', amount: 4500, category: 'Shopping', description: 'Workwear & Shoes', paymentMethod: 'Card', date: getDate(3, 18) },
      { userId: demoUser._id, type: 'expense', amount: 1800, category: 'Entertainment', description: 'Cinema & Streaming', paymentMethod: 'UPI', date: getDate(3, 22) },
      { userId: demoUser._id, type: 'expense', amount: 1500, category: 'Healthcare', description: 'Vitamins & Pharmacy', paymentMethod: 'Cash', date: getDate(3, 25) }
    ); // Month -3 total expense: ~20,200

    // Month -2
    transactions.push(
      { userId: demoUser._id, type: 'income', amount: 65000, category: 'Salary', description: 'Monthly Tech Salary', paymentMethod: 'Bank Transfer', date: getDate(2, 1) },
      { userId: demoUser._id, type: 'expense', amount: 7200, category: 'Food', description: 'Dining out & Weekly Grocery', paymentMethod: 'UPI', date: getDate(2, 5) },
      { userId: demoUser._id, type: 'expense', amount: 2600, category: 'Transport', description: 'Fuel & Metro passes', paymentMethod: 'UPI', date: getDate(2, 9) },
      { userId: demoUser._id, type: 'expense', amount: 3500, category: 'Bills', description: 'Electricity & Mobile', paymentMethod: 'Card', date: getDate(2, 12) },
      { userId: demoUser._id, type: 'expense', amount: 3800, category: 'Education', description: 'Cloud Certification Course', paymentMethod: 'Card', date: getDate(2, 16) },
      { userId: demoUser._id, type: 'expense', amount: 2500, category: 'Entertainment', description: 'Concert & Dinner', paymentMethod: 'UPI', date: getDate(2, 21) },
      { userId: demoUser._id, type: 'expense', amount: 3100, category: 'Shopping', description: 'Electronics Accessories', paymentMethod: 'Card', date: getDate(2, 26) }
    ); // Month -2 total expense: ~22,700

    // Month -1
    transactions.push(
      { userId: demoUser._id, type: 'income', amount: 65000, category: 'Salary', description: 'Monthly Tech Salary', paymentMethod: 'Bank Transfer', date: getDate(1, 1) },
      { userId: demoUser._id, type: 'income', amount: 5000, category: 'Freelance', description: 'Code Review Contract', paymentMethod: 'UPI', date: getDate(1, 15) },
      { userId: demoUser._id, type: 'expense', amount: 7900, category: 'Food', description: 'Pantry supplies & food delivery', paymentMethod: 'UPI', date: getDate(1, 4) },
      { userId: demoUser._id, type: 'expense', amount: 2800, category: 'Transport', description: 'Cab rides & Metro', paymentMethod: 'UPI', date: getDate(1, 10) },
      { userId: demoUser._id, type: 'expense', amount: 3600, category: 'Bills', description: 'Water, Gas & Wifi', paymentMethod: 'Card', date: getDate(1, 12) },
      { userId: demoUser._id, type: 'expense', amount: 5200, category: 'Shopping', description: 'Ergonomic Desk Chair', paymentMethod: 'Card', date: getDate(1, 19) },
      { userId: demoUser._id, type: 'expense', amount: 2200, category: 'Entertainment', description: 'Gaming & Coffee outings', paymentMethod: 'Cash', date: getDate(1, 24) },
      { userId: demoUser._id, type: 'expense', amount: 1800, category: 'Healthcare', description: 'Dental Checkup', paymentMethod: 'UPI', date: getDate(1, 28) }
    ); // Month -1 total expense: ~23,500

    // Current Month (Month 0)
    transactions.push(
      { userId: demoUser._id, type: 'income', amount: 65000, category: 'Salary', description: 'Monthly Tech Salary', paymentMethod: 'Bank Transfer', date: getDate(0, 1) },
      { userId: demoUser._id, type: 'expense', amount: 5400, category: 'Food', description: 'Weekly groceries & cafe', paymentMethod: 'UPI', date: getDate(0, 2) },
      { userId: demoUser._id, type: 'expense', amount: 1900, category: 'Transport', description: 'Metro pass recharge', paymentMethod: 'UPI', date: getDate(0, 3) },
      { userId: demoUser._id, type: 'expense', amount: 3400, category: 'Bills', description: 'High-speed Fiber bill', paymentMethod: 'Card', date: getDate(0, 3) }
    );

    await Transaction.insertMany(transactions);
    console.log(`[Seed] Inserted ${transactions.length} transactions across 4 months`);

    // Budgets for current month
    const thisMonthNumber = currentMonth + 1;
    const budgets = [
      { userId: demoUser._id, category: 'Food', amount: 8000, month: thisMonthNumber, year: currentYear },
      { userId: demoUser._id, category: 'Transport', amount: 3000, month: thisMonthNumber, year: currentYear },
      { userId: demoUser._id, category: 'Bills', amount: 4500, month: thisMonthNumber, year: currentYear },
      { userId: demoUser._id, category: 'Shopping', amount: 4000, month: thisMonthNumber, year: currentYear },
      { userId: demoUser._id, category: 'Entertainment', amount: 2500, month: thisMonthNumber, year: currentYear },
    ];
    await Budget.insertMany(budgets);
    console.log(`[Seed] Created ${budgets.length} budgets for month ${thisMonthNumber}/${currentYear}`);

    // Savings Goals
    const futureDate = (monthsAhead) => new Date(currentYear, currentMonth + monthsAhead, 15);
    const savingsGoals = [
      {
        userId: demoUser._id,
        title: 'Emergency Safety Fund',
        targetAmount: 100000,
        currentAmount: 48000,
        deadline: futureDate(6),
      },
      {
        userId: demoUser._id,
        title: 'Apple MacBook Pro M3',
        targetAmount: 85000,
        currentAmount: 52000,
        deadline: futureDate(4),
      },
      {
        userId: demoUser._id,
        title: 'Cloud Architect Certification',
        targetAmount: 25000,
        currentAmount: 18500,
        deadline: futureDate(2),
      },
    ];
    await SavingsGoal.insertMany(savingsGoals);
    console.log(`[Seed] Created ${savingsGoals.length} savings goals`);

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
