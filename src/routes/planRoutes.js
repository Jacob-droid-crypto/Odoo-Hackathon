const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { createPlanSchema, updatePlanSchema } = require('../validators/planValidator');
const { ROLES } = require('../constants/roles');

// Create subscription plan (ADMIN only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createPlanSchema),
  planController.createPlan
);

// List subscription plans with interval & product filtering (Public / Authenticated)
router.get(
  '/',
  planController.getAllPlans
);

// Get single plan by ID
router.get(
  '/:id',
  planController.getPlanById
);

// Update subscription plan (ADMIN only)
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updatePlanSchema),
  planController.updatePlan
);

// Delete/deactivate subscription plan (ADMIN only)
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  planController.deletePlan
);

module.exports = router;
