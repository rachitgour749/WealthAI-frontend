/**
 * Formats a date to the standard format: DD-MMM-YYYY (e.g., "12-Oct-2025")
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @returns {string} Formatted date string in DD-MMM-YYYY format
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Formats a date with time to the standard format: DD-MMM-YYYY HH:MM (e.g., "12-Oct-2025 14:30")
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @returns {string} Formatted date string with time
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date with time:', error);
    return 'N/A';
  }
};

/**
 * Formats a number in Indian currency format with rupee symbol and comma separation
 * Example: 1000000 -> "₹10,00,000"
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '';
  
  // Convert to number and remove any existing formatting
  const numAmount = typeof amount === 'string' 
    ? parseFloat(amount.toString().replace(/[₹,]/g, '')) 
    : parseFloat(amount);
  
  if (isNaN(numAmount)) return '';
  
  // Convert to string and split into integer and decimal parts
  const parts = numAmount.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1] : '';
  
  // Apply Indian numbering system (first comma after 3 digits from right, then every 2 digits)
  if (integerPart.length > 3) {
    // Get last 3 digits (thousands)
    const lastThree = integerPart.slice(-3);
    // Get remaining digits
    let remaining = integerPart.slice(0, -3);
    
    // Add commas every 2 digits in the remaining part (from right to left)
    if (remaining.length > 0) {
      let formattedRemaining = '';
      // Process remaining digits from right to left, grouping by 2
      for (let i = remaining.length - 1; i >= 0; i -= 2) {
        const start = Math.max(0, i - 1);
        const group = remaining.slice(start, i + 1);
        formattedRemaining = group + (formattedRemaining ? ',' + formattedRemaining : '');
      }
      
      integerPart = formattedRemaining + ',' + lastThree;
    } else {
      integerPart = lastThree;
    }
  }
  
  return `₹${integerPart}${decimalPart}`;
};

/**
 * Parses a formatted Indian currency string back to a number
 * Example: "₹10,00,000" -> 1000000
 * @param {string} formattedValue - The formatted currency string
 * @returns {number} Parsed numeric value
 */
export const parseIndianCurrency = (formattedValue) => {
  if (!formattedValue || formattedValue === '') return 0;
  
  // Remove rupee symbol, commas, and spaces
  const cleaned = formattedValue.toString().replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

