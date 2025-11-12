/**
 * Utility functions for formatting data
 */

/**
 * Format number as Indian currency
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '₹0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (absValue >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
};

/**
 * Format number as percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format number with commas
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Get color for P&L
 */
export const getPnLColor = (value) => {
  if (value > 0) return '#52c41a'; // green
  if (value < 0) return '#f5222d'; // red
  return '#8c8c8c'; // gray
};

/**
 * Get color class for P&L
 */
export const getPnLClass = (value) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

