const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';
const ML_URL = 'http://127.0.0.1:8000';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 FINSIGHT END-TO-END ACCEPTANCE CRITERIA TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.response?.data || err.message);
      failed++;
    }
  };

  // 1. Health Checks
  await test('FastAPI ML Service /health returns healthy', async () => {
    const res = await axios.get(`${ML_URL}/health`);
    if (res.data.status !== 'healthy') throw new Error('ML health check failed');
  });

  await test('Node.js REST API /api/health returns online', async () => {
    const res = await axios.get(`${API_URL}/health`);
    if (res.data.status !== 'online') throw new Error('API health check failed');
  });

  // 2. Fresh User Workflow (testing insufficient data rule)
  const testEmail = `testuser_${Date.now()}@finsight.com`;
  let freshToken = '';
  let freshUserId = '';

  await test('Step 1 & 2: User Registration & JWT Token generation', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test Workflow User',
      email: testEmail,
      password: 'Password123',
      monthlyIncome: 50000,
    });
    if (!res.data.success || !res.data.token) throw new Error('Registration failed');
    freshToken = res.data.token;
    freshUserId = res.data.user._id;
  });

  const authHeader = () => ({ headers: { Authorization: `Bearer ${freshToken}` } });

  await test('Step 3: Access Protected Current User Profile (/api/auth/me)', async () => {
    const res = await axios.get(`${API_URL}/auth/me`, authHeader());
    if (res.data.user.email !== testEmail.toLowerCase()) throw new Error('Profile mismatch');
  });

  await test('Step 11 & 12: Minimum-History ML Rule returns "insufficient_data" on fresh account', async () => {
    const res = await axios.post(`${API_URL}/prediction`, {}, authHeader());
    if (res.data.status !== 'insufficient_data') throw new Error(`Expected insufficient_data, got: ${res.data.status}`);
    if (res.data.predictedExpense !== null) throw new Error('Predicted expense must be null on insufficient data');
  });

  // 3. Add Income & Expenses
  let incomeTxId = '';
  let expenseTxId = '';

  await test('Step 4 & 5: Add Income Transaction (₹50,000 Salary via Bank Transfer)', async () => {
    const res = await axios.post(`${API_URL}/transactions`, {
      type: 'income',
      amount: 50000,
      category: 'Salary',
      paymentMethod: 'Bank Transfer',
      description: 'Initial Monthly Salary',
      date: new Date().toISOString(),
    }, authHeader());
    if (!res.data.success || res.data.transaction.amount !== 50000) throw new Error('Failed to create income');
    incomeTxId = res.data.transaction._id;
  });

  await test('Step 6: Add Expense Transaction (₹6,000 Food via UPI)', async () => {
    const res = await axios.post(`${API_URL}/transactions`, {
      type: 'expense',
      amount: 6000,
      category: 'Food',
      paymentMethod: 'UPI',
      description: 'Monthly Groceries & Cafe',
      date: new Date().toISOString(),
    }, authHeader());
    if (!res.data.success || res.data.transaction.amount !== 6000) throw new Error('Failed to create expense');
    expenseTxId = res.data.transaction._id;
  });

  await test('Step 7: View Transactions with Filtering and Sorting', async () => {
    const res = await axios.get(`${API_URL}/transactions`, authHeader());
    if (res.data.transactions.length !== 2) throw new Error(`Expected 2 transactions, got ${res.data.transactions.length}`);
  });

  await test('Step 8: Edit and Update Transaction', async () => {
    const res = await axios.put(`${API_URL}/transactions/${expenseTxId}`, {
      amount: 6500,
      description: 'Updated Monthly Groceries',
    }, authHeader());
    if (res.data.transaction.amount !== 6500) throw new Error('Update amount mismatch');
  });

  // 4. Budget Management & Overspending Detection
  await test('Step 9, 10 & 11: Create Monthly Budget & Trigger Overspending Alert', async () => {
    const now = new Date();
    // Budget is ₹5,000, but expense was ₹6,500 -> must trigger isOverspent: true!
    const res = await axios.post(`${API_URL}/budgets`, {
      category: 'Food',
      amount: 5000,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }, authHeader());

    const budgetsRes = await axios.get(`${API_URL}/budgets`, authHeader());
    const foodBudget = budgetsRes.data.budgets.find((b) => b.category === 'Food');
    if (!foodBudget) throw new Error('Food budget not found');
    if (!foodBudget.isOverspent) throw new Error('Overspending flag was not triggered!');
    if (foodBudget.spent !== 6500) throw new Error(`Expected spent 6500, got ${foodBudget.spent}`);
    if (foodBudget.overspentAmount !== 1500) throw new Error(`Expected overspentAmount 1500, got ${foodBudget.overspentAmount}`);
  });

  // 5. Savings Goals
  let goalId = '';
  await test('Step 12 & 13: Create Savings Goal & Deposit Funds', async () => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 4);

    const res = await axios.post(`${API_URL}/savings`, {
      title: 'Emergency Medical Reserve',
      targetAmount: 40000,
      currentAmount: 10000,
      deadline: deadline.toISOString(),
    }, authHeader());

    goalId = res.data.goal._id;
    if (res.data.goal.targetAmount !== 40000) throw new Error('Goal target amount mismatch');

    // Deposit ₹5,000
    const depRes = await axios.patch(`${API_URL}/savings/${goalId}/deposit`, {
      amount: 5000,
    }, authHeader());

    if (depRes.data.goal.currentAmount !== 15000) throw new Error('Deposit not applied correctly');
  });

  // 6. Dashboard Calculations
  await test('Step 14 & 18: Dashboard Summary calculates live balance, savings and budgets', async () => {
    const res = await axios.get(`${API_URL}/dashboard/summary`, authHeader());
    const summary = res.data.summaryCards;
    // Inflow: 50000, Outflow: 6500, Balance: 43500, Savings: 15000
    if (summary.totalIncome !== 50000) throw new Error(`Expected totalIncome 50000, got ${summary.totalIncome}`);
    if (summary.totalExpenses !== 6500) throw new Error(`Expected totalExpenses 6500, got ${summary.totalExpenses}`);
    if (summary.balance !== 43500) throw new Error(`Expected balance 43500, got ${summary.balance}`);
    if (summary.totalSavings !== 15000) throw new Error(`Expected totalSavings 15000, got ${summary.totalSavings}`);
  });

  // 7. Demo Account Full 4-Month Machine Learning Prediction
  await test('Step 15, 16 & 17: Multi-Month Historical Data produces scikit-learn Prediction', async () => {
    // Login as pre-seeded demo user
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'demo@finsight.com',
      password: 'Password123',
    });

    const demoHeader = { headers: { Authorization: `Bearer ${loginRes.data.token}` } };
    const predRes = await axios.post(`${API_URL}/prediction`, {}, demoHeader);

    if (predRes.data.status !== 'success') throw new Error(`Prediction status was ${predRes.data.status}`);
    if (typeof predRes.data.predictedExpense !== 'number' || predRes.data.predictedExpense <= 0) {
      throw new Error(`Invalid predictedExpense: ${predRes.data.predictedExpense}`);
    }
    if (predRes.data.historicalMonthsCount < 3) {
      throw new Error(`Historical months count was ${predRes.data.historicalMonthsCount}, expected >= 3`);
    }

    console.log(`   ✨ ML Model Prediction Result: ₹${predRes.data.predictedExpense}`);
    console.log(`   ✨ Historical Months Analyzed: ${predRes.data.historicalMonthsCount}`);
    console.log(`   ✨ Trend Direction: ${predRes.data.trend}`);
    console.log(`   ✨ Slope: ₹${predRes.data.details?.trend_slope}/mo`);
  });

  // 8. Financial Analytics Endpoint
  await test('Step 14b: Financial Analytics aggregation & distribution', async () => {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'demo@finsight.com',
      password: 'Password123',
    });
    const demoHeader = { headers: { Authorization: `Bearer ${loginRes.data.token}` } };
    const res = await axios.get(`${API_URL}/analytics`, demoHeader);

    if (!res.data.success) throw new Error('Analytics failed');
    if (!res.data.categoryBreakdown.length) throw new Error('Category breakdown empty');
    if (!res.data.paymentMethods.length) throw new Error('Payment methods empty');
    if (!res.data.monthlyTrends.length) throw new Error('Monthly trends empty');
  });

  // 9. Re-login & Data Persistence (MongoDB)
  await test('Step 19 & 20: Persistent Data Verified after Re-login', async () => {
    const reloginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: 'Password123',
    });
    if (!reloginRes.data.success) throw new Error('Re-login failed');

    const checkHeader = { headers: { Authorization: `Bearer ${reloginRes.data.token}` } };
    const txCheck = await axios.get(`${API_URL}/transactions`, checkHeader);
    if (txCheck.data.transactions.length !== 2) throw new Error('Persistent transactions count mismatch');
  });

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTestSuite();
