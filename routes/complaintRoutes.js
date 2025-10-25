const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const complaintController = require('../controllers/complaintController');
const { handleValidation } = require('../utils/validators');

// create complaint (authenticated) - photos optional (field name 'photos')
router.post('/',
  protect,
  upload.array('photos', 5),
  [
    body('title').notEmpty().withMessage('Title required'),
  ],
  handleValidation,
  complaintController.createComplaint
);

// get complaints of current user
router.get('/mine', protect, complaintController.getMyComplaints);

// public search endpoint
router.get('/public', complaintController.searchComplaintsPublic);

// get complaint by id
router.get('/:id', protect, complaintController.getComplaintById);

module.exports = router;
