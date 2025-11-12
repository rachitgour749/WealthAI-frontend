import React, { createContext, useContext } from 'react';

// Create the API context
const ApiContext = createContext();

// API configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  // BASE_URL: 'https://api.wealthai1.in',
  ENDPOINTS: {
    RATE: '/api/rate',
    CHAT: '/api/chat',
    USER_HISTORY: '/api/user-history',
    USER_PROMPTS: '/api/user-prompts',
    CUSTOM: '/custom',
    SAVE_JSON: '/api/save-json',
    SAVED_JSON: '/api/saved-json',
    STOCKS_METRICS: '/api/stocks/metrics/',
    NIFTY50_METRICS: '/api/nifty50-metrics',
    COSTS_SUMMARY: '/api/costs/summary',
    COSTS_ANALYSIS: '/api/costs/analysis',
    COSTS_BREAKDOWN: '/api/costs/breakdown',
    STOCKS_COSTS_SUMMARY: '/api/stocks/costs/summary',
    STOCKS_COSTS_ANALYSIS: '/api/stocks/costs/analysis',
    STOCKS_COSTS_BREAKDOWN: '/api/stocks/costs/breakdown',
    TRADE_EXECUTION_STATUS: '/api/trade-execution-status',
    SKIPPED_TRADES: '/api/skipped-trades',
    ETFS: '/api/etfs',
    ETFS_OVERVIEW: '/api/etfs/overview',
    ETFS_DATE_RANGE: '/api/etfs/date-range',
    METRICS: '/api/metrics',
    TRANSACTION_LOG: '/api/transaction-log',
    TRANSACTION_COSTS: '/api/transaction-costs',
    SAVE_STRATEGY: '/api/save-strategy',
    STOCKS: '/api/stocks',
    STOCKS_OVERVIEW: '/api/stocks/overview',
    STOCKS_TRADE_EXECUTION_STATUS: '/api/stocks/trade-execution-status',
    STOCKS_SKIPPED_TRADES: '/api/stocks/skipped-trades',
    GET_SAVED_STRATEGIES_LIST: '/api/get-saved-strategies-list',
    STOCKS_GET_SAVED_STRATEGIES_LIST: '/api/stocks/get-saved-strategies-list',
    STOCKS_TRANSACTION_LOG: '/api/stocks/transaction-log',
    STOCKS_TRANSACTION_COSTS: '/api/stocks/transaction-costs',
    STOCKS_DATE_RANGE: '/api/stocks/date-range',
    STOCKS_SAVE_STRATEGY: '/api/stocks/save-strategy'
  }
};

// Provider component
export const ApiProvider = ({ children }) => {
  const value = {
    baseUrl: API_CONFIG.BASE_URL,
    endpoints: API_CONFIG.ENDPOINTS,
    // Helper function to build full URL
    buildUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
    // Helper function to build API URL
    buildApiUrl: (endpoint) => {
      const endpointPath = API_CONFIG.ENDPOINTS[endpoint];
      if (!endpointPath) {
        console.error(`Endpoint '${endpoint}' not found in API_CONFIG.ENDPOINTS`);
        return `${API_CONFIG.BASE_URL}/api/unknown-endpoint`;
      }
      return `${API_CONFIG.BASE_URL}${endpointPath}`;
    }
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export default ApiContext;
