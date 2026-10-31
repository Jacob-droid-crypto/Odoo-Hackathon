const { z } = require('zod');
const { PRODUCT_TYPES } = require('../constants/roles');

const productTypeEnum = z.enum([
  PRODUCT_TYPES.SOFTWARE,
  PRODUCT_TYPES.ADDON,
  PRODUCT_TYPES.SERVICE,
  PRODUCT_TYPES.PHYSICAL
]);

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  type: productTypeEnum.default(PRODUCT_TYPES.SOFTWARE),
  salesPrice: z.coerce.number().min(0, 'Sales price must be greater than or equal to 0'),
  costPrice: z.coerce.number().min(0, 'Cost price must be greater than or equal to 0').default(0),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true)
});

const updateProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name cannot be empty').optional(),
  type: productTypeEnum.optional(),
  salesPrice: z.coerce.number().min(0, 'Sales price must be greater than or equal to 0').optional(),
  costPrice: z.coerce.number().min(0, 'Cost price must be greater than or equal to 0').optional(),
  notes: z.string().trim().optional(),
  isActive: z.boolean().optional()
});

const createVariantSchema = z.object({
  variantName: z.string().trim().min(1, 'Variant name is required (e.g. Brand: Odoo)'),
  attributeName: z.string().trim().min(1, 'Attribute name is required (e.g. Brand)'),
  attributeValue: z.string().trim().min(1, 'Attribute value is required (e.g. Odoo)'),
  priceExtra: z.coerce.number().min(0, 'Extra price must be >= 0').default(0),
  sku: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true)
});

const updateVariantSchema = z.object({
  variantName: z.string().trim().min(1).optional(),
  attributeName: z.string().trim().min(1).optional(),
  attributeValue: z.string().trim().min(1).optional(),
  priceExtra: z.coerce.number().min(0).optional(),
  sku: z.string().trim().optional(),
  isActive: z.boolean().optional()
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema
};
