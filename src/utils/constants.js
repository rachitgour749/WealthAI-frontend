// RS Strategy Constants
export const RS_CONSTANTS = {
  // Default strategy parameters
  DEFAULT_RS_THRESHOLD: 0.5,
  DEFAULT_PROFIT_TARGET: 40,
  DEFAULT_STOP_LOSS: 8,
  DEFAULT_HOLDING_PERIOD: 120,
  DEFAULT_CASH_BUFFER: 0.05,
  
  // Market data constants
  NIFTY500_INDEX: '^NSEI',
  BENCHMARK_INDEX: '^NSEI',
  
  // Backtest constants
  DEFAULT_START_DATE: '2020-01-01',
  DEFAULT_END_DATE: new Date().toISOString().split('T')[0],
  
  // UI constants
  MAX_STRATEGIES_DISPLAY: 10,
  CHART_HEIGHT: 400,
  
  // API endpoints
  API_ENDPOINTS: {
    STRATEGIES: '/configs',
    BACKTESTS: '/backtests',
    MARKET_DATA: '/market-data'
  }
};

export const STRATEGY_TYPES = {
  RS_STRATEGY: 'rs_strategy',
  MOMENTUM_STRATEGY: 'momentum_strategy'
};

export const BACKTEST_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const STOCK_UNIVERSE_OPTIONS = [
  { value: 'NIFTY50', label: 'Nifty 50', description: 'Top 50 stocks by market cap' },
  { value: 'NIFTY100', label: 'Nifty 100', description: 'Top 100 stocks by market cap' },
  { value: 'NIFTY500', label: 'Nifty 500', description: 'Top 500 stocks by market cap' },
  
 
];
