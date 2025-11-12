import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Select as AntSelect,
  DatePicker,
  Button,
  Row,
  Col,
  Alert,
  message,
  Space,
  Typography,
  Skeleton,
  InputNumber,
  Divider,
} from "antd";
import Select from "react-select";
import axios from "axios";
import { useApp } from "../../context/RScontext";
import { STOCK_UNIVERSE_OPTIONS } from "../../utils/constants";
import { formatDate, formatIndianCurrency, parseIndianCurrency } from "../../utils/dateFormatter";
import dayjs from "dayjs";
import { BsThreeDots } from "react-icons/bs";
import { TbProgressCheck } from "react-icons/tb";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdOutlineSaveAlt } from "react-icons/md";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const Backtest = ({
  onBacktestSuccess,
  embedded = false,
  initialConfig = null,
  onRunningStateChange = null, // Callback to notify parent of running state
  onSaveStrategy = null, // Callback to save strategy from universe selection
}) => {
  const { runBacktest } = useApp();
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

  // Removed inline results state - results now shown in separate view (like ETF Strategy)

  // Stock Selection State
  const [selectedUniverses, setSelectedUniverses] = useState(new Set()); // Track which universe checkboxes are checked (can be multiple)
  const [availableStocks, setAvailableStocks] = useState([]); // All stocks for dropdown
  const [selectedStocks, setSelectedStocks] = useState([]); // Selected stocks
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [universeStocksMap, setUniverseStocksMap] = useState({}); // Track stocks by universe: { 'NIFTY50': ['RELIANCE', ...], 'NIFTY100': [...] }

  // Date Range State (like ETF Strategy)
  const [dateRange, setDateRange] = useState({ start: "", end: "", years: 0 });
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);

  // Default parameter values (only visible parameters)
  const [maxPositions, setMaxPositions] = useState(20);
  const [totalCapital, setTotalCapital] = useState(1000000);
  const [totalCapitalDisplay, setTotalCapitalDisplay] = useState(formatIndianCurrency(1000000)); // Formatted display value
  const [stopLossPct, setStopLossPct] = useState(15.0);
  const [bufferCapitalPct, setBufferCapitalPct] = useState(10.0);
  const [capitalResetThresholdPct, setCapitalResetThresholdPct] =
    useState(25.0);
  const [transactionCostPct, setTransactionCostPct] = useState(0.1);
  const [riskFreeRate, setRiskFreeRate] = useState(6.0);

  // Hidden/default parameters (not shown in UI)
  const mainIndex = "^NSEI"; // Default main index
  const [stockUniverse, setStockUniverse] = useState("NIFTY500"); // Default stock universe

  // Calculate position size automatically based on max_positions and buffer_capital_pct
  const calculatePositionSizePct = () => {
    const availableCapitalPct = 1 - bufferCapitalPct / 100;
    const calculatedPositionSizePct =
      (availableCapitalPct / maxPositions) * 100;
    return calculatedPositionSizePct;
  };

  // Removed transaction data loading - now handled in ResultDetail component

  // Calculate date range function (like ETF Strategy)
  const calculateDateRange = useCallback(async () => {
    if (selectedStocks.length === 0) return;

    try {
      setDateRangeLoading(true);
      setError(""); // Clear previous errors

      const response = await axios.post("/api/rs-strategy/date-range", {
        tickers: selectedStocks.map((stock) => stock.value),
      });

      if (response.data && response.data.start_date && response.data.end_date) {
        setDateRange({
          start: response.data.start_date,
          end: response.data.end_date,
          years: response.data.years,
        });
        // Set custom dates to match the calculated range initially
        setCustomStartDate(response.data.start_date);
        setCustomEndDate(response.data.end_date);
        console.log("Date range calculated:", response.data);
        console.log(
          "Set custom dates to:",
          response.data.start_date,
          "and",
          response.data.end_date
        );
      } else {
        console.warn("Date range calculation returned empty dates");
      }
    } catch (err) {
      console.error("Error calculating date range:", err);
      // Don't set error here - let the backtest use fallback dates
      console.log("Will use fallback dates for backtest");
    } finally {
      setDateRangeLoading(false);
    }
  }, [selectedStocks]);

  // Auto-load NIFTY500 stocks when component mounts so dropdown has options
  useEffect(() => {
    const loadDefaultStocks = async () => {
      try {
        setLoadingStocks(true);
        const response = await axios.get(
          `/api/rs-strategy/stocks/universe/NIFTY500`
        );

        if (response.data.success && response.data.stocks) {
          const stocks = response.data.stocks.map((stock) => ({
            value: stock.symbol || stock.value,
            label: `${stock.symbol || stock.value}`,
          }));

          setAvailableStocks(stocks);
          // Don't auto-select - let user choose manually
          setStockUniverse("NIFTY500");
        }
      } catch (error) {
        console.error("Error loading default stocks:", error);
        message.error("Failed to load stocks. Please check your connection.");
      } finally {
        setLoadingStocks(false);
      }
    };

    // Load default stocks on component mount
    loadDefaultStocks();
  }, []); // Empty array = runs once on mount

  // Calculate date range when stocks change
  useEffect(() => {
    if (selectedStocks.length > 0) {
      calculateDateRange();
    } else {
      // Reset date range and duration when all stocks are cleared
      setDateRange({ start: "", end: "", years: 0 });
      setCustomStartDate("");
      setCustomEndDate("");
      setUseCustomDates(false);
      setDateRangeLoading(false);
    }
  }, [selectedStocks, calculateDateRange]);

  // Update custom dates when date range changes
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      setCustomStartDate(dateRange.start);
      setCustomEndDate(dateRange.end);
      console.log(
        "Updated custom dates:",
        dateRange.start,
        "to",
        dateRange.end
      );
    }
  }, [dateRange.start, dateRange.end]);

  // Restore state from initialConfig when navigating back from results
  useEffect(() => {
    if (initialConfig) {
      console.log("Restoring state from initialConfig:", initialConfig);

      // Restore strategy parameters
      if (initialConfig.max_positions !== undefined)
        setMaxPositions(initialConfig.max_positions);
      if (initialConfig.total_capital !== undefined) {
        setTotalCapital(initialConfig.total_capital);
        setTotalCapitalDisplay(formatIndianCurrency(initialConfig.total_capital));
      }
      if (initialConfig.stop_loss_pct !== undefined)
        setStopLossPct(initialConfig.stop_loss_pct);
      if (initialConfig.buffer_capital_pct !== undefined)
        setBufferCapitalPct(initialConfig.buffer_capital_pct);
      if (initialConfig.capital_reset_threshold_pct !== undefined)
        setCapitalResetThresholdPct(initialConfig.capital_reset_threshold_pct);
      if (initialConfig.transaction_cost_pct !== undefined)
        setTransactionCostPct(initialConfig.transaction_cost_pct);
      if (initialConfig.risk_free_rate !== undefined)
        setRiskFreeRate(initialConfig.risk_free_rate);
      if (initialConfig.stock_universe !== undefined)
        setStockUniverse(initialConfig.stock_universe);

      // Restore selected stocks
      if (
        initialConfig.custom_stocks &&
        Array.isArray(initialConfig.custom_stocks)
      ) {
        setSelectedStocks(initialConfig.custom_stocks);
      }

      // Restore selected universes
      if (
        initialConfig.selected_universes &&
        Array.isArray(initialConfig.selected_universes)
      ) {
        setSelectedUniverses(new Set(initialConfig.selected_universes));
      }

      // Restore date range and custom dates
      if (initialConfig.date_range) {
        setDateRange(initialConfig.date_range);
      }
      if (initialConfig.custom_start_date)
        setCustomStartDate(initialConfig.custom_start_date);
      if (initialConfig.custom_end_date)
        setCustomEndDate(initialConfig.custom_end_date);
      if (initialConfig.use_custom_dates !== undefined)
        setUseCustomDates(initialConfig.use_custom_dates);

      // Set active step to show the setup is complete
      setActiveSetupStep(4);
    }
  }, [initialConfig]);

  // Reset custom dates when stocks change
  useEffect(() => {
    if (selectedStocks.length === 0) {
      setCustomStartDate("");
      setCustomEndDate("");
      setUseCustomDates(false);
    }
  }, [selectedStocks]);

  // Fetch stocks by universe
  const fetchStocksByUniverse = async (
    universe,
    autoSelect = false,
    mergeWithExisting = false
  ) => {
    try {
      setLoadingStocks(true);
      const response = await axios.get(
        `/api/rs-strategy/stocks/universe/${universe}`
      );

      if (response.data.success) {
        const stocks = response.data.stocks.map((stock) => ({
          value: stock.symbol || stock.value,
          label: `${stock.symbol || stock.value}`,
        }));

        // Store stocks for this universe to track them
        setUniverseStocksMap((prev) => ({
          ...prev,
          [universe]: stocks.map((s) => s.value), // Store just the values (symbols)
        }));

        // Update available stocks (merge with existing or replace)
        if (mergeWithExisting) {
          // Merge with existing available stocks, avoiding duplicates
          setAvailableStocks((prev) => {
            const existingValues = new Set(prev.map((s) => s.value));
            const newStocks = stocks.filter(
              (s) => !existingValues.has(s.value)
            );
            return [...prev, ...newStocks];
          });
        } else {
          // Replace available stocks
          setAvailableStocks(stocks);
        }

        setStockUniverse(universe);

        // Only auto-select if requested (for checkbox behavior)
        if (autoSelect) {
          setSelectedStocks((prev) => {
            // Merge with existing selections, avoiding duplicates
            const existingValues = new Set(prev.map((s) => s.value));
            const newSelections = stocks.filter(
              (s) => !existingValues.has(s.value)
            );
            const merged = [...prev, ...newSelections];
            return merged;
          });
          message.success(
            `Loaded and selected ${stocks.length} stocks from ${universe}`
          );
        } else {
          // If not auto-selecting, don't change selectedStocks - let user choose manually
          message.success(
            `Loaded ${stocks.length} stocks from ${universe}. Select stocks from dropdown.`
          );
        }

        setActiveSetupStep(Math.max(activeSetupStep, 1));
      }
    } catch (error) {
      message.error(`Failed to load ${universe} stocks: ${error.message}`);
      console.error("Error fetching stocks:", error);
    } finally {
      setLoadingStocks(false);
    }
  };

  // Handle checkbox changes for universe selection
  const handleUniverseCheckbox = async (universe, checked) => {
    if (checked) {
      // Add universe to selected set
      setSelectedUniverses((prev) => new Set([...prev, universe]));

      // Populate dropdown AND auto-select all stocks from this universe
      // Merge with existing selections so user's manual selections are preserved
      await fetchStocksByUniverse(universe, true, true); // autoSelect=true, mergeWithExisting=true
    } else {
      // Calculate updated universes before state update
      const updatedUniverses = new Set(selectedUniverses);
      updatedUniverses.delete(universe);

      // Remove universe from selected set
      setSelectedUniverses(updatedUniverses);

      // Remove stocks from this universe from selectedStocks
      // Keep manually selected stocks and stocks from other universes
      setSelectedStocks((prev) => {
        const stocksToRemove = universeStocksMap[universe] || [];
        const stocksToRemoveSet = new Set(stocksToRemove);
        return prev.filter((stock) => !stocksToRemoveSet.has(stock.value));
      });

      // Clear this universe from the map
      setUniverseStocksMap((prev) => {
        const updated = { ...prev };
        delete updated[universe];
        return updated;
      });

      // If no universe is selected, reload default NIFTY500 stocks to dropdown
      // But don't auto-select them
      if (updatedUniverses.size === 0) {
        // No universes selected, reload default
        try {
          const response = await axios.get(
            `/api/rs-strategy/stocks/universe/NIFTY500`
          );
          if (response.data.success) {
            const stocks = response.data.stocks.map((stock) => ({
              value: stock.symbol || stock.value,
              label: `${stock.symbol || stock.value}`,
            }));
            setAvailableStocks(stocks);
            setStockUniverse("NIFTY500");
          }
        } catch (error) {
          console.error("Error loading default stocks:", error);
        }
      }
    }
  };

  const handleRunBacktest = async (values) => {
    setIsRunning(true);
    setError(null);

    try {
      // Use custom dates if enabled, otherwise use calculated date range (like ETF Strategy)
      let startDate = useCustomDates ? customStartDate : dateRange.start;
      let endDate = useCustomDates ? customEndDate : dateRange.end;

      // Validate date range
      if (!startDate || !endDate) {
        setError("Please select stocks first or enable custom dates");
        setIsRunning(false);
        return;
      }

      // Update active step to indicate execution
      setActiveSetupStep(4);

      // Calculate position size automatically
      const calculatedPositionSizePct = calculatePositionSizePct();

      // Prepare all parameters (only send visible + calculated parameters)
      const backtestParams = {
        start_date: startDate,
        end_date: endDate,
        main_index: mainIndex, // Default: '^NSEI'
        stock_universe: stockUniverse, // Default: 'NIFTY500'
        custom_stocks:
          selectedStocks.length > 0 ? selectedStocks.map((s) => s.value) : null, // Custom stock selection
        max_positions: maxPositions,
        position_size_pct: calculatedPositionSizePct, // Auto-calculated based on max_positions and buffer_capital_pct
        total_capital: parseFloat(totalCapital),
        stop_loss_pct: stopLossPct,
        buffer_capital_pct: bufferCapitalPct,
        capital_reset_threshold_pct: capitalResetThresholdPct,
        transaction_cost_pct: transactionCostPct,
        risk_free_rate: riskFreeRate,
        // Removed: max_holding_period, min_price, min_turnover (use backend defaults)
      };

      const result = await runBacktest(backtestParams);

      if (result.success || result.results || result.rs_metrics) {
        message.success("Backtest completed successfully!");

        // Add config parameters to result for saving strategy later (include full setup state for restoration)
        const resultWithConfig = {
          ...result,
          config: {
            main_index: mainIndex,
            stock_universe: stockUniverse,
            max_positions: maxPositions,
            position_size_pct: calculatedPositionSizePct, // Auto-calculated
            total_capital: parseFloat(totalCapital),
            stop_loss_pct: stopLossPct,
            buffer_capital_pct: bufferCapitalPct,
            capital_reset_threshold_pct: capitalResetThresholdPct,
            transaction_cost_pct: transactionCostPct,
            risk_free_rate: riskFreeRate,
            // Include full setup state for restoration
            custom_stocks: selectedStocks,
            selected_universes: Array.from(selectedUniverses),
            start_date: backtestParams.start_date,
            end_date: backtestParams.end_date,
            custom_start_date: customStartDate,
            custom_end_date: customEndDate,
            use_custom_dates: useCustomDates,
            date_range: dateRange,
          },
          start_date: backtestParams.start_date,
          end_date: backtestParams.end_date,
        };

        // Keep step at 2 (Execute) - results are shown in separate view

        // Call the success callback to show results (pass full response like ETF Strategy)
        if (onBacktestSuccess) {
          onBacktestSuccess(resultWithConfig); // Pass entire response with config
        }
      } else {
        message.info("Backtest already exists or is in progress");
      }
    } catch (error) {
      setError(error.message || "Backtest failed");
      message.error("Failed to run backtest");
    } finally {
      setIsRunning(false);
    }
  };

  // Shared inner content used for both standalone and embedded mode
  const innerContent = (
    <div
      className={
        embedded
          ? "space-y-6"
          : "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
      }
    >
      {/* Left Column - Stock Selection */}
      <div className="space-y-6">
        {/* Stocks Universe Selection Card */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                📈
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900">
                Stocks Universe Selection
              </span>
            </div>
            {onSaveStrategy && (
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
                  // Get current configuration
                  const currentConfig = {
                    selectedStocks: selectedStocks,
                    dateRange: dateRange,
                    customStartDate: customStartDate,
                    customEndDate: customEndDate,
                    useCustomDates: useCustomDates,
                    maxPositions: maxPositions,
                    totalCapital: totalCapital,
                    stopLossPct: stopLossPct,
                    bufferCapitalPct: bufferCapitalPct,
                    capitalResetThresholdPct: capitalResetThresholdPct,
                    transactionCostPct: transactionCostPct,
                    riskFreeRate: riskFreeRate,
                    mainIndex: mainIndex,
                    stockUniverse: stockUniverse,
                    positionSizePct: calculatePositionSizePct()
                  };
                  onSaveStrategy(currentConfig);
                }}
                disabled={activeSetupStep < 2 || selectedStocks.length === 0}
                className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {/* <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg> */}
                 <MdOutlineSaveAlt className="w-4 h-4 mr-1.5" />
                Save Strategy
              </button>
            )}
          </div>

          {/* <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Stocks for RS strategy
          </label> */}

          {/* Universe Checkboxes */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-600 font-medium">
                Quick Selection:
              </p>
              <button 
                className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:from-blue-100 hover:to-purple-100 rounded-lg flex items-center gap-1.5 cursor-not-allowed opacity-75 border border-blue-200"
                disabled
                title="This feature is coming soon!"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Suggestions</span>
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                  Coming Soon
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nifty50"
                  checked={selectedUniverses.has("NIFTY50")}
                  onChange={(e) =>
                    handleUniverseCheckbox("NIFTY50", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="nifty50"
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  NIFTY 50
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nifty100"
                  checked={selectedUniverses.has("NIFTY100")}
                  onChange={(e) =>
                    handleUniverseCheckbox("NIFTY100", e.target.checked)
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="nifty100"
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  NIFTY 100
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nifty200"
                  checked={selectedUniverses.has("NIFTY200")}
                  onChange={(e) =>
                    handleUniverseCheckbox("NIFTY200", e.target.checked)
                  }
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="nifty200"
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  NIFTY 200
                </label>
              </div>

              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nifty500"
                  checked={selectedUniverses.has('NIFTY500')}
                  onChange={(e) => handleUniverseCheckbox('NIFTY500', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="nifty500" className="ml-2 text-sm font-medium text-gray-900">
                  NIFTY 500
                </label>
              </div> */}
            </div>
          </div>

          {/* Multi-select Input */}
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
                ? "Select multiple Stocks..."
                : "Click a universe checkbox to load stocks"
            }
            isLoading={loadingStocks}
            isDisabled={loadingStocks}
            className="mb-4"
            noOptionsMessage={() =>
              loadingStocks
                ? "Loading..."
                : "No stocks available. Select a universe checkbox first."
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

          {/* Helper text */}
          {availableStocks.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {selectedStocks.length > 0
                ? `${selectedStocks.length} stock(s) selected${
                    selectedUniverses.size > 0
                      ? ` (${Array.from(selectedUniverses).join(
                          ", "
                        )} auto-selected)`
                      : ""
                  }. You can add/remove stocks manually.`
                : `Available: ${availableStocks.length} stocks. Select stocks from the dropdown or check a universe checkbox.`}
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

              {selectedStocks.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Available Period:</span>
                        {dateRange.start && dateRange.end ? (
                          <p className="font-semibold text-gray-900">
                            {formatDate(dateRange.start)} to{" "}
                            {formatDate(dateRange.end)}
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
                      onChange={(e) => {
                        setUseCustomDates(e.target.checked);
                        setActiveSetupStep(Math.max(activeSetupStep, 3));
                      }}
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
              )}

              {selectedStocks.length === 0 && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Available Period:</span>
                        {dateRange.start && dateRange.end ? (
                          <p className="font-semibold text-gray-900">
                            {formatDate(dateRange.start)} to{" "}
                            {formatDate(dateRange.end)}
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
                      onChange={(e) => {
                        setUseCustomDates(e.target.checked);
                       
                          setActiveSetupStep(Math.max(activeSetupStep, 3));
                       
                      }}
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
            {/* Max Positions and Total Capital */}
            <Row gutter={16} style={{ marginTop: "10px" }}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 text-sm">
                      No. of Positions
                    </span>
                  }
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={1}
                    max={100}
                    value={maxPositions}
                    onChange={(val) => setMaxPositions(val)}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Position size: {calculatePositionSizePct().toFixed(2)}%
                    (auto-calculated)
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 text-sm">
                      Total Capital (₹)
                    </span>
                  }
                >
                  <input
                    type="text"
                    value={totalCapitalDisplay}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setTotalCapitalDisplay(inputValue);
                      
                      // Parse the input and update numeric value
                      const numericValue = parseIndianCurrency(inputValue);
                      if (!isNaN(numericValue) && numericValue >= 0) {
                        setTotalCapital(numericValue);
                      }
                      setActiveSetupStep(Math.max(activeSetupStep, 4));
                    }}
                    onBlur={(e) => {
                      // Format the value when user leaves the field
                      const numericValue = parseIndianCurrency(e.target.value);
                      if (numericValue >= 100000) {
                        setTotalCapital(numericValue);
                        setTotalCapitalDisplay(formatIndianCurrency(numericValue));
                      } else {
                        // Reset to minimum if below threshold
                        setTotalCapital(100000);
                        setTotalCapitalDisplay(formatIndianCurrency(100000));
                      }
                    }}
                    onFocus={(e) => {
                      // Select all text on focus for easy editing
                      e.target.select();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="₹10,00,000"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "-12px" }}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 text-sm">Stop Loss (%)</span>
                  }
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={0}
                    max={50}
                    step={0.1}
                    value={stopLossPct}
                    onChange={(val) => setStopLossPct(val)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 text-sm">
                      Buffer Capital (%)
                    </span>
                  }
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={0}
                    max={50}
                    step={0.1}
                    value={bufferCapitalPct}
                    onChange={(val) => setBufferCapitalPct(val)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "-12px" }}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 text-sm">
                      Transaction Cost (%)
                    </span>
                  }
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={0}
                    max={2}
                    step={0.01}
                    value={transactionCostPct}
                    onChange={(val) => setTransactionCostPct(val)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 text-sm">
                      Risk-Free Rate (%)
                    </span>
                  }
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={0}
                    max={20}
                    step={0.1}
                    value={riskFreeRate}
                    onChange={(val) => setRiskFreeRate(val)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row
              gutter={16}
              style={{ marginTop: "-12px", marginBottom: "-12px" }}
            >
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 text-sm">
                      Compounding Threshold (%)
                    </span>
                  }
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={1}
                    max={100}
                    step={0.1}
                    value={capitalResetThresholdPct}
                    onChange={(val) => setCapitalResetThresholdPct(val)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      {/* Right Column - Configuration Summary */}
      {/* <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
              📊
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Configuration Summary</h3>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-3">
            <div className="text-sm">
              <span className="text-gray-500">Index:</span>
              <span className="font-medium ml-2">{mainIndex}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Universe:</span>
              <span className="font-medium ml-2">{stockUniverse}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Max Positions:</span>
              <span className="font-medium ml-2">{maxPositions}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Position Size:</span>
              <span className="font-medium ml-2">{positionSizePct}%</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Total Capital:</span>
              <span className="font-medium ml-2">{formatIndianCurrency(totalCapital)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Stop Loss:</span>
              <span className="font-medium ml-2">{stopLossPct}%</span>
                </div>
            <div className="text-sm">
              <span className="text-gray-500">Buffer Capital:</span>
              <span className="font-medium ml-2">{bufferCapitalPct}%</span>
              </div>
            <div className="text-sm">
              <span className="text-gray-500">Max Holding:</span>
              <span className="font-medium ml-2">{maxHoldingPeriod} weeks</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Transaction Cost:</span>
              <span className="font-medium ml-2">{transactionCostPct}%</span>
            </div>
          </div>
                </div>
      </div> */}
    </div>
  );

  if (embedded) {
    // Render only the inner cards (stacked) without page wrappers/step rail
    return <div className="bg-white">{innerContent}</div>;
  }

  // Full page layout with wrappers
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
                { step: 3, title: "Execution", icon:  <BsThreeDots className="w-7 h-7 border-2 border-gray-500 rounded-full p-[3px]"/>}
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
