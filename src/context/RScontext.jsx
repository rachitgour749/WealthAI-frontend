import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api.js';

const AppContext = createContext();

const initialState = {
  loading: false,
  error: null,
  backtests: [],
  selectedBacktest: null,
  marketData: {
    nifty500Symbols: [],
    stockData: {},
    indexData: {}
  },
  user: {
    isAuthenticated: false,
    preferences: {}
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_BACKTESTS':
      return { ...state, backtests: action.payload };
    
    case 'ADD_BACKTEST':
      return { ...state, backtests: [action.payload, ...state.backtests] };
    
    case 'SELECT_BACKTEST':
      return { ...state, selectedBacktest: action.payload };
    
    case 'SET_MARKET_DATA':
      return {
        ...state,
        marketData: { ...state.marketData, ...action.payload }
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();


  console.log(user);

  // API base URL (use REACT_APP_API_URL if provided; otherwise default to production API)
  // Note: keep base as root so axios requests using relative paths work across the app



  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.timeout = 0; // No timeout limit - wait indefinitely for backend response
    
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        return config;
      },
      (error) => {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        dispatch({ type: 'SET_LOADING', payload: false });
        return response;
      },
      (error) => {
        dispatch({ type: 'SET_LOADING', payload: false });
        const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return Promise.reject(error);
      }
    );
  }, [API_BASE_URL]);

  // API functions with useCallback to prevent infinite loops
  const loadBacktests = useCallback(async () => {
    if (!user?.email) return;
    try {
      const response = await axios.get('/api/rs-strategy/backtests', {
        params: { user_id: user.email }
      });
      dispatch({ type: 'SET_BACKTESTS', payload: response.data });
    } catch (error) {
      console.error('Failed to load backtests:', error);
    }
  }, [user?.email]);

  const loadNifty500Symbols = useCallback(async () => {
    try {
      const response = await axios.get('/api/rs-strategy/market-data/symbols');
      dispatch({ 
        type: 'SET_MARKET_DATA', 
        payload: { nifty500Symbols: response.data } 
      });
    } catch (error) {
      console.error('Failed to load Nifty 500 symbols:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadBacktests();
    loadNifty500Symbols();
  }, [loadBacktests, loadNifty500Symbols]);

  const runBacktest = async (backtestData) => {
    if (!user?.email) throw new Error('User not authenticated');
    try {
      // BacktestData now contains all config parameters directly (no config_id needed)
      const response = await axios.post('/api/rs-strategy/backtests/run', backtestData, {
        params: { user_id: user.email }
      });
      if (response.data.backtest_id) {
        // Reload backtests to get the new one
        await loadBacktests();
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getBacktestDetails = async (backtestId) => {
    if (!user?.email) throw new Error('User not authenticated');
    try {
      const response = await axios.get(`/api/rs-strategy/backtests/${backtestId}`, {
        params: { user_id: user.email }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getBacktestTrades = async (backtestId) => {
    if (!user?.email) throw new Error('User not authenticated');
    try {
      const response = await axios.get(`/api/rs-strategy/backtests/${backtestId}/trades`, {
        params: { user_id: user.email }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getBacktestPortfolio = async (backtestId) => {
    if (!user?.email) throw new Error('User not authenticated');
    try {
      const response = await axios.get(`/api/rs-strategy/backtests/${backtestId}/portfolio`, {
        params: { user_id: user.email }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getBacktestCosts = async (backtestId) => {
    if (!user?.email) throw new Error('User not authenticated');
    try {
      const response = await axios.get(`/api/rs-strategy/backtests/${backtestId}/costs`, {
        params: { user_id: user.email }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getStockData = async (symbol, startDate, endDate) => {
    if (!user?.email) throw new Error('User not authenticated');
    try {
      const response = await axios.get(`/api/rs-strategy/market-data/stock/${symbol}`, {
        params: { 
          start_date: startDate, 
          end_date: endDate,
          user_id: user.email
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getIndexData = async (indexSymbol, startDate, endDate) => {
    if (!user?.email) throw new Error('User not authenticated');
    try {
      const response = await axios.get(`/api/rs-strategy/market-data/index/${indexSymbol}`, {
        params: { 
          start_date: startDate, 
          end_date: endDate,
          user_id: user.email
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const selectBacktest = (backtest) => {
    dispatch({ type: 'SELECT_BACKTEST', payload: backtest });
  };

  const value = {
    ...state,
    // API functions
    loadBacktests,
    runBacktest,
    getBacktestDetails,
    getBacktestTrades,
    getBacktestPortfolio,
    getBacktestCosts,
    getStockData,
    getIndexData,
    loadNifty500Symbols,
    // Utility functions
    clearError,
    selectBacktest,
    // Constants
    API_BASE_URL
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

