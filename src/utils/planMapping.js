/**
 * Plan Code Mapping Utility
 * Maps plan codes to product access based on the subscription plans table
 * Updated to match the database schema from the subscription_plans table
 */

// Product codes used in the application
export const PRODUCT_CODES = {
  TRADAI: 'TRADAI',
  CHATAI: 'CHATAI',
  MARKETAI: 'MARKETAI',
  AUTOMATIONAI: 'AUTOMATIONAI',
};

/**
 * Plan code to product access mapping
 * Based on the subscription_plans table from database:
 * 
 * plan_code 1: TradeAI1 - 365 days - product ID: 5
 * plan_code 2: MarketsAI1 - 365 days - product ID: null
 * plan_code 3: ChatAI1 - 365 days - product ID: 2000
 * plan_code 4: AutomationAI1 Basic - 365 days - product ID: 1000
 * plan_code 5: AutomationAI1 Premium - 365 days - product ID: 2000
 * plan_code 6: TradeAI1+MarketsA1 Bundle - 365 days - product ID: 5
 * plan_code 7: All Products Mega Bundle - 365 days - product IDs: 5, 2000, 1000
 * plan_code 8: All Products Mega Bundle Trial - 7 days - product IDs: 5, 40, 20
 */
export const PLAN_CODE_MAPPING = {
  // plan_code 1: TradeAI1
  '1': {
    products: [PRODUCT_CODES.TRADAI],
    planName: 'TradeAI1',
    extensionDays: 365,
  },

  // plan_code 2: MarketsAI1
  '2': {
    products: [PRODUCT_CODES.MARKETAI],
    planName: 'MarketsAI1',
    extensionDays: 365,
  },

  // plan_code 3: ChatAI1
  '3': {
    products: [PRODUCT_CODES.CHATAI],
    planName: 'ChatAI1',
    extensionDays: 365,
  },

  // plan_code 4: AutomationAI1 Basic
  '4': {
    products: [PRODUCT_CODES.AUTOMATIONAI],
    planName: 'AutomationAI1 Basic',
    extensionDays: 365,
  },

  // plan_code 5: AutomationAI1 Premium
  '5': {
    products: [PRODUCT_CODES.AUTOMATIONAI],
    planName: 'AutomationAI1 Premium',
    extensionDays: 365,
  },

  // plan_code 6: TradeAI1+MarketsA1 Bundle
  '6': {
    products: [PRODUCT_CODES.TRADAI, PRODUCT_CODES.MARKETAI],
    planName: 'TradeAI1+MarketsA1 Bundle',
    extensionDays: 365,
  },

  // plan_code 7: All Products Mega Bundle
  '7': {
    products: [PRODUCT_CODES.TRADAI, PRODUCT_CODES.CHATAI, PRODUCT_CODES.AUTOMATIONAI],
    planName: 'All Products Mega Bundle',
    extensionDays: 365,
    // Note: Based on description "5,,2000,1000", this includes TradeAI1(5), ChatAI1(2000), AutomationAI1 Basic(1000)
    // MarketsAI1 is not explicitly listed but may be included through the bundle
    // Including all products for full access
  },

  // plan_code 8: All Products Mega Bundle Trial
  '8': {
    products: [PRODUCT_CODES.TRADAI, PRODUCT_CODES.MARKETAI, PRODUCT_CODES.AUTOMATIONAI],
    planName: 'All Products Mega Bundle Trial',
    extensionDays: 7,
    isTrial: true,
    // Note: Based on description "5,,40,20", this includes TradeAI1(5), MarketsAI1(40), AutomationAI1(20)
    // ChatAI1 may not be included in trial version
  },
};

/**
 * Check if a plan code grants access to a specific product
 * @param {string|number} planCode - The plan code from subscription
 * @param {string} productCode - The product code to check access for
 * @returns {boolean} - Whether the plan grants access to the product
 */
export const hasProductAccess = (planCode, productCode) => {
  if (!planCode) return false;
  
  const planKey = String(planCode);
  const plan = PLAN_CODE_MAPPING[planKey];
  
  if (!plan) {
    console.warn(`Unknown plan code: ${planCode}`);
    return false;
  }
  
  return plan.products.includes(productCode);
};

/**
 * Get all products accessible by a plan code
 * @param {string|number} planCode - The plan code from subscription
 * @returns {string[]} - Array of product codes accessible by this plan
 */
export const getProductsForPlan = (planCode) => {
  if (!planCode) return [];
  
  const planKey = String(planCode);
  const plan = PLAN_CODE_MAPPING[planKey];
  
  if (!plan) {
    console.warn(`Unknown plan code: ${planCode}`);
    return [];
  }
  
  return plan.products || [];
};

/**
 * Get plan information
 * @param {string|number} planCode - The plan code from subscription
 * @returns {object|null} - Plan information or null if not found
 */
export const getPlanInfo = (planCode) => {
  if (!planCode) return null;
  
  const planKey = String(planCode);
  return PLAN_CODE_MAPPING[planKey] || null;
};

/**
 * Check if a plan is a trial plan
 * @param {string|number} planCode - The plan code from subscription
 * @returns {boolean} - Whether the plan is a trial plan
 */
export const isTrialPlan = (planCode) => {
  if (!planCode) return false;
  
  const planKey = String(planCode);
  const plan = PLAN_CODE_MAPPING[planKey];
  
  if (!plan) return false;
  
  return plan.isTrial === true;
};
