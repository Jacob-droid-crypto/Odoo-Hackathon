const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const logger = require('../utils/logger');
const { roundCurrency } = require('../utils/billingCalculator');
const { INVOICE_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS } = require('../constants/roles');

class PaymentService {
  /**
   * Record a payment against an invoice
   * 
   * Strict Rules:
   * 1. Calculate outstanding balance: totalAmount - sum(existing payments).
   * 2. Prevent recording payments exceeding outstanding balance.
   * 3. Support partial payments (status -> PARTIALLY_PAID).
   * 4. Full payment changes invoice status to PAID.
   * 5. Use database transactions for payment and invoice operations.
   */
  async recordPayment(data, requestingUser = null) {
    const {
      invoiceId,
      amount,
      paymentMethod = PAYMENT_METHODS.CREDIT_CARD,
      referenceNote = null,
      paymentDate = new Date()
    } = data;

    const paymentAmount = roundCurrency(parseFloat(amount));
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      const error = new Error('Payment amount must be greater than zero');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 1. Fetch Invoice
    let invoice = null;
    let existingPayments = [];

    if (getIsDbConnected() && prisma) {
      try {
        invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: {
            customer: true,
            payments: {
              where: { status: PAYMENT_STATUSES.COMPLETED }
            }
          }
        });
        if (invoice) {
          existingPayments = invoice.payments || [];
        }
      } catch (err) {
        logger.warn('Prisma invoice lookup failed, checking inMemoryStore:', err.message);
      }
    }

    if (!invoice) {
      invoice = inMemoryStore.invoices.get(invoiceId);
      if (invoice) {
        existingPayments = Array.from(inMemoryStore.payments.values())
          .filter(p => p.invoiceId === invoiceId && p.status === PAYMENT_STATUSES.COMPLETED);
      }
    }

    if (!invoice) {
      const error = new Error(`Invoice with ID '${invoiceId}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // 2. Authorization check: Customer can only pay their own invoice
    if (requestingUser && requestingUser.role === 'CUSTOMER' && invoice.customerId !== requestingUser.id) {
      const error = new Error('You are not authorized to record payments for this invoice');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    // 3. Status checks
    if (invoice.status === INVOICE_STATUSES.CANCELLED) {
      const error = new Error(`Cannot record payment: Invoice '${invoice.invoiceNumber}' is CANCELLED`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (invoice.status === INVOICE_STATUSES.PAID) {
      const error = new Error(`Cannot record payment: Invoice '${invoice.invoiceNumber}' has already been paid in full`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 4. Calculate existing paid and outstanding balance
    const totalAmount = roundCurrency(parseFloat(invoice.totalAmount));
    const currentPaid = roundCurrency(
      existingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    );
    const outstandingBalance = roundCurrency(Math.max(0, totalAmount - currentPaid));

    if (outstandingBalance <= 0) {
      const error = new Error(`Invoice '${invoice.invoiceNumber}' has an outstanding balance of 0. No payment is required.`);
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 5. Validation: Payment cannot exceed outstanding balance
    if (paymentAmount > outstandingBalance) {
      const error = new Error(
        `Payment amount of ₹${paymentAmount.toFixed(2)} exceeds the invoice outstanding balance of ₹${outstandingBalance.toFixed(2)}`
      );
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // 6. Determine new status
    const newTotalPaid = roundCurrency(currentPaid + paymentAmount);
    const newOutstandingBalance = roundCurrency(Math.max(0, totalAmount - newTotalPaid));
    const isFullyPaid = newOutstandingBalance <= 0;
    const nextInvoiceStatus = isFullyPaid ? INVOICE_STATUSES.PAID : INVOICE_STATUSES.PARTIALLY_PAID;
    const paidAt = isFullyPaid ? new Date() : null;

    // Normalizing payment method enum
    const methodUpper = paymentMethod ? paymentMethod.toUpperCase().replace(/\s+/g, '_') : 'CREDIT_CARD';
    const validMethod = PAYMENT_METHODS[methodUpper] || methodUpper;

    // 7. Database Transaction for Payment Creation & Invoice Update
    if (getIsDbConnected() && prisma) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          const year = new Date().getFullYear();
          const pCount = await tx.payment.count();
          const paymentNumber = `PAY-${year}-${String(pCount + 1).padStart(4, '0')}`;

          const payment = await tx.payment.create({
            data: {
              paymentNumber,
              invoiceId: invoice.id,
              customerId: invoice.customerId,
              amount: paymentAmount,
              paymentMethod: validMethod,
              status: PAYMENT_STATUSES.COMPLETED,
              paymentDate: new Date(paymentDate),
              referenceNote: referenceNote || null
            }
          });

          const updatedInvoice = await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              status: nextInvoiceStatus,
              paidAmount: newTotalPaid,
              outstandingAmount: newOutstandingBalance,
              paidAt,
              updatedAt: new Date()
            },
            include: {
              payments: true
            }
          });

          return { payment, invoice: updatedInvoice };
        });

        logger.info(`Payment ${result.payment.paymentNumber} of ₹${paymentAmount} recorded for invoice ${invoice.invoiceNumber}. New status: ${nextInvoiceStatus}`);
        return {
          payment: result.payment,
          invoiceSummary: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            totalAmount,
            paidAmount: newTotalPaid,
            outstandingBalance: newOutstandingBalance,
            status: nextInvoiceStatus,
            isFullyPaid
          }
        };
      } catch (err) {
        logger.warn('Prisma transaction for payment failed, falling back to inMemoryStore:', err.message);
      }
    }

    // In-Memory Fallback
    const paymentId = inMemoryStore.generateId();
    const paymentNumber = inMemoryStore.generatePaymentNumber();

    const paymentObj = {
      id: paymentId,
      paymentNumber,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: paymentAmount,
      paymentMethod: validMethod,
      status: PAYMENT_STATUSES.COMPLETED,
      paymentDate: new Date(paymentDate),
      referenceNote: referenceNote || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryStore.payments.set(paymentId, paymentObj);

    // Update Invoice in Memory
    invoice.paidAmount = newTotalPaid;
    invoice.outstandingAmount = newOutstandingBalance;
    invoice.status = nextInvoiceStatus;
    invoice.paidAt = paidAt;
    invoice.updatedAt = new Date();
    inMemoryStore.invoices.set(invoice.id, invoice);

    return {
      payment: paymentObj,
      invoiceSummary: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount,
        paidAmount: newTotalPaid,
        outstandingBalance: newOutstandingBalance,
        status: nextInvoiceStatus,
        isFullyPaid
      }
    };
  }

  /**
   * Get all payments with filtering and pagination
   */
  async getPayments(query = {}, requestingUser = null) {
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
        if (query.invoiceId) where.invoiceId = query.invoiceId;
        if (query.status) where.status = query.status.toUpperCase();
        if (query.paymentMethod) where.paymentMethod = query.paymentMethod.toUpperCase();

        const [total, items] = await Promise.all([
          prisma.payment.count({ where }),
          prisma.payment.findMany({
            where,
            include: {
              customer: {
                select: { id: true, email: true, firstName: true, lastName: true, companyName: true }
              },
              invoice: {
                select: { id: true, invoiceNumber: true, totalAmount: true, status: true }
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
        logger.warn('Prisma getPayments failed, checking inMemoryStore:', err.message);
      }
    }

    // In-Memory Filter
    let list = Array.from(inMemoryStore.payments.values());

    if (targetCustomerId) {
      list = list.filter(p => p.customerId === targetCustomerId);
    }

    if (query.invoiceId) {
      list = list.filter(p => p.invoiceId === query.invoiceId);
    }

    if (query.status) {
      const st = query.status.toUpperCase();
      list = list.filter(p => p.status === st);
    }

    if (query.paymentMethod) {
      const pm = query.paymentMethod.toUpperCase();
      list = list.filter(p => p.paymentMethod === pm);
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const paginatedItems = list.slice(skip, skip + limit).map(p => {
      const cust = inMemoryStore.users.get(p.customerId);
      const inv = inMemoryStore.invoices.get(p.invoiceId);
      return {
        ...p,
        customer: cust ? {
          id: cust.id,
          email: cust.email,
          firstName: cust.firstName,
          lastName: cust.lastName,
          companyName: cust.companyName
        } : null,
        invoice: inv ? {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          totalAmount: inv.totalAmount,
          status: inv.status
        } : null
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
   * Get single payment by ID
   */
  async getPaymentById(id, requestingUser = null) {
    let payment = null;

    if (getIsDbConnected() && prisma) {
      try {
        payment = await prisma.payment.findUnique({
          where: { id },
          include: {
            customer: true,
            invoice: true
          }
        });
      } catch (err) {
        logger.warn('Prisma getPaymentById failed:', err.message);
      }
    }

    if (!payment) {
      payment = inMemoryStore.payments.get(id);
      if (payment) {
        payment = {
          ...payment,
          customer: inMemoryStore.users.get(payment.customerId),
          invoice: inMemoryStore.invoices.get(payment.invoiceId)
        };
      }
    }

    if (!payment) {
      const error = new Error(`Payment with ID '${id}' was not found`);
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (requestingUser && requestingUser.role === 'CUSTOMER' && payment.customerId !== requestingUser.id) {
      const error = new Error('You are not authorized to view this payment');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    return payment;
  }

  /**
   * Get all payments for a specific invoice
   */
  async getPaymentsByInvoiceId(invoiceId) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.payment.findMany({
          where: { invoiceId },
          orderBy: { createdAt: 'desc' }
        });
      } catch (err) {
        logger.warn('Prisma getPaymentsByInvoiceId failed:', err.message);
      }
    }

    return Array.from(inMemoryStore.payments.values())
      .filter(p => p.invoiceId === invoiceId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get all payments for a customer
   */
  async getPaymentsByCustomerId(customerId) {
    return this.getPayments({ customerId });
  }
}

const paymentService = new PaymentService();
module.exports = paymentService;
