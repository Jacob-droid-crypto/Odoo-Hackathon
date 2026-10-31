const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');

class ProductService {
  async createProduct(data) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.product.create({
          data: {
            name: data.name,
            type: data.type,
            salesPrice: data.salesPrice,
            costPrice: data.costPrice || 0,
            notes: data.notes || null,
            isActive: data.isActive !== undefined ? data.isActive : true
          },
          include: {
            variants: true,
            plans: true
          }
        });
      } catch (err) {
        logger.warn('Prisma createProduct failed, saving in-memory:', err.message);
      }
    }

    const newProduct = {
      id: inMemoryStore.generateId(),
      name: data.name,
      type: data.type,
      salesPrice: Number(data.salesPrice),
      costPrice: Number(data.costPrice || 0),
      notes: data.notes || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      variants: [],
      plans: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async getAllProducts(filters = {}) {
    const { type, isActive, search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    if (getIsDbConnected() && prisma) {
      try {
        const where = {};
        if (type) where.type = type;
        if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } }
          ];
        }

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            include: {
              variants: { where: { isActive: true } },
              plans: { where: { isActive: true } }
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
          }),
          prisma.product.count({ where })
        ]);

        return { products, total, page: Number(page), limit: Number(limit) };
      } catch (err) {
        logger.warn('Prisma getAllProducts failed, checking in-memory:', err.message);
      }
    }

    let list = Array.from(inMemoryStore.products.values()).map(prod => {
      // Attach variants and plans
      const variants = Array.from(inMemoryStore.variants.values()).filter(v => v.productId === prod.id && v.isActive);
      const plans = Array.from(inMemoryStore.plans.values()).filter(p => p.productId === prod.id && p.isActive);
      return { ...prod, variants, plans };
    });

    if (type) {
      list = list.filter(p => p.type === type);
    }
    if (isActive !== undefined) {
      const activeBool = isActive === 'true' || isActive === true;
      list = list.filter(p => p.isActive === activeBool);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || (p.notes && p.notes.toLowerCase().includes(s)));
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + Number(limit));
    return { products: paginated, total, page: Number(page), limit: Number(limit) };
  }

  async getProductById(id) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.product.findUnique({
          where: { id },
          include: {
            variants: true,
            plans: true
          }
        });
      } catch (err) {
        logger.warn('Prisma getProductById failed, checking in-memory:', err.message);
      }
    }

    const product = inMemoryStore.products.get(id);
    if (!product) return null;
    const variants = Array.from(inMemoryStore.variants.values()).filter(v => v.productId === id);
    const plans = Array.from(inMemoryStore.plans.values()).filter(p => p.productId === id);
    return { ...product, variants, plans };
  }

  async updateProduct(id, updateData) {
    const existing = await this.getProductById(id);
    if (!existing) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.product.update({
          where: { id },
          data: updateData,
          include: {
            variants: true,
            plans: true
          }
        });
      } catch (err) {
        logger.warn('Prisma updateProduct failed, updating in-memory:', err.message);
      }
    }

    const current = inMemoryStore.products.get(id);
    const updated = {
      ...current,
      ...updateData,
      salesPrice: updateData.salesPrice !== undefined ? Number(updateData.salesPrice) : current.salesPrice,
      costPrice: updateData.costPrice !== undefined ? Number(updateData.costPrice) : current.costPrice,
      updatedAt: new Date()
    };
    inMemoryStore.products.set(id, updated);
    return this.getProductById(id);
  }

  async deleteProduct(id) {
    const existing = await this.getProductById(id);
    if (!existing) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        // Soft delete
        return await prisma.product.update({
          where: { id },
          data: { isActive: false }
        });
      } catch (err) {
        logger.warn('Prisma deleteProduct failed, updating in-memory:', err.message);
      }
    }

    const current = inMemoryStore.products.get(id);
    current.isActive = false;
    current.updatedAt = new Date();
    return current;
  }
}

module.exports = new ProductService();
