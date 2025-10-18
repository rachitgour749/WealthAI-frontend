import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

const initialState = {
  loading: false,
  error: null,
  strategies: [],
  backtests: [],
  selectedStrategy: null,
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
    
    case 'SET_STRATEGIES':
      return { ...state, strategies: action.payload };
    
    case 'ADD_STRATEGY':
      return { ...state, strategies: [...state.strategies, action.payload] };
    
    case 'UPDATE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    
    case 'DELETE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.filter(s => s.id !== action.payload)
      };
    
    case 'SET_BACKTESTS':
      return { ...state, backtests: action.payload };
    
    case 'ADD_BACKTEST':
      return { ...state, backtests: [action.payload, ...state.backtests] };
    
    case 'SELECT_STRATEGY':
      return { ...state, selectedStrategy: action.payload };
    
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

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/rs-strategy';

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
  const loadStrategies = useCallback(async () => {
    try {
      const response = await axios.get('/configs');
      dispatch({ type: 'SET_STRATEGIES', payload: response.data });
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  }, []);

  const loadBacktests = useCallback(async () => {
    try {
      const response = await axios.get('/backtests');
      dispatch({ type: 'SET_BACKTESTS', payload: response.data });
    } catch (error) {
      console.error('Failed to load backtests:', error);
    }
  }, []);

  const loadNifty500Symbols = useCallback(async () => {
    try {
      const response = await axios.get('/market-data/symbols');
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
    loadStrategies();
    loadBacktests();
    loadNifty500Symbols();
  }, [loadStrategies, loadBacktests, loadNifty500Symbols]);

  const createStrategy = async (strategyData) => {
    try {
      const response = await axios.post('/configs', strategyData);
      dispatch({ type: 'ADD_STRATEGY', payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateStrategy = async (id, strategyData) => {
    try {
      const response = await axios.put(`/configs/${id}`, strategyData);
      dispatch({ type: 'UPDATE_STRATEGY', payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteStrategy = async (id) => {
    try {
      await axios.delete(`/configs/${id}`);
      dispatch({ type: 'DELETE_STRATEGY', payload: id });
    } catch (error) {
      throw error;
    }
  };

  const runBacktest = async (backtestData) => {
    try {
      const response = await axios.post('/backtests/run', backtestData);
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
    try {
      const response = await axios.get(`/backtests/${backtestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getBacktestTrades = async (backtestId) => {
    try {
      const response = await axios.get(`/backtests/${backtestId}/trades`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getBacktestPortfolio = async (backtestId) => {
    try {
      const response = await axios.get(`/backtests/${backtestId}/portfolio`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getStockData = async (symbol, startDate, endDate) => {
    try {
      const response = await axios.get(`/market-data/stock/${symbol}`, {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getIndexData = async (indexSymbol, startDate, endDate) => {
    try {
      const response = await axios.get(`/market-data/index/${indexSymbol}`, {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const selectStrategy = (strategy) => {
    dispatch({ type: 'SELECT_STRATEGY', payload: strategy });
  };

  const selectBacktest = (backtest) => {
    dispatch({ type: 'SELECT_BACKTEST', payload: backtest });
  };

  const value = {
    ...state,
    // API functions
    loadStrategies,
    loadBacktests,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    runBacktest,
    getBacktestDetails,
    getBacktestTrades,
    getBacktestPortfolio,
    getStockData,
    getIndexData,
    loadNifty500Symbols,
    // Utility functions
    clearError,
    selectStrategy,
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

