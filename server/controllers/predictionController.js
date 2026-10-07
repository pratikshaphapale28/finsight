const axios = require('axios');
const Transaction = require('../models/Transaction');

// @desc    Request future expense prediction via Python FastAPI ML Service
// @route   POST /api/prediction
// @access  Private
const getPrediction = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all user expense transactions ordered chronologically
    const expenses = await Transaction.find({
      userId,
      type: 'expense',
    })
      .sort({ date: 1 })
      .select('amount category date');

    if (!expenses || expenses.length === 0) {
      return res.status(200).json({
        status: 'insufficient_data',
        predictedExpense: null,
        message: 'Insufficient data for prediction. Please add more historical expense transactions.',
        historicalMonthsCount: 0,
        requiredMonths: 3,
        disclaimer: 'FinSight predictions are estimates based on historical spending patterns and do not constitute guaranteed financial advice.',
      });
    }

    // Format transaction payload for FastAPI
    const payload = {
      user_id: userId.toString(),
      transactions: expenses.map((e) => ({
        amount: e.amount,
        category: e.category,
        date: e.date.toISOString(),
      })),
    };

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

    try {
      const mlResponse = await axios.post(`${mlServiceUrl}/predict`, payload, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      });

      return res.status(200).json({
        ...mlResponse.data,
        disclaimer: 'FinSight predictions are statistical estimates based on historical spending patterns and do not constitute guaranteed financial advice.',
      });
    } catch (mlErr) {
      console.warn('[Prediction Controller] ML Service call failed:', mlErr.message);

      // Return a clean user-facing error response rather than crashing
      return res.status(503).json({
        status: 'service_unavailable',
        predictedExpense: null,
        message: 'The Machine Learning prediction service is temporarily unavailable. Please ensure the Python FastAPI service is running.',
        error: mlErr.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrediction,
};
