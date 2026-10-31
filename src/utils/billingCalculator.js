/**
 * Brightloop Subscription & Billing Calculation Utilities
 * 
 * Implements strict financial formulas required for:
 * 1. Subtotal = Unit Price * Quantity
 * 2. Discount:
 *    - Percentage: Subtotal * (Percentage / 100)
 *    - Fixed: Min(FixedAmount, Subtotal)
 *    - Validation: 0 <= Percentage <= 100, Discount >= 0, Discount <= Subtotal
 * 3. Taxable Amount = Subtotal - Discount
 * 4. Tax Amount = Taxable Amount * (TaxRate / 100)
 * 5. Final Amount = Taxable Amount + Tax Amount
 * 6. Recurring billing interval date calculation
 */

const { BILLING_INTERVALS, DISCOUNT_TYPES } = require('../constants/roles');

/**
 * Rounds a number to exactly two decimal places for currency operations
 * @param {number|string} value 
 * @returns {number}
 */
const roundCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates next billing cycle date based on interval and count
 * @param {Date|string} fromDate 
 * @param {string} interval DAILY | WEEKLY | MONTHLY | YEARLY
 * @param {number} count 
 * @returns {Date}
 */
const calculateNextBillingDate = (fromDate = new Date(), interval = BILLING_INTERVALS.MONTHLY, count = 1) => {
  const baseDate = new Date(fromDate);
  const intervalCount = Math.max(1, parseInt(count, 10) || 1);
  const nextDate = new Date(baseDate.getTime());

  switch (interval) {
    case BILLING_INTERVALS.DAILY:
      nextDate.setDate(nextDate.getDate() + intervalCount);
      break;

    case BILLING_INTERVALS.WEEKLY:
      nextDate.setDate(nextDate.getDate() + (intervalCount * 7));
      break;

    case BILLING_INTERVALS.MONTHLY: {
      const currentDay = nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + intervalCount);
      // Handle edge cases like Jan 31 -> Feb 28/29
      if (nextDate.getDate() < currentDay) {
        nextDate.setDate(0);
      }
      break;
    }

    case BILLING_INTERVALS.YEARLY: {
      const currentYear = nextDate.getFullYear();
      nextDate.setFullYear(currentYear + intervalCount);
      break;
    }

    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate;
};

/**
 * Calculate due date based on issued date and payment terms
 * @param {Date|string} issuedDate 
 * @param {string} paymentTerms e.g. "Net 30", "Net 15", "Immediate"
 * @returns {Date}
 */
const calculateDueDate = (issuedDate = new Date(), paymentTerms = 'Net 30') => {
  const due = new Date(issuedDate);
  if (!paymentTerms) {
    due.setDate(due.getDate() + 30);
    return due;
  }

  const termsLower = paymentTerms.toLowerCase().trim();
  if (termsLower === 'immediate' || termsLower === 'due on receipt') {
    return due;
  }

  const match = termsLower.match(/net\s*(\d+)/i);
  if (match) {
    const days = parseInt(match[1], 10);
    due.setDate(due.getDate() + days);
    return due;
  }

  // Default to 30 days
  due.setDate(due.getDate() + 30);
  return due;
};

/**
 * Comprehensive pricing, discount, and tax calculation function
 * 
 * Formula:
 * Subtotal = Unit Price * Quantity
 * Taxable Amount = Subtotal - Discount
 * Tax Amount = Taxable Amount * (Tax Rate / 100)
 * Final Amount = Taxable Amount + Tax Amount
 * 
 * @param {Object} params
 * @param {number} params.unitPrice Base unit price of product/plan
 * @param {number} params.quantity Quantity of items
 * @param {string} [params.discountType] 'PERCENTAGE' or 'FIXED'
 * @param {number} [params.discountValue] Percentage (0-100) or Fixed currency amount
 * @param {number} [params.taxRatePercentage] Tax percentage (e.g. 18.00)
 * @returns {Object} Calculated line breakdown with rounded financial values
 */
const calculatePricing = ({
  unitPrice = 0,
  quantity = 1,
  discountType = null,
  discountValue = 0,
  taxRatePercentage = 18.00
}) => {
  const price = Math.max(0, parseFloat(unitPrice) || 0);
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const taxRate = Math.max(0, parseFloat(taxRatePercentage) || 0);

  // 1. Subtotal = Unit Price * Quantity
  const subtotal = roundCurrency(price * qty);

  // 2. Discount Calculation & Validation
  let discountAmount = 0;
  const rawDiscValue = parseFloat(discountValue) || 0;

  if (rawDiscValue < 0) {
    const error = new Error('Discount value cannot be negative');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  if (discountType === DISCOUNT_TYPES.PERCENTAGE || discountType === 'PERCENTAGE') {
    if (rawDiscValue > 100) {
      const error = new Error('Percentage discount cannot exceed 100%');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }
    // Percentage Discount: Subtotal * (Discount% / 100)
    discountAmount = roundCurrency(subtotal * (rawDiscValue / 100));
  } else if (discountType === DISCOUNT_TYPES.FIXED || discountType === 'FIXED') {
    // Fixed Discount: cannot exceed subtotal
    discountAmount = roundCurrency(Math.min(rawDiscValue, subtotal));
  }

  // Ensure discount does not exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  // 3. Taxable Amount = Subtotal - Discount
  const taxableAmount = roundCurrency(subtotal - discountAmount);

  // 4. Tax Amount = Taxable Amount * Tax Percentage / 100
  const taxAmount = roundCurrency(taxableAmount * (taxRate / 100));

  // 5. Final Payable Amount = Taxable Amount + Tax Amount
  const totalAmount = roundCurrency(taxableAmount + taxAmount);

  return {
    unitPrice: roundCurrency(price),
    quantity: qty,
    subtotal,
    discountType: discountType || null,
    discountValue: roundCurrency(rawDiscValue),
    discountAmount,
    taxableAmount,
    taxRatePercentage: roundCurrency(taxRate),
    taxAmount,
    totalAmount
  };
};

module.exports = {
  roundCurrency,
  calculateNextBillingDate,
  calculateDueDate,
  calculatePricing
};
