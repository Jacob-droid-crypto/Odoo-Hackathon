const planService = require('../services/planService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

/**
 * Create a new subscription plan (ADMIN only)
 * POST /api/plans
 */
const createPlan = async (req, res, next) => {
  try {
    const plan = await planService.createPlan(req.body);
    return sendSuccess(res, 'Subscription plan created successfully', { plan }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all subscription plans with filters & pagination
 * GET /api/plans
 */
const getAllPlans = async (req, res, next) => {
  try {
    const { productId, billingInterval, isActive, search, page, limit } = req.query;
    const result = await planService.getAllPlans({
      productId,
      billingInterval,
      isActive,
      search,
      page,
      limit
    });

    return sendPaginated(
      res,
      'Subscription plans retrieved successfully',
      result.plans,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / (result.limit || 50))
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single subscription plan by ID
 * GET /api/plans/:id
 */
const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);

    if (!plan) {
      return sendError(res, `Subscription plan with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, 'Subscription plan retrieved successfully', { plan });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a subscription plan (ADMIN only)
 * PUT /api/plans/:id
 */
const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await planService.updatePlan(id, req.body);
    return sendSuccess(res, 'Subscription plan updated successfully', { plan: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a subscription plan (Soft delete - sets isActive = false) (ADMIN only)
 * DELETE /api/plans/:id
 */
const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    await planService.deletePlan(id);
    return sendSuccess(res, 'Subscription plan deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan
};
