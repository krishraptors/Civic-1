const express = require('express');
const { body } = require('express-validator');
const { handleValidation } = require('../utils/validators');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register',
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
  ],
  handleValidation,
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  handleValidation,
  authController.login
);

// Save push subscription (protected)
router.post('/subscribe', protect, authController.savePushSubscription);

module.exports = router;
