const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { createStaffSchema } = require('../validators/authValidator');
const { ROLES } = require('../constants/roles');

// All user management routes require authentication
router.use(authenticate);

// ONLY ADMIN can create staff accounts
router.post(
  '/staff',
  authorize(ROLES.ADMIN),
  validate(createStaffSchema),
  userController.createStaff
);

// ADMIN and STAFF can list users
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.STAFF),
  userController.listUsers
);

// Get user by ID (Customer can only view own profile; Admin/Staff can view any)
router.get(
  '/:id',
  userController.getUserById
);

module.exports = router;
