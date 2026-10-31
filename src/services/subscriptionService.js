const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const { calculateNextBillingDate, roundCurrency } = require('../utils/billingCalculator');
const invoiceService = require('./invoiceService');
const { SUBSCRIPTION_STATUSES } = require('../constants/roles');

class SubscriptionService {
  /**
   * Allowed state transitions map
   */
  static VALID_TRANSITIONS = {
    [SUBSCRIPTION_STATUSES.DRAFT]: [
      SUBSCRIPTION_STATUSES.QUOTATION,
      SUBSCRIPTION_STATUSES.CONFIRMED,
      SUBSCRIPTION_STATUSES.ACTIVE,
      SUBSCRIPTION_STATUSES.CLOSED
    ],
    [SUBSCRIPTION_STATUSES.QUOTATION]: [
      SUBSCRIPTION_STATUSES.DRAFT,
      SUBSCRIPTION_STATUSES.CONFIRMED,
      SUBSCRIPTION_STATUSES.ACTIVE,
      SUBSCRIPTION_STATUSES.CLOSED
    ],
    [SUBSCRIPTION_STATUSES.CONFIRMED]: [
      SUBSCRIPTION_STATUSES.ACTIVE,
      SUBSCRIPTION_STATUSES.CLOSED
    ],
    [SUBSCRIPTION_STATUSES.ACTIVE]: [
      SUBSCRIPTION_STATUSES.PAUSED,
      SUBSCRIPTION_STATUSES.CLOSED
    ],
    [SUBSCRIPTION_STATUSES.PAUSED]: [
      SUBSCRIPTION_STATUSES.ACTIVE, // Resume
      SUBSCRIPTION_STATUSES.CLOSED
    ],
    [SUBSCRIPTION_STATUSES.CLOSED]: [] // Terminal state: cannot transition to any other status
  };

  /**
   * Create a new subscription
   */
  async createSubscription(data, requestingUser = null) {
    const {
      customerId,
      planId,
      productId,
      variantId,
      quantity = 1,
      startDate = new Date(),
      paymentTerms = 'Net 30',
      autoRenew = true,
      notes = null,
      status = SUBSCRIPTION_STATUSES.DRAFT,
      discountCode = null
    } = data;

    // 1. Validate Customer
    let customer = null;
    if (getIsDbConnected() && prisma) {
      try {
        customer = await prisma.user.findUnique({ where: { id: customerId } });
      } catch (err) {
        logger.warn('Prisma customer lookup failed:', err.message);
      }
    }
    if (!customer) {
      customer = inMemoryStore.users.get(customerId);
    }
    if (!customer) {
      const error = new Error(`Cannot create subscription: Customer with ID '${customerId}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // 2. Validate Plan
    let plan = null;
    if (getIsDbConnected() && prisma) {
      try {
        plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
          include: { product: true }
        });
      } catch (err) {
        logger.warn('Prisma plan lookup failed:', err.message);
      }
    }
    if (!plan) {
      plan = inMemoryStore.plans.get(planId);
      if (plan) {
        plan.product = inMemoryStore.products.get(plan.productId);
      }
    }
    if (!plan) {
      const error = new Error(`Cannot create subscription: Subscription plan with ID '${planId}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (!plan.isActive) {
      const error = new Error(`Cannot create subscription: Subscription plan '${plan.name}' is currently inactive`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 3. Resolve Product & Variant
    const effectiveProductId = productId || plan.productId;
    let variant = null;
    if (variantId) {
      if (getIsDbConnected() && prisma) {
        try {
          variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
        } catch (err) {
          logger.warn('Prisma variant lookup failed:', err.message);
        }
      }
      if (!variant) {
        variant = inMemoryStore.variants.get(variantId);
      }
    }

    // 4. Calculate Quantities & Pricing
    const qty = Math.max(plan.minQuantity || 1, parseInt(quantity, 10) || 1);
    let unitPrice = parseFloat(plan.price);
    if (variant && variant.priceExtra) {
      unitPrice += parseFloat(variant.priceExtra);
    }
    unitPrice = roundCurrency(unitPrice);
    const totalAmount = roundCurrency(unitPrice * qty);

    // 5. Calculate Dates
    const subStartDate = new Date(startDate);
    const nextBillingDate = calculateNextBillingDate(subStartDate, plan.billingInterval, plan.intervalCount);

    // 6. Save in PostgreSQL / In-Memory
    let createdSubscription = null;
    const initialStatus = status ? status.toUpperCase() : SUBSCRIPTION_STATUSES.DRAFT;

    if (getIsDbConnected() && prisma) {
      try {
        const year = new Date().getFullYear();
        const count = await prisma.subscription.count();
        const subscriptionNumber = `SUB-${year}-${String(count + 1).padStart(4, '0')}`;

        createdSubscription = await prisma.subscription.create({
          data: {
            subscriptionNumber,
            customerId,
            planId,
            quantity: qty,
            unitPrice,
            totalAmount,
            status: initialStatus,
            startDate: subStartDate,
            nextBillingDate,
            paymentTerms,
            autoRenew,
            notes,
            lines: {
              create: [
                {
                  productId: effectiveProductId,
                  variantId: variant ? variant.id : null,
                  quantity: qty,
                  unitPrice,
                  amount: totalAmount
                }
              ]
            }
          },
          include: {
            customer: {
              select: { id: true, email: true, firstName: true, lastName: true, companyName: true }
            },
            plan: {
              include: { product: true }
            },
            lines: {
              include: { product: true, variant: true }
            }
          }
        });
      } catch (err) {
        logger.warn('Prisma createSubscription failed, falling back to inMemoryStore:', err.message);
      }
    }

    if (!createdSubscription) {
      const subId = inMemoryStore.generateId();
      const subscriptionNumber = inMemoryStore.generateSubscriptionNumber();

      const lineId = inMemoryStore.generateId();
      const lineObj = {
        id: lineId,
        subscriptionId: subId,
        productId: effectiveProductId,
        variantId: variant ? variant.id : null,
        quantity: qty,
        unitPrice,
        taxRate: 0.00,
        amount: totalAmount,
        product: plan.product,
        variant
      };

      createdSubscription = {
        id: subId,
        subscriptionNumber,
        customerId,
        planId,
        quantity: qty,
        unitPrice,
        totalAmount,
        status: initialStatus,
        startDate: subStartDate,
        nextBillingDate,
        lastBillingDate: null,
        expiryDate: null,
        paymentTerms,
        autoRenew,
        notes,
        discountCode: discountCode || null,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          companyName: customer.companyName
        },
        plan,
        lines: [lineObj],
        invoices: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      inMemoryStore.subscriptions.set(subId, createdSubscription);
      inMemoryStore.subscriptionLines.set(lineId, lineObj);
    }

    // 7. Automatic Invoice Generation if subscription is created directly as ACTIVE
    if (initialStatus === SUBSCRIPTION_STATUSES.ACTIVE) {
      try {
        const invoice = await invoiceService.generateInvoiceForSubscription(createdSubscription.id);
        createdSubscription.initialInvoice = invoice;
      } catch (err) {
        logger.warn(`Initial invoice generation for active subscription ${createdSubscription.subscriptionNumber} failed:`, err.message);
      }
    }

    return createdSubscription;
  }

  /**
   * Get all subscriptions with search, filter, and pagination
   */
  async getSubscriptions(query = {}, requestingUser = null) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    let targetCustomerId = query.customerId;
    if (requestingUser && requestingUser.role === 'CUSTOMER') {
      targetCustomerId = requestingUser.id;
    }

    if (getIsDbConnected() && prisma) {
      try {
        const where = {};
        if (targetCustomerId) where.customerId = targetCustomerId;
        if (query.status) where.status = query.status.toUpperCase();
        if (query.planId) where.planId = query.planId;

        if (query.search) {
          const s = query.search.trim();
          where.OR = [
            { id: { contains: s, mode: 'insensitive' } },
            { customerId: { contains: s, mode: 'insensitive' } },
            { subscriptionNumber: { contains: s, mode: 'insensitive' } },
            { customer: { firstName: { contains: s, mode: 'insensitive' } } },
            { customer: { lastName: { contains: s, mode: 'insensitive' } } },
            { customer: { email: { contains: s, mode: 'insensitive' } } },
            { customer: { companyName: { contains: s, mode: 'insensitive' } } }
          ];
        }

        const [total, items] = await Promise.all([
          prisma.subscription.count({ where }),
          prisma.subscription.findMany({
            where,
            include: {
              customer: {
                select: { id: true, email: true, firstName: true, lastName: true, companyName: true }
              },
              plan: {
                include: { product: true }
              },
              lines: true,
              invoices: {
                orderBy: { createdAt: 'desc' }
              }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
          })
        ]);

        return {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (err) {
        logger.warn('Prisma getSubscriptions failed, checking inMemoryStore:', err.message);
      }
    }

    // In-Memory Filter
    let list = Array.from(inMemoryStore.subscriptions.values());

    if (targetCustomerId) {
      list = list.filter(s => s.customerId === targetCustomerId);
    }

    if (query.status) {
      const st = query.status.toUpperCase();
      list = list.filter(s => s.status === st);
    }

    if (query.planId) {
      list = list.filter(s => s.planId === query.planId);
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(sub => {
        const numMatch = sub.subscriptionNumber && sub.subscriptionNumber.toLowerCase().includes(s);
        const idMatch = sub.id && sub.id.toLowerCase().includes(s);
        const custIdMatch = sub.customerId && sub.customerId.toLowerCase().includes(s);
        const cust = inMemoryStore.users.get(sub.customerId);
        const custMatch = cust && `${cust.firstName} ${cust.lastName} ${cust.email} ${cust.companyName}`.toLowerCase().includes(s);
        return numMatch || idMatch || custIdMatch || custMatch;
      });
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const paginatedItems = list.slice(skip, skip + limit).map(sub => {
      const invoices = Array.from(inMemoryStore.invoices.values())
        .filter(inv => inv.subscriptionId === sub.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const customer = inMemoryStore.users.get(sub.customerId);
      const plan = inMemoryStore.plans.get(sub.planId);
      const lines = Array.from(inMemoryStore.subscriptionLines.values()).filter(l => l.subscriptionId === sub.id);

      return {
        ...sub,
        customer: customer ? {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          companyName: customer.companyName
        } : null,
        plan,
        lines,
        invoices
      };
    });

    return {
      items: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single subscription by ID
   */
  async getSubscriptionById(id, requestingUser = null) {
    let sub = null;

    if (getIsDbConnected() && prisma) {
      try {
        sub = await prisma.subscription.findUnique({
          where: { id },
          include: {
            customer: {
              select: { id: true, email: true, firstName: true, lastName: true, companyName: true, phone: true }
            },
            plan: {
              include: { product: true }
            },
            lines: {
              include: { product: true, variant: true }
            },
            invoices: {
              include: { lines: true, payments: true },
              orderBy: { createdAt: 'desc' }
            }
          }
        });
      } catch (err) {
        logger.warn('Prisma getSubscriptionById failed:', err.message);
      }
    }

    if (!sub) {
      sub = inMemoryStore.subscriptions.get(id);
      if (sub) {
        const customer = inMemoryStore.users.get(sub.customerId);
        const plan = inMemoryStore.plans.get(sub.planId);
        const lines = Array.from(inMemoryStore.subscriptionLines.values()).filter(l => l.subscriptionId === id);
        const invoices = Array.from(inMemoryStore.invoices.values())
          .filter(inv => inv.subscriptionId === id)
          .map(inv => {
            const payments = Array.from(inMemoryStore.payments.values()).filter(p => p.invoiceId === inv.id);
            return { ...inv, payments };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sub = {
          ...sub,
          customer: customer ? {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            companyName: customer.companyName,
            phone: customer.phone
          } : null,
          plan,
          lines,
          invoices
        };
      }
    }

    if (!sub) {
      const error = new Error(`Subscription with ID '${id}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Role check: CUSTOMER can only view their own subscription
    if (requestingUser && requestingUser.role === 'CUSTOMER' && sub.customerId !== requestingUser.id) {
      const error = new Error('You are not authorized to access this subscription');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return sub;
  }

  /**
   * Update subscription details (plan, quantity, payment terms, notes)
   */
  async updateSubscription(id, updateData, requestingUser = null) {
    const existing = await this.getSubscriptionById(id, requestingUser);

    // Rule: Cannot edit closed subscriptions
    if (existing.status === SUBSCRIPTION_STATUSES.CLOSED) {
      const error = new Error(`Cannot update subscription '${existing.subscriptionNumber}': Closed subscriptions cannot be modified. Please create a new subscription or initiate renewal.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    let planId = existing.planId;
    let plan = existing.plan;
    let quantity = existing.quantity || 1;
    let unitPrice = existing.unitPrice ? parseFloat(existing.unitPrice) : parseFloat(plan.price);

    let needsRecalculation = false;

    if (updateData.planId && updateData.planId !== existing.planId) {
      planId = updateData.planId;
      if (getIsDbConnected() && prisma) {
        plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      } else {
        plan = inMemoryStore.plans.get(planId);
      }
      if (!plan) {
        const error = new Error(`Subscription plan with ID '${planId}' was not found`);
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }
      unitPrice = parseFloat(plan.price);
      needsRecalculation = true;
    }

    if (updateData.quantity !== undefined && updateData.quantity !== existing.quantity) {
      quantity = Math.max(1, parseInt(updateData.quantity, 10));
      needsRecalculation = true;
    }

    const totalAmount = needsRecalculation ? roundCurrency(unitPrice * quantity) : existing.totalAmount;

    let nextBillingDate = existing.nextBillingDate;
    if (updateData.planId && plan) {
      // Recalculate next billing date if plan changed
      nextBillingDate = calculateNextBillingDate(existing.startDate, plan.billingInterval, plan.intervalCount);
    }

    const notes = updateData.notes !== undefined ? updateData.notes : existing.notes;
    const paymentTerms = updateData.paymentTerms !== undefined ? updateData.paymentTerms : existing.paymentTerms;
    const autoRenew = updateData.autoRenew !== undefined ? updateData.autoRenew : existing.autoRenew;

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.subscription.update({
          where: { id },
          data: {
            planId,
            quantity,
            unitPrice,
            totalAmount,
            nextBillingDate,
            paymentTerms,
            autoRenew,
            notes,
            updatedAt: new Date()
          },
          include: {
            customer: true,
            plan: true,
            lines: true
          }
        });
      } catch (err) {
        logger.warn('Prisma updateSubscription failed:', err.message);
      }
    }

    const updated = {
      ...existing,
      planId,
      plan,
      quantity,
      unitPrice,
      totalAmount,
      nextBillingDate,
      paymentTerms,
      autoRenew,
      notes,
      updatedAt: new Date()
    };

    inMemoryStore.subscriptions.set(id, updated);
    return updated;
  }

  /**
   * Update subscription lifecycle status with strict state machine validation
   */
  async updateSubscriptionStatus(id, newStatus, reason = null, requestingUser = null) {
    const existing = await this.getSubscriptionById(id, requestingUser);
    const targetStatus = newStatus.toUpperCase();

    // 1. Strict State Machine Validation
    if (existing.status === SUBSCRIPTION_STATUSES.CLOSED) {
      const error = new Error(
        `Invalid status transition: Subscription '${existing.subscriptionNumber}' is CLOSED. Closed subscriptions cannot be activated or transitioned again. Please create a new subscription or initiate an explicit renewal workflow.`
      );
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const allowedTransitions = SubscriptionService.VALID_TRANSITIONS[existing.status] || [];
    if (!allowedTransitions.includes(targetStatus)) {
      const error = new Error(
        `Invalid status transition from '${existing.status}' to '${targetStatus}'. Allowed transitions from '${existing.status}': [${allowedTransitions.join(', ')}]`
      );
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 2. Transition Business Logic
    let updatedNextBillingDate = existing.nextBillingDate;
    const isActivating = targetStatus === SUBSCRIPTION_STATUSES.ACTIVE;
    const isResuming = existing.status === SUBSCRIPTION_STATUSES.PAUSED && targetStatus === SUBSCRIPTION_STATUSES.ACTIVE;

    if (isActivating && !existing.nextBillingDate) {
      const plan = existing.plan;
      if (plan) {
        updatedNextBillingDate = calculateNextBillingDate(new Date(), plan.billingInterval, plan.intervalCount);
      }
    }

    const notes = reason ? `${existing.notes ? existing.notes + '\n' : ''}[Status change to ${targetStatus}]: ${reason}` : existing.notes;

    let updatedSub = null;
    if (getIsDbConnected() && prisma) {
      try {
        updatedSub = await prisma.subscription.update({
          where: { id },
          data: {
            status: targetStatus,
            nextBillingDate: updatedNextBillingDate,
            notes,
            updatedAt: new Date()
          },
          include: {
            customer: true,
            plan: true,
            lines: true,
            invoices: true
          }
        });
      } catch (err) {
        logger.warn('Prisma updateSubscriptionStatus failed:', err.message);
      }
    }

    if (!updatedSub) {
      updatedSub = {
        ...existing,
        status: targetStatus,
        nextBillingDate: updatedNextBillingDate,
        notes,
        updatedAt: new Date()
      };
      inMemoryStore.subscriptions.set(id, updatedSub);
    }

    // 3. Automatic Invoice Generation when becoming ACTIVE for the first time
    if (isActivating && !isResuming) {
      // Check if any invoices already exist for this subscription
      const existingInvoices = await invoiceService.getInvoicesBySubscriptionId(id);
      if (existingInvoices.length === 0) {
        try {
          const generatedInvoice = await invoiceService.generateInvoiceForSubscription(id);
          updatedSub.generatedInvoice = generatedInvoice;
          logger.info(`Automatically generated initial invoice ${generatedInvoice.invoiceNumber} upon subscription activation.`);
        } catch (err) {
          logger.warn(`Automatic invoice generation on activation for ${updatedSub.subscriptionNumber} failed:`, err.message);
        }
      }
    }

    return updatedSub;
  }

  /**
   * Renew a subscription
   */
  async renewSubscription(id, requestingUser = null) {
    const existing = await this.getSubscriptionById(id, requestingUser);
    const plan = existing.plan;

    if (plan && plan.allowRenew === false) {
      const error = new Error(`Renewal is not permitted by plan '${plan.name}'`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const billingInterval = plan ? plan.billingInterval : 'MONTHLY';
    const intervalCount = plan ? plan.intervalCount : 1;

    const baseDate = existing.nextBillingDate ? new Date(existing.nextBillingDate) : new Date();
    const newNextBillingDate = calculateNextBillingDate(baseDate, billingInterval, intervalCount);

    let renewedSub = null;
    if (getIsDbConnected() && prisma) {
      try {
        renewedSub = await prisma.subscription.update({
          where: { id },
          data: {
            status: SUBSCRIPTION_STATUSES.ACTIVE,
            nextBillingDate: newNextBillingDate,
            notes: `${existing.notes ? existing.notes + '\n' : ''}[Renewed on ${new Date().toISOString()}]`,
            updatedAt: new Date()
          },
          include: {
            customer: true,
            plan: true,
            lines: true
          }
        });
      } catch (err) {
        logger.warn('Prisma renewSubscription failed:', err.message);
      }
    }

    if (!renewedSub) {
      renewedSub = {
        ...existing,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        nextBillingDate: newNextBillingDate,
        notes: `${existing.notes ? existing.notes + '\n' : ''}[Renewed on ${new Date().toISOString()}]`,
        updatedAt: new Date()
      };
      inMemoryStore.subscriptions.set(id, renewedSub);
    }

    // Automatically generate renewal invoice for the renewed cycle
    try {
      const renewalInvoice = await invoiceService.generateInvoiceForSubscription(id, {
        billingPeriodStart: baseDate,
        billingPeriodEnd: newNextBillingDate,
        notes: `Renewal invoice for period ${baseDate.toISOString().split('T')[0]} to ${newNextBillingDate.toISOString().split('T')[0]}`
      });
      renewedSub.renewalInvoice = renewalInvoice;
    } catch (err) {
      logger.warn(`Renewal invoice generation for ${renewedSub.subscriptionNumber} returned:`, err.message);
    }

    return renewedSub;
  }
}

const subscriptionService = new SubscriptionService();
module.exports = subscriptionService;
