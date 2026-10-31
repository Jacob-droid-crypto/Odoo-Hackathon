const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const productService = require('./productService');

class VariantService {
  async createVariant(productId, data) {
    const product = await productService.getProductById(productId);
    if (!product) {
      const error = new Error(`Cannot add variant: Product with ID '${productId}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.productVariant.create({
          data: {
            productId,
            variantName: data.variantName,
            attributeName: data.attributeName,
            attributeValue: data.attributeValue,
            priceExtra: data.priceExtra !== undefined ? data.priceExtra : 0,
            sku: data.sku || null,
            isActive: data.isActive !== undefined ? data.isActive : true
          }
        });
      } catch (err) {
        logger.warn('Prisma createVariant failed, saving in-memory:', err.message);
      }
    }

    const newVariant = {
      id: inMemoryStore.generateId(),
      productId,
      variantName: data.variantName,
      attributeName: data.attributeName,
      attributeValue: data.attributeValue,
      priceExtra: Number(data.priceExtra || 0),
      sku: data.sku || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.variants.set(newVariant.id, newVariant);
    return newVariant;
  }

  async getVariantsByProductId(productId) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.productVariant.findMany({
          where: { productId, isActive: true },
          orderBy: { createdAt: 'asc' }
        });
      } catch (err) {
        logger.warn('Prisma getVariants failed, checking in-memory:', err.message);
      }
    }

    return Array.from(inMemoryStore.variants.values()).filter(
      v => v.productId === productId && v.isActive
    );
  }

  async getVariantById(id) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.productVariant.findUnique({
          where: { id },
          include: { product: true }
        });
      } catch (err) {
        logger.warn('Prisma getVariantById failed, checking in-memory:', err.message);
      }
    }

    const variant = inMemoryStore.variants.get(id);
    if (!variant) return null;
    const product = inMemoryStore.products.get(variant.productId);
    return { ...variant, product };
  }

  async updateVariant(id, updateData) {
    const existing = await this.getVariantById(id);
    if (!existing) {
      const error = new Error('Product variant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.productVariant.update({
          where: { id },
          data: updateData
        });
      } catch (err) {
        logger.warn('Prisma updateVariant failed, updating in-memory:', err.message);
      }
    }

    const current = inMemoryStore.variants.get(id);
    const updated = {
      ...current,
      ...updateData,
      priceExtra: updateData.priceExtra !== undefined ? Number(updateData.priceExtra) : current.priceExtra,
      updatedAt: new Date()
    };
    inMemoryStore.variants.set(id, updated);
    return updated;
  }

  async deleteVariant(id) {
    const existing = await this.getVariantById(id);
    if (!existing) {
      const error = new Error('Product variant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.productVariant.update({
          where: { id },
          data: { isActive: false }
        });
      } catch (err) {
        logger.warn('Prisma deleteVariant failed, updating in-memory:', err.message);
      }
    }

    const current = inMemoryStore.variants.get(id);
    current.isActive = false;
    current.updatedAt = new Date();
    return current;
  }
}

module.exports = new VariantService();
