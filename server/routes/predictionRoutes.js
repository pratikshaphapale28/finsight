const express = require('express');
const router = express.Router();
const { getPrediction } = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, getPrediction);
router.get('/', protect, getPrediction);

module.exports = router;
