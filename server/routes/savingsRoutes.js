const express = require('express');
const router = express.Router();
const {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  depositToGoal,
  deleteSavingsGoal,
} = require('../controllers/savingsController');
const { protect } = require('../middleware/auth');

router.use(protect); // All savings routes are protected

router.route('/')
  .get(getSavingsGoals)
  .post(createSavingsGoal);

router.route('/:id')
  .put(updateSavingsGoal)
  .delete(deleteSavingsGoal);

router.route('/:id/deposit')
  .patch(depositToGoal);

module.exports = router;
