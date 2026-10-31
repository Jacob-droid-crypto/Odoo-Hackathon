const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const { calculatePricing } = require('../utils/billingCalculator');
const { DISCOUNT_TYPES } = require('../constants/roles');

class TaxDiscountService {
  /**
   * Get all active tax rules
   */
  async getAllTaxRules(filter = {}) {
    if (getIsDbConnected() && prisma) {
      try {
        const where = {};
        if (filter.isActive !== undefined) {
          where.isActive = filter.isActive === 'true' || filter.isActive === true;
        }
        return await prisma.taxRule.findMany({
          where,
          orderBy: { createdAt: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getAllTaxRules failed, falling back to inMemoryStore:', err.message);
      }
    }

    let rules = Array.from(inMemoryStore.taxRules.values());
    if (filter.isActive !== undefined) {
      const activeBool = filter.isActive === 'true' || filter.isActive === true;
      rules = rules.filter(r => r.isActive === activeBool);
    }
    return rules;
  }

  /**
   * Get default tax rule (e.g. Standard GST 18%)
   */
  async getDefaultTaxRule() {
    if (getIsDbConnected() && prisma) {
      try {
        const rule = await prisma.taxRule.findFirst({
          where: { isDefault: true, isActive: true }
        });
        if (rule) return rule;
      } catch (err) {
        logger.warn('Prisma getDefaultTaxRule failed:', err.message);
      }
    }

    const defaultRule = Array.from(inMemoryStore.taxRules.values()).find(r => r.isDefault && r.isActive);
    if (defaultRule) return defaultRule;

    // Fallback default
    return {
      id: 'default-tax-18',
      name: 'Standard GST (18%)',
      ratePercentage: 18.00,
      description: 'Default standard tax rate',
      isDefault: true,
      isActive: true
    };
  }

  /**
   * Create a new configurable tax rate rule
   */
  async createTaxRule(data) {
    const rate = parseFloat(data.ratePercentage);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      const error = new Error('Tax rate percentage must be between 0 and 100');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        if (data.isDefault) {
          // Reset other defaults
          await prisma.taxRule.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
          });
        }

        return await prisma.taxRule.create({
          data: {
            name: data.name,
            ratePercentage: rate,
            description: data.description || null,
            isDefault: data.isDefault || false,
            isActive: data.isActive !== undefined ? data.isActive : true
          }
        });
      } catch (err) {
        logger.warn('Prisma createTaxRule failed:', err.message);
      }
    }

    if (data.isDefault) {
      for (const rule of inMemoryStore.taxRules.values()) {
        rule.isDefault = false;
      }
    }

    const newRule = {
      id: inMemoryStore.generateId(),
      name: data.name,
      ratePercentage: rate,
      description: data.description || null,
      isDefault: data.isDefault || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryStore.taxRules.set(newRule.id, newRule);
    return newRule;
  }

  /**
   * Get all discount rules
   */
  async getAllDiscountRules(filter = {}) {
    if (getIsDbConnected() && prisma) {
      try {
        const where = {};
        if (filter.isActive !== undefined) {
          where.isActive = filter.isActive === 'true' || filter.isActive === true;
        }
        return await prisma.discountRule.findMany({
          where,
          orderBy: { createdAt: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getAllDiscountRules failed:', err.message);
      }
    }

    let rules = Array.from(inMemoryStore.discountRules.values());
    if (filter.isActive !== undefined) {
      const activeBool = filter.isActive === 'true' || filter.isActive === true;
      rules = rules.filter(r => r.isActive === activeBool);
    }
    return rules;
  }

  /**
   * Find discount rule by promo code
   */
  async getDiscountRuleByCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.discountRule.findUnique({
          where: { code: cleanCode }
        });
      } catch (err) {
        logger.warn('Prisma getDiscountRuleByCode failed:', err.message);
      }
    }

    for (const rule of inMemoryStore.discountRules.values()) {
      if (rule.code.toUpperCase() === cleanCode) {
        return rule;
      }
    }
    return null;
  }

  /**
   * Create a new discount rule (Percentage or Fixed)
   */
  async createDiscountRule(data) {
    const code = data.code.trim().toUpperCase();
    const type = data.type ? data.type.toUpperCase() : DISCOUNT_TYPES.PERCENTAGE;
    const value = parseFloat(data.value);

    if (isNaN(value) || value < 0) {
      const error = new Error('Discount value cannot be negative');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (type === DISCOUNT_TYPES.PERCENTAGE && value > 100) {
      const error = new Error('Percentage discount cannot exceed 100%');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.discountRule.create({
          data: {
            code,
            description: data.description || null,
            type,
            value,
            minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null,
            minQuantity: data.minQuantity ? parseInt(data.minQuantity, 10) : null,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            maxUses: data.maxUses ? parseInt(data.maxUses, 10) : null,
            targetType: data.targetType || 'SUBSCRIPTION',
            targetProductId: data.targetProductId || null,
            isActive: data.isActive !== undefined ? data.isActive : true
          }
        });
      } catch (err) {
        logger.warn('Prisma createDiscountRule failed:', err.message);
      }
    }

    for (const r of inMemoryStore.discountRules.values()) {
      if (r.code.toUpperCase() === code) {
        const error = new Error(`Discount code '${code}' already exists`);
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
    }

    const newDiscount = {
      id: inMemoryStore.generateId(),
      code,
      description: data.description || null,
      type,
      value,
      minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null,
      minQuantity: data.minQuantity ? parseInt(data.minQuantity, 10) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      maxUses: data.maxUses ? parseInt(data.maxUses, 10) : null,
      usedCount: 0,
      targetType: data.targetType || 'SUBSCRIPTION',
      targetProductId: data.targetProductId || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryStore.discountRules.set(newDiscount.id, newDiscount);
    return newDiscount;
  }

  /**
   * Validate and resolve discount details for an order
   */
  async resolveDiscount({ discountCode, discountType, discountValue, subtotal = 0, quantity = 1, productId = null }) {
    if (discountCode) {
      const rule = await this.getDiscountRuleByCode(discountCode);
      if (!rule) {
        const error = new Error(`Discount coupon '${discountCode}' was not found`);
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }

      if (!rule.isActive) {
        const error = new Error(`Discount coupon '${discountCode}' is no longer active`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      const now = new Date();
      if (rule.startDate && new Date(rule.startDate) > now) {
        const error = new Error(`Discount coupon '${discountCode}' has not started yet`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      if (rule.endDate && new Date(rule.endDate) < now) {
        const error = new Error(`Discount coupon '${discountCode}' has expired`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      if (rule.maxUses && rule.usedCount >= rule.maxUses) {
        const error = new Error(`Discount coupon '${discountCode}' has reached its maximum usage limit`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      if (rule.minPurchase && subtotal < parseFloat(rule.minPurchase)) {
        const error = new Error(`Discount coupon '${discountCode}' requires a minimum subtotal of ₹${rule.minPurchase}`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      if (rule.minQuantity && quantity < rule.minQuantity) {
        const error = new Error(`Discount coupon '${discountCode}' requires a minimum quantity of ${rule.minQuantity}`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      if (rule.targetProductId && productId && rule.targetProductId !== productId) {
        const error = new Error(`Discount coupon '${discountCode}' is only valid for product ID ${rule.targetProductId}`);
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }

      return {
        discountRuleId: rule.id,
        discountCode: rule.code,
        discountType: rule.type,
        discountValue: parseFloat(rule.value)
      };
    }

    if (discountType && discountValue !== undefined) {
      return {
        discountRuleId: null,
        discountCode: null,
        discountType: discountType.toUpperCase(),
        discountValue: parseFloat(discountValue)
      };
    }

    return {
      discountRuleId: null,
      discountCode: null,
      discountType: null,
      discountValue: 0
    };
  }

  /**
   * Preview calculation endpoint helper
   */
  async calculatePreview(params) {
    const {
      unitPrice = 0,
      quantity = 1,
      discountCode = null,
      discountType = null,
      discountValue = 0,
      taxRuleId = null,
      taxRate = null,
      productId = null
    } = params;

    const baseSubtotal = parseFloat(unitPrice) * parseInt(quantity, 10);

    // Resolve discount
    const resolvedDiscount = await this.resolveDiscount({
      discountCode,
      discountType,
      discountValue,
      subtotal: baseSubtotal,
      quantity,
      productId
    });

    // Resolve tax rate
    let effectiveTaxRate = 18.00;
    let selectedTaxRule = null;

    if (taxRate !== null && taxRate !== undefined) {
      effectiveTaxRate = parseFloat(taxRate);
    } else if (taxRuleId) {
      const allRules = await this.getAllTaxRules();
      selectedTaxRule = allRules.find(r => r.id === taxRuleId);
      if (selectedTaxRule) {
        effectiveTaxRate = parseFloat(selectedTaxRule.ratePercentage);
      }
    } else {
      selectedTaxRule = await this.getDefaultTaxRule();
      if (selectedTaxRule) {
        effectiveTaxRate = parseFloat(selectedTaxRule.ratePercentage);
      }
    }

    const calculation = calculatePricing({
      unitPrice,
      quantity,
      discountType: resolvedDiscount.discountType,
      discountValue: resolvedDiscount.discountValue,
      taxRatePercentage: effectiveTaxRate
    });

    return {
      ...calculation,
      discountCode: resolvedDiscount.discountCode,
      taxRuleName: selectedTaxRule ? selectedTaxRule.name : `Tax (${effectiveTaxRate}%)`
    };
  }
}

const taxDiscountService = new TaxDiscountService();
module.exports = taxDiscountService;
