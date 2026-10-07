const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect); // All budget routes are protected

router.route('/')
  .get(getBudgets)
  .post(createOrUpdateBudget);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
