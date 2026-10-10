const express = require('express');
const router = express.Router();
const { askAssistant } = require('../controllers/assistantController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, askAssistant);

module.exports = router;
