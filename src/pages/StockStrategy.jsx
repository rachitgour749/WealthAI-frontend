import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TradeExecutionTracker from '../components/TradeExecutionTracker';
import CostsDashboard from '../components/CostsDashboard';

const API_BASE_URL = 'http://127.0.0.1:8000' || 'https://api.wealthai1.in';

// Define Nifty 50 stocks array (stocks only, no ; symbols without ".NS")
const nifty50Stocks = [
  { value: 'ADANIENT', label: 'Adani Enterprises Ltd.' },
  { value: 'ADANIPORTS', label: 'Adani Ports and Special Economic Zone Ltd.' },
  { value: 'APOLLOHOSP', label: 'Apollo Hospitals Enterprise Ltd.' },
  { value: 'ASIANPAINT', label: 'Asian Paints Ltd.' },
  { value: 'AXISBANK', label: 'Axis Bank Ltd.' },
  { value: 'BAJAJ-AUTO', label: 'Bajaj Auto Ltd.' },
  { value: 'BAJAJFINSV', label: 'Bajaj Finserv Ltd.' },
  { value: 'BAJFINANCE', label: 'Bajaj Finance Ltd.' },
  { value: 'BHARTIARTL', label: 'Bharti Airtel Ltd.' },
  { value: 'BPCL', label: 'Bharat Petroleum Corporation Ltd.' },
  { value: 'BRITANNIA', label: 'Britannia Industries Ltd.' },
  { value: 'CIPLA', label: 'Cipla Ltd.' },
  { value: 'COALINDIA', label: 'Coal India Ltd.' },
  { value: 'DIVISLAB', label: "Divi's Laboratories Ltd." },
  { value: 'DRREDDY', label: "Dr. Reddy's Laboratories Ltd." },
  { value: 'EICHERMOT', label: 'Eicher Motors Ltd.' },
  { value: 'GRASIM', label: 'Grasim Industries Ltd.' },
  { value: 'HCLTECH', label: 'HCL Technologies Ltd.' },
  { value: 'HDFCBANK', label: 'HDFC Bank Ltd.' },
  { value: 'HDFCLIFE', label: 'HDFC Life Insurance Company Ltd.' },
  { value: 'HEROMOTOCO', label: 'Hero MotoCorp Ltd.' },
  { value: 'HINDALCO', label: 'Hindalco Industries Ltd.' },
  { value: 'HINDUNILVR', label: 'Hindustan Unilever Ltd.' },
  { value: 'ICICIBANK', label: 'ICICI Bank Ltd.' },
  { value: 'INDUSINDBK', label: 'IndusInd Bank Ltd.' },
  { value: 'INFY', label: 'Infosys Ltd.' },
  { value: 'ITC', label: 'ITC Ltd.' },
  { value: 'JSWSTEEL', label: 'JSW Steel Ltd.' },
  { value: 'KOTAKBANK', label: 'Kotak Mahindra Bank Ltd.' },
  { value: 'LT', label: 'Larsen & Toubro Ltd.' },
  { value: 'LTIM', label: 'LTIMindtree Ltd.' },
  { value: 'M&M', label: 'Mahindra & Mahindra Ltd.' },
  { value: 'MARUTI', label: 'Maruti Suzuki India Ltd.' },
  { value: 'NESTLEIND', label: 'Nestlé India Ltd.' },
  { value: 'NTPC', label: 'NTPC Ltd.' },
  { value: 'ONGC', label: 'Oil & Natural Gas Corporation Ltd.' },
  { value: 'POWERGRID', label: 'Power Grid Corporation of India Ltd.' },
  { value: 'RELIANCE', label: 'Reliance Industries Ltd.' },
  { value: 'SBILIFE', label: 'SBI Life Insurance Company Ltd.' },
  { value: 'SBIN', label: 'State Bank of India' },
  { value: 'SUNPHARMA', label: 'Sun Pharmaceutical Industries Ltd.' },
  { value: 'TATACONSUM', label: 'Tata Consumer Products Ltd.' },
  { value: 'TATAMOTORS', label: 'Tata Motors Ltd.' },
  { value: 'TATASTEEL', label: 'Tata Steel Ltd.' },
  { value: 'TCS', label: 'Tata Consultancy Services Ltd.' },
  { value: 'TECHM', label: 'Tech Mahindra Ltd.' },
  { value: 'TITAN', label: 'Titan Company Ltd.' },
  { value: 'ULTRACEMCO', label: 'UltraTech Cement Ltd.' },
  { value: 'UPL', label: 'UPL Ltd.' },
  { value: 'WIPRO', label: 'Wipro Ltd.' }
];


function StockStrategy({ onBack }) {
  // Main state
  const [showResults, setShowResults] = useState(false);
  const [etfs, setEtfs] = useState([]);
  const [selectedEtfs, setSelectedEtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '', years: 0 });
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [backtestResult, setBacktestResult] = useState(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [etfOverview, setEtfOverview] = useState([]);
  const [transactionLog, setTransactionLog] = useState([]);
  const [transactionCosts, setTransactionCosts] = useState([]);
  const [tradingSummary, setTradingSummary] = useState({});
  const [transactionLogLoading, setTransactionLogLoading] = useState(false);

  // Strategy Settings
  const [capitalPerWeek, setCapitalPerWeek] = useState(50000);
  const [accumulationWeeks, setAccumulationWeeks] = useState(52);
  const [brokeragePercent, setBrokeragePercent] = useState(0.0);
  const [riskFreeRate, setRiskFreeRate] = useState(8.0);
  const [compoundingEnabled, setCompoundingEnabled] = useState(false);

  // Performance Comparison Toggles
  const [showETFStrategy, setShowETFStrategy] = useState(true);
  console.log(showETFStrategy);

  // Active tab
  const [activeTab, setActiveTab] = useState('metrics');

  // UI State
  const [activeSetupStep, setActiveSetupStep] = useState(1);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Load transaction data when trade tab is selected
    if (tab === 'trades' && showResults) {
      loadTransactionLog();
      loadTransactionCosts();
    }
  };

  const handleAddAllNifty50 = (checked) => {
    if (checked) {
      setSelectedEtfs(nifty50Stocks);
    } else {
      // Remove all Nifty 50 stocks from selection
      setSelectedEtfs(prev => prev.filter(stock => !nifty50Stocks.some(nifty => nifty.value === stock.value)));
    }
    setActiveSetupStep(Math.max(activeSetupStep, 2));
  };

  const handleAddTop20Stocks = (checked) => {
    const top20Stocks = nifty50Stocks.slice(0, 20);
    if (checked) {
      setSelectedEtfs(prev => {
        const existingStocks = prev.filter(stock => !top20Stocks.some(top20 => top20.value === stock.value));
        return [...existingStocks, ...top20Stocks];
      });
    } else {
      // Remove top 20 stocks from selection
      setSelectedEtfs(prev => prev.filter(stock => !top20Stocks.some(top20 => top20.value === stock.value)));
    }
    setActiveSetupStep(Math.max(activeSetupStep, 2));
  };

  const handleAddTop10Stocks = (checked) => {
    const top10Stocks = nifty50Stocks.slice(0, 10);
    if (checked) {
      setSelectedEtfs(prev => {
        const existingStocks = prev.filter(stock => !top10Stocks.some(top10 => top10.value === stock.value));
        return [...existingStocks, ...top10Stocks];
      });
    } else {
      // Remove top 10 stocks from selection
      setSelectedEtfs(prev => prev.filter(stock => !top10Stocks.some(top10 => top10.value === stock.value)));
    }
    setActiveSetupStep(Math.max(activeSetupStep, 2));
  };

  // Export Functions
  const exportETFPerformanceCSV = () => {
    if (!backtestResult || !backtestResult.performance_data) {
      alert('No performance data available. Please run a backtest first.');
      return;
    }

    const performanceData = backtestResult.performance_data;
    
    // Validate that dates array exists and is not empty
    if (!performanceData.dates || !Array.isArray(performanceData.dates) || performanceData.dates.length === 0) {
      alert('No performance data available. Please run a backtest first.');
      return;
    }

    const dates = performanceData.dates || [];
    const etfStrategy = performanceData.etf_strategy || [];
    const cumulativeInvestment = performanceData.cumulative_investment || [];
    const nifty50BuyHold = performanceData.nifty50_buyhold || [];

    const csvContent = [
      ['Date', ' Stocks Strategy NAV', 'Cumulative Investment', 'Nifty50 Buy & Hold'],
      ...dates.map((date, index) => [
        date,
        etfStrategy[index] || '',
        cumulativeInvestment[index] || '',
        nifty50BuyHold[index] || ''
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, ' Stocks_performance.csv');
  };

  const exportNifty50DataCSV = () => {
    if (!backtestResult || !backtestResult.performance_data) {
      alert('No Nifty50 data available. Please run a backtest first.');
      return;
    }

    const performanceData = backtestResult.performance_data;
    
    // Validate that dates array exists and is not empty
    if (!performanceData.dates || !Array.isArray(performanceData.dates) || performanceData.dates.length === 0) {
      alert('No Nifty50 data available. Please run a backtest first.');
      return;
    }
    console.log(performanceData.dates, performanceData.stock_strategy, performanceData.nifty50_buyhold, "++++++++++++++++++++++++++++++++");
    const dates = performanceData.dates || [];
    const etfStrategy = performanceData.stock_strategy    || [];
    const nifty50BuyHold = performanceData.nifty50_buyhold || [];

    const csvContent = [
      ['Date', 'Nifty50 NAV', ' Stocks Strategy NAV', 'Performance Difference'],
      ...dates.map((date, index) => {
        const niftyValue = nifty50BuyHold[index] || 0;
        const etfValue = etfStrategy[index] || 0;
        const difference = etfValue - niftyValue;
        return [date, niftyValue, etfValue, difference];
      })
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'nifty50_data.csv');
  };

  const exportTransactionCostsCSV = () => {
    if (!transactionCosts || transactionCosts.length === 0) {
      alert('No transaction costs data available. Please run a backtest first.');
      return;
    }

    const csvContent = [
      ['Date', 'Cumulative Cost', 'Weekly Cost', 'Total Costs'],
      ...transactionCosts.map(cost => [
        cost.date || '',
        cost.cumulative_cost || 0,
        cost.weekly_cost || 0,
        cost.total_costs || 0
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'transaction_costs.csv');
  };

  const downloadCSV = (csvString, filename) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadETFs();
    loadETFOverview();
  }, []);

  const loadETFs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/stocks`);
      console.log(response.data);
      if (response.data && response.data.stocks && response.data.stocks.length > 0) {
        const stocksOptions = response.data.stocks.map(stock => ({
          value: stock.ticker,
          label: `${stock.ticker} - ${stock.name}`
        }));
        setEtfs(stocksOptions);
        console.log(`Loaded ${stocksOptions.length} Stocks`);
      } else {
        setError('No  Stocks found in database');
      }
    } catch (err) {
      console.error('Error loading Stocks:', err);
      setError('Failed to load Stocks. Please check if backend is running.')
    } finally {
      setLoading(false);
    }
  };

  const loadETFOverview = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stocks/overview`);
      if (response.data && response.data.stock_overview) {
        setEtfOverview(response.data.stock_overview);
      }
    } catch (err) {
      console.error('Error loading Stock overview:', err);
    }
  };

  const loadTransactionLog = useCallback(async () => {
    try {
      setTransactionLogLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/stocks/transaction-log`);
      if (response.data && response.data.transaction_log) {
        setTransactionLog(response.data.transaction_log);
      }
      if (response.data && response.data.trading_summary) {
        setTradingSummary(response.data.trading_summary);
      }
    } catch (err) {
      console.error('Error loading transaction log:', err);
    } finally {
      setTransactionLogLoading(false);
    }
  }, []);

  const loadTransactionCosts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stocks/transaction-costs`);
      if (response.data && response.data.transaction_costs) {
        setTransactionCosts(response.data.transaction_costs);
      }
    } catch (err) {
      console.error('Error loading transaction costs:', err);
    }
  }, []);

  const calculateDateRange = useCallback(async () => {
    if (selectedEtfs.length === 0) return;
    
    try {
      setDateRangeLoading(true);
      setError(''); // Clear previous errors
      
      const response = await axios.post(`${API_BASE_URL}/api/stocks/date-range`, {
        tickers: selectedEtfs.map(etf => etf.value)
      });
      
      if (response.data && response.data.start_date && response.data.end_date) {
        setDateRange({
          start: response.data.start_date,
          end: response.data.end_date,
          years: response.data.years
        });
        // Set custom dates to match the calculated range initially
        setCustomStartDate(response.data.start_date);
        setCustomEndDate(response.data.end_date);
        console.log('Date range calculated:', response.data);
        console.log('Set custom dates to:', response.data.start_date, 'and', response.data.end_date);
      } else {
        console.warn('Date range calculation returned empty dates');
      }
    } catch (err) {
      console.error('Error calculating date range:', err);
      // Don't set error here - let the backtest use fallback dates
      console.log('Will use fallback dates for backtest');
    } finally {
      setDateRangeLoading(false);
    }
  }, [selectedEtfs]);



  useEffect(() => {
    if (selectedEtfs.length > 0) {
      calculateDateRange();
    }
  }, [selectedEtfs, calculateDateRange]);

  // Update custom dates when date range changes
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      setCustomStartDate(dateRange.start);
      setCustomEndDate(dateRange.end);
      console.log('Updated custom dates:', dateRange.start, 'to', dateRange.end);
    }
  }, [dateRange.start, dateRange.end]);

  // Reset custom dates when ETFs change
  useEffect(() => {
    if (selectedEtfs.length === 0) {
      setCustomStartDate('');
      setCustomEndDate('');
      setUseCustomDates(false);
    }
  }, [selectedEtfs]);

  // Load transaction data when backtest results are available
  useEffect(() => {
    if (showResults) {
      loadTransactionLog();
      loadTransactionCosts();
    }
  }, [showResults, loadTransactionLog, loadTransactionCosts]);

  const runBacktest = async () => {
    if (selectedEtfs.length === 0) {
      setError('Please select Stocks first');
      return;
    }

    try {
      setBacktestLoading(true);
      setError('');

      // Use custom dates if enabled, otherwise use calculated date range
      let startDate = useCustomDates ? customStartDate : dateRange.start;
      let endDate = useCustomDates ? customEndDate : dateRange.end;
      
      if (!startDate || !endDate) {
        // Fallback to a reasonable date range
        startDate = '2020-01-01';
        endDate = '2023-12-31';
        console.log('Using fallback dates:', startDate, 'to', endDate);
      }

      const backtestParams = {
        tickers: selectedEtfs.map(etf => etf.value),
        start_date: startDate,
        end_date: endDate,
        capital_per_week: parseFloat(capitalPerWeek),
        accumulation_weeks: parseInt(accumulationWeeks),
        brokerage_percent: parseFloat(brokeragePercent),
        compounding_enabled: Boolean(compoundingEnabled),
        risk_free_rate: parseFloat(riskFreeRate)
      };

      const response = await axios.post(`${API_BASE_URL}/api/stocks/metrics/`, backtestParams);
      let backtestData = response.data;
      console.log(backtestData);
      
      // If Nifty50 metrics are not included, try to fetch them separately
      if (!backtestData.nifty_metrics && !backtestData.nifty50_metrics && !backtestData.benchmark_metrics) {
        try {
          console.log('Nifty50 metrics not found in main response, fetching separately...');
          const niftyResponse = await axios.post(`${API_BASE_URL}/api/nifty50-metrics`, {
            start_date: startDate,
            end_date: endDate,
            capital_per_week: parseFloat(capitalPerWeek),
            accumulation_weeks: parseInt(accumulationWeeks)
          });
          
          if (niftyResponse.data && niftyResponse.data.nifty_metrics) {
            backtestData = { ...backtestData, nifty_metrics: niftyResponse.data.nifty_metrics };
            console.log('Nifty50 metrics fetched successfully');
          }
        } catch (niftyErr) {
          console.warn('Failed to fetch Nifty50 metrics separately:', niftyErr);
        }
      }
      
      setBacktestResult(backtestData);
      setShowResults(true);
      console.log('Backtest result:', backtestData);
      console.log('Backtest result keys:', Object.keys(backtestData));
      if (backtestData.stock_metrics) {
        console.log('ETF metrics keys:', Object.keys(backtestData.stock_metrics));
      }
      if (backtestData.nifty_metrics) {
        console.log('Nifty metrics keys:', Object.keys(backtestData.nifty_metrics));
      }
      
      // Load transaction data after successful backtest
      await loadTransactionLog();
      await loadTransactionCosts();
    } catch (err) {
      console.error('Backtest error:', err);
      if (err.response && err.response.data) {
        setError(`Backtest failed: ${JSON.stringify(err.response.data)}`);
      } else {
        setError('Backtest failed. Please check your parameters.');
      }
    } finally {
      setBacktestLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === 'string' && value.includes('₹')) {
      return value;
    }
    return `₹${Math.round(parseFloat(value || 0)).toLocaleString('en-IN')}`;
  };



  const renderMetricsCard = (title, value, subtitle = '') => {
    const getDefinition = (metricTitle) => {
      const definitions = {
        'Total Return': 'The total percentage gain or loss on an investment over a specific period, including dividends and capital appreciation.',
        'CAGR': 'Compound Annual Growth Rate - the mean annual growth rate of an investment over a specified period longer than one year.',
        'XIRR': 'Extended Internal Rate of Return - calculates the rate of return for investments with multiple cash flows occurring at irregular intervals.',
        'Volatility': 'A measure of the rate at which the price of a security increases or decreases for a given set of returns.',
        'Sharpe Ratio': 'A measure of risk-adjusted return, calculated as excess return per unit of risk. Higher values indicate better risk-adjusted performance.',
        'Treynor Ratio': 'A risk-adjusted measure of return based on systematic risk, calculated as excess return per unit of systematic risk.',
        'Calmar Ratio': 'A risk-adjusted measure that compares the annualized return to the maximum drawdown, indicating return per unit of downside risk.',
        'Max Drawdown': 'The maximum observed loss from a peak to a subsequent trough, representing the largest percentage decline in portfolio value.',
        'Win Rate': 'The percentage of profitable trades out of total trades executed during the investment period.',
        'Total Investment': 'The total amount of capital invested over the entire investment period.',
        'Final Value': 'The total portfolio value at the end of the investment period.',
        'Total Trades': 'The total number of buy and sell transactions executed during the investment period.'
      };
      return definitions[metricTitle] || 'No definition available for this metric.';
    };
  
    return (
      <div className="group relative bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  
        {/* Tooltip: rectangular, single column (title then definition) */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none z-[9999]">
          <div className="relative w-[220px] max-w-[40vw] px-4 py-3 bg-gray-900 text-white
                          rounded-md shadow-lg whitespace-normal break-words leading-snug">
            <div className="font-semibold text-sm mb-1">{title}</div>
            <div className="text-gray-200 text-xs leading-relaxed">
              {getDefinition(title)}
            </div>
  
            {/* Arrow */}
            <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45"></span>
          </div>
        </div>
      </div>
    );
  };
  
  
  const renderPerformanceChart = () => {
    if (!backtestResult || !backtestResult.performance_data) return null;

    const { performance_data } = backtestResult;
    
    // Add comprehensive validation for all required arrays
    if (!performance_data.dates || !Array.isArray(performance_data.dates) || performance_data.dates.length === 0) {
      console.warn('Performance data dates array is missing or empty');
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
          <div className="text-center text-gray-500 py-8">
            No performance data available. Please run a backtest first.
          </div>
        </div>
      );
    }

    // Ensure all required arrays exist and have the same length
    const dates = performance_data.dates || [];
    const etfStrategy = performance_data.stock_strategy || [];
    const cumulativeInvestment = performance_data.cumulative_investment || [];
    const nifty50BuyHold = performance_data.nifty50_buyhold || [];

    // Safe array access function
    const safeArrayAccess = (array, index) => {
      if (!Array.isArray(array) || index < 0 || index >= array.length) {
        return 0;
      }
      const value = array[index];
      return (value !== null && value !== undefined && !isNaN(value)) ? value : 0;
    };

    const chartData = dates.map((date, index) => {
      // Validate date
      if (!date) {
        console.warn(`Invalid date at index ${index}`);
        return null;
      }
      
      return {
        date,
        'Stock Strategy': safeArrayAccess(etfStrategy, index),
        'Cumulative Investment': safeArrayAccess(cumulativeInvestment, index),
        'Nifty50 Buy & Hold': safeArrayAccess(nifty50BuyHold, index)
      };
    }).filter(item => item !== null); // Remove any null items

    // Check if we have valid chart data
    if (!chartData || chartData.length === 0) {
      console.warn('No valid chart data available');
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
          <div className="text-center text-gray-500 py-8">
            No valid performance data available for charting. Please run a backtest first.
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => {
                try {
                  if (!value) return 'N/A';
                  const date = new Date(value);
                  if (isNaN(date.getTime())) return 'Invalid Date';
                  const month = date.toLocaleDateString('en-US', { month: 'short' });
                  const year = date.getFullYear();
                  return `${month}, ${year}`;
                } catch (error) {
                  console.warn('Error formatting date:', error);
                  return 'Invalid Date';
                }
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                try {
                  if (value === null || value === undefined || isNaN(value)) return '₹0M';
                  return `₹${(value / 1000000).toFixed(1)}M`;
                } catch (error) {
                  console.warn('Error formatting Y-axis value:', error);
                  return '₹0M';
                }
              }}
            />
            <Tooltip 
              formatter={(value) => {
                try {
                  if (value === null || value === undefined || isNaN(value)) return ['₹0', 'Value'];
                  return [formatCurrency(value), 'Value'];
                } catch (error) {
                  console.warn('Error formatting tooltip value:', error);
                  return ['₹0', 'Value'];
                }
              }}
              labelFormatter={(label) => {
                try {
                  if (!label) return 'Date: N/A';
                  return `Date: ${label}`;
                } catch (error) {
                  console.warn('Error formatting tooltip label:', error);
                  return 'Date: N/A';
                }
              }}
            />
            <Legend />
            {showETFStrategy && (
              <Line 
                type="monotone" 
                dataKey="Stock Strategy" 
                stroke="#1f77b4" 
                strokeWidth={3}
                dot={false}
              />
            )}
            {showETFStrategy && (
              <Line 
                type="monotone" 
                dataKey="Cumulative Investment" 
                stroke="#ff7f0e" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}

          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderMetricsTable = () => {
    if (!backtestResult) return null;

    const { stock_metrics, nifty_metrics } = backtestResult;
    console.log(backtestResult);
    // Check for alternative key names for Nifty50 data
    const niftyData = nifty_metrics || backtestResult.nifty50_metrics || backtestResult.benchmark_metrics || backtestResult.nifty_50_metrics;
    
    // Debug logging

    
    // If no metrics at all, show a message
    if (!stock_metrics && !niftyData) {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics Comparison</h3>
          </div>
          <div className="p-6 text-center text-gray-500">
            <p>No metrics data available. Please run a backtest first.</p>
            <p className="text-sm mt-2">Available data: {Object.keys(backtestResult).join(', ')}</p>
          </div>
        </div>
      );
    }
    const metrics = [
      { key: 'Total Investment', label: 'Total Investment' },
      { key: 'Final Value', label: 'Final Value' },
      { key: 'Total Return', label: 'Total Return' },
      { key: 'CAGR', label: 'CAGR' },
      { key: 'XIRR', label: 'XIRR' },
      { key: 'Volatility', label: 'Volatility' },
      { key: 'Sharpe Ratio', label: 'Sharpe Ratio' },
      { key: 'Treynor Ratio', label: 'Treynor Ratio' },
      { key: 'Calmar Ratio', label: 'Calmar Ratio' },
      { key: 'Max Drawdown', label: 'Max Drawdown' },
     
    ];

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics Comparison</h3>
        </div>
        

        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                {stock_metrics && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Rotation Strategy
                  </th>
                )}
                {niftyData && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nifty50 Buy & Hold
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.map((metric) => (
                <tr key={metric.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.label}
                  </td>
                  {stock_metrics && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock_metrics[metric.key] || stock_metrics[metric.key.toLowerCase()] || 'N/A'}
                    </td>
                  )}
                  {niftyData && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {niftyData[metric.key] || niftyData[metric.key.toLowerCase()] || 'N/A'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTransactionLog = () => {
    // Add comprehensive error boundary
    try {
      if (transactionLogLoading) {
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading transaction data...</span>
            </div>
          </div>
        );
      }

      // Validate transactionLog is an array
      if (!Array.isArray(transactionLog)) {
        console.warn('Transaction log is not an array:', transactionLog);
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Data Format Error</h3>
              <p className="text-gray-500 mb-4">
                Transaction data is not in the expected format. Please run a backtest again.
              </p>
              <button
                onClick={() => {
                  setTransactionLog([]);
                  setTradingSummary({});
                  runBacktest();
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry Backtest
              </button>
            </div>
          </div>
        );
      }

      if (transactionLog.length === 0) {
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transaction Data Available</h3>
              <p className="text-gray-500 mb-4">
                {!showResults 
                  ? "Run a backtest first to see transaction details." 
                  : "No trades were executed during the backtest period."
                }
              </p>
              {!showResults && (
                <button
                  onClick={runBacktest}
                  disabled={selectedEtfs.length === 0 || backtestLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {backtestLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Backtest...
                    </>
                  ) : (
                    'Run Backtest'
                  )}
                </button>
              )}
            </div>
          </div>
        );
      }

      const safeString = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'object') return 'Object';
        return String(value);
      };

      const formatCurrency = (value) => {
        try {
          if (typeof value === 'string' && value.includes('₹')) {
            return value;
          }
          const numValue = parseFloat(value || 0);
          if (isNaN(numValue)) return '₹0';
          return `₹${Math.round(numValue).toLocaleString('en-IN')}`;
        } catch (error) {
          return '₹0';
        }
      };

      const getDayOfWeek = (dateStr) => {
        try {
          if (!dateStr || typeof dateStr !== 'string') return 'N/A';
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return 'N/A';
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        } catch (error) {
          return 'N/A';
        }
      };

      const getActionColor = (action) => {
        const actionStr = safeString(action).toUpperCase();
        switch (actionStr) {
          case 'BUY':
            return 'bg-green-100 text-green-800';
          case 'SELL':
            return 'bg-red-100 text-red-800';
          case 'CHURN':
            return 'bg-orange-100 text-orange-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
      };

      // Validate trading summary
      const validTradingSummary = tradingSummary && typeof tradingSummary === 'object' ? tradingSummary : {};

      return (
        <div className="space-y-6">
          {/* Trading Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Monday Trading Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{safeString(validTradingSummary.total_trades) || '0'}</div>
                <div className="text-sm text-gray-500">Total Trades</div>
              </div>
              {/* <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{safeString(validTradingSummary.buy_trades) || '0'}</div>
                <div className="text-sm text-gray-500">Buy Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{safeString(validTradingSummary.sell_trades) || '0'}</div>
                <div className="text-sm text-gray-500">Sell Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{safeString(validTradingSummary.churn_trades) || '0'}</div>
                <div className="text-sm text-gray-500">Churn Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{safeString(validTradingSummary.no_trade_weeks) || '0'}</div>
                <div className="text-sm text-gray-500">No Trade Weeks</div>
              </div> */}
              {/* <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{safeString(validTradingSummary.trading_frequency) || '0%'}</div>
                <div className="text-sm text-gray-500">Trading Frequency</div>
              </div> */}
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">📋 All Monday Trade Transactions</h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete list of all Stock trades executed every Monday during the backtest period
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbols</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prices</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Costs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capital Gains Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionLog.map((log, index) => {
                    // Comprehensive validation for each log entry
                    if (!log || typeof log !== 'object') {
                      console.warn('Invalid log entry at index', index, ':', log);
                      return (
                        <tr key={`invalid-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              N/A
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                        </tr>
                      );
                    }
                    
                    const dateStr = safeString(log.date);
                    const dayOfWeek = getDayOfWeek(dateStr);
                    const isMonday = dayOfWeek === 'Mon';
                    
                    return (
                      <tr key={`trade-${index}`} className={isMonday ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-medium">{safeString(log.week)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dateStr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isMonday ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {dayOfWeek}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.action === 'churn' ? (
                            <div className="flex gap-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-200 text-orange-700">
                                churn
                              </span>
                             
                            </div>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                              {safeString(log.action)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action === 'churn' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">S</span>
                                <span className="font-mono font-medium">{log.churning_details?.sell_transactions[0]?.ticker || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">B</span>
                                <span className="font-mono font-medium">{log?.churning_details?.buy_transaction?.ticker || 'N/A'}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="font-mono font-medium">{safeString(log.ticker)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action === 'churn' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">S</span>
                                <span className="font-medium">{log.units_sold?.toLocaleString('en-IN') || '0'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">B</span>
                                <span className="font-medium">{log.units_bought?.toLocaleString('en-IN') || '0'}</span>
                              </div>
                            </div>
                          ) : (
                            (() => {
                              try {
                                const units = parseFloat(safeString(log.units));
                                return isNaN(units) ? '0' : units.toLocaleString('en-IN');
                              } catch (error) {
                                return '0';
                              }
                            })()
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action === 'churn' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">S</span>
                                <span>{formatCurrency(log.churning_details?.sell_transactions?.[0]?.price || 0)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">B</span>
                                <span>{formatCurrency(log.churning_details?.buy_transaction?.price || 0)}</span>
                              </div>
                            </div>
                          ) : (
                            formatCurrency(log.price)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action === 'churn' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">S</span>
                                <span className="font-medium">{formatCurrency(log.sell_amount || 0)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">B</span>
                                <span className="font-medium">{formatCurrency(log.buy_amount || 0)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium">{formatCurrency(log.amount)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action === 'churn' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">S</span>
                                <span>{formatCurrency(log.churning_details?.sell_transactions?.[0]?.costs?.total_costs || 0)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">B</span>
                                <span>{formatCurrency(log.churning_details?.buy_transaction?.costs?.total_costs || 0)}</span>
                              </div>
                            </div>
                          ) : (
                            formatCurrency(log.transaction_costs)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action === 'churn' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">S</span>
                                <span>{formatCurrency(log.churning_details?.sell_transactions?.[0]?.capital_gains_tax || 0)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">B</span>
                                <span>₹0</span>
                              </div>
                            </div>
                          ) : (
                            formatCurrency(log.capital_gains_tax)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold">{formatCurrency(log.nav)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Summary Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-medium">Total Transactions:</span> {transactionLog.length}
                </div>
                <div>
                  <span className="font-medium">Monday Trades:</span> {(() => {
                    try {
                      return transactionLog.filter(log => {
                        if (!log || typeof log !== 'object') return false;
                        const dayOfWeek = getDayOfWeek(safeString(log.date));
                        return dayOfWeek === 'Mon';
                      }).length;
                    } catch (error) {
                      return 0;
                    }
                  })()}
                </div>
                <div>
                  <span className="font-medium">Total Volume:</span> {(() => {
                    try {
                      const totalVolume = transactionLog.reduce((sum, log) => {
                        if (!log || typeof log !== 'object') return sum;
                        const amount = parseFloat(log.amount || 0);
                        return sum + (isNaN(amount) ? 0 : amount);
                      }, 0);
                      return formatCurrency(totalVolume);
                    } catch (error) {
                      return '₹0';
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering transaction log:', error);
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rendering Error</h3>
            <p className="text-gray-500 mb-4">
              An error occurred while rendering the transaction data. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };



  if (!showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => onBack?.()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Strategies
            </button>
          </div>

          {/* Strategy Configuration */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  ⚙️
                </span>
                Strategy Configuration
              </h2>
              <p className="text-teal-100 mt-2">Configure your Stock rotation strategy parameters</p>
            </div>

            {/* Progress Steps */}
            <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, title: 'Stock Selection', icon: '📈' },
                  { step: 2, title: 'Date Range', icon: '📅' },
                  { step: 3, title: 'Parameters', icon: '⚙️' },
                  { step: 4, title: 'Execute', icon: '🚀' }
                ].map((item, index) => (
                  <React.Fragment key={item.step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          activeSetupStep >= item.step
                            ? 'bg-teal-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          activeSetupStep >= item.step ? 'text-teal-600' : 'text-gray-500'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    {index < 3 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                          activeSetupStep > item.step ? 'bg-teal-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Configuration Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Inputs */}
                <div className="space-y-6">
                  {/* ETF Selection */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                        📈
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Stocks Universe Selection</h3>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Stocks for rotation strategy
                    </label>
                    <Select
                      isMulti
                      options={etfs}
                      value={selectedEtfs}
                      onChange={(selected) => {
                        setSelectedEtfs(selected);
                        setActiveSetupStep(Math.max(activeSetupStep, 2));
                      }}
                      placeholder="Select multiple Stocks..."
                      isLoading={loading}
                      className="mb-4"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#0D9488',
                          boxShadow: '0 0 0 1px #0D9488',
                          '&:hover': {
                            borderColor: '#0F766E'
                          }
                        })
                      }}
                    />
                    
                    {/* {selectedEtfs.length > 0 && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-teal-200">
                        <p className="text-sm text-teal-700 font-medium">
                          ✓ {selectedEtfs.length} Stocks selected
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedEtfs.slice(0, 3).map((etf) => (
                            <span key={etf.value} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              {etf.value}
                            </span>
                          ))}
                          {selectedEtfs.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{selectedEtfs.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )} */}

                                         {/* Quick Selection Row */}
                     <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                       <p className="text-xs text-gray-600 mb-3 font-medium">Quick Selection:</p>
                       <div className="flex flex-wrap gap-4">
                                                   {/* Top 50 */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="addAllNifty50"
                              onChange={(e) => handleAddAllNifty50(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="addAllNifty50" className="ml-2 text-sm font-medium text-gray-900">
                              Top 50 Stocks
                            </label>
                          </div>

                          {/* Top 20 */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="addTop20Stocks"
                              onChange={(e) => handleAddTop20Stocks(e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="addTop20Stocks" className="ml-2 text-sm font-medium text-gray-900">
                              Top 20 Stocks
                            </label>
                          </div>

                          {/* Top 10 */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="addTop10Stocks"
                              onChange={(e) => handleAddTop10Stocks(e.target.checked)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="addTop10Stocks" className="ml-2 text-sm font-medium text-gray-900">
                              Top 10 Stocks
                            </label>
                          </div>
                       </div>
                     </div>
                  </div>

                  {/* Date Range Configuration */}
                  {selectedEtfs.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                          📅
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Date Range</h3>
                      </div>
                      
                      {dateRangeLoading && (
                        <div className="flex items-center text-sm text-teal-600 mb-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                          Calculating optimal date range...
                        </div>
                      )}
                      
                      {dateRange.start && dateRange.end && (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-green-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Available Period:</span>
                                <p className="font-semibold text-gray-900">{dateRange.start} to {dateRange.end}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Duration:</span>
                                <p className="font-semibold text-green-600">{dateRange.years.toFixed(1)} years</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="useCustomDates"
                              checked={useCustomDates}
                              onChange={(e) => {
                                setUseCustomDates(e.target.checked);
                                setActiveSetupStep(Math.max(activeSetupStep, 3));
                              }}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="useCustomDates" className="ml-2 block text-sm font-medium text-gray-900">
                              Customize date range
                            </label>
                          </div>

                          {useCustomDates && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                  type="date"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  min={dateRange.start}
                                  max={dateRange.end}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  min={customStartDate || dateRange.start}
                                  max={dateRange.end}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strategy Parameters */}
                  {(dateRange.start || selectedEtfs.length > 0) && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                          ⚙️
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Strategy Parameters</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capital per Week (₹)
                          </label>
                          <input
                            type="number"
                            value={capitalPerWeek}
                            onChange={(e) => {
                              setCapitalPerWeek(e.target.value);
                              setActiveSetupStep(Math.max(activeSetupStep, 4));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            min="1000"
                            max="1000000"
                            step="1000"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Accumulation Weeks
                          </label>
                          <input
                            type="number"
                            value={accumulationWeeks}
                            onChange={(e) => setAccumulationWeeks(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            min="4"
                            max="208"
                            step="4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brokerage (%)
                          </label>
                          <input
                            type="number"
                            value={brokeragePercent}
                            onChange={(e) => setBrokeragePercent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            min="0"
                            max="1"
                            step="0.001"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Risk-free Rate (%)
                          </label>
                          <input
                            type="number"
                            value={riskFreeRate}
                            onChange={(e) => setRiskFreeRate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            min="0"
                            max="20"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="compounding"
                            checked={compoundingEnabled}
                            onChange={(e) => setCompoundingEnabled(e.target.checked)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label htmlFor="compounding" className="ml-2 block text-sm font-medium text-gray-900">
                            Enable Compounding
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - ETF Overview Table */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                      📋
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Available Stocks
                    </h3>
                  </div>
 
                  <div className="bg-white rounded-lg border border-gray-200">
                    {/* Scroll area with hidden scrollbar */}
                    <div className="max-h-96 overflow-y-auto scrollbar-hide">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Symbol
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sector
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Years
                            </th>
                          </tr>
                        </thead>
 
                        <tbody className="bg-white divide-y divide-gray-200">
                          {etfOverview.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className="px-4 py-6 text-sm text-gray-500 text-center"
                              >
                                No stocks found.
                              </td>
                            </tr>
                          ) : (
                            etfOverview.map((etf, idx) => (
                              <tr
                                key={etf?.symbol ?? idx}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {etf.symbol}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {etf.sector}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {etf.years_available}
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

              {/* Execute Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedEtfs.length === 0 ? (
                      "Select Stocks to begin configuration"
                    ) : activeSetupStep < 4 ? (
                      "Complete all configuration steps"
                    ) : (
                      "Ready to run backtest"
                    )}
                  </div>
                  <button
                    onClick={runBacktest}
                    disabled={backtestLoading || selectedEtfs.length === 0}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    {backtestLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Running Backtest...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Run Backtest
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Configuration Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2024 WealthAI1. Advanced AI-powered trading strategies.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <button className="hover:text-gray-900 transition-colors">Documentation</button>
                <button className="hover:text-gray-900 transition-colors">Support</button>
                <button className="hover:text-gray-900 transition-colors">API</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Results View (keeping existing results view)
  return (
    <div className="bg-gray-50 h-full p-4 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📊 Backtest Results</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Stock Rotation Strategy Analysis
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => onBack?.()}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  ← Back to Strategies
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  ← Back to Setup
                </button>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setBacktestResult(null);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  🔄 New Backtest
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        {backtestResult && renderPerformanceChart()}

        {/* Chart Controls */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showETF"
                checked={showETFStrategy}
                onChange={(e) => setShowETFStrategy(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showETF" className="ml-2 text-sm text-gray-900">
                📊 Show Stock Strategy
              </label>
            </div>

          </div>
        </div>

        {/* Metrics Cards */}
        {backtestResult && backtestResult.stock_metrics && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 overflow-visible relative" style={{ overflow: 'visible' }}>
            {renderMetricsCard('Total Return', backtestResult.stock_metrics['Total Return'] || backtestResult.stock_metrics['total_return'] || 'N/A')}
            {renderMetricsCard('CAGR', backtestResult.stock_metrics['CAGR'] || backtestResult.stock_metrics['cagr'] || 'N/A')}
            {renderMetricsCard('XIRR', backtestResult.stock_metrics['XIRR'] || backtestResult.stock_metrics['xirr'] || 'N/A')}
            {renderMetricsCard('Sharpe Ratio', backtestResult.stock_metrics['Sharpe Ratio'] || backtestResult.stock_metrics['sharpe_ratio'] || 'N/A')}
            {renderMetricsCard('Treynor Ratio', backtestResult.stock_metrics['Treynor Ratio'] || backtestResult.stock_metrics['treynor_ratio'] || 'N/A')}
            {renderMetricsCard('Calmar Ratio', backtestResult.stock_metrics['Calmar Ratio'] || backtestResult.stock_metrics['calmar_ratio'] || 'N/A')}
            {renderMetricsCard('Max Drawdown', backtestResult.stock_metrics['Max Drawdown'] || backtestResult.stock_metrics['max_drawdown'] || 'N/A')}
           
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'metrics', label: '📊 Metrics' },
                { id: 'trades', label: '📋 Trades' },
                { id: 'costs', label: '💰 Costs' },
                { id: 'execution', label: '⚡ Skipped Trades' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'metrics' && renderMetricsTable()}
            {activeTab === 'trades' && renderTransactionLog()}
            {activeTab === 'costs' && <CostsDashboard />}
            {activeTab === 'execution' && <TradeExecutionTracker />}
          </div>
        </div>

        {/* Export Buttons */}
        {showResults && (
          <div className="mt-8 mb-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Export Data</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportETFPerformanceCSV}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                </svg>
                Stock Performance CSV
              </button>
              
              <button
                onClick={exportNifty50DataCSV}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                Nifty50 Data CSV
              </button>
              
              <button
                onClick={exportTransactionCostsCSV}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                Transaction Costs CSV
              </button>
            </div>
          </div>
        )}

        {/* Footer for Results */}
        <footer className="bg-white border-t border-gray-200 py-6 rounded-lg shadow mt-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2024 WealthAI1. Advanced AI-powered trading strategies.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <button className="hover:text-gray-900 transition-colors">Documentation</button>
                <button className="hover:text-gray-900 transition-colors">Support</button>
                <button className="hover:text-gray-900 transition-colors">API</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default StockStrategy;