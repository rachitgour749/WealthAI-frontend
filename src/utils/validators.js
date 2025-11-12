/**
 * Validation utility functions
 */

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate number is positive
 */
export const isPositiveNumber = (value) => {
  return !isNaN(value) && parseFloat(value) > 0;
};

/**
 * Validate number is in range
 */
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate integer
 */
export const isInteger = (value) => {
  return Number.isInteger(parseFloat(value));
};

/**
 * Validate config object
 */
export const validateConfig = (config) => {
  const errors = [];
  
  if (!isPositiveNumber(config.ema_short)) {
    errors.push('EMA Short must be a positive number');
  }
  
  if (!isPositiveNumber(config.ema_long)) {
    errors.push('EMA Long must be a positive number');
  }
  
  if (config.ema_short >= config.ema_long) {
    errors.push('EMA Short must be less than EMA Long');
  }
  
  if (!isPositiveNumber(config.supertrend_period)) {
    errors.push('Supertrend Period must be a positive number');
  }
  
  if (!isInRange(config.supertrend_stop_pct, 1, 50)) {
    errors.push('Supertrend Stop % must be between 1 and 50');
  }
  
  if (!isInteger(config.max_holdings) || !isInRange(config.max_holdings, 1, 20)) {
    errors.push('Max Holdings must be an integer between 1 and 20');
  }
  
  if (!isPositiveNumber(config.price_floor)) {
    errors.push('Price Floor must be a positive number');
  }
  
  if (!isPositiveNumber(config.liquidity_cr)) {
    errors.push('Liquidity must be a positive number');
  }
  
  return errors;
};

/**
 * Validate backtest request
 */
export const validateBacktestRequest = (request) => {
  const errors = [];
  
  if (!validateDate(request.start_date)) {
    errors.push('Invalid start date format');
  }
  
  if (!validateDate(request.end_date)) {
    errors.push('Invalid end date format');
  }
  
  if (new Date(request.start_date) >= new Date(request.end_date)) {
    errors.push('Start date must be before end date');
  }
  
  if (!isPositiveNumber(request.initial_capital)) {
    errors.push('Initial capital must be a positive number');
  }

  if (!request.symbols || !Array.isArray(request.symbols) || request.symbols.length === 0) {
    errors.push('Please select at least one stock symbol');
  }

  if (!isPositiveNumber(request.ema_short)) {
    errors.push('EMA (Short) must be a positive number');
  }

  if (!isPositiveNumber(request.ema_long)) {
    errors.push('EMA (Long) must be a positive number');
  }

  const emaShort = parseFloat(request.ema_short);
  const emaLong = parseFloat(request.ema_long);
  if (!isNaN(emaShort) && !isNaN(emaLong) && emaShort >= emaLong) {
    errors.push('EMA (Short) must be less than EMA (Long)');
  }

  if (
    !isInteger(request.max_holdings) ||
    !isInRange(request.max_holdings, 1, 20)
  ) {
    errors.push('Max Holdings must be an integer between 1 and 20');
  }
  
  return errors;
};

