/**
 * Brightloop Software Currency Configuration and Formatting Utility
 * Centralizes currency configuration so it is not hardcoded across the application.
 */

const envCurrency = process.env.APP_CURRENCY || 'USD';
const envLocale = process.env.APP_LOCALE || 'en-US';

const CURRENCY_CONFIGS = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' }
};

const getCurrencyConfig = (currencyCode = envCurrency) => {
  const code = (currencyCode || 'USD').toUpperCase();
  return CURRENCY_CONFIGS[code] || {
    code,
    symbol: '$',
    name: code,
    locale: envLocale
  };
};

/**
 * Format numeric amount into localized currency string
 * @param {number|string} amount 
 * @param {string} currencyCode 
 * @returns {string}
 */
const formatCurrency = (amount, currencyCode = envCurrency) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const config = getCurrencyConfig(currencyCode);

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch (err) {
    return `${config.symbol}${num.toFixed(2)}`;
  }
};

module.exports = {
  getCurrencyConfig,
  formatCurrency,
  CURRENCY_CONFIGS,
  DEFAULT_CURRENCY: envCurrency
};
