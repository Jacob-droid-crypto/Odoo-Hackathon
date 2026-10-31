const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const productService = require('./productService');

class PlanService {
  async createPlan(data) {
    const product = await productService.getProductById(data.productId);
    if (!product) {
      const error = new Error(`Cannot create plan: Product with ID '${data.productId}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.subscriptionPlan.create({
          data: {
            productId: data.productId,
            name: data.name,
            code: data.code,
            description: data.description || null,
            price: data.price,
            billingInterval: data.billingInterval,
            intervalCount: data.intervalCount || 1,
            minQuantity: data.minQuantity || 1,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            autoClose: data.autoClose !== undefined ? data.autoClose : false,
            allowEarlyClose: data.allowEarlyClose !== undefined ? data.allowEarlyClose : true,
            allowPause: data.allowPause !== undefined ? data.allowPause : true,
            allowRenew: data.allowRenew !== undefined ? data.allowRenew : true,
            isActive: data.isActive !== undefined ? data.isActive : true
          },
          include: {
            product: true
          }
        });
      } catch (err) {
        logger.warn('Prisma createPlan failed, saving in-memory:', err.message);
      }
    }

    // Check code uniqueness
    for (const p of inMemoryStore.plans.values()) {
      if (p.code.toLowerCase() === data.code.toLowerCase()) {
        const error = new Error(`A subscription plan with code '${data.code}' already exists`);
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
    }

    const newPlan = {
      id: inMemoryStore.generateId(),
      productId: data.productId,
      name: data.name,
      code: data.code,
      description: data.description || null,
      price: Number(data.price),
      billingInterval: data.billingInterval,
      intervalCount: Number(data.intervalCount || 1),
      minQuantity: Number(data.minQuantity || 1),
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      autoClose: data.autoClose !== undefined ? data.autoClose : false,
      allowEarlyClose: data.allowEarlyClose !== undefined ? data.allowEarlyClose : true,
      allowPause: data.allowPause !== undefined ? data.allowPause : true,
      allowRenew: data.allowRenew !== undefined ? data.allowRenew : true,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.plans.set(newPlan.id, newPlan);

    return { ...newPlan, product };
  }

  async getAllPlans(filters = {}) {
    const { productId, billingInterval, isActive, search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    if (getIsDbConnected() && prisma) {
      try {
        const where = {};
        if (productId) where.productId = productId;
        if (billingInterval) where.billingInterval = billingInterval;
        if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ];
        }

        const [plans, total] = await Promise.all([
          prisma.subscriptionPlan.findMany({
            where,
            include: { product: true },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
          }),
          prisma.subscriptionPlan.count({ where })
        ]);

        return { plans, total, page: Number(page), limit: Number(limit) };
      } catch (err) {
        logger.warn('Prisma getAllPlans failed, checking in-memory:', err.message);
      }
    }

    let list = Array.from(inMemoryStore.plans.values()).map(p => {
      const product = inMemoryStore.products.get(p.productId);
      return { ...p, product };
    });

    if (productId) {
      list = list.filter(p => p.productId === productId);
    }
    if (billingInterval) {
      list = list.filter(p => p.billingInterval === billingInterval);
    }
    if (isActive !== undefined) {
      const activeBool = isActive === 'true' || isActive === true;
      list = list.filter(p => p.isActive === activeBool);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + Number(limit));
    return { plans: paginated, total, page: Number(page), limit: Number(limit) };
  }

  async getPlanById(id) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.subscriptionPlan.findUnique({
          where: { id },
          include: { product: true }
        });
      } catch (err) {
        logger.warn('Prisma getPlanById failed, checking in-memory:', err.message);
      }
    }

    const plan = inMemoryStore.plans.get(id);
    if (!plan) return null;
    const product = inMemoryStore.products.get(plan.productId);
    return { ...plan, product };
  }

  async updatePlan(id, updateData) {
    const existing = await this.getPlanById(id);
    if (!existing) {
      const error = new Error('Subscription plan not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        const data = { ...updateData };
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        return await prisma.subscriptionPlan.update({
          where: { id },
          data,
          include: { product: true }
        });
      } catch (err) {
        logger.warn('Prisma updatePlan failed, updating in-memory:', err.message);
      }
    }

    const current = inMemoryStore.plans.get(id);
    const updated = {
      ...current,
      ...updateData,
      price: updateData.price !== undefined ? Number(updateData.price) : current.price,
      startDate: updateData.startDate ? new Date(updateData.startDate) : current.startDate,
      endDate: updateData.endDate ? new Date(updateData.endDate) : current.endDate,
      updatedAt: new Date()
    };
    inMemoryStore.plans.set(id, updated);
    return this.getPlanById(id);
  }

  async deletePlan(id) {
    const existing = await this.getPlanById(id);
    if (!existing) {
      const error = new Error('Subscription plan not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.subscriptionPlan.update({
          where: { id },
          data: { isActive: false }
        });
      } catch (err) {
        logger.warn('Prisma deletePlan failed, updating in-memory:', err.message);
      }
    }

    const current = inMemoryStore.plans.get(id);
    current.isActive = false;
    current.updatedAt = new Date();
    return current;
  }
}

module.exports = new PlanService();
