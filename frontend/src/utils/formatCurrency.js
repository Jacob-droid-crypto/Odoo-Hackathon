/**
 * Currency Formatting Utility for Brightloop Software
 * Uses configured currency from API response or defaults to USD ($)
 */

export const formatCurrency = (amount, currencyCode = 'USD', symbol = '$') => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch (err) {
    return `${symbol || '$'}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const formatCompactNumber = (number) => {
  const num = typeof number === 'number' ? number : parseFloat(number) || 0;
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
};
