const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { permit } = require('../middlewares/roleMiddleware');
const { handleValidation } = require('../utils/validators');

const router = express.Router();

// All routes here require authority or admin
router.use(protect);
router.use(permit('authority', 'admin'));

// list complaints with filters
router.get('/complaints', adminController.listComplaints);

// update status
router.patch('/complaints/:id/status',
  [body('status').notEmpty().withMessage('status required')],
  handleValidation,
  adminController.updateComplaintStatus
);

// assign complaint to an officer
router.patch('/complaints/:id/assign',
  [body('assignedTo').notEmpty().withMessage('assignedTo user id required')],
  handleValidation,
  adminController.assignComplaint
);

// add comment to complaint
router.post('/complaints/:id/comment',
  [body('message').notEmpty().withMessage('message required')],
  handleValidation,
  adminController.addComment
);

module.exports = router;
