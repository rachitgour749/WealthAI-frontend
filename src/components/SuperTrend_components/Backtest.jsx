/**
 * Backtest Page - SuperTrend Strategy
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Form, InputNumber, message, Row, Col, Alert } from 'antd';
import Select from 'react-select';
import { runBacktest } from '../../context/SuperTrendapi/endpoints';
import { validateBacktestRequest } from '../../utils/validators';
import { formatDate, formatIndianCurrency, parseIndianCurrency } from '../../utils/dateFormatter';
import dayjs from 'dayjs';
import { BsThreeDots } from 'react-icons/bs';
import { TbProgressCheck } from 'react-icons/tb';
import { FaRegCheckCircle } from 'react-icons/fa';
import { MdOutlineSaveAlt } from 'react-icons/md';

const SYMBOL_OPTIONS = [
  'RELIANCE',
  'TCS',
  'HDFCBANK',
  'INFY',
  'HINDUNILVR',
  'ICICIBANK',
  'SBIN',
  'BHARTIARTL',
  'KOTAKBANK',
  'ITC',
  'LT',
  'AXISBANK',
  'ASIANPAINT',
  'MARUTI',
  'HCLTECH',
  'BAJFINANCE',
  'TITAN',
  'ULTRACEMCO',
  'WIPRO',
  'NESTLEIND',
  'ADANIENT',
  'NTPC',
  'TATAMOTORS',
  'JSWSTEEL',
  'POWERGRID',
  'BAJAJFINSV',
  'M&M',
  'ADANIPORTS',
  'COALINDIA',
  'DIVISLAB',
  'TATASTEEL',
  'INDUSINDBK',
  'CIPLA',
  'HDFCLIFE',
  'SBILIFE',
  'HINDALCO',
  'BAJAJ-AUTO',
  'GRASIM',
  'DRREDDY',
  'EICHERMOT',
  'APOLLOHOSP',
  'BPCL',
  'HEROMOTOCO',
  'BRITANNIA',
  'TRENT',
  'HAVELLS',
  'SHRIRAMFIN',
  'ADANIGREEN',
  'PIDILITIND',
  'SIEMENS',
  'ABB',
  'DLF',
  'AMBUJACEM',
  'ICICIPRULI',
  'GODREJCP',
  'SBICARD',
  'VEDL',
  'BANKBARODA',
  'CHOLAFIN',
  'DABUR',
  'MARICO',
  'INDIGO',
  'NYKAA',
  'GLAND',
  'DMART',
  'IRCTC',
  'PNB',
  'IOC',
  'BOSCHLTD',
  'LTIM',
  'TORNTPHARM',
  'BERGEPAINT',
  'PFC',
  'RECLTD',
  'LICHSGFIN',
  'UNIONBANK',
  'IDFCFIRSTB',
  'BANDHANBNK',
  'FEDERALBNK',
  'AUBANK',
  'INDIANB',
  'MUTHOOTFIN',
  'BATAINDIA',
  'PAGEIND',
  'COLPAL',
  'GODREJPROP',
  'OBEROIRLTY',
  'BRIGADE',
  'PRESTIGE',
  'LODHA',
  'CONCOR',
  'ZYDUSLIFE',
  'LUPIN',
  'BIOCON',
  'ALKEM',
  'LAURUSLABS',
  'LALPATHLAB',
  'METROPOLIS',
  'AUROPHARMA',
  'SUNPHARMA',
  'FORTIS',
  'MAXHEALTH',
  'AIAENG',
  'THERMAX',
  'VOLTAS',
  'BLUEDART',
  'CROMPTON',
  'POLYCAB',
  'KEI',
  'DIXON',
  'AMBER',
  'DOMS',
  'APLAPOLLO',
  'ASTRAL',
  'ADANIPOWER',
  'TATAPOWER',
  'NHPC',
  'SJVN',
  'TORNTPOWER',
  'CESC',
  'JINDALSTEL',
  'NMDC',
  'MOIL',
  'NATIONALUM',
  'WELCORP',
  'RAYMOND',
  'SOLARINDS',
  'KPITTECH',
  'COFORGE',
  'PERSISTENT',
  'MPHASIS',
  'LTTS',
  'TECHM',
  'OFSS',
  'TATAELXSI',
  'CYIENT',
  'SONACOMS',
  'MOTHERSON',
  'BALKRISIND',
  'APOLLOTYRE',
  'MRF',
  'ESCORTS',
  'ASHOKLEY',
  'EXIDEIND',
  'TIINDIA',
  'BHARATFORG',
  'CUMMINSIND',
  'SKFINDIA',
  'SCHAEFFLER',
  'TIMKEN',
  'DEEPAKNTR',
  'CLEAN',
  'SRF',
  'ATUL',
  'NAVINFLUOR',
  'PIIND',
  'GNFC',
  'CHAMBLFERT',
  'COROMANDEL',
  'UPL',
  'RALLIS',
  'TATACOMM',
  'ROUTE',
  'TANLA',
  'MFSL',
  'CDSL',
  'CAMS',
  'MAZDOCK',
  'COCHINSHIP',
  'GRSE',
  'BEL',
  'HAL',
  'BEML',
  'RVNL',
  'IRCON',
  'RAILTEL',
  'IRFC',
  'HUDCO',
  'CANBK',
  'SAIL',
  'ONGC',
  'GAIL',
  'PETRONET',
  'GSPL',
  'IGL',
  'MGL',
  'GUJGASLTD',
  'FINEORG',
  'SUMICHEM',
  'ALKYLAMINE',
  'TATACHEM',
  'TATACONSUM',
  'VBL',
  'CCL',
  'RADICO',
  'UNITDSPR',
  'PGHH',
  'GILLETTE',
  'EMAMILTD',
  'WESTLIFE',
  'DEVYANI',
  'SAPPHIRE',
  'KIMS',
  'RAIN',
  'STARCEMENT',
];

const Backtest = ({ 
  onBacktestSuccess,
  embedded = false,
  initialConfig = null,
  onRunningStateChange = null,
  onSaveStrategy = null,
}) => {
  const [form] = Form.useForm();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [activeSetupStep, setActiveSetupStep] = useState(1);

  // Notify parent when running state changes
  useEffect(() => {
    if (onRunningStateChange) {
      onRunningStateChange(isRunning);
    }
  }, [isRunning, onRunningStateChange]);

  // Stock Selection State
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(false);

  // Date Range State
  const [dateRange, setDateRange] = useState({ start: '', end: '', years: 0 });
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);

  // Strategy Parameters
  const [emaShort, setEmaShort] = useState(10);
  const [emaLong, setEmaLong] = useState(20);
  const [maxHoldings, setMaxHoldings] = useState(5);
  const [initialCapital, setInitialCapital] = useState(1000000);
  const [initialCapitalDisplay, setInitialCapitalDisplay] = useState(formatIndianCurrency(1000000));
  const [bufferPct, setBufferPct] = useState(10.0);
  const [brokeragePct, setBrokeragePct] = useState(0.1);

  // Load available stocks on mount
  useEffect(() => {
    const loadStocks = () => {
      setLoadingStocks(true);
      const stocks = SYMBOL_OPTIONS.map(symbol => ({
        value: symbol,
        label: symbol
      }));
      setAvailableStocks(stocks);
      setLoadingStocks(false);
    };
    loadStocks();
  }, []);

  // Calculate date range when stocks change
  const calculateDateRange = useCallback(() => {
    if (selectedStocks.length === 0) return;

    try {
      setDateRangeLoading(true);
      // For SuperTrend, we'll use a default date range
      // In production, you might want to fetch this from backend
      const endDate = dayjs().format('YYYY-MM-DD');
      const startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
      
      setDateRange({
        start: startDate,
        end: endDate,
        years: 1
      });
      setCustomStartDate(startDate);
      setCustomEndDate(endDate);
    } catch (err) {
      console.error('Error calculating date range:', err);
    } finally {
      setDateRangeLoading(false);
    }
  }, [selectedStocks]);

  useEffect(() => {
    if (selectedStocks.length > 0) {
      calculateDateRange();
    } else {
      setDateRange({ start: '', end: '', years: 0 });
      setCustomStartDate('');
      setCustomEndDate('');
      setUseCustomDates(false);
      setDateRangeLoading(false);
    }
  }, [selectedStocks, calculateDateRange]);

  // Restore state from initialConfig
  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.ema_short !== undefined) setEmaShort(initialConfig.ema_short);
      if (initialConfig.ema_long !== undefined) setEmaLong(initialConfig.ema_long);
      if (initialConfig.max_holdings !== undefined) setMaxHoldings(initialConfig.max_holdings);
      if (initialConfig.initial_capital !== undefined) {
        setInitialCapital(initialConfig.initial_capital);
        setInitialCapitalDisplay(formatIndianCurrency(initialConfig.initial_capital));
      }
      if (initialConfig.buffer_pct !== undefined) setBufferPct(initialConfig.buffer_pct);
      if (initialConfig.brokerage_pct !== undefined) setBrokeragePct(initialConfig.brokerage_pct);
      if (initialConfig.symbols && Array.isArray(initialConfig.symbols)) {
        setSelectedStocks(initialConfig.symbols);
      }
      if (initialConfig.date_range) setDateRange(initialConfig.date_range);
      if (initialConfig.custom_start_date) setCustomStartDate(initialConfig.custom_start_date);
      if (initialConfig.custom_end_date) setCustomEndDate(initialConfig.custom_end_date);
      if (initialConfig.use_custom_dates !== undefined) setUseCustomDates(initialConfig.use_custom_dates);
      setActiveSetupStep(4);
    }
  }, [initialConfig]);

  const handleRunBacktest = async (values) => {
    setIsRunning(true);
    setError(null);

    try {
      // Use custom dates if enabled, otherwise use calculated date range
      let startDate = useCustomDates ? customStartDate : dateRange.start;
      let endDate = useCustomDates ? customEndDate : dateRange.end;

      // Validate date range
      if (!startDate || !endDate) {
        setError('Please select stocks first or enable custom dates');
        setIsRunning(false);
        return;
      }

      // Update active step
      setActiveSetupStep(4);

      const request = {
        start_date: dayjs(startDate).format('DD-MM-YYYY'),
        end_date: dayjs(endDate).format('DD-MM-YYYY'),
        initial_capital: parseFloat(initialCapital),
        brokerage_pct: brokeragePct,
        buffer_pct: bufferPct,
        ema_short: emaShort,
        ema_long: emaLong,
        max_holdings: maxHoldings,
        symbols: selectedStocks.map(s => s.value),
      };

      // Validate request
      const errors = validateBacktestRequest(request);
      if (errors.length > 0) {
        setError(errors[0]);
        message.error(errors[0]);
        setIsRunning(false);
        return;
      }

      const result = await runBacktest(request);
      
      if (result) {
        message.success('Backtest completed successfully!');
        
        // Add config for restoration
        const resultWithConfig = {
          ...result,
          config: {
            ema_short: emaShort,
            ema_long: emaLong,
            max_holdings: maxHoldings,
            initial_capital: parseFloat(initialCapital),
            buffer_pct: bufferPct,
            brokerage_pct: brokeragePct,
            symbols: selectedStocks,
            start_date: request.start_date,
            end_date: request.end_date,
            custom_start_date: customStartDate,
            custom_end_date: customEndDate,
            use_custom_dates: useCustomDates,
            date_range: dateRange,
          },
          start_date: request.start_date,
          end_date: request.end_date,
        };

        if (onBacktestSuccess) {
          onBacktestSuccess(resultWithConfig);
        }
      }
    } catch (error) {
      setError(error.message || 'Backtest failed');
      message.error('Failed to run backtest');
    } finally {
      setIsRunning(false);
    }
  };

  // Shared inner content
  const innerContent = (
    <div className={embedded ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"}>
      {/* Left Column - Stock Selection */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-teal-200">
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                📈
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900">
                Stock Universe Selection
              </span>
            </div>
              <button
                onClick={() => {
                  if (activeSetupStep < 2) {
                    message.error('Please complete Step 1 and Step 2 first');
                    return;
                  }
                  if (selectedStocks.length === 0) {
                    message.error('Please select stocks first');
                    return;
                  }
                  const currentConfig = {
                    selectedStocks: selectedStocks,
                    dateRange: dateRange,
                    customStartDate: customStartDate,
                    customEndDate: customEndDate,
                    useCustomDates: useCustomDates,
                    emaShort: emaShort,
                    emaLong: emaLong,
                    maxHoldings: maxHoldings,
                    initialCapital: initialCapital,
                    bufferPct: bufferPct,
                    brokeragePct: brokeragePct,
                  };
                  if (onSaveStrategy) {
                    onSaveStrategy(currentConfig);
                  } else {
                    message.info('Save strategy feature coming soon');
                  }
                }}
                disabled={activeSetupStep < 2 || selectedStocks.length === 0}
                className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <MdOutlineSaveAlt className="w-4 h-4 mr-1.5" />
                Save Strategy
              </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Choose Stocks for SuperTrend strategy
            </label>
            <button 
              className="text-sm px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:from-blue-100 hover:to-purple-100 rounded-lg flex items-center gap-2 cursor-not-allowed opacity-75 border border-blue-200"
              disabled
              title="This feature is coming soon!"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI Suggestions</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                Coming Soon
              </span>
            </button>
          </div>

          <Select
            isMulti
            options={availableStocks}
            value={selectedStocks}
            onChange={(selected) => {
              setSelectedStocks(selected || []);
              setActiveSetupStep(Math.max(activeSetupStep, 2));
            }}
            placeholder={
              loadingStocks
                ? "Loading stocks..."
                : availableStocks.length > 0
                ? "Select multiple stocks..."
                : "Loading available stocks..."
            }
            isLoading={loadingStocks}
            isDisabled={loadingStocks}
            className="mb-4"
            noOptionsMessage={() =>
              loadingStocks
                ? "Loading..."
                : "No stocks available."
            }
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#0D9488",
                boxShadow: "0 0 0 1px #0D9488",
                "&:hover": {
                  borderColor: "#0F766E",
                },
              }),
            }}
          />

          {availableStocks.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {selectedStocks.length > 0
                ? `${selectedStocks.length} stock(s) selected. You can add/remove stocks manually.`
                : `Available: ${availableStocks.length} stocks. Select stocks from the dropdown.`}
            </p>
          )}
        </div>
      </div>

      {/* Right Column - Configuration */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRunBacktest}
            disabled={isRunning}
            className="space-y-4"
          >
            {/* Header with Title and Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                  📅
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  Date Range
                </span>
              </div>
              <Form.Item className="mb-0">
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    form.submit();
                  }}
                  disabled={
                    isRunning ||
                    selectedStocks.length === 0 ||
                    (useCustomDates
                      ? !customStartDate || !customEndDate
                      : !dateRange.start || !dateRange.end)
                  }
                  className="inline-flex items-center px-3 py-2 border border-transparent text-[13px] font-medium rounded-lg text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {isRunning ? (
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
              </Form.Item>
            </div>

            {/* Error Display */}
            {error && (
              <Alert
                message="Backtest Error"
                description={error}
                type="error"
                showIcon
                className="mb-4"
                closable
                onClose={() => setError(null)}
              />
            )}

            {/* Date Range Section */}
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">
                Backtest Period
              </label>

              {dateRangeLoading && (
                <div className="flex items-center text-sm text-teal-600 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                  Calculating optimal date range...
                </div>
              )}

              {selectedStocks.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Available Period:</span>
                        {dateRange.start && dateRange.end ? (
                          <p className="font-semibold text-gray-900">
                            {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
                          </p>
                        ) : (
                          <p className="font-semibold text-gray-400">-</p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Max Duration:</span>
                        {dateRange.years > 0 ? (
                          <p className="font-semibold text-green-600">
                            {dateRange.years.toFixed(1)} years
                          </p>
                        ) : (
                          <p className="font-semibold text-gray-400">0 years</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useCustomDates"
                      checked={useCustomDates}
                      onChange={(e) => setUseCustomDates(e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="useCustomDates"
                      className="ml-2 block text-sm font-medium text-gray-900"
                    >
                      Customize date range
                    </label>
                  </div>

                  {useCustomDates && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => {
                            setCustomStartDate(e.target.value);
                            if (activeSetupStep < 2) {
                              setActiveSetupStep(2);
                            }
                          }}
                          min={dateRange.start}
                          max={dateRange.end}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => {
                            setCustomEndDate(e.target.value);
                            if (activeSetupStep < 2) {
                              setActiveSetupStep(2);
                            }
                          }}
                          min={customStartDate || dateRange.start}
                          max={dateRange.end}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-500 text-center">
                    Please select stocks to see available date range
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Strategy Parameters
              </h3>
            </div>

            <Row gutter={16} style={{ marginTop: "10px" }}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 text-sm">EMA (Short)</span>}
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={1}
                    max={100}
                    value={emaShort}
                    onChange={(val) => setEmaShort(val)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 text-sm">EMA (Long)</span>}
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={2}
                    max={200}
                    value={emaLong}
                    onChange={(val) => setEmaLong(val)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "-12px" }}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 text-sm">Max Holdings</span>}
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={1}
                    max={20}
                    value={maxHoldings}
                    onChange={(val) => setMaxHoldings(val)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 text-sm">Initial Capital (₹)</span>}
                >
                  <input
                    type="text"
                    value={initialCapitalDisplay}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setInitialCapitalDisplay(inputValue);
                      const numericValue = parseIndianCurrency(inputValue);
                      if (!isNaN(numericValue) && numericValue >= 0) {
                        setInitialCapital(numericValue);
                      }
                      setActiveSetupStep(Math.max(activeSetupStep, 4));
                    }}
                    onBlur={(e) => {
                      const numericValue = parseIndianCurrency(e.target.value);
                      if (numericValue >= 10000) {
                        setInitialCapital(numericValue);
                        setInitialCapitalDisplay(formatIndianCurrency(numericValue));
                      } else {
                        setInitialCapital(10000);
                        setInitialCapitalDisplay(formatIndianCurrency(10000));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="₹10,00,000"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "-12px" }}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 text-sm">Buffer Reserve (%)</span>}
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={0}
                    max={30}
                    step={0.1}
                    value={bufferPct}
                    onChange={(val) => setBufferPct(val)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-gray-700 text-sm">Brokerage (%)</span>}
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={0}
                    max={2}
                    step={0.01}
                    value={brokeragePct}
                    onChange={(val) => setBrokeragePct(val)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="bg-white">{innerContent}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Progress Steps */}
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: "Strategy Selection", icon: <FaRegCheckCircle className="w-7 h-7" /> },
                { step: 2, title: "Strategy Configuration", icon: <TbProgressCheck className="w-7 h-7" />},
                { step: 3, title: "Execution", icon: <BsThreeDots className="w-7 h-7 border-2 border-gray-500 rounded-full p-[3px]"/>}
              ].map((item, index) => {
                const isCompleted = activeSetupStep >= item.step;
                const isCurrent = activeSetupStep === item.step;
                
                return (
                  <React.Fragment key={item.step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                          isCompleted
                            ? "bg-teal-600 text-white shadow-lg"
                            : isCurrent
                            ? "bg-white text-gray-400 shadow-lg border-none"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          item.icon
                        )}
                      </div>
                      <span
                        className={`text-[10px] mt-2 font-medium ${
                          isCompleted || isCurrent
                            ? "text-gray-600"
                            : "text-gray-600"
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    {index < 2 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                          isCompleted
                            ? "bg-teal-400"
                            : "bg-gray-400"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">{innerContent}</div>
        </div>
      </div>
    </div>
  );
};

export default Backtest;

