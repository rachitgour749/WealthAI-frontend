import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Table, 
  Row, 
  Col, 
  Button, 
  DatePicker, 
  Space,
  Skeleton,
  message
} from 'antd';
import { useApp } from '../../context/RScontext';
import { useAuth } from '../../context/AuthContext';
import WebHook from '../WebHook';
import { formatDate } from '../../utils/dateFormatter';
import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const Results = ({ onSelectResult, onBackToSetup, isBacktestRunning = false }) => {
  const { backtests, loading } = useApp();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(null);
  
  // State management for deployment features
  const [isSaveStrategyPopupOpen, setIsSaveStrategyPopupOpen] = useState(false);
  const [isWebHookModalOpen, setIsWebHookModalOpen] = useState(false);
  const [isSavedStrategiesPopupOpen, setIsSavedStrategiesPopupOpen] = useState(false);
  const [customStrategyName, setCustomStrategyName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedBacktestForSave, setSelectedBacktestForSave] = useState(null);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [savedStrategiesLoading, setSavedStrategiesLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [webHookStrategyType, setWebHookStrategyType] = useState('');
  const [clientCheckboxes, setClientCheckboxes] = useState({});
  
  // Strategy Details Popup State
  const [isStrategyDetailsOpen, setIsStrategyDetailsOpen] = useState(false);
  const [selectedStrategyDetails, setSelectedStrategyDetails] = useState(null);

  // Save strategy function with stock universe
  const handleSaveStrategy = useCallback((backtest) => {
    setSelectedBacktestForSave(backtest);
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/:/g, '-');
    setCustomStrategyName(`RS Strategy - ${backtest.config_name} - ${timestamp}`);
    setIsSaveStrategyPopupOpen(true);
  }, []);

  const columns = useMemo(() => [
    {
      title: 'Strategy',
      dataIndex: 'config_name',
      key: 'config_name',
      render: (text, record) => {
        // Using custom configs now, so just show "Custom RS Strategy"
        return text || 'Custom RS Strategy';
      },
    },
    {
      title: 'Period',
      dataIndex: 'start_date',
      key: 'period',
      render: (start_date, record) => {
        const start = formatDate(start_date);
        const end = formatDate(record.end_date);
        return `${start} - ${end}`;
      },
    },
    {
      title: 'Return',
      dataIndex: 'total_return',
      key: 'total_return',
      render: (value) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {value ? value.toFixed(2) : '0.00'}%
        </span>
      ),
    },
    {
      title: 'Sharpe Ratio',
      dataIndex: 'sharpe_ratio',
      key: 'sharpe_ratio',
      render: (value) => value ? value.toFixed(2) : '-',
    },
    {
      title: 'Treynor Ratio',
      dataIndex: 'treynor_ratio',
      key: 'treynor_ratio',
      render: (value) => value ? `${value.toFixed(2)}%` : '-',
    },
    {
      title: 'Calmar Ratio',
      dataIndex: 'calmar_ratio',
      key: 'calmar_ratio',
      render: (value) => value ? value.toFixed(2) : '-',
    },
    {
      title: 'Max Drawdown',
      dataIndex: 'max_drawdown',
      key: 'max_drawdown',
      render: (value) => (
        <span className="text-red-600">
          {value ? value.toFixed(2) : '0.00'}%
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => onSelectResult(record.id)}
            disabled={isBacktestRunning}
            className={`bg-blue-600 border-0 ${isBacktestRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isBacktestRunning ? 'Backtest is running. Please wait...' : 'View Details'}
          >
            View Details
          </Button>
          <Button 
            type="default" 
            size="small"
            onClick={() => handleSaveStrategy(record)}
            className="bg-green-600 border-0 text-white"
            icon="💾"
          >
            Save Strategy
          </Button>
        </Space>
      ),
    },
  ], [isBacktestRunning, onSelectResult, handleSaveStrategy]);

  const filteredBacktests = backtests
    .filter(backtest => {
      if (!dateRange || dateRange.length !== 2) return true;
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      const backtestDate = dayjs(backtest.start_date);
      return backtestDate.isAfter(startDate) && backtestDate.isBefore(endDate);
    })
    .sort((a, b) => {
      // Sort by start_date in descending order (most recent first)
      return dayjs(b.start_date).valueOf() - dayjs(a.start_date).valueOf();
    });

  const getOverallStats = () => {
    if (!filteredBacktests.length) {
      return {
        totalBacktests: 0,
        averageReturn: 0,
        bestReturn: 0,
        worstReturn: 0,
        winRate: 0
      };
    }

    const returns = filteredBacktests.map(b => b.total_return || 0);
    const positiveReturns = returns.filter(r => r > 0);
    
    return {
      totalBacktests: filteredBacktests.length,
      averageReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
      bestReturn: Math.max(...returns),
      worstReturn: Math.min(...returns),
      winRate: (positiveReturns.length / returns.length) * 100
    };
  };

  const stats = getOverallStats();

  const saveStrategyParameters = async (customName) => {
    if (!selectedBacktestForSave) return;
    
    try {
      setSaveLoading(true);
      
      // Get strategy config to extract stock_universe
      // No longer using saved strategies - custom configs only
      const strategyConfig = null;
      
      const strategyParams = {
        strategy_name: customName,
        strategy_type: "rs_strategy",
        user_id: user.email,
        config_id: selectedBacktestForSave.config_id,
        backtest_id: selectedBacktestForSave.id,
        start_date: selectedBacktestForSave.start_date,
        end_date: selectedBacktestForSave.end_date,
        stock_universe: strategyConfig?.stock_universe || "NIFTY500", // Added stock universe
        backtest_results: {
          total_return: selectedBacktestForSave.total_return,
          cagr: selectedBacktestForSave.cagr,
          sharpe_ratio: selectedBacktestForSave.sharpe_ratio,
          max_drawdown: selectedBacktestForSave.max_drawdown,
          win_rate: selectedBacktestForSave.win_rate
        },
        strategy_config: {
          config_name: selectedBacktestForSave.config_name,
          main_index: strategyConfig?.main_index || "^NSEI",
          max_positions: strategyConfig?.max_positions || 20,
          position_size_pct: strategyConfig?.position_size_pct || 5.0,
          stop_loss_pct: strategyConfig?.stop_loss_pct || 15.0,
          total_capital: strategyConfig?.total_capital || 1000000.0,
          stock_universe: strategyConfig?.stock_universe || "NIFTY500" // Added here too
        },
        created_at: new Date().toISOString()
      };

      const response = await axios.post('/api/save-rs-strategy', strategyParams);
      
      if (response.data.success) {
        message.success('RS Strategy saved successfully!');
        setIsSaveStrategyPopupOpen(false);
        setCustomStrategyName('');
        setSelectedBacktestForSave(null);
        // Refresh saved strategies list
        fetchSavedStrategies();
      } else {
        message.error(response.data.message || 'Failed to save strategy');
      }
    } catch (error) {
      console.error('Save strategy error:', error);
      message.error('Failed to save strategy');
    } finally {
      setSaveLoading(false);
    }
  };

  // Fetch saved strategies
  const fetchSavedStrategies = async () => {
    try {
      setSavedStrategiesLoading(true);
      const response = await axios.get(`/api/get-saved-rs-strategies/${user.email}`);
      if (response.data.success) {
        setSavedStrategies(response.data.strategies);
      }
    } catch (error) {
      console.error('Failed to fetch saved strategies:', error);
      message.error('Failed to load saved strategies');
    } finally {
      setSavedStrategiesLoading(false);
    }
  };

  // Load saved strategy
  const loadSavedStrategy = (strategy) => {
    // Load strategy configuration and backtest results
    message.success('Strategy loaded successfully!');
    setIsSavedStrategiesPopupOpen(false);
  };


  // Handle stop strategy
  const handleStopStrategy = async (strategy) => {
    try {
      const response = await axios.post('/api/stop-rs-strategy', {
        strategy_id: strategy.id,
        user_id: user.email
      });
      
      if (response.data.success) {
        message.success('Strategy stopped successfully!');
        fetchSavedStrategies();
      } else {
        message.error(response.data.message || 'Failed to stop strategy');
      }
    } catch (error) {
      console.error('Stop strategy error:', error);
      message.error('Failed to stop strategy');
    }
  };

  // Handle restart strategy
  const handleRestartStrategy = async (strategy) => {
    try {
      const response = await axios.post('/api/restart-rs-strategy', {
        strategy_id: strategy.id,
        user_id: user.email
      });
      
      if (response.data.success) {
        message.success('Strategy restarted successfully!');
        fetchSavedStrategies();
      } else {
        message.error(response.data.message || 'Failed to restart strategy');
      }
    } catch (error) {
      console.error('Restart strategy error:', error);
      message.error('Failed to restart strategy');
    }
  };

  // Handle delete strategy
  const handleDeleteStrategy = async (strategy) => {
    try {
      const response = await axios.delete(`/api/delete-rs-strategy/${strategy.id}`);
      
      if (response.data.success) {
        message.success('Strategy deleted successfully!');
        fetchSavedStrategies();
      } else {
        message.error(response.data.message || 'Failed to delete strategy');
      }
    } catch (error) {
      console.error('Delete strategy error:', error);
      message.error('Failed to delete strategy');
    }
  };

  // Open strategy details
  const openStrategyDetails = (strategy) => {
    setSelectedStrategyDetails(strategy);
    setIsStrategyDetailsOpen(true);
    setIsSavedStrategiesPopupOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">

        {/* Strategy Configuration */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className='flex justify-end  mr-9
           mt-2  '>
            <button
              onClick={() => onBackToSetup && onBackToSetup()}
              className="flex  items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Strategy Setup
            </button>
          </div>
          {/* Progress Steps */}
          {/* <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: 'Results Overview', icon: '📊' },
                { step: 2, title: 'Performance Analysis', icon: '📈' },
                { step: 3, title: 'Strategy Comparison', icon: '⚖️' },
                { step: 4, title: 'Detailed View', icon: '🔍' }
              ].map((item, index) => (
                <React.Fragment key={item.step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${index < 2
                        ? 'bg-teal-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${index < 2 ? 'text-teal-600' : 'text-gray-500'
                        }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${index < 1 ? 'bg-teal-600' : 'bg-gray-200'
                        }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div> */}

          {/* Configuration Content */}
          <div className=" sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Results Overview */}
              {/* <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-teal-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                      📊
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Results Overview</h3>
                  </div>
                  
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-teal-200">
                        <div className="text-lg font-bold text-teal-600 mb-2">Performance Summary</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>• Total Backtests: {stats.totalBacktests}</div>
                          <div>• Average Return: {stats.averageReturn.toFixed(2)}%</div>
                          <div>• Best Performance: {stats.bestReturn.toFixed(2)}%</div>
                          <div>• Win Rate: {stats.winRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div> */}

              {/* Right Column - Date Range & Actions */}
              {/* <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                      📅
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Filter & Actions</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-800 font-medium mb-2 block">Date Range</label>
                      <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="MMM YYYY"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <Button 
                        className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                        icon="📥"
                      >
                        Export
                      </Button>
                      <Button 
                        type="primary" 
                        className="bg-blue-600 border-0"
                        icon="📤"
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Results Table */}
            <div >
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Backtest Results</h3>
                </div>
                <div className="p-6">
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : filteredBacktests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-gray-600">No backtest results found for the selected period</p>
                    </div>
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={filteredBacktests}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`
                      }}
                      className="results-table"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Strategy Popup */}
      {isSaveStrategyPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Save RS Strategy
                </h3>
                <button
                  onClick={() => {
                    setIsSaveStrategyPopupOpen(false);
                    setCustomStrategyName('');
                    setSelectedBacktestForSave(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label htmlFor="strategyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  id="strategyName"
                  value={customStrategyName}
                  onChange={(e) => setCustomStrategyName(e.target.value)}
                  placeholder="Enter strategy name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500">
                  Choose a descriptive name for your RS strategy.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsSaveStrategyPopupOpen(false);
                    setCustomStrategyName('');
                    setSelectedBacktestForSave(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    if (!customStrategyName.trim()) {
                      message.error('Please enter a strategy name');
                      return;
                    }
                    
                    setIsSaveStrategyPopupOpen(false);
                    await saveStrategyParameters(customStrategyName.trim());
                    setCustomStrategyName('');
                  }}
                  disabled={saveLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Strategy'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Strategies Popup */}
      {isSavedStrategiesPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Saved Strategy Instances</h2>
                <button
                  onClick={() => setIsSavedStrategiesPopupOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Strategies Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Universe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedStrategiesLoading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : savedStrategies.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No saved strategies found
                        </td>
                      </tr>
                    ) : (
                      savedStrategies.map((strategy) => (
                        <tr key={strategy.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{strategy.strategy_name}</div>
                            <div className="text-sm text-gray-500">{strategy.strategy_type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {strategy.stock_universe || 'NIFTY500'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {strategy.start_date ? formatDate(strategy.start_date) : '-'} - {strategy.end_date ? formatDate(strategy.end_date) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {strategy.backtest_results?.total_return?.toFixed(2) || 'N/A'}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              strategy.status === 'running' 
                                ? 'bg-green-100 text-green-800' 
                                : strategy.status === 'stop'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {strategy.status === 'running' ? 'Running' : 
                               strategy.status === 'stop' ? 'Stopped' : 'Not Deployed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openStrategyDetails(strategy)}
                                className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                              
                              <button
                                onClick={() => {
                                  loadSavedStrategy(strategy);
                                  setIsSavedStrategiesPopupOpen(false);
                                }}
                                className="flex items-center px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Load
                              </button>
                              
                              {/* Deploy Button - Only show if status is deploy */}
                              {strategy.status === 'deploy' && (
                                <button
                                  onClick={() => {
                                    setWebHookStrategyType('RS Strategy');
                                    setSelectedStrategy(strategy);
                                    setIsWebHookModalOpen(true);
                                    setIsSavedStrategiesPopupOpen(false);
                                  }}
                                  className="flex items-center px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                  Deploy
                                </button>
                              )}
                              
                              {/* Stop Button - Only show if status is running */}
                              {strategy.status === 'running' && (
                                <button
                                  onClick={() => handleStopStrategy(strategy)}
                                  className="flex items-center px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                  </svg>
                                  Stop
                                </button>
                              )}
                              
                              {/* Restart Button - Only show if status is stop */}
                              {strategy.status === 'stop' && (
                                <button
                                  onClick={() => handleRestartStrategy(strategy)}
                                  className="flex items-center px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Restart
                                </button>
                              )}
                              
                              {/* Delete Button - Always visible */}
                              <button
                                onClick={() => handleDeleteStrategy(strategy)}
                                className="flex items-center px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WebHook Modal for Deployment - Using existing WebHook component */}
      {isWebHookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[350px] max-h-[90vh] overflow-hidden px-[10px] py-[10px]">
            {/* WebHook Component */}
            <WebHook
              onClose={() => {
                setIsWebHookModalOpen(false);
                setSelectedStrategy(null);
              }}
              strategyType="RS Strategy"
              userEmail={user?.email || 'test@test.com'}
              selectedEtfs={selectedStrategy ? selectedStrategy.tickers : []}
              selectedStrategy={selectedStrategy}
              strategyParams={selectedStrategy ? {
                config_name: selectedStrategy.strategy_name,
                main_index: selectedStrategy.strategy_config?.main_index || "^NSEI",
                max_positions: selectedStrategy.strategy_config?.max_positions || 20,
                position_size_pct: selectedStrategy.strategy_config?.position_size_pct || 5.0,
                stop_loss_pct: selectedStrategy.strategy_config?.stop_loss_pct || 15.0,
                total_capital: selectedStrategy.strategy_config?.total_capital || 1000000.0,
                stock_universe: selectedStrategy.stock_universe || "NIFTY500"
              } : {
                config_name: "RS Strategy",
                main_index: "^NSEI",
                max_positions: 20,
                position_size_pct: 5.0,
                stop_loss_pct: 15.0,
                total_capital: 1000000.0,
                stock_universe: "NIFTY500"
              }}
              onDeploymentSuccess={() => {
                // Refresh saved strategies list after successful deployment
                fetchSavedStrategies();
                message.success('RS Strategy deployed successfully!');
              }}
            />
          </div>
        </div>
      )}

      {/* Strategy Details Popup */}
      {isStrategyDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10002] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Strategy Details</h2>
                <button
                  onClick={() => {
                    setIsStrategyDetailsOpen(false);
                    setSelectedStrategyDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Strategy Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategy Information</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedStrategyDetails?.strategy_name}</div>
                    <div><span className="font-medium">Type:</span> {selectedStrategyDetails?.strategy_type}</div>
                    <div><span className="font-medium">Stock Universe:</span> {selectedStrategyDetails?.stock_universe}</div>
                    <div><span className="font-medium">Period:</span> {selectedStrategyDetails?.start_date ? formatDate(selectedStrategyDetails.start_date) : '-'} - {selectedStrategyDetails?.end_date ? formatDate(selectedStrategyDetails.end_date) : '-'}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedStrategyDetails?.status === 'running' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedStrategyDetails?.status === 'stop'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedStrategyDetails?.status === 'running' ? 'Running' : 
                         selectedStrategyDetails?.status === 'stop' ? 'Stopped' : 'Not Deployed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Total Return:</span> {selectedStrategyDetails?.backtest_results?.total_return?.toFixed(2)}%</div>
                    <div><span className="font-medium">CAGR:</span> {selectedStrategyDetails?.backtest_results?.cagr?.toFixed(2)}%</div>
                    <div><span className="font-medium">Sharpe Ratio:</span> {selectedStrategyDetails?.backtest_results?.sharpe_ratio?.toFixed(2)}</div>
                    <div><span className="font-medium">Max Drawdown:</span> {selectedStrategyDetails?.backtest_results?.max_drawdown?.toFixed(2)}%</div>
                    {/* <div><span className="font-medium">Win Rate:</span> {selectedStrategyDetails?.backtest_results?.win_rate?.toFixed(2)}%</div> */}
                  </div>
                </div>
              </div>

              {/* Strategy Configuration */}
              {selectedStrategyDetails?.strategy_config && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategy Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-medium">Main Index:</span> {selectedStrategyDetails.strategy_config.main_index}</div>
                    <div><span className="font-medium">Max Positions:</span> {selectedStrategyDetails.strategy_config.max_positions}</div>
                    <div><span className="font-medium">Position Size:</span> {selectedStrategyDetails.strategy_config.position_size_pct}%</div>
                    <div><span className="font-medium">Stop Loss:</span> {selectedStrategyDetails.strategy_config.stop_loss_pct}%</div>
                    <div><span className="font-medium">Total Capital:</span> ₹{selectedStrategyDetails.strategy_config.total_capital?.toLocaleString()}</div>
                    <div><span className="font-medium">Stock Universe:</span> {selectedStrategyDetails.strategy_config.stock_universe}</div>
                  </div>
                </div>
              )}

              {/* Client Information */}
              {selectedStrategyDetails?.client_information_json && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
                  <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                    {(() => {
                      try {
                        // Check if it's already an object or a JSON string
                        const clientInfo = selectedStrategyDetails.client_information_json;
                        if (typeof clientInfo === 'string') {
                          return JSON.stringify(JSON.parse(clientInfo), null, 2);
                        } else if (typeof clientInfo === 'object') {
                          return JSON.stringify(clientInfo, null, 2);
                        } else {
                          return JSON.stringify({}, null, 2);
                        }
                      } catch (error) {
                        console.error('Error parsing client information:', error);
                        return 'Error displaying client information';
                      }
                    })()}
                  </pre>
                </div>
              )}

              {/* Webhook Information */}
              {selectedStrategyDetails?.webhook_url && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Webhook Information</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Webhook URL:</span> {selectedStrategyDetails.webhook_url}</div>
                    <div><span className="font-medium">Run ID:</span> {selectedStrategyDetails.run_id}</div>
                    <div><span className="font-medium">Created At:</span> {selectedStrategyDetails.created_at}</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    loadSavedStrategy(selectedStrategyDetails);
                    setIsStrategyDetailsOpen(false);
                    setSelectedStrategyDetails(null);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Load Strategy
                </button>
                
                {selectedStrategyDetails?.status !== 'running' && (
                  <button
                    onClick={() => {
                      setWebHookStrategyType('RS Strategy');
                      setSelectedStrategy(selectedStrategyDetails);
                      setIsWebHookModalOpen(true);
                      setIsStrategyDetailsOpen(false);
                      setSelectedStrategyDetails(null);
                    }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Deploy Strategy
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setIsStrategyDetailsOpen(false);
                    setSelectedStrategyDetails(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .results-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0) !important;
          border-bottom: 2px solid #e2e8f0 !important;
          font-weight: 600 !important;
        }
        .results-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        .results-table .ant-pagination .ant-pagination-item-active {
          background: linear-gradient(135deg, #3b82f6, #06b6d4) !important;
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default Results;