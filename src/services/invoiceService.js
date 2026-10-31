const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const { calculatePricing, calculateNextBillingDate, calculateDueDate } = require('../utils/billingCalculator');
const taxDiscountService = require('./taxDiscountService');
const { INVOICE_STATUSES, SUBSCRIPTION_STATUSES } = require('../constants/roles');

class InvoiceService {
  /**
   * Automatically generate an invoice for a subscription
   * 
   * Strict Rules:
   * 1. Never generate invoices for PAUSED or CLOSED subscriptions.
   * 2. Prevent duplicate invoices for the same subscription and billing period.
   * 3. Compute all financial calculations securely on the backend (never trust frontend totals).
   * 4. Wrap database operations in a transaction.
   * 5. Advance next billing date upon invoice issuance.
   */
  async generateInvoiceForSubscription(subscriptionId, options = {}) {
    // 1. Fetch Subscription with Plan, Product, Customer
    let subscription = null;
    let customer = null;
    let plan = null;
    let product = null;
    let variant = null;

    if (getIsDbConnected() && prisma) {
      try {
        subscription = await prisma.subscription.findUnique({
          where: { id: subscriptionId },
          include: {
            customer: true,
            plan: {
              include: {
                product: true
              }
            },
            lines: {
              include: {
                product: true,
                variant: true
              }
            },
            invoices: true
          }
        });
      } catch (err) {
        logger.warn('Prisma find subscription failed, checking inMemoryStore:', err.message);
      }
    }

    if (!subscription) {
      subscription = inMemoryStore.subscriptions.get(subscriptionId);
      if (subscription) {
        customer = inMemoryStore.users.get(subscription.customerId);
        plan = inMemoryStore.plans.get(subscription.planId);
        if (plan) {
          product = inMemoryStore.products.get(plan.productId);
        }
        if (subscription.variantId) {
          variant = inMemoryStore.variants.get(subscription.variantId);
        }
      }
    } else {
      customer = subscription.customer;
      plan = subscription.plan;
      product = plan ? plan.product : null;
      if (subscription.lines && subscription.lines.length > 0) {
        variant = subscription.lines[0].variant;
      }
    }

    if (!subscription) {
      const error = new Error(`Subscription with ID '${subscriptionId}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // 2. Validate Status: Never generate invoices for PAUSED or CLOSED subscriptions
    if (subscription.status === SUBSCRIPTION_STATUSES.PAUSED) {
      const error = new Error(`Cannot generate invoice: Subscription '${subscription.subscriptionNumber}' is PAUSED. Resume subscription before billing.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (subscription.status === SUBSCRIPTION_STATUSES.CLOSED) {
      const error = new Error(`Cannot generate invoice: Subscription '${subscription.subscriptionNumber}' is CLOSED. Closed subscriptions cannot be billed.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 3. Determine Billing Period
    const billingPeriodStart = options.billingPeriodStart 
      ? new Date(options.billingPeriodStart) 
      : (subscription.lastBillingDate ? new Date(subscription.lastBillingDate) : new Date(subscription.startDate));

    const billingInterval = plan ? plan.billingInterval : 'MONTHLY';
    const intervalCount = plan ? plan.intervalCount : 1;

    const billingPeriodEnd = options.billingPeriodEnd
      ? new Date(options.billingPeriodEnd)
      : calculateNextBillingDate(billingPeriodStart, billingInterval, intervalCount);

    const startISO = billingPeriodStart.toISOString().split('T')[0];
    const endISO = billingPeriodEnd.toISOString().split('T')[0];

    // 4. Check for duplicate invoices for the same subscription and billing period
    const existingInvoices = await this.getInvoicesBySubscriptionId(subscription.id);
    const isDuplicate = existingInvoices.some(inv => {
      if (inv.status === INVOICE_STATUSES.CANCELLED) return false;
      if (inv.billingPeriodStart && inv.billingPeriodEnd) {
        const invStartISO = new Date(inv.billingPeriodStart).toISOString().split('T')[0];
        const invEndISO = new Date(inv.billingPeriodEnd).toISOString().split('T')[0];
        return invStartISO === startISO && invEndISO === endISO;
      }
      return false;
    });

    if (isDuplicate) {
      const error = new Error(`Duplicate invoice rejected: An active invoice already exists for subscription '${subscription.subscriptionNumber}' for billing period ${startISO} to ${endISO}`);
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    // 5. Calculate Subtotal, Discounts, and Taxes
    const quantity = Math.max(1, subscription.quantity || 1);
    let unitPrice = 0;

    if (subscription.unitPrice) {
      unitPrice = parseFloat(subscription.unitPrice);
    } else if (plan) {
      unitPrice = parseFloat(plan.price);
      if (variant && variant.priceExtra) {
        unitPrice += parseFloat(variant.priceExtra);
      }
    } else if (product) {
      unitPrice = parseFloat(product.salesPrice);
    }

    // Resolve Discount
    const discountResolution = await taxDiscountService.resolveDiscount({
      discountCode: options.discountCode || subscription.discountCode,
      discountType: options.discountType,
      discountValue: options.discountValue,
      subtotal: unitPrice * quantity,
      quantity,
      productId: product ? product.id : null
    });

    // Resolve Tax
    let effectiveTaxRate = 18.00;
    if (options.taxRatePercentage !== undefined) {
      effectiveTaxRate = parseFloat(options.taxRatePercentage);
    } else {
      const defaultTax = await taxDiscountService.getDefaultTaxRule();
      if (defaultTax) {
        effectiveTaxRate = parseFloat(defaultTax.ratePercentage);
      }
    }

    const pricing = calculatePricing({
      unitPrice,
      quantity,
      discountType: discountResolution.discountType,
      discountValue: discountResolution.discountValue,
      taxRatePercentage: effectiveTaxRate
    });

    // 6. Generate Dates & Numbers
    const issuedDate = options.issuedDate ? new Date(options.issuedDate) : new Date();
    const dueDate = options.dueDate 
      ? new Date(options.dueDate) 
      : calculateDueDate(issuedDate, subscription.paymentTerms || 'Net 30');

    const nextBillingCycleDate = calculateNextBillingDate(billingPeriodEnd, billingInterval, intervalCount);

    const description = options.description || 
      `${product ? product.name : 'Subscription'}${variant ? ` (${variant.variantName})` : ''} - Plan: ${plan ? plan.name : 'Recurring'}`;

    const notes = options.notes || `Billing period: ${startISO} to ${endISO}. Payment terms: ${subscription.paymentTerms || 'Net 30'}.`;

    // 7. Database Transaction for Invoice Creation
    if (getIsDbConnected() && prisma) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Generate unique invoice number
          const year = new Date().getFullYear();
          const count = await tx.invoice.count();
          const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

          const invoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              subscriptionId: subscription.id,
              customerId: subscription.customerId,
              status: INVOICE_STATUSES.UNPAID,
              subtotal: pricing.subtotal,
              discountTotal: pricing.discountAmount,
              taxTotal: pricing.taxAmount,
              totalAmount: pricing.totalAmount,
              paidAmount: 0.00,
              outstandingAmount: pricing.totalAmount,
              billingPeriodStart,
              billingPeriodEnd,
              issuedDate,
              dueDate,
              notes,
              lines: {
                create: [
                  {
                    productId: product ? product.id : null,
                    variantId: variant ? variant.id : null,
                    description,
                    quantity,
                    unitPrice: pricing.unitPrice,
                    taxAmount: pricing.taxAmount,
                    discountAmount: pricing.discountAmount,
                    lineTotal: pricing.totalAmount
                  }
                ]
              }
            },
            include: {
              lines: true,
              customer: {
                select: { id: true, email: true, firstName: true, lastName: true, companyName: true }
              },
              subscription: true
            }
          });

          // Update subscription next billing date & last billing date
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              lastBillingDate: issuedDate,
              nextBillingDate: nextBillingCycleDate,
              updatedAt: new Date()
            }
          });

          return invoice;
        });

        logger.info(`Invoice ${result.invoiceNumber} generated successfully for subscription ${subscription.subscriptionNumber}`);
        return result;
      } catch (err) {
        logger.warn('Prisma transaction for invoice creation failed, falling back to inMemoryStore:', err.message);
      }
    }

    // In-Memory Fallback Implementation
    const invoiceId = inMemoryStore.generateId();
    const invoiceNumber = inMemoryStore.generateInvoiceNumber();

    const invoiceLines = [
      {
        id: inMemoryStore.generateId(),
        invoiceId,
        productId: product ? product.id : null,
        variantId: variant ? variant.id : null,
        description,
        quantity,
        unitPrice: pricing.unitPrice,
        taxAmount: pricing.taxAmount,
        discountAmount: pricing.discountAmount,
        lineTotal: pricing.totalAmount,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const invoiceObj = {
      id: invoiceId,
      invoiceNumber,
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      status: INVOICE_STATUSES.UNPAID,
      subtotal: pricing.subtotal,
      discountTotal: pricing.discountAmount,
      taxTotal: pricing.taxAmount,
      totalAmount: pricing.totalAmount,
      paidAmount: 0.00,
      outstandingAmount: pricing.totalAmount,
      billingPeriodStart,
      billingPeriodEnd,
      issuedDate,
      dueDate,
      paidAt: null,
      notes,
      lines: invoiceLines,
      customer: customer ? {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        companyName: customer.companyName
      } : null,
      subscription: {
        id: subscription.id,
        subscriptionNumber: subscription.subscriptionNumber,
        status: subscription.status
      },
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryStore.invoices.set(invoiceId, invoiceObj);
    for (const line of invoiceLines) {
      inMemoryStore.invoiceLines.set(line.id, line);
    }

    // Advance Next Billing Date on Subscription
    subscription.lastBillingDate = issuedDate;
    subscription.nextBillingDate = nextBillingCycleDate;
    subscription.updatedAt = new Date();
    inMemoryStore.subscriptions.set(subscription.id, subscription);

    return invoiceObj;
  }

  /**
   * Get all invoices with filtering and pagination
   */
  async getInvoices(filter = {}, requestingUser = null) {
    const page = Math.max(1, parseInt(filter.page, 10) || 1);
    const limit = Math.max(1, parseInt(filter.limit, 10) || 20);
    const skip = (page - 1) * limit;

    let targetCustomerId = filter.customerId;
    if (requestingUser && requestingUser.role === 'CUSTOMER') {
      targetCustomerId = requestingUser.id;
    }

    if (getIsDbConnected() && prisma) {
      try {
        const where = {};
        if (targetCustomerId) where.customerId = targetCustomerId;
        if (filter.subscriptionId) where.subscriptionId = filter.subscriptionId;
        if (filter.status) where.status = filter.status.toUpperCase();

        if (filter.search) {
          const s = filter.search.trim();
          where.OR = [
            { invoiceNumber: { contains: s, mode: 'insensitive' } },
            { customer: { email: { contains: s, mode: 'insensitive' } } },
            { customer: { firstName: { contains: s, mode: 'insensitive' } } },
            { customer: { lastName: { contains: s, mode: 'insensitive' } } }
          ];
        }

        const [total, items] = await Promise.all([
          prisma.invoice.count({ where }),
          prisma.invoice.findMany({
            where,
            include: {
              customer: {
                select: { id: true, email: true, firstName: true, lastName: true, companyName: true }
              },
              lines: true,
              payments: true
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
        logger.warn('Prisma getInvoices failed, checking inMemoryStore:', err.message);
      }
    }

    // In-Memory Filter
    let list = Array.from(inMemoryStore.invoices.values());

    if (targetCustomerId) {
      list = list.filter(inv => inv.customerId === targetCustomerId);
    }

    if (filter.subscriptionId) {
      list = list.filter(inv => inv.subscriptionId === filter.subscriptionId);
    }

    if (filter.status) {
      const statusUpper = filter.status.toUpperCase();
      list = list.filter(inv => inv.status === statusUpper);
    }

    if (filter.search) {
      const s = filter.search.toLowerCase().trim();
      list = list.filter(inv => {
        const numMatch = inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(s);
        const cust = inMemoryStore.users.get(inv.customerId);
        const nameMatch = cust && `${cust.firstName} ${cust.lastName} ${cust.email}`.toLowerCase().includes(s);
        return numMatch || nameMatch;
      });
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const paginatedItems = list.slice(skip, skip + limit).map(inv => {
      const payments = Array.from(inMemoryStore.payments.values()).filter(p => p.invoiceId === inv.id);
      return {
        ...inv,
        payments
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
   * Get single invoice details by ID
   */
  async getInvoiceById(id, requestingUser = null) {
    let invoice = null;

    if (getIsDbConnected() && prisma) {
      try {
        invoice = await prisma.invoice.findUnique({
          where: { id },
          include: {
            customer: {
              select: { id: true, email: true, firstName: true, lastName: true, companyName: true, phone: true }
            },
            subscription: {
              include: {
                plan: true
              }
            },
            lines: true,
            payments: {
              orderBy: { createdAt: 'desc' }
            }
          }
        });
      } catch (err) {
        logger.warn('Prisma getInvoiceById failed:', err.message);
      }
    }

    if (!invoice) {
      invoice = inMemoryStore.invoices.get(id);
      if (invoice) {
        const payments = Array.from(inMemoryStore.payments.values())
          .filter(p => p.invoiceId === id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        invoice = {
          ...invoice,
          customer: inMemoryStore.users.get(invoice.customerId),
          subscription: inMemoryStore.subscriptions.get(invoice.subscriptionId),
          payments
        };
      }
    }

    if (!invoice) {
      const error = new Error(`Invoice with ID '${id}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Role check: CUSTOMER can only view their own invoices
    if (requestingUser && requestingUser.role === 'CUSTOMER' && invoice.customerId !== requestingUser.id) {
      const error = new Error('You are not authorized to access this invoice');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return invoice;
  }

  /**
   * Get all invoices for a specific subscription
   */
  async getInvoicesBySubscriptionId(subscriptionId) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.invoice.findMany({
          where: { subscriptionId },
          include: {
            lines: true,
            payments: true
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getInvoicesBySubscriptionId failed:', err.message);
      }
    }

    return Array.from(inMemoryStore.invoices.values())
      .filter(inv => inv.subscriptionId === subscriptionId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

const invoiceService = new InvoiceService();
module.exports = invoiceService;
