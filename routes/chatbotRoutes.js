const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware');

// optionally protected: if user authenticates, bot can access their complaints
router.post('/query', protect, chatbotController.query);
router.post('/public-query', chatbotController.query); // public fallback

module.exports = router;
