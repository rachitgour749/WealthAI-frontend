import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Button, 
  Tag,
  Tabs,
  Table,
  message
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { rsETFStrategyService } from '../../services/rsETFStrategyService';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import WebHook from '../WebHook';
import {
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { formatDate } from '../../utils/dateFormatter';
import dayjs from 'dayjs';

// Removed unused Typography destructuring
const { TabPane } = Tabs;

const ResultDetailETF = ({ backtestResult, onBackToSetup, onBack, onNewBacktest }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for Save Strategy
  const [saveLoading, setSaveLoading] = useState(false);
  const [isCustomNamePopupOpen, setIsCustomNamePopupOpen] = useState(false);
  const [customStrategyName, setCustomStrategyName] = useState('');
  
  // Post-Save Deployment Popup State (after saving from backtest results)
  const [isPostSaveDeploymentPopupOpen, setIsPostSaveDeploymentPopupOpen] = useState(false);
  const [savedStrategyName, setSavedStrategyName] = useState('');
  const [recentlySavedStrategy, setRecentlySavedStrategy] = useState(null);
  
  // WebHook Modal State
  const [isWebHookModalOpen, setIsWebHookModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [webHookStrategyType, setWebHookStrategyType] = useState('RS Strategy');
  
  // Extract data directly from prop (in-memory, no database fetch)
  const rsMetrics = backtestResult?.rs_metrics || backtestResult?.results || {};
  const performanceData = backtestResult?.performance_data || {};
  const tradesData = backtestResult?.trades || backtestResult?.transaction_log || [];
  const portfolioSnapshots = backtestResult?.portfolio_snapshots || [];
  
  // Transform portfolio snapshots for chart display
  const portfolioData = performanceData.dates?.map((date, idx) => {
    const totalValue = performanceData.rs_strategy?.[idx] || portfolioSnapshots[idx]?.total_value || 0;
    const totalInvestment = backtestResult?.backtest_result?.total_investment || performanceData.cumulative_investment?.[idx] || 0;
    // Handle date string format (convert to Date object if needed)
    let dateObj = date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    }
    return {
      date: dateObj,
      total_value: totalValue,
      drawdown_pct: portfolioSnapshots[idx]?.drawdown_pct || 0,
      cumulative_pnl: totalValue - totalInvestment,
      cumulative_investment: totalInvestment,
      cash_balance: portfolioSnapshots[idx]?.cash_balance || 0
    };
  }) || [];
  
  // Calculate costs from trades
  const calculateCostsFromTrades = (trades) => {
    if (!trades || trades.length === 0) return null;
    
    const totalCosts = trades.reduce((sum, trade) => sum + (trade.total_costs || 0), 0);
    const totalBrokerage = trades.reduce((sum, trade) => sum + (trade.brokerage || 0), 0);
    const totalSTT = trades.reduce((sum, trade) => sum + (trade.stt || 0), 0);
    const totalStampDuty = trades.reduce((sum, trade) => sum + (trade.stamp_duty || 0), 0);
    const totalExchangeCharges = trades.reduce((sum, trade) => sum + (trade.exchange_charges || 0), 0);
    const totalSEBICharges = trades.reduce((sum, trade) => sum + (trade.sebi_charges || 0), 0);
    const totalGST = trades.reduce((sum, trade) => sum + (trade.gst || 0), 0);
    const totalVolume = trades.reduce((sum, trade) => sum + (trade.transaction_value || trade.amount || 0), 0);
    const totalTurnover = totalVolume;
    
    return {
      total_costs: totalCosts,
      total_brokerage: totalBrokerage,
      total_stt: totalSTT,
      total_stamp_duty: totalStampDuty,
      total_exchange_charges: totalExchangeCharges,
      total_sebi_charges: totalSEBICharges,
      total_gst: totalGST,
      total_volume: totalVolume,
      total_turnover: totalTurnover,
      cost_as_percent: totalVolume > 0 ? (totalCosts / totalVolume) * 100 : 0,
      cost_percentage: totalVolume > 0 ? (totalCosts / totalVolume) * 100 : 0,
      avg_cost_per_trade: trades.length > 0 ? totalCosts / trades.length : 0,
      return_impact_pct: backtestResult?.backtest_result?.total_investment > 0 
        ? (totalCosts / backtestResult.backtest_result.total_investment) * 100 
        : 0
    };
  };
  
  const costData = calculateCostsFromTrades(tradesData);
  
  // Use rsMetrics as detailedResults for compatibility with existing display code
  const detailedResults = {
    total_return: rsMetrics.total_return,
    cagr_pct: rsMetrics.cagr_pct,
    xirr_pct: rsMetrics.xirr_pct,
    sharpe_ratio: rsMetrics.sharpe_ratio,
    beta: rsMetrics.beta,
    treynor_ratio: rsMetrics.treynor_ratio,
    calmar_ratio: rsMetrics.calmar_ratio,
    max_drawdown: rsMetrics.max_drawdown,
    win_rate_pct: rsMetrics.win_rate_pct,
    total_trades: rsMetrics.total_trades,
    final_capital: rsMetrics.final_capital
  };
  
  const selectedBacktest = {
    start_date: performanceData.dates?.[0] || '',
    end_date: performanceData.dates?.[performanceData.dates.length - 1] || ''
  };
  
  const [loading] = useState(false);  // No loading needed for in-memory data

  const getStrategyName = () => {
    return 'RS Strategy Backtest';
  };

  // Handle Save Strategy
  const handleSaveStrategy = () => {
    // Set default name with timestamp
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/:/g, '-');
    setCustomStrategyName(`RS Strategy - ${timestamp}`);
    setIsCustomNamePopupOpen(true);
  };

  // Save Strategy Parameters
  const saveStrategyParameters = async (customName) => {
    try {
      setSaveLoading(true);

      // Extract dates from backtestResult first, then fallback to performance data
      const startDate = backtestResult?.start_date || performanceData.dates?.[0] || '';
      const endDate = backtestResult?.end_date || performanceData.dates?.[performanceData.dates.length - 1] || '';

      // Get backtest config if available, otherwise use defaults
      const configData = backtestResult?.config || {};
      
      const strategyParams = {
        strategy_name: customName,
        strategy_type: "rs_strategy",
        user_id: user?.email || '',
        start_date: startDate,
        end_date: endDate,
        stock_universe: configData.stock_universe || "RS_ETF_UNIVERSE",
        backtest_results: {
          total_return: rsMetrics.total_return || detailedResults.total_return || 0,
          cagr: rsMetrics.cagr_pct || detailedResults.cagr_pct || 0,
          sharpe_ratio: rsMetrics.sharpe_ratio || detailedResults.sharpe_ratio || 0,
          max_drawdown: rsMetrics.max_drawdown || detailedResults.max_drawdown || 0,
          win_rate: rsMetrics.win_rate_pct || detailedResults.win_rate_pct || 0
        },
        strategy_config: {
          config_name: customName,
          main_index: configData.main_index || "^NSEI",
          max_positions: configData.max_positions || 20,
          position_size_pct: configData.position_size_pct || 5.0,
          stop_loss_pct: configData.stop_loss_pct || 15.0,
          total_capital: configData.total_capital || backtestResult?.backtest_result?.total_investment || 1000000.0,
          stock_universe: configData.stock_universe || "RS_ETF_UNIVERSE",
          buffer_capital_pct: configData.buffer_capital_pct || 10.0,
          capital_reset_threshold_pct: configData.capital_reset_threshold_pct || 25.0,
          max_holding_period: configData.max_holding_period || 52,
          transaction_cost_pct: configData.transaction_cost_pct || 0.1,
          min_price: configData.min_price || 10.0,
          min_turnover: configData.min_turnover || 1000000.0
        },
        created_at: new Date().toISOString()
      };

      const response = await axios.post(`${API_BASE_URL}/api/save-rs-etf-strategy`, strategyParams);
      
      if (response.data.success) {
        message.success('RS Strategy saved successfully!');
        setSavedStrategyName(customName);
        
        // Fetch the saved strategy to get its ID and details
        const email = user?.email || '';
        const strategiesResponse = await axios.get(`${API_BASE_URL}/api/get-saved-rs-etf-strategies/${encodeURIComponent(email)}`);
        
        if (strategiesResponse.data && strategiesResponse.data.strategies) {
          // Find the just-saved strategy by name
          const savedStrategy = strategiesResponse.data.strategies.find(
            s => s.strategy_name === customName
          );
          
          if (savedStrategy) {
            setRecentlySavedStrategy(savedStrategy);
            setIsCustomNamePopupOpen(false);
            setIsPostSaveDeploymentPopupOpen(true);
            setCustomStrategyName('');
          }
        }
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

  // Handle New Backtest
  const handleNewBacktest = () => {
    if (onNewBacktest) {
      onNewBacktest(); // Clear config and start fresh
    } else if (onBackToSetup) {
      onBackToSetup(); // Fallback to regular back
    }
  };

  const chartData = portfolioData.map(snapshot => ({
    date: formatDate(snapshot.date),
    value: snapshot.total_value,
    drawdown: Math.abs(snapshot.drawdown_pct),
    pnl: snapshot.cumulative_pnl,
  }));

  if (!backtestResult || !detailedResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="empty-state">
            <h3>No Backtest Results</h3>
            <p>No backtest result data available.</p>
            <Button type="primary" onClick={() => onBackToSetup && onBackToSetup()}>
              Back to Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderMetricsCard = (title, value, subtitle = '') => {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">
            {subtitle}
          </div>
        )}
      </div>
    );
  };

  const renderPerformanceChart = () => {
    if (!portfolioData || portfolioData.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
          <div className="text-center text-gray-500 py-8">
            No performance data available. Please run a backtest first.
          </div>
        </div>
      );
    }

    const performanceData = backtestResult?.performance_data || {};
    const chartData = portfolioData.map((snapshot, idx) => ({
      date: formatDate(snapshot.date),
      'RS Strategy': snapshot.total_value,
      'Cumulative Investment': performanceData.cumulative_investment?.[idx] || snapshot.cumulative_investment || backtestResult?.backtest_result?.total_investment || 0,
    }));

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`}
            />
            <RechartsTooltip 
              formatter={(value, name) => [`₹${(value / 1000).toFixed(0)}K`, name]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="RS Strategy"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Cumulative Investment"
              stroke="#ff7f0e"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Backtest Results</h1>
            <p className="text-lg text-gray-600">{getStrategyName()} - Performance Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveStrategy}
              disabled={saveLoading}
              className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saveLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 mb-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Strategy
                </>
              )}
            </button>
            <button
              onClick={() => onBack && onBack()}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              ← Back to Strategies
            </button>
            <button
              onClick={() => onBackToSetup && onBackToSetup()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ← Back to Setup
            </button>
            <button
              onClick={handleNewBacktest}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              🔄 New Backtest
            </button>
          </div>
        </div>

        {/* Performance Chart */}
        {renderPerformanceChart()}

        {/* Key Metrics Cards */}
        {detailedResults && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {renderMetricsCard('Total Return', `${detailedResults.total_return?.toFixed(2) || '0.00'}%`)}
            {renderMetricsCard('CAGR', `${detailedResults.cagr_pct?.toFixed(2) || '0.00'}%`)}
            {renderMetricsCard('XIRR', `${detailedResults.xirr_pct?.toFixed(2) || '0.00'}%`)}
            {renderMetricsCard('Sharpe Ratio', detailedResults.sharpe_ratio?.toFixed(2) || '0.00')}
            {renderMetricsCard('Treynor Ratio', `${detailedResults.treynor_ratio?.toFixed(2) || '0.00'}%`)}
            {renderMetricsCard('Calmar Ratio', detailedResults.calmar_ratio?.toFixed(2) || '0.00')}
            {renderMetricsCard('Max Drawdown', `${detailedResults.max_drawdown?.toFixed(2) || '0.00'}%`)}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8">
          <Tabs defaultActiveKey="metrics" size="large">
            <TabPane 
              tab={
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Trades
                </span>
              } 
              key="trades"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Trade History</h3>
                </div>
                <div className="p-6">
                  <Table
                    dataSource={tradesData}
                    columns={[
                      {
                        title: 'Date',
                        dataIndex: 'date',
                        key: 'date',
                        render: (value) => formatDate(value),
                        width: 120
                      },
                      {
                        title: 'Symbol',
                        dataIndex: 'symbol',
                        key: 'symbol',
                        width: 100
                      },
                      {
                        title: 'Action',
                        dataIndex: 'action',
                        key: 'action',
                        render: (action) => (
                          <Tag color={action === 'BUY' ? 'green' : 'red'}>
                            {action}
                          </Tag>
                        ),
                        width: 80
                      },
                      {
                        title: 'Quantity',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: 100
                      },
                      {
                        title: 'Price',
                        dataIndex: 'price',
                        key: 'price',
                        render: (value) => `₹${value.toFixed(2)}`,
                        width: 120
                      },
                      {
                        title: 'Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        render: (value) => `₹${(value / 1000).toFixed(1)}K`,
                        width: 120
                      },
                      {
                        title: 'Transaction Cost',
                        dataIndex: 'total_costs',
                        key: 'total_costs',
                        render: (value) => value ? `₹${value.toFixed(2)}` : '₹0.00',
                        width: 130
                      },
                      {
                        title: 'Reason',
                        dataIndex: 'reason',
                        key: 'reason',
                        width: 150
                      },
                    ]}
                    size="middle"
                    pagination={{ pageSize: 20 }}
                  />
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Costs
                </span>
              } 
              key="costs"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Cost Analysis</h3>
                </div>
                <div className="p-6">
                  {costData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Transaction Costs</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Brokerage:</span>
                            <span className="font-semibold">₹{costData.total_brokerage?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">STT Paid:</span>
                            <span className="font-semibold">₹{costData.total_stt?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stamp Duty:</span>
                            <span className="font-semibold">₹{costData.total_stamp_duty?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Exchange Charges:</span>
                            <span className="font-semibold">₹{costData.total_exchange_charges?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">SEBI Charges:</span>
                            <span className="font-semibold">₹{costData.total_sebi_charges?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GST:</span>
                            <span className="font-semibold">₹{costData.total_gst?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between border-t pt-3">
                            <span className="text-gray-900 font-bold">Total Costs:</span>
                            <span className="font-bold text-lg">₹{costData.total_costs?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Cost Impact</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Turnover:</span>
                            <span className="font-semibold">₹{(costData.total_turnover / 100000)?.toFixed(1) || '0.0'}L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost per Trade:</span>
                            <span className="font-semibold">₹{costData.avg_cost_per_trade?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost as % of Turnover:</span>
                            <span className="font-semibold">{costData.cost_percentage?.toFixed(3) || '0.000'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Return Impact:</span>
                            <span className="font-semibold text-red-600">-{costData.return_impact_pct?.toFixed(2) || '0.00'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Trades:</span>
                            <span className="font-semibold">{tradesData?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No cost data available for this backtest.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Skipped Trades
                </span>
              } 
              key="skipped"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Skipped Trades</h3>
                </div>
                <div className="p-6 text-center text-gray-500">
                  <p>No skipped trades data available.</p>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Save Strategy Popup */}
      {isCustomNamePopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Save Strategy
                </h3>
                <button
                  onClick={() => {
                    setIsCustomNamePopupOpen(false);
                    setCustomStrategyName('');
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
                    setIsCustomNamePopupOpen(false);
                    setCustomStrategyName('');
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

                    await saveStrategyParameters(customStrategyName.trim());
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

      {/* Post-Save Deployment Popup (after saving from backtest results) */}
      {isPostSaveDeploymentPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10002] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Strategy Saved Successfully
                </h2>
                <button
                  onClick={() => {
                    setIsPostSaveDeploymentPopupOpen(false);
                    setSavedStrategyName('');
                    setRecentlySavedStrategy(null);
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
                <p className="text-sm text-gray-600 mb-2">Your strategy Configuration has been saved:</p>
                <p className="text-lg font-semibold text-gray-900">{savedStrategyName}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsPostSaveDeploymentPopupOpen(false);
                    setSavedStrategyName('');
                    setRecentlySavedStrategy(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (recentlySavedStrategy) {
                      setWebHookStrategyType('RS Strategy');
                      setSelectedStrategy(recentlySavedStrategy);
                      setIsPostSaveDeploymentPopupOpen(false);
                      setIsWebHookModalOpen(true);
                      setSavedStrategyName('');
                      setRecentlySavedStrategy(null);
                    }
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                >
                  Deploy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WebHook Modal */}
      {isWebHookModalOpen && selectedStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[350px] max-h-[90vh] overflow-hidden px-[10px] py-[10px]">
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
                etf_universe: selectedStrategy.etf_universe || "ALL_ETFS"
              } : {
                config_name: "RS Strategy",
                main_index: "^NSEI",
                max_positions: 20,
                position_size_pct: 5.0,
                stop_loss_pct: 15.0,
                total_capital: 1000000.0,
                etf_universe: "ALL_ETFS"
              }}
              onDeploymentSuccess={() => {
                message.success('RS Strategy deployed successfully!');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDetailETF;
