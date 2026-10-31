const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const variantController = require('../controllers/variantController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema
} = require('../validators/productValidator');
const { ROLES } = require('../constants/roles');

// -----------------------------------------------------------------------------
// Product Variant Routes (Nested under /api/products/:productId/variants)
// -----------------------------------------------------------------------------

// Add variant to product (ADMIN only)
router.post(
  '/:productId/variants',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createVariantSchema),
  variantController.createVariant
);

// Get all variants for a product (Public / Authenticated)
router.get(
  '/:productId/variants',
  variantController.getVariantsByProduct
);

// Get a specific variant by ID
router.get(
  '/:productId/variants/:variantId',
  variantController.getVariantById
);

// Update variant (ADMIN only)
router.put(
  '/:productId/variants/:variantId',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateVariantSchema),
  variantController.updateVariant
);

// Delete/deactivate variant (ADMIN only)
router.delete(
  '/:productId/variants/:variantId',
  authenticate,
  authorize(ROLES.ADMIN),
  variantController.deleteVariant
);

// -----------------------------------------------------------------------------
// Product Core CRUD Routes
// -----------------------------------------------------------------------------

// Create product (ADMIN only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createProductSchema),
  productController.createProduct
);

// List products (Public / Authenticated)
router.get(
  '/',
  productController.getAllProducts
);

// Get single product with variants & plans
router.get(
  '/:id',
  productController.getProductById
);

// Update product (ADMIN only)
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateProductSchema),
  productController.updateProduct
);

// Delete product (ADMIN only)
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  productController.deleteProduct
);

module.exports = router;
