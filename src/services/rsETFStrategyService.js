import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const rsETFStrategyService = {
  async runBacktest(params) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/rs-etf-strategy/backtests/run`,
        params,
        { 
          params: { user_id: params.user_id },
          timeout: 300000 // 5 minutes timeout for backtests
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error running RS ETF backtest:', error);
      throw error;
    }
  },

  async getBacktestResults(userId, limit = 50) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/rs-etf-strategy/backtests`,
        { 
          params: { user_id: userId, limit },
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching RS ETF backtest results:', error);
      throw error;
    }
  },

  async getBacktestResult(backtestId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/rs-etf-strategy/backtests/${backtestId}`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching RS ETF backtest result:', error);
      throw error;
    }
  },

  async getAvailableETFs(universe = 'ALL_ETFS') {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/rs-etf-strategy/etfs/universe/${universe}`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching available ETFs:', error);
      throw error;
    }
  },

  async getETFData(symbol, startDate, endDate) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/rs-etf-strategy/market-data/etf/${symbol}`,
        { 
          params: { 
            start_date: startDate, 
            end_date: endDate 
          },
          timeout: 30000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ETF data:', error);
      throw error;
    }
  },

  async calculateDateRange(tickers) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/rs-etf-strategy/date-range`,
        { tickers },
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating date range:', error);
      throw error;
    }
  }
};

