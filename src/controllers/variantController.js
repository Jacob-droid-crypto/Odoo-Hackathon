const variantService = require('../services/variantService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Add a variant to a product (ADMIN only)
 * POST /api/products/:productId/variants
 */
const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variant = await variantService.createVariant(productId, req.body);
    return sendSuccess(res, 'Product variant added successfully', { variant }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List all variants for a product
 * GET /api/products/:productId/variants
 */
const getVariantsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variants = await variantService.getVariantsByProductId(productId);
    return sendSuccess(res, 'Variants retrieved successfully', { variants });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single variant by ID
 * GET /api/products/:productId/variants/:variantId
 */
const getVariantById = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const variant = await variantService.getVariantById(variantId);

    if (!variant) {
      return sendError(res, `Variant with ID '${variantId}' not found`, 404);
    }

    return sendSuccess(res, 'Variant retrieved successfully', { variant });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product variant (ADMIN only)
 * PUT /api/products/:productId/variants/:variantId
 */
const updateVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const updated = await variantService.updateVariant(variantId, req.body);
    return sendSuccess(res, 'Product variant updated successfully', { variant: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product variant (ADMIN only)
 * DELETE /api/products/:productId/variants/:variantId
 */
const deleteVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    await variantService.deleteVariant(variantId);
    return sendSuccess(res, 'Product variant deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVariant,
  getVariantsByProduct,
  getVariantById,
  updateVariant,
  deleteVariant
};
