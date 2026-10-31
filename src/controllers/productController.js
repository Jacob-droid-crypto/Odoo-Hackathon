const productService = require('../services/productService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

/**
 * Create a new product (ADMIN only)
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, 'Product created successfully', { product }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products with filters & pagination
 * GET /api/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { type, isActive, search, page, limit } = req.query;
    const result = await productService.getAllProducts({ type, isActive, search, page, limit });

    return sendPaginated(
      res,
      'Products retrieved successfully',
      result.products,
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
 * Get a single product by ID (including variants and plans)
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return sendError(res, `Product with ID '${id}' not found`, 404);
    }

    return sendSuccess(res, 'Product retrieved successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product (ADMIN only)
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await productService.updateProduct(id, req.body);
    return sendSuccess(res, 'Product updated successfully', { product: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product (Soft delete - sets isActive = false) (ADMIN only)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    return sendSuccess(res, 'Product deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
