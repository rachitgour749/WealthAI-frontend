import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TradeExecutionTracker from "../components/TradeExecutionTracker";
import CostsDashboard from "../components/CostsDashboard";
import WebHook from "../components/WebHook";
import BestEtfCombinationModal from "../components/Combinations/BestEtfCombinationModal";
import {
  formatDate,
  formatDateTime,
  formatIndianCurrency,
  parseIndianCurrency,
} from "../utils/dateFormatter";
import { message } from "antd";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../context/ApiContext";
import { API_BASE_URL } from "../config/api.js";
import { HiOutlinePauseCircle } from "react-icons/hi2";
import { FaRegEye, FaCloudUploadAlt } from "react-icons/fa";
import { FaRegPlayCircle } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { TbProgressCheck } from "react-icons/tb";
import { FaRegCheckCircle } from "react-icons/fa";
import { MdOutlineSaveAlt } from "react-icons/md";

function ETFStrategy({ onBack, strategyType = "ETF Rotation Strategy" }) {
  // Main state
  const [showResults, setShowResults] = useState(false);
  const { buildApiUrl } = useApi();
  const [etfs, setEtfs] = useState([]);
  const [selectedEtfs, setSelectedEtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "", years: 0 });
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [backtestResult, setBacktestResult] = useState(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [etfOverview, setEtfOverview] = useState([]);
  const [transactionLog, setTransactionLog] = useState([]);
  const [transactionCosts, setTransactionCosts] = useState([]);
  const [tradingSummary, setTradingSummary] = useState({});
  const [isBacktestRunning, setIsBacktestRunning] = useState(false);
  const [transactionLogLoading, setTransactionLogLoading] = useState(false);
  const [clientCheckboxes, setClientCheckboxes] = useState({});

  // Strategy Settings
  const [capitalPerWeek, setCapitalPerWeek] = useState(50000);
  const [capitalPerWeekDisplay, setCapitalPerWeekDisplay] = useState(
    formatIndianCurrency(50000)
  ); // Formatted display value
  const [accumulationWeeks, setAccumulationWeeks] = useState(52);
  const [brokeragePercent, setBrokeragePercent] = useState(0.0);
  const [riskFreeRate, setRiskFreeRate] = useState(6.0);
  const [compoundingEnabled, setCompoundingEnabled] = useState(false);

  // Performance Comparison Toggles
  const [showETFStrategy, setShowETFStrategy] = useState(true);
  const [showNiftyBenchmark, setShowNiftyBenchmark] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("metrics");

  // UI State
  const [activeSetupStep, setActiveSetupStep] = useState(1);

  // Saved Strategies Dropdown State
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [savedStrategiesLoading, setSavedStrategiesLoading] = useState(false);

  // Strategy Details Popup State
  const [selectedStrategyDetails, setSelectedStrategyDetails] = useState(null);
  const [isStrategyDetailsOpen, setIsStrategyDetailsOpen] = useState(false);
const [clientSelectionMap, setClientSelectionMap] = useState({});
const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Function to handle client checkbox changes
  const handleClientCheckboxChange = async (clientId, isChecked) => {
    try {
      // Safety check for selectedStrategyDetails
      if (!selectedStrategyDetails?.deploymentDetails) {
        message.error("No deployment details available");
        return;
      }

      // Get current client information with proper structure handling
      let currentClientInfo = {};
      if (selectedStrategyDetails.deploymentDetails?.client_information_json) {
        const rawData = JSON.parse(
          selectedStrategyDetails.deploymentDetails.client_information_json
        );
        console.log("🔍 Checkbox change - Raw data:", rawData);

        // Handle both possible JSON structures
        if (rawData.clients) {
          // It's the nested structure: {clients: {clientId: capital}}
          currentClientInfo = rawData.clients;
          console.log(
            "🔍 Checkbox change - Using nested structure:",
            currentClientInfo
          );
        } else {
          // It's the direct structure: {clientId: capital}
          currentClientInfo = rawData;
          console.log(
            "🔍 Checkbox change - Using direct structure:",
            currentClientInfo
          );
        }
      }

      // Update client information based on checkbox state
      if (isChecked) {
        // Add client back (you might need to get the original capital value)
        currentClientInfo[clientId] =
          currentClientInfo[clientId] || "₹1,923.08"; // Default capital from your data
        console.log(
          "🔍 Checkbox change - Added client:",
          clientId,
          currentClientInfo[clientId]
        );
      } else {
        // Remove client
        delete currentClientInfo[clientId];
        console.log("🔍 Checkbox change - Removed client:", clientId);
      }

      // Update the deployment details in database
      if (!selectedStrategyDetails.deploymentDetails) {
        console.error("No deployment details available");
        return;
      }

      const requestBody = {
        run_id: selectedStrategyDetails.deploymentDetails.run_id,
        client_information_json: JSON.stringify(currentClientInfo),
      };

      console.log(
        "🔍 Checkbox change - Making API request to update client info:",
        requestBody
      );

      const response = await fetch(
        `${API_BASE_URL}/api/live-signals/update-client-information`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("🔍 Checkbox change - API response status:", response.status);

      if (response.ok) {
        // Update local state
        setSelectedStrategyDetails((prev) => ({
          ...prev,
          deploymentDetails: {
            ...prev.deploymentDetails,
            client_information_json: JSON.stringify(currentClientInfo),
          },
        }));

        // Update checkbox state
        setClientCheckboxes((prev) => ({
          ...prev,
          [clientId]: isChecked,
        }));

        message.success(
          `Client ${clientId} ${isChecked ? "added" : "removed"} successfully`
        );
      } else {
        message.error("Failed to update client information");
      }
    } catch (error) {
      console.error("Error updating client information:", error);
      message.error("Error updating client information");
    }
  };

  useEffect(() => {
    const currentInfo = getCurrentClientInformation();
    const initialSelection = {};

    Object.keys(currentInfo).forEach((clientId) => {
      initialSelection[clientId] = false;
    });

    setClientSelectionMap(initialSelection);
  }, [
    selectedStrategyDetails?.deploymentDetails?.client_information_json,
    selectedStrategyDetails?.client_information_json,
  ]);

  const clientSelectionKeys = Object.keys(clientSelectionMap);
  const selectedClientIds = clientSelectionKeys.filter(
    (clientId) => clientSelectionMap[clientId]
  );
  const totalClients = clientSelectionKeys.length;
  const areAllClientsSelected =
    totalClients > 0 && selectedClientIds.length === totalClients;
  const hasSelectedClients = selectedClientIds.length > 0;

  const getCurrentClientInformation = () => {
    const source =
      selectedStrategyDetails?.deploymentDetails?.client_information_json ||
      selectedStrategyDetails?.client_information_json;

    if (!source) {
      return {};
    }

    try {
      const parsed =
        typeof source === "string" ? JSON.parse(source) : source;

      if (parsed && typeof parsed === "object") {
        return parsed.clients ? parsed.clients : parsed;
      }

      return {};
    } catch (error) {
      console.error("Error parsing client information JSON:", error);
      return {};
    }
  };

  const handleClientSelectionChange = (clientId, isSelected) => {
    setClientSelectionMap((prev) => ({
      ...prev,
      [clientId]: isSelected,
    }));
  };

  const handleSelectAllClients = (isSelected) => {
    const currentInfo = getCurrentClientInformation();
    const updatedSelection = {};

    Object.keys(currentInfo).forEach((clientId) => {
      updatedSelection[clientId] = isSelected;
    });

    setClientSelectionMap(updatedSelection);
  };

  const openBulkDeleteConfirm = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const closeBulkDeleteConfirm = () => {
    if (bulkDeleteLoading) {
      return;
    }
    setIsBulkDeleteConfirmOpen(false);
  };

  const confirmBulkDelete = async () => {
    const clientsToDelete = Object.keys(clientSelectionMap).filter(
      (clientId) => clientSelectionMap[clientId]
    );

    if (!clientsToDelete.length) {
      setIsBulkDeleteConfirmOpen(false);
      return;
    }

    if (!selectedStrategyDetails?.deploymentDetails) {
      message.error("No deployment details available");
      return;
    }

    const currentClientInfo = { ...getCurrentClientInformation() };
    let didModify = false;

    clientsToDelete.forEach((clientId) => {
      if (currentClientInfo.hasOwnProperty(clientId)) {
        delete currentClientInfo[clientId];
        didModify = true;
      }
    });

    if (!didModify) {
      setIsBulkDeleteConfirmOpen(false);
      return;
    }

    try {
      setBulkDeleteLoading(true);

      const requestBody = {
        run_id: selectedStrategyDetails.deploymentDetails.run_id,
        client_information_json: JSON.stringify(currentClientInfo),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/live-signals/update-client-information`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update client information");
      }

      setSelectedStrategyDetails((prev) => ({
        ...prev,
        deploymentDetails: {
          ...prev.deploymentDetails,
          client_information_json: JSON.stringify(currentClientInfo),
        },
      }));

      setClientSelectionMap(() => {
        const updatedMap = {};
        Object.keys(currentClientInfo).forEach((clientId) => {
          updatedMap[clientId] = false;
        });
        return updatedMap;
      });

      setClientCheckboxes((prev) => {
        const updatedCheckboxes = { ...prev };
        clientsToDelete.forEach((clientId) => {
          delete updatedCheckboxes[clientId];
        });
        return updatedCheckboxes;
      });

      message.success(
        clientsToDelete.length > 1
          ? `${clientsToDelete.length} clients removed successfully`
          : "Client removed successfully"
      );
    } catch (error) {
      console.error("Error removing clients:", error);
      message.error(
        error.message || "Failed to remove selected clients. Please try again."
      );
    } finally {
      setBulkDeleteLoading(false);
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  // Initialize client checkboxes when deployment details change
  useEffect(() => {
    console.log("🔍 ========== useEffect DEBUG START ==========");
    console.log("🔍 Full selectedStrategyDetails:", selectedStrategyDetails);
    console.log(
      "🔍 deploymentDetails:",
      selectedStrategyDetails?.deploymentDetails
    );
    console.log(
      "🔍 client_information_json:",
      selectedStrategyDetails?.deploymentDetails?.client_information_json
    );
    console.log(
      "🔍 client_information_json type:",
      typeof selectedStrategyDetails?.deploymentDetails?.client_information_json
    );
    console.log(
      "🔍 client_information_json length:",
      selectedStrategyDetails?.deploymentDetails?.client_information_json
        ?.length
    );

    if (selectedStrategyDetails?.deploymentDetails?.client_information_json) {
      try {
        if (
          !selectedStrategyDetails.deploymentDetails?.client_information_json
        ) {
          console.log("🔍 No client information available");
          return {};
        }
        const rawData = JSON.parse(
          selectedStrategyDetails.deploymentDetails.client_information_json
        );
        console.log("🔍 Parsed client data:", rawData);

        // Handle both possible JSON structures
        let clientInfo = {};
        if (rawData.clients) {
          // It's the nested structure: {clients: {clientId: capital}}
          clientInfo = rawData.clients;
          console.log("🔍 Using nested clients structure:", clientInfo);
        } else {
          // It's the direct structure: {clientId: capital}
          clientInfo = rawData;
          console.log("🔍 Using direct client structure:", clientInfo);
        }

        const checkboxState = {};
        Object.keys(clientInfo).forEach((clientId) => {
          checkboxState[clientId] = true; // All clients checked by default
        });
        setClientCheckboxes(checkboxState);
        console.log("🔍 Set checkbox state:", checkboxState);
      } catch (error) {
        console.error("🔍 Error parsing client_information_json:", error);
        console.error("🔍 Error details:", error.message);
      }
    } else {
      console.log("🔍 No client_information_json found in useEffect");
    }
    console.log("🔍 ========== useEffect DEBUG END ==========");
  }, [selectedStrategyDetails?.deploymentDetails]);

  // Saved Strategies Popup State
  const [isSavedStrategiesPopupOpen, setIsSavedStrategiesPopupOpen] =
    useState(false);
  const [isBestCombinationsModalOpen, setIsBestCombinationsModalOpen] =
    useState(false);
  
  // Save Strategy Popup State
  const [isCustomNamePopupOpen, setIsCustomNamePopupOpen] = useState(false);
  const [customStrategyName, setCustomStrategyName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveFromUniverseSelection, setSaveFromUniverseSelection] =
    useState(false);
  
  // Post-Save Deployment Popup State (after saving from backtest results)
  const [isPostSaveDeploymentPopupOpen, setIsPostSaveDeploymentPopupOpen] =
    useState(false);
  const [savedStrategyName, setSavedStrategyName] = useState("");
  const [recentlySavedStrategy, setRecentlySavedStrategy] = useState(null);
  
  // WebHook Modal State
  const [isWebHookModalOpen, setIsWebHookModalOpen] = useState(false);
  const [isStrategyInfoModalOpen, setIsStrategyInfoModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [webHookStrategyType, setWebHookStrategyType] = useState(
    "ETF Rotation Strategy"
  );
  const [showSavedStrategiesDropdown, setShowSavedStrategiesDropdown] =
    useState(false);
  const [strategyLoadedMessage, setStrategyLoadedMessage] = useState("");
  // State for deployment status - now tracks status for each strategy
  const [deploymentStatuses, setDeploymentStatuses] = useState({});

  const { user } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Load transaction data when trade tab is selected
    if (tab === "trades" && showResults) {
      loadTransactionLog();
      loadTransactionCosts();
    }
  };

  // Add this function to debug strategy names
  const debugStrategyNames = async () => {
    try {
      const email = user.email;
      const response = await axios.get(
        `${buildApiUrl("GET_SAVED_STRATEGIES_LIST")}/${encodeURIComponent(
          email
        )}`
      );

      console.log("🔍 DEBUG: All saved strategies:", response.data);

      if (response.data && response.data.strategies) {
        response.data.strategies.forEach((strategy, index) => {
          console.log(`Strategy ${index + 1}:`, {
            strategy_name: strategy.strategy_name,
            name: strategy.name,
            strategy_type: strategy.strategy_type,
          });
        });
      }
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  // Fetch saved strategies on component mount
  useEffect(() => {
    if (user && user.email) {
      debugStrategyNames(); // Debug strategy names first
      fetchSavedStrategies();
    }
  }, [user]);

  // Check deployment status for a single strategy and return the status
  const checkDeploymentStatusForStrategy = async (strategy) => {
    try {
      // ✅ USE ACTUAL STRATEGY NAME
      const strategyName =
        strategy.strategy_name || strategy.name || "ETF Rotation Strategy";
      const currentDate = new Date().toISOString().split("T")[0];

      console.log("🔍 Checking status for strategy:", strategyName);
      console.log("🔍 Execution date:", currentDate);
      console.log("🔍 Strategy object:", strategy);

      const response = await fetch(
        `${API_BASE_URL}/api/live-signals/deployment-status-by-strategy`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strategy_name: strategyName, // ✅ USES ACTUAL STRATEGY NAME
            execution_date: currentDate,
          }),
        }
      );

      const result = await response.json();

      console.log("🔍 Status Check Result:", {
        strategyName,
        currentDate,
        apiResponse: result,
        foundStatus:
          result.success && result.data.exists ? result.data.status : "deploy",
      });

      if (result.success && result.data.exists) {
        console.log(
          "✅ Found deployment with status:",
          result.data.status,
          "for strategy:",
          strategyName
        );
        return result.data.status;
      } else {
        console.log(
          "⚠️ No deployment found for:",
          strategyName,
          "on date:",
          currentDate
        );
        return "deploy";
      }
    } catch (error) {
      console.error(
        "❌ Error checking deployment status for:",
        strategy.strategy_name,
        error
      );
      return "deploy";
    }
  };

  // Function to fetch deployment details for a strategy
  const fetchDeploymentDetails = async (strategy) => {
    try {
      const strategyName =
        strategy.strategy_name || strategy.name || "ETF Rotation Strategy";
      const currentDate = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `${API_BASE_URL}/api/live-signals/deployment-status-by-strategy`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strategy_name: strategyName,
            execution_date: currentDate,
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.data.exists) {
        return {
          ...strategy,
          deploymentDetails: result.data,
        };
      } else {
        return {
          ...strategy,
          deploymentDetails: null,
        };
      }
    } catch (error) {
      console.error("❌ Error fetching deployment details:", error);
      return {
        ...strategy,
        deploymentDetails: null,
      };
    }
  };

  // Function to open strategy details popup
  const openStrategyDetails = async (strategy) => {
    try {
      // Close saved strategies popup first
      const strategyWithDetails = await fetchDeploymentDetails(strategy);
      setSelectedStrategyDetails(strategyWithDetails);
      setIsStrategyDetailsOpen(true);
    } catch (error) {
      console.error("Error opening strategy details:", error);
    }
  };

  // Fetch saved strategies
  const fetchSavedStrategies = async () => {
    setSavedStrategiesLoading(true);
    try {
      // Check if user exists and has email
      if (!user || !user.email) {
        console.error("User not found or no email available");
        setSavedStrategies([]);
        return;
      }

      const email = user.email;
      console.log("Fetching strategies for user:", email); // Debug log

      const response = await axios.get(
        `${buildApiUrl("GET_SAVED_STRATEGIES_LIST")}/${encodeURIComponent(
          email
        )}`
      );
      console.log("API Response:", response.data); // Debug log

      // Ensure we always have an array, handle different response structures
      let strategies = [];
      if (response.data) {
        if (Array.isArray(response.data.strategies)) {
          strategies = response.data.strategies;
        } else {
          // If it's a single object, wrap it in an array
          strategies = [response.data.strategies];
        }
      }

      // Filter to only show ETF rotation strategies
      strategies = strategies.filter(
        (strategy) =>
          strategy.strategy_type === "etf_rotation" ||
        (strategy.tickers && Array.isArray(strategy.tickers))
      );

      console.log("Filtered strategies:", strategies); // Debug log

      // Use the status from backend directly, with fallback to deployment status check
      console.log("🔄 Processing strategies with status from backend...");
      const strategiesWithStatus = await Promise.all(
        strategies.map(async (strategy) => {
          // Use backend status if available, otherwise check deployment status
          const backendStatus = strategy.status;
          if (backendStatus) {
            console.log(
              `Strategy ${strategy.strategy_name}: Using backend status ${backendStatus}`
            );
            return {
              ...strategy,
              status: backendStatus,
              deploymentStatus: backendStatus,
            };
          } else {
            const status = await checkDeploymentStatusForStrategy(strategy);
            return { ...strategy, deploymentStatus: status };
          }
        })
      );

      console.log("✅ All strategies with status:", strategiesWithStatus);
      setSavedStrategies(strategiesWithStatus);
    } catch (error) {
      console.error("Error fetching saved strategies:", error);
      console.error("Error details:", error.response?.data); // More detailed error logging
    } finally {
      setSavedStrategiesLoading(false);
    }
  };

  // Load saved strategy
  const loadSavedStrategy = (strategy) => {
    try {
      // Populate selected ETFs
      if (strategy.tickers && Array.isArray(strategy.tickers)) {
        console.log("Setting selected ETFs:", strategy.tickers); // Debug log
        const etfOptions = strategy.tickers.map((ticker) => {
          // Find the ETF in the available ETFs list
          const etfOption = etfs.find((etf) => etf.value === ticker);
          if (etfOption) {
            console.log("Found ETF option:", etfOption); // Debug log
            return etfOption;
          }
          // If not found in the loaded ETFs, create a basic option
          console.log("Creating basic option for:", ticker); // Debug log
          return {
            value: ticker,
            label: `${ticker} - ${ticker}`,
          };
        });
        console.log("Final ETF options:", etfOptions); // Debug log
        setSelectedEtfs(etfOptions);
      }

      // Populate date range
      if (strategy.start_date && strategy.end_date) {
        setDateRange({
          start: strategy.start_date,
          end: strategy.end_date,
          years: strategy.years || 0,
        });
        setCustomStartDate(strategy.start_date);
        setCustomEndDate(strategy.end_date);
        setUseCustomDates(strategy.use_custom_dates || false);
      }

      // Populate strategy parameters
      console.log("Setting strategy parameters:", {
        capital_per_week: strategy.capital_per_week,
        accumulation_weeks: strategy.accumulation_weeks,
        brokerage_percent: strategy.brokerage_percent,
        risk_free_rate: strategy.risk_free_rate,
        compounding_enabled: strategy.compounding_enabled,
      }); // Debug log

      if (strategy.capital_per_week) {
        setCapitalPerWeek(strategy.capital_per_week);
        setCapitalPerWeekDisplay(
          formatIndianCurrency(strategy.capital_per_week)
        );
      }
      if (strategy.accumulation_weeks) {
        setAccumulationWeeks(strategy.accumulation_weeks);
      }
      if (strategy.brokerage_percent !== undefined) {
        setBrokeragePercent(strategy.brokerage_percent);
      }
      if (strategy.risk_free_rate) {
        setRiskFreeRate(strategy.risk_free_rate);
      }
      if (strategy.compounding_enabled !== undefined) {
        setCompoundingEnabled(strategy.compounding_enabled);
      }

      // Set active step to 4 (ready to execute)
      setActiveSetupStep(4);

      // Clear any previous results
      setShowResults(false);
      setBacktestResult(null);
      setError("");

      // Show success message
      setStrategyLoadedMessage(
        `Strategy "${
          strategy.strategy_name || strategy.name || "ETF Rotation Strategy"
        }" loaded successfully!`
      );
      setTimeout(() => setStrategyLoadedMessage(""), 3000);

      // Check deployment status after loading strategy
      checkDeploymentStatus(strategy);

      console.log("Strategy loaded successfully");
    } catch (error) {
      console.error("Error loading strategy:", error);
      setError("Failed to load strategy parameters");
    }
  };

  // Check deployment status for a strategy
  const checkDeploymentStatus = async (strategy) => {
    try {
      const strategyName =
        strategy.strategy_name || strategy.name || "ETF Rotation Strategy";
      const currentDate = new Date().toISOString().split("T")[0]; // Keep as YYYY-MM-DD format

      const response = await fetch(
        `${API_BASE_URL}/api/live-signals/deployment-status-by-strategy`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strategy_name: strategyName,
            execution_date: currentDate,
          }),
        }
      );
      const result = await response.json();

      // Create a unique key for this strategy
      const strategyKey = `${strategyName}_${currentDate}`;

      console.log("🔍 ETF Status Check Debug:", {
        strategyName,
        currentDate,
        strategyKey,
        apiResponse: result,
        foundStatus:
          result.success && result.data.exists ? result.data.status : "deploy",
      });

      if (result.success && result.data.exists) {
        setDeploymentStatuses((prev) => ({
          ...prev,
          [strategyKey]: result.data.status,
        }));
        console.log("✅ ETF Status Updated to:", result.data.status);
      } else {
        setDeploymentStatuses((prev) => ({
          ...prev,
          [strategyKey]: "deploy",
        }));
        console.log("⚠️ ETF Status Set to Default: deploy");
      }
    } catch (error) {
      console.error("Error checking deployment status:", error);
      const strategyName =
        strategy.strategy_name || strategy.name || "ETF Rotation Strategy";
      const currentDate = new Date().toISOString().split("T")[0]; // Keep as YYYY-MM-DD format
      const strategyKey = `${strategyName}_${currentDate}`;
      setDeploymentStatuses((prev) => ({
        ...prev,
        [strategyKey]: "deploy",
      }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSavedStrategiesDropdown &&
        !event.target.closest(".saved-strategies-dropdown")
      ) {
        setShowSavedStrategiesDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSavedStrategiesDropdown]);

  // Export Functions
  const exportETFPerformanceCSV = () => {
    if (!backtestResult || !backtestResult.performance_data) {
      alert("No performance data available. Please run a backtest first.");
      return;
    }

    const performanceData = backtestResult.performance_data;
    const csvContent = [
      [
        "Date",
        "ETF Rotation Strategy NAV",
        "Cumulative Investment",
        "Nifty50 Buy & Hold",
      ],
      ...performanceData.dates.map((date, index) => [
        date,
        performanceData.etf_strategy
          ? performanceData.etf_strategy[index] || ""
          : "",
        performanceData.cumulative_investment
          ? performanceData.cumulative_investment[index] || ""
          : "",
        performanceData.nifty50_buyhold
          ? performanceData.nifty50_buyhold[index] || ""
          : "",
      ]),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    downloadCSV(csvString, "etf_performance.csv");
  };

  const exportNifty50DataCSV = () => {
    if (!backtestResult || !backtestResult.performance_data) {
      alert("No Nifty50 data available. Please run a backtest first.");
      return;
    }

    const performanceData = backtestResult.performance_data;
    const csvContent = [
      [
        "Date",
        "Nifty50 NAV",
        "ETF Rotation Strategy NAV",
        "Performance Difference",
      ],
      ...performanceData.dates.map((date, index) => {
        const niftyValue = performanceData.nifty50_buyhold
          ? performanceData.nifty50_buyhold[index] || 0
          : 0;
        const etfValue = performanceData.etf_strategy
          ? performanceData.etf_strategy[index] || 0
          : 0;
        const difference = etfValue - niftyValue;
        return [date, niftyValue, etfValue, difference];
      }),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    downloadCSV(csvString, "nifty50_data.csv");
  };

  const exportTransactionCostsCSV = () => {
    if (!transactionCosts || transactionCosts.length === 0) {
      alert(
        "No transaction costs data available. Please run a backtest first."
      );
      return;
    }

    const csvContent = [
      ["Date", "Cumulative Cost", "Weekly Cost", "Total Costs"],
      ...transactionCosts.map((cost) => [
        cost.date || "",
        cost.cumulative_cost || 0,
        cost.weekly_cost || 0,
        cost.total_costs || 0,
      ]),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    downloadCSV(csvString, "transaction_costs.csv");
  };

  const downloadCSV = (csvString, filename) => {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
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
      const response = await axios.get(buildApiUrl("ETFS"));
      if (
        response.data &&
        response.data.etfs &&
        response.data.etfs.length > 0
      ) {
        const etfOptions = response.data.etfs.map((etf) => ({
          value: etf.ticker,
          label: `${etf.ticker} - ${etf.name}`,
        }));
        setEtfs(etfOptions);
        console.log(`Loaded ${etfOptions.length} ETFs`);
      } else {
        setError("No ETFs found in database");
      }
    } catch (err) {
      console.error("Error loading ETFs:", err);
      setError("Failed to load ETFs. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadETFOverview = async () => {
    try {
      const response = await axios.get(buildApiUrl("ETFS_OVERVIEW"));
      if (response.data && response.data.etf_overview) {
        setEtfOverview(response.data.etf_overview);
      }
    } catch (err) {
      console.error("Error loading ETF overview:", err);
    }
  };

  const loadTransactionLog = async () => {
    try {
      setTransactionLogLoading(true);
      const response = await axios.get(buildApiUrl("TRANSACTION_LOG"));
      if (response.data && response.data.transaction_log) {
        setTransactionLog(response.data.transaction_log);
      }
      if (response.data && response.data.trading_summary) {
        setTradingSummary(response.data.trading_summary);
      }
    } catch (err) {
      console.error("Error loading transaction log:", err);
    } finally {
      setTransactionLogLoading(false);
    }
  };

  const loadTransactionCosts = async () => {
    try {
      const response = await axios.get(buildApiUrl("TRANSACTION_COSTS"));
      if (response.data && response.data.transaction_costs) {
        setTransactionCosts(response.data.transaction_costs);
      }
    } catch (err) {
      console.error("Error loading transaction costs:", err);
    }
  };

  const calculateDateRange = async () => {
    if (selectedEtfs.length === 0) return;

    try {
      setDateRangeLoading(true);
      setError(""); // Clear previous errors

      const response = await axios.post(buildApiUrl("ETFS_DATE_RANGE"), {
        tickers: selectedEtfs.map((etf) => etf.value),
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
  };

  const calculateYearsBetweenDates = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    // Ensure dates are in YYYY-MM-DD format
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffTime = Math.abs(end - start);
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, diffYears);
  };

  useEffect(() => {
    if (selectedEtfs.length > 0) {
      calculateDateRange();
    } else {
      // Reset date range and duration when all ETFs are cleared
      setDateRange({ start: "", end: "", years: 0 });
      setCustomStartDate("");
      setCustomEndDate("");
      setUseCustomDates(false);
      setDateRangeLoading(false);
    }
  }, [selectedEtfs]);

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

  // Reset custom dates when ETFs change
  useEffect(() => {
    if (selectedEtfs.length === 0) {
      setCustomStartDate("");
      setCustomEndDate("");
      setUseCustomDates(false);
    }
  }, [selectedEtfs]);

  // Load transaction data when backtest results are available
  useEffect(() => {
    if (showResults) {
      loadTransactionLog();
      loadTransactionCosts();
    }
  }, [showResults]);

  const runBacktest = async () => {
    if (selectedEtfs.length === 0) {
      setError("Please select ETFs first");
      return;
    }

    try {
      setBacktestLoading(true);
      setIsBacktestRunning(true);
      setActiveSetupStep(3);
      setError("");

      // Use custom dates if enabled, otherwise use calculated date range
      let startDate = useCustomDates ? customStartDate : dateRange.start;
      let endDate = useCustomDates ? customEndDate : dateRange.end;

      if (!startDate || !endDate) {
        // Fallback to a reasonable date range
        startDate = "2020-01-01";
        endDate = "2023-12-31";
        console.log("Using fallback dates:", startDate, "to", endDate);
      }

      const backtestParams = {
        tickers: selectedEtfs.map((etf) => etf.value),
        start_date: startDate,
        end_date: endDate,
        capital_per_week: parseFloat(capitalPerWeek),
        accumulation_weeks: parseInt(accumulationWeeks),
        brokerage_percent: parseFloat(brokeragePercent),
        compounding_enabled: Boolean(compoundingEnabled),
        risk_free_rate: parseFloat(riskFreeRate),
      };

      const response = await axios.post(buildApiUrl("METRICS"), backtestParams);
      setBacktestResult(response.data);
      setShowResults(true);
      console.log("Backtest result:", response.data);

      // Load transaction data after successful backtest
      await loadTransactionLog();
      await loadTransactionCosts();
    } catch (err) {
      console.error("Backtest error:", err);
      if (err.response && err.response.data) {
        setError(`Backtest failed: ${JSON.stringify(err.response.data)}`);
      } else {
        setError("Backtest failed. Please check your parameters.");
      }
    } finally {
      setBacktestLoading(false);
      setIsBacktestRunning(false);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === "string" && value.includes("₹")) {
      return value;
    }
    return `₹${Math.round(parseFloat(value || 0)).toLocaleString("en-IN")}`;
  };

  const formatPercentage = (value) => {
    if (typeof value === "string" && value.includes("%")) {
      return value;
    }
    return `${parseFloat(value || 0).toFixed(2)}%`;
  };

  const renderMetricsCard = (title, value, subtitle = "") => {
    const getDefinition = (metricTitle) => {
      const definitions = {
        "Total Return":
          "The total percentage gain or loss on an investment over a specific period, including dividends and capital appreciation.",
        CAGR: "Compound Annual Growth Rate - the mean annual growth rate of an investment over a specified period longer than one year.",
        XIRR: "Extended Internal Rate of Return - calculates the rate of return for investments with multiple cash flows occurring at irregular intervals.",
        Volatility:
          "A measure of the rate at which the price of a security increases or decreases for a given set of returns.",
        "Sharpe Ratio":
          "A measure of risk-adjusted return, calculated as excess return per unit of risk. Higher values indicate better risk-adjusted performance.",
        "Treynor Ratio":
          "A risk-adjusted measure of return based on systematic risk, calculated as excess return per unit of systematic risk.",
        "Calmar Ratio":
          "A risk-adjusted measure that compares the annualized return to the maximum drawdown, indicating return per unit of downside risk.",
        "Max Drawdown":
          "The maximum observed loss from a peak to a subsequent trough, representing the largest percentage decline in portfolio value.",
        "Win Rate":
          "The percentage of profitable trades out of total trades executed during the investment period.",
        "Total Investment":
          "The total amount of capital invested over the entire investment period.",
        "Final Value":
          "The total portfolio value at the end of the investment period.",
        "Total Trades":
          "The total number of buy and sell transactions executed during the investment period.",
      };
      return (
        definitions[metricTitle] || "No definition available for this metric."
      );
    };

    return (
      <div className="group relative bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}

        {/* Tooltip: rectangular, single column (title then definition) */}
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none z-[9999]"
        >
          <div
            className="relative w-[220px] max-w-[40vw] px-4 py-3 bg-gray-900 text-white
                          rounded-md shadow-lg whitespace-normal break-words leading-snug"
          >
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
    if (
      !performance_data.dates ||
      !Array.isArray(performance_data.dates) ||
      performance_data.dates.length === 0
    ) {
      console.warn("Performance data dates array is missing or empty");
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Comparison
          </h3>
          <div className="text-center text-gray-500 py-8">
            No performance data available. Please run a backtest first.
          </div>
        </div>
      );
    }

    // Ensure all required arrays exist and have the same length
    const dates = performance_data.dates || [];
    const etfStrategy = performance_data.etf_strategy || [];
    const cumulativeInvestment = performance_data.cumulative_investment || [];
    const nifty50BuyHold = performance_data.nifty50_buyhold || [];

    // Safe array access function
    const safeArrayAccess = (array, index) => {
      if (!Array.isArray(array) || index < 0 || index >= array.length) {
        return 0;
      }
      const value = array[index];
      return value !== null && value !== undefined && !isNaN(value) ? value : 0;
    };

    const chartData = dates
      .map((date, index) => {
      // Validate date
      if (!date) {
        console.warn(`Invalid date at index ${index}`);
        return null;
      }

      return {
        date,
          "ETF Rotation Strategy": safeArrayAccess(etfStrategy, index),
          "Cumulative Investment": safeArrayAccess(cumulativeInvestment, index),
          "Nifty50 Buy & Hold": safeArrayAccess(nifty50BuyHold, index),
        };
      })
      .filter((item) => item !== null); // Remove any null items

    // Check if we have valid chart data
    if (!chartData || chartData.length === 0) {
      console.warn("No valid chart data available");
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Comparison
          </h3>
          <div className="text-center text-gray-500 py-8">
            No valid performance data available for charting. Please run a
            backtest first.
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Comparison
        </h3>
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
                  if (!value) return "N/A";
                  const date = new Date(value);
                  if (isNaN(date.getTime())) return "Invalid Date";
                  return formatDate(date);
                } catch (error) {
                  console.warn("Error formatting date:", error);
                  return "Invalid Date";
                }
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                try {
                  if (value === null || value === undefined || isNaN(value))
                    return "₹0M";
                  return `₹${(value / 1000000).toFixed(1)}M`;
                } catch (error) {
                  console.warn("Error formatting Y-axis value:", error);
                  return "₹0M";
                }
              }}
            />
            <Tooltip
              formatter={(value) => {
                try {
                  if (value === null || value === undefined || isNaN(value))
                    return ["₹0", "Value"];
                  if (typeof formatCurrency === "function") {
                    return [formatCurrency(value), "Value"];
                  } else {
                    return [
                      `₹${parseFloat(value || 0).toLocaleString("en-IN")}`,
                      "Value",
                    ];
                  }
                } catch (error) {
                  console.warn("Error formatting tooltip value:", error);
                  return ["₹0", "Value"];
                }
              }}
              labelFormatter={(label) => {
                try {
                  if (!label) return "Date: N/A";
                  return `Date: ${formatDate(label)}`;
                } catch (error) {
                  console.warn("Error formatting tooltip label:", error);
                  return "Date: N/A";
                }
              }}
            />
            <Legend />
            {showETFStrategy && (
              <Line
                type="monotone"
                dataKey="ETF Rotation Strategy"
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
            {showNiftyBenchmark && (
              <Line
                type="monotone"
                dataKey="Nifty50 Buy & Hold"
                stroke="#d62728"
                strokeWidth={3}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderMetricsTable = () => {
    if (!backtestResult) {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Metrics Comparison
            </h3>
          </div>
          <div className="p-6 text-center text-gray-500">
            <p>No backtest results available. Please run a backtest first.</p>
          </div>
        </div>
      );
    }

    // Check for alternative key names for metrics data
    const etf_metrics =
      backtestResult.etf_metrics || backtestResult.etf_metrics_data || {};
    const nifty_metrics =
      backtestResult.nifty_metrics ||
      backtestResult.nifty50_metrics ||
      backtestResult.benchmark_metrics ||
      backtestResult.nifty_50_metrics ||
      {};

    // Debug logging
    console.log(
      "renderMetricsTable - backtestResult keys:",
      Object.keys(backtestResult)
    );
    console.log("renderMetricsTable - etf_metrics:", etf_metrics);
    console.log("renderMetricsTable - nifty_metrics:", nifty_metrics);

    // If no metrics at all, show a message
    if (!etf_metrics || Object.keys(etf_metrics).length === 0) {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Metrics Comparison
            </h3>
          </div>
          <div className="p-6 text-center text-gray-500">
            <p>No metrics data available. Please run a backtest first.</p>
            <p className="text-sm mt-2">
              Available data: {Object.keys(backtestResult).join(", ")}
            </p>
          </div>
        </div>
      );
    }
    const metrics = [
      { key: "Total Investment", label: "Total Investment" },
      { key: "Final Value", label: "Final Value" },
      { key: "Total Return", label: "Total Return" },
      { key: "CAGR", label: "CAGR" },
      { key: "XIRR", label: "XIRR" },
      // { key: 'Volatility', label: 'Volatility' },
      { key: "Sharpe Ratio", label: "Sharpe Ratio" },
      { key: "Treynor Ratio", label: "Treynor Ratio" },
      { key: "Calmar Ratio", label: "Calmar Ratio" },
      // { key: 'Max Drawdown', label: 'Max Drawdown' },
      // { key: 'Win Rate', label: 'Win Rate' }
    ];

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Metrics Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                {etf_metrics && Object.keys(etf_metrics).length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETF Rotation Strategy
                  </th>
                )}
                {nifty_metrics && Object.keys(nifty_metrics).length > 0 && (
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
                  {etf_metrics && Object.keys(etf_metrics).length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {etf_metrics[metric.key] ||
                        etf_metrics[metric.key.toLowerCase()] ||
                        "N/A"}
                    </td>
                  )}
                  {nifty_metrics && Object.keys(nifty_metrics).length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {nifty_metrics[metric.key] ||
                        nifty_metrics[metric.key.toLowerCase()] ||
                        "N/A"}
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
              <span className="ml-2 text-gray-600">
                Loading transaction data...
              </span>
            </div>
          </div>
        );
      }

      // Validate transactionLog is an array
      if (!Array.isArray(transactionLog)) {
        console.warn("Transaction log is not an array:", transactionLog);
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Data Format Error
              </h3>
              <p className="text-gray-500 mb-4">
                Transaction data is not in the expected format. Please run a
                backtest again.
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
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Transaction Data Available
              </h3>
              <p className="text-gray-500 mb-4">
                {!showResults
                  ? "Run a backtest first to see transaction details."
                  : "No trades were executed during the backtest period."}
              </p>
              {!showResults && (
                <button
                  onClick={runBacktest}
                  disabled={selectedEtfs.length === 0 || backtestLoading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-[10px] font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {backtestLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running Backtest...
                    </>
                  ) : (
                    "Run Backtest"
                  )}
                </button>
              )}
            </div>
          </div>
        );
      }

      const safeString = (value) => {
        if (value === null || value === undefined) return "N/A";
        if (typeof value === "string") return value;
        if (typeof value === "number") return value.toString();
        if (typeof value === "object") return "Object";
        return String(value);
      };

      const formatCurrency = (value) => {
        try {
          if (typeof value === "string" && value.includes("₹")) {
            return value;
          }
          const numValue = parseFloat(value || 0);
          if (isNaN(numValue)) return "₹0";
          return `₹${Math.round(numValue).toLocaleString("en-IN")}`;
        } catch (error) {
          return "₹0";
        }
      };

      const getDayOfWeek = (dateStr) => {
        try {
          if (!dateStr || typeof dateStr !== "string") return "N/A";
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return "N/A";
          return date.toLocaleDateString("en-US", { weekday: "short" });
        } catch (error) {
          return "N/A";
        }
      };

      const getActionColor = (action) => {
        const actionStr = safeString(action).toUpperCase();
        switch (actionStr) {
          case "BUY":
            return "bg-green-100 text-green-800";
          case "SELL":
            return "bg-red-100 text-red-800";
          case "CHURN":
            return "bg-orange-100 text-orange-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };

      // Validate trading summary
      const validTradingSummary =
        tradingSummary && typeof tradingSummary === "object"
          ? tradingSummary
          : {};

      return (
        <div className="space-y-6">
          {/* Trading Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Monday Trading Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {safeString(validTradingSummary.total_trades) || "0"}
                </div>
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
              <h3 className="text-lg font-semibold text-gray-900">
                📋 All Monday Trade Transactions
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete list of all Stock trades executed every Monday during
                the backtest period
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Week
                    </th>
                    <th className="px-4 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbols
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prices
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Costs
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capital Gains Tax
                    </th>
                    <th className="px-6 py-3 felx just-center items-center text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Portfolio Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionLog.map((log, index) => {
                    // Comprehensive validation for each log entry
                    if (!log || typeof log !== "object") {
                      console.warn(
                        "Invalid log entry at index",
                        index,
                        ":",
                        log
                      );
                      return (
                        <tr key={`invalid-${index}`}>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              N/A
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            N/A
                          </td>
                        </tr>
                      );
                    }

                    const dateStr = safeString(log.date);
                    const dayOfWeek = getDayOfWeek(dateStr);
                    const isMonday = dayOfWeek === "Mon";

                    return (
                      <tr
                        key={`trade-${index}`}
                        className={isMonday ? "bg-blue-50" : ""}
                      >
                        <td className="px-3 flex justify-center items-center py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-medium">
                            {safeString(log.week)}
                          </span>
                        </td>
                        <td className="px-3 text-center py-4 whitespace-nowrap text-sm text-gray-900">
                          {dateStr ? formatDate(dateStr) : "N/A"}
                        </td>
                        <td className="px-3 text-center py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              isMonday
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {dayOfWeek}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {log.action === "churn" ? (
                            <div className="flex gap-2">
                              <span className="inline-flex px-2 text-center py-1 text-xs font-semibold rounded-full bg-orange-200 text-orange-700">
                                churn
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(
                                log.action
                              )}`}
                            >
                              {safeString(log.action)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {log.action === "churn" ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  S
                                </span>
                                <span className="font-mono font-medium">
                                  {log.churning_details?.sell_transactions[0]
                                    ?.ticker || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  B
                                </span>
                                <span className="font-mono font-medium">
                                  {log?.churning_details?.buy_transaction
                                    ?.ticker || "N/A"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="font-mono font-medium">
                              {safeString(log.ticker)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {log.action === "churn" ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  S
                                </span>
                                <span className="font-medium">
                                  {log.units_sold?.toLocaleString("en-IN") ||
                                    "0"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  B
                                </span>
                                <span className="font-medium">
                                  {log.units_bought?.toLocaleString("en-IN") ||
                                    "0"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            (() => {
                              try {
                                const units = parseFloat(safeString(log.units));
                                return isNaN(units)
                                  ? "0"
                                  : units.toLocaleString("en-IN");
                              } catch (error) {
                                return "0";
                              }
                            })()
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {log.action === "churn" ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  S
                                </span>
                                <span>
                                  {formatCurrency(
                                    log.churning_details?.sell_transactions?.[0]
                                      ?.price || 0
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  B
                                </span>
                                <span>
                                  {formatCurrency(
                                    log.churning_details?.buy_transaction
                                      ?.price || 0
                                  )}
                                </span>
                              </div>
                            </div>
                          ) : (
                            formatCurrency(log.price)
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {log.action === "churn" ? (
                            <div className="space-y-1">
                              <div className="flex text-center items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-center text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  S
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(log.sell_amount || 0)}
                                </span>
                              </div>
                              <div className="flex text-center items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-center text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  B
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(log.buy_amount || 0)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-center font-medium">
                              {formatCurrency(log.amount)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {log.action === "churn" ? (
                            <div className="space-y-1">
                              <div className="flex justify-center items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  S
                                </span>
                                <span>
                                  {formatCurrency(
                                    log.churning_details?.sell_transactions?.[0]
                                      ?.costs?.total_costs || 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-centeritems-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  B
                                </span>
                                <span>
                                  {formatCurrency(
                                    log.churning_details?.buy_transaction?.costs
                                      ?.total_costs || 0
                                  )}
                                </span>
                              </div>
                            </div>
                          ) : (
                            formatCurrency(log.transaction_costs)
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {log.action === "churn" ? (
                            <div className="space-y-1">
                              <div className="flex text-center items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  S
                                </span>
                                <span>
                                  {formatCurrency(
                                    log.churning_details?.sell_transactions?.[0]
                                      ?.capital_gains_tax || 0
                                  )}
                                </span>
                              </div>
                              <div className="flex text-center items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  B
                                </span>
                                <span className="text-center">₹0</span>
                              </div>
                            </div>
                          ) : (
                            formatCurrency(log.capital_gains_tax)
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          <span className="text-center font-semibold">
                            {formatCurrency(log.nav)}
                          </span>
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
                  <span className="font-medium">Total Transactions:</span>{" "}
                  {transactionLog.length}
                </div>
                <div>
                  <span className="font-medium">Monday Trades:</span>{" "}
                  {(() => {
                    try {
                      return transactionLog.filter((log) => {
                        if (!log || typeof log !== "object") return false;
                        const dayOfWeek = getDayOfWeek(safeString(log.date));
                        return dayOfWeek === "Mon";
                      }).length;
                    } catch (error) {
                      return 0;
                    }
                  })()}
                </div>
                <div>
                  <span className="font-medium">Total Volume:</span>{" "}
                  <span className="font-bold text-teal-600">
                    {" "}
                    {(() => {
                    try {
                        const totalVolume = transactionLog.reduce(
                          (sum, log) => {
                            if (!log || typeof log !== "object") return sum;
                        const amount = parseFloat(log.amount || 0);
                        return sum + (isNaN(amount) ? 0 : amount);
                          },
                          0
                        );
                      return formatCurrency(totalVolume);
                    } catch (error) {
                        return "₹0";
                    }
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering transaction log:", error);
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Rendering Error
            </h3>
            <p className="text-gray-500 mb-4">
              An error occurred while rendering the transaction data. Please try
              refreshing the page.
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

  const saveStrategyParameters = async (customName = null) => {
    if (selectedEtfs.length === 0) {
      message.error("Please select ETFs first");
      return;
    }

    try {
      setSaveLoading(true);

      // Use custom dates if enabled, otherwise use calculated date range
      let startDate = useCustomDates ? customStartDate : dateRange.start;
      let endDate = useCustomDates ? customEndDate : dateRange.end;

      if (!startDate || !endDate) {
        // Fallback to a reasonable date range
        startDate = "2020-01-01";
        endDate = "2023-12-31";
      }

      const strategyParams = {
        user_id: user.email,
        strategy_type: "ETF_rotation",
        tickers: selectedEtfs.map((etf) => etf.value),
        start_date: startDate,
        end_date: endDate,
        capital_per_week: parseFloat(capitalPerWeek),
        accumulation_weeks: parseInt(accumulationWeeks),
        brokerage_percent: parseFloat(brokeragePercent),
        compounding_enabled: Boolean(compoundingEnabled),
        risk_free_rate: parseFloat(riskFreeRate),
        use_custom_dates: useCustomDates,
        strategy_name:
          customName || `ETFs Rotation Strategy - ${selectedEtfs.length} ETFs`,
        created_at: new Date().toISOString(),
        // Always include backtest_results (required by backend) - all values must be strings
        backtest_results: {
          total_return: String(
            backtestResult?.stock_metrics?.["Total Return"] ||
              backtestResult?.stock_metrics?.["total_return"] ||
              0
          ),
          cagr: String(
            backtestResult?.stock_metrics?.["CAGR"] ||
              backtestResult?.stock_metrics?.["cagr"] ||
              0
          ),
          sharpe_ratio: String(
            backtestResult?.stock_metrics?.["Sharpe Ratio"] ||
              backtestResult?.stock_metrics?.["sharpe_ratio"] ||
              0
          ),
          max_drawdown: String(
            backtestResult?.stock_metrics?.["Max Drawdown"] ||
              backtestResult?.stock_metrics?.["max_drawdown"] ||
              0
          ),
        },
      };

      // Uncomment this line when backend is ready:
      const response = await axios.post(
        buildApiUrl("SAVE_STRATEGY"),
        strategyParams
      );
      if (response.data && response.data.success) {
        message.success("Strategy saved successfully");
        setSavedStrategyName(customName || strategyParams.strategy_name);
        
        // Fetch the saved strategy to get its ID and details
        const email = user.email;
        const strategiesResponse = await axios.get(
          `${buildApiUrl("GET_SAVED_STRATEGIES_LIST")}/${encodeURIComponent(
            email
          )}`
        );
        
        if (strategiesResponse.data && strategiesResponse.data.strategies) {
          // Find the just-saved strategy by name
          const savedStrategy = strategiesResponse.data.strategies.find(
            (s) => s.strategy_name === strategyParams.strategy_name
          );
          
          if (savedStrategy) {
            setRecentlySavedStrategy(savedStrategy);
            setIsCustomNamePopupOpen(false);
            setIsPostSaveDeploymentPopupOpen(true);
            setCustomStrategyName("");
            setSaveFromUniverseSelection(false);
          }
        }
      } else {
        message.error(response.data.message);
      }
    } catch (err) {
      console.error("Save strategy error:", err);
      if (err.response && err.response.data) {
        message.error(
          `Save failed: ${
            err.response.data.message || JSON.stringify(err.response.data)
          }`
        );
      } else {
        message.error(
          "Save failed. Please check your connection and try again."
        );
      }
    } finally {
      setSaveLoading(false);
      setSaveFromUniverseSelection(false);
    }
  };

  // Handle Stop Strategy
  const handleStopStrategy = async (strategy) => {
    try {
      const strategyId = strategy.id;

      console.log("🛑 Stopping strategy:", strategyId);

      const response = await fetch(
        `${API_BASE_URL}/api/stop-strategy/${strategyId}`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Strategy stopped successfully:", result);
        message.success("Strategy stopped successfully");
        // Refresh strategies to show updated status
        fetchSavedStrategies();
      } else {
        console.error("❌ Failed to stop strategy:", result);
        message.error(result.message || "Failed to stop strategy");
      }
    } catch (error) {
      console.error("❌ Error stopping strategy:", error);
      message.error("Error stopping strategy");
    }
  };

  // Handle Restart Strategy
  const handleRestartStrategy = async (strategy) => {
    try {
      const strategyId = strategy.id;

      console.log("🔄 Restarting strategy:", strategyId);
      const response = await fetch(
        `${API_BASE_URL}/api/restart-strategy/${strategyId}`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Strategy restarted successfully:", result);
        message.success("Strategy restarted successfully");
        // Refresh strategies to show updated status
        fetchSavedStrategies();
      } else {
        console.error("❌ Failed to restart strategy:", result);
        message.error(result.message || "Failed to restart strategy");
      }
    } catch (error) {
      console.error("❌ Error restarting strategy:", error);
      message.error("Error restarting strategy");
    }
  };

  // Handle Delete Strategy
  const handleDeleteStrategy = async (strategy) => {
    try {
      const strategyName = strategy.strategy_name || strategy.name;
      const runId = strategy.run_id;

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to delete the strategy "${strategyName}"? This action cannot be undone.`
      );

      if (!confirmed) {
        return;
      }

      console.log("🗑️ Deleting strategy:", strategyName, "Run ID:", runId);
      
      let response;

      if (runId) {
        // Use the new endpoint with run_id
        response = await fetch(
          `${API_BASE_URL}/api/delete-strategy-by-run-id/${runId}`,
          {
            method: "DELETE",
          headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Fallback to old endpoint
        response = await fetch(
          `${API_BASE_URL}/api/delete-saved-strategy/${strategy.id}`,
          {
            method: "DELETE",
          headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Strategy deleted successfully:", result);
        message.success(`Strategy "${strategyName}" deleted successfully`);
        // Refresh strategies to show updated list
        fetchSavedStrategies();
      } else {
        console.error("❌ Failed to delete strategy:", result);
        message.error(result.message || "Failed to delete strategy");
      }
    } catch (error) {
      console.error("❌ Error deleting strategy:", error);
      message.error("Error deleting strategy");
    }
  };

  const renderTransactionCosts = () => {
    if (transactionCosts.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction Costs
          </h3>
          <div className="text-center text-gray-500">
            No transaction costs data available. Run a backtest first.
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction Costs Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionCosts}>
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
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Cost"]}
                labelFormatter={(label) =>
                  label ? `Date: ${formatDate(label)}` : "Date: N/A"
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulative_cost"
                stroke="#d62728"
                strokeWidth={2}
                dot={false}
                name="Cumulative Costs"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (!showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
        {isWebHookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[350px] max-h-[90vh] overflow-hidden px-[10px] py-[10px]">
              {/* WebHook Component */}
              <WebHook
                onClose={() => {
                  setIsWebHookModalOpen(false);
                  setSelectedStrategy(null);
                  setIsSavedStrategiesPopupOpen(true);
                }}
                strategyType={webHookStrategyType}
                userEmail={user?.email || "test@test.com"}
                selectedEtfs={
                  selectedStrategy ? selectedStrategy.tickers : selectedEtfs
                }
                selectedStrategy={selectedStrategy}
                strategyParams={
                  selectedStrategy
                    ? {
                  capitalPerWeek: selectedStrategy.capital_per_week,
                  accumulationWeeks: selectedStrategy.accumulation_weeks,
                  brokeragePercent: selectedStrategy.brokerage_percent,
                  riskFreeRate: selectedStrategy.risk_free_rate,
                        compoundingEnabled:
                          selectedStrategy.compounding_enabled,
                      }
                    : {
                  capitalPerWeek,
                  accumulationWeeks,
                  brokeragePercent,
                  riskFreeRate,
                        compoundingEnabled,
                      }
                }
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full mt-2">
          {/* Strategy Header Section */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[10px] mb-6 px-5 py-3 shadow-lg">
            <div className="flex relative items-center justify-between">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={() => onBack?.()}
                  className="px-2 py-[7px] rounded-[8px] flex shadow-md bg-white/20 backdrop-blur-sm font-semibold items-center justify-center text-white text-[13px] transition-all duration-300 transform hover:scale-105 hover:bg-white/30"
                >
                  <svg
                    className="w-4 h-4 mr-2 mt-[-1px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Strategies
                </button>
              )}

              {/* Strategy Title - Centered */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                <h1 className="text-[20px] font-bold text-white mb-[-1px]">
                  {strategyType}
                </h1>
                <div className="relative group ">
                  <button
                    onClick={() => {
                      if (!isBacktestRunning) {
                        setIsStrategyInfoModalOpen(true);
                      }
                    }}
                    disabled={isBacktestRunning}
                    className={`w-5 h-5 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer ${
                      isBacktestRunning ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <IoMdInformationCircleOutline className="w-5 h-5 mt-[7px]" />
                  </button>
                  {!isBacktestRunning && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      View Details
                    </div>
                  )}
                  {isBacktestRunning && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Backtest is running. Please wait...
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Buttons Container */}
              <div className="flex items-center justify-contend gap-4">
                {/* Saved Strategies Button */}
                <button
                  onClick={(e) => {
                    if (!isBacktestRunning) {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Saved strategies button clicked");
                      setIsSavedStrategiesPopupOpen(true);
                      fetchSavedStrategies();
                    }
                  }}
                  disabled={isBacktestRunning}
                  className={`px-2 py-[7px] rounded-[8px] flex shadow-md bg-white/20 backdrop-blur-sm font-semibold items-center justify-center text-white text-[13px] transition-all duration-300 transform hover:scale-105 hover:bg-white/30 ${
                    isBacktestRunning ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title={
                    isBacktestRunning
                      ? "Backtest is running. Please wait..."
                      : "View Saved Strategy Instances"
                  }
                >
                  {/* <svg className="w-4 h-4 mr-2 mt-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg> */}
                  <MdOutlineSaveAlt className="w-4 h-4 mr-2 mt-[-1px]" />
                  Strategy Instances 
                  {Array.isArray(savedStrategies) &&
                    savedStrategies.length > 0 && (
                    <span className="ml-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {savedStrategies.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Strategy Configuration */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Progress Steps */}
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {[
                  {
                    step: 1,
                    title: "Strategy Selection",
                    icon: <FaRegCheckCircle className="w-7 h-7" />,
                  },
                  {
                    step: 2,
                    title: "Strategy Configuration",
                    icon: <TbProgressCheck className="w-7 h-7" />,
                  },
                  {
                    step: 3,
                    title: "Execution",
                    icon: (
                      <BsThreeDots className="w-7 h-7 border-2 border-gray-500 rounded-full p-[3px]" />
                    ),
                  },
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
                              ? "bg-white text-gray-500 shadow-lg "
                              : "bg-white text-gray-500"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="white"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
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
                            isCompleted ? "bg-teal-400" : "bg-gray-400"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Configuration Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column - Inputs */}
                <div className="space-y-6">
                  {/* ETF Selection */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-teal-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                          📈
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          ETF Universe Selection
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedEtfs.length === 0) {
                            message.error("Please select ETFs first");
                            return;
                          }
                          const timestamp = new Date()
                            .toISOString()
                            .replace(/T/, " ")
                            .replace(/\..+/, "")
                            .replace(/:/g, "-");
                          setCustomStrategyName(
                            `ETF Rotation Strategy - ${selectedEtfs.length} ETFs - ${timestamp}`
                          );
                          setIsCustomNamePopupOpen(true);
                          setSaveFromUniverseSelection(true);
                        }}
                        disabled={selectedEtfs.length === 0 || saveLoading}
                        className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {/* <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg> */}
                        <MdOutlineSaveAlt className="w-4 h-4 mr-1.5" />
                        Save Strategy
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mt-4">
                      Choose ETFs for rotation strategy
                    </label>
                      <button
                        className="text-sm px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:from-blue-100 hover:to-purple-100 rounded-md flex items-center gap-2 cursor-not-allowed opacity-75 border border-blue-200"
                        disabled
                        title="This feature is coming soon!"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>

                        <span>AI Suggestions</span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          Coming Soon
                        </span>
                      </button>
                    </div>
                    
                    <Select
                      isMulti
                      options={etfs}
                      value={selectedEtfs}
                      onChange={(selected) => {
                        setSelectedEtfs(selected);
                        setActiveSetupStep(2);
                      }}
                      placeholder="Select multiple ETFs..."
                      isLoading={loading}
                      className="mb-4 mt-4"
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
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                        📋
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Available ETFs
                      </h3>
                    </div>

                    <div className="bg-white rounded-lg">
                      {/* Scroll area with hidden scrollbar */}
                      <div className="max-h-96 overflow-y-auto scrollbar-hide">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 top-0 sticky">
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

                {/* Right Column - ETF Overview Table */}
                {1 > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <div className="flex relative items-center mb-4">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                        📅
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Date Range
                      </h3>
                      <button
                        onClick={runBacktest}
                        disabled={backtestLoading || selectedEtfs.length === 0}
                        className="inline-flex absolute top-0 right-0 items-center px-3 py-2 border border-transparent text-[13px] font-medium rounded-lg text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
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

                    {dateRangeLoading && (
                      <div className="flex items-center text-sm text-teal-600 mb-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                        Calculating optimal date range...
                      </div>
                    )}

                    {true && true && (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Available Period:
                              </span>
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
                              <span className="text-gray-500">
                                Max Duration:
                              </span>
                              {dateRange.years > 0 ? (
                                <p className="font-semibold text-green-600">
                                  {dateRange.years.toFixed(1)} years
                                </p>
                              ) : (
                                <p className="font-semibold text-gray-400">
                                  0 years
                                </p>
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
                              // setActiveSetupStep(Math.max(activeSetupStep, 3));
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
                                onChange={(e) =>
                                  setCustomStartDate(e.target.value)
                                }
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
                                onChange={(e) =>
                                  setCustomEndDate(e.target.value)
                                }
                                min={customStartDate || dateRange.start}
                                max={dateRange.end}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Strategy Parameters */}
                        {true && (
                          <>
                            <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                                ⚙️
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">
                                Strategy Parameters
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Capital per Week (₹)
                                </label>
                                <input
                                  type="text"
                                  value={capitalPerWeekDisplay}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    setCapitalPerWeekDisplay(inputValue);
                                    
                                    // Parse the input and update numeric value
                                    const numericValue =
                                      parseIndianCurrency(inputValue);
                                    if (
                                      !isNaN(numericValue) &&
                                      numericValue >= 0
                                    ) {
                                      setCapitalPerWeek(numericValue);
                                    }
                                    setActiveSetupStep(
                                      Math.max(activeSetupStep, 4)
                                    );
                                  }}
                                  onBlur={(e) => {
                                    // Format the value when user leaves the field
                                    const numericValue = parseIndianCurrency(
                                      e.target.value
                                    );
                                    if (numericValue >= 1000) {
                                      setCapitalPerWeek(numericValue);
                                      setCapitalPerWeekDisplay(
                                        formatIndianCurrency(numericValue)
                                      );
                                    } else {
                                      // Reset to minimum if below threshold
                                      setCapitalPerWeek(1000);
                                      setCapitalPerWeekDisplay(
                                        formatIndianCurrency(1000)
                                      );
                                    }
                                  }}
                                  onFocus={(e) => {
                                    // Select all text on focus for easy editing
                                    e.target.select();
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  placeholder="₹50,000"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Accumulation Weeks
                                </label>
                                <input
                                  type="number"
                                  value={accumulationWeeks}
                                  onChange={(e) =>
                                    setAccumulationWeeks(e.target.value)
                                  }
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
                                  onChange={(e) =>
                                    setBrokeragePercent(e.target.value)
                                  }
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
                                  onChange={(e) =>
                                    setRiskFreeRate(e.target.value)
                                  }
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
                                  onChange={(e) =>
                                    setCompoundingEnabled(e.target.checked)
                                  }
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor="compounding"
                                  className="ml-2 block text-sm font-medium text-gray-900"
                                >
                                  Enable Compounding
                                </label>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {strategyLoadedMessage && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Strategy Loaded
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    {strategyLoadedMessage}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Configuration Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Tooltip Styles */}
        <style>{`
          .custom-tooltip {
            position: relative;
          }
          .custom-tooltip::before {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 8px;
            padding: 4px 8px;
            background-color: #000000;
            color: #ffffff;
            border-radius: 6px;
            font-size: 11px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease-in-out;
            z-index: 10000;
          }
          .custom-tooltip::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 2px;
            border: 5px solid transparent;
            border-top-color: #000000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease-in-out;
            z-index: 10000;
          }
          .custom-tooltip:hover::before,
          .custom-tooltip:hover::after {
            opacity: 1;
          }
        `}</style>

        {/* Saved Strategies Popup */}
        {isSavedStrategiesPopupOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-[1300px] w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Saved Strategy Instances
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchSavedStrategies}
                      className="text-sm text-teal-600 hover:text-teal-800 transition-colors duration-150 flex items-center gap-1"
                      title="Refresh strategies"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh
                    </button>
                    <button
                      onClick={() => {
                        setIsSavedStrategiesPopupOpen(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Strategies List */}
                {savedStrategiesLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center text-sm text-gray-500">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-6 w-6 text-teal-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading strategies...
                    </div>
                  </div>
                ) : !Array.isArray(savedStrategies) ||
                  savedStrategies.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-500">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No saved strategies found
                      </h3>
                      <p className="text-gray-400">
                        Save a strategy first to see it here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        {/* Table Header */}
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                              Strategy Name
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                              Created Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                              Selected ETFs
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[140px]">
                              Last Execution Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[140px]">
                              Next Execution Date
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(savedStrategies) &&
                            savedStrategies.map((strategy, index) => {
                              const isRunning =
                                strategy.deploymentStatus === "running";
                              const isStopped =
                                strategy.deploymentStatus === "stop" ||
                                strategy.deploymentStatus === "stopped";
                            const showExecutionDates = isRunning || isStopped;
                            
                            return (
                            <tr key={index} className="hover:bg-gray-50">
                              {/* Strategy Name */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                      {strategy.strategy_name ||
                                        strategy.name ||
                                        `ETF Rotation Strategy ${index + 1}`}
                                </div>
                              </td>

                              {/* Created Date */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                      {strategy.created_at
                                        ? formatDate(strategy.created_at)
                                        : "N/A"}
                                </div>
                              </td>

                              {/* Selected ETFs */}
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                      {strategy.tickers &&
                                      strategy.tickers.length > 0 ? (
                                        <>
                                          {strategy.tickers
                                            .slice(0, 3)
                                            .map((ticker, tickerIndex) => (
                                              <span
                                                key={tickerIndex}
                                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                              >
                                          {ticker}
                                        </span>
                                      ))}
                                      {strategy.tickers.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                              +{strategy.tickers.length - 3}{" "}
                                              more
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                          No ETFs
                                        </span>
                                  )}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        strategy.deploymentStatus === "running"
                                          ? "bg-green-100 text-green-800"
                                          : strategy.deploymentStatus ===
                                              "stop" ||
                                            strategy.deploymentStatus ===
                                              "stopped"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {strategy.deploymentStatus === "running"
                                        ? "Running"
                                        : strategy.deploymentStatus ===
                                            "stop" ||
                                          strategy.deploymentStatus ===
                                            "stopped"
                                        ? "Stopped"
                                        : "Not Deployed"}
                                </span>
                              </td>

                              {/* Last Execution Date - Only show for running/stopped strategies */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {showExecutionDates ? (
                                  <div className="text-sm text-gray-900">
                                        {strategy.deploymentDetails
                                          ?.execution_date
                                          ? formatDate(
                                              strategy.deploymentDetails
                                                .execution_date
                                            )
                                      : strategy.last_execution_date 
                                          ? formatDate(
                                              strategy.last_execution_date
                                            )
                                          : "-"}
                                  </div>
                                ) : (
                                      <div className="text-sm text-gray-400">
                                        -
                                      </div>
                                )}
                              </td>

                              {/* Next Execution Date - Only show for running/stopped strategies */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {showExecutionDates ? (
                                  <div className="text-sm text-gray-900">
                                    {strategy.next_execution_date 
                                          ? formatDate(
                                              strategy.next_execution_date
                                            )
                                          : "-"}
                                  </div>
                                ) : (
                                      <div className="text-sm text-gray-400">
                                        -
                                      </div>
                                )}
                              </td>

                              {/* Actions */}
                              {/* view button */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-1">
                                  <button
                                    data-tooltip="Client Information"
                                    onClick={() => {
                                      openStrategyDetails(strategy);
                                    }}
                                    className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                                  >
                                     <FaRegEye />
                                  </button>

                                  {/* <button
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
                                  </button> */}

                                  {/* Deploy Button - Only show if status is deploy */}
                                      {(strategy.status === "deploy" ||
                                        strategy.deploymentStatus ===
                                          "deploy") && (
                                    <button
                                      data-tooltip="Deploy"
                                      onClick={() => {
                                            setWebHookStrategyType(
                                              "ETF Strategy"
                                            );
                                        setSelectedStrategy(strategy);
                                        setIsWebHookModalOpen(true);
                                      }}
                                      className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                                    >
                                      <FaCloudUploadAlt />
                                    </button>
                                  )}

                                  {/* Stop Button - Only show if status is running */}
                                      {(strategy.status === "running" ||
                                        strategy.deploymentStatus ===
                                          "running") && (
                                    <button
                                          onClick={() =>
                                            handleStopStrategy(strategy)
                                          }
                                      data-tooltip="Stop"
                                      className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                                    >
                                     <HiOutlinePauseCircle />
                                    </button>
                                  )}

                                  {/* Restart Button - Only show if status is stopped */}
                                      {(strategy.status === "stopped" ||
                                        strategy.deploymentStatus ===
                                          "stopped") && (
                                    <button
                                      data-tooltip="Restart"
                                          onClick={() =>
                                            handleRestartStrategy(strategy)
                                          }
                                      className="custom-tooltip flex items-center text-black hover:scale-125 transition-transform duration-500 ease-in-out text-2xl px-2"
                                    >
                                   <FaRegPlayCircle />
                                    </button>
                                  )}

                                  {/* Delete Button - Always visible */}
                                  <button
                                    data-tooltip="Delete"
                                        onClick={() =>
                                          handleDeleteStrategy(strategy)
                                        }
                                     className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                                  >
                                    <RiDeleteBinLine />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Strategy Details Popup */}
        {isStrategyDetailsOpen && selectedStrategyDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6 space-y-2">
  {/* Row 1: Webhook URL (left) + Close (right) */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-gray-600 shrink-0">
                        Web Hook URL:
                      </span>
      <span
        className="text-sm text-gray-900 truncate"
                        title={
                          selectedStrategyDetails.deploymentDetails.webhook_url
                        }
      >
        {selectedStrategyDetails.deploymentDetails.webhook_url}
      </span>
    </div>

    <button
      onClick={() => {
        setIsStrategyDetailsOpen(false);
        setSelectedStrategyDetails(null);
      }}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      aria-label="Close"
    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
      </svg>
    </button>
  </div>

  {/* Row 2: Heading */}
                  <h2 className="text-2xl font-bold text-gray-900">
                    Client Information
                  </h2>
</div>

                {/* Strategy Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Strategy Name: </span>
                        <span className="text-sm text-gray-900">{selectedStrategyDetails.strategy_name || selectedStrategyDetails.name}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Created: </span>
                        <span className="text-sm text-gray-900">
                          {selectedStrategyDetails.created_at ? formatDateTime(selectedStrategyDetails.created_at) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">ETFs Count: </span>
                        <span className="text-sm text-gray-900">
                          {selectedStrategyDetails.tickers ? selectedStrategyDetails.tickers.length : 0} ETFs
                        </span>
                      </div>
                      {selectedStrategyDetails.deploymentDetails && (
                        <>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Run ID: </span>
                            <span className="text-sm text-gray-900 font-mono">{selectedStrategyDetails.deploymentDetails.run_id || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Execution Date: </span>
                            <span className="text-sm text-gray-900">{selectedStrategyDetails.deploymentDetails.execution_date ? formatDate(selectedStrategyDetails.deploymentDetails.execution_date) : 'N/A'}</span>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-600">Status: </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          selectedStrategyDetails.deploymentStatus === 'running'
                            ? 'bg-green-100 text-green-800'
                            : selectedStrategyDetails.deploymentStatus === 'stopped' || selectedStrategyDetails.deploymentStatus === 'stop'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedStrategyDetails.deploymentStatus === 'running' 
                            ? 'Running' 
                            : selectedStrategyDetails.deploymentStatus === 'stopped' || selectedStrategyDetails.deploymentStatus === 'stop'
                            ? 'Stopped'
                            : 'Not Deployed'}
                        </span>
                      </div>
                    </div>
                  </div> */}

                  {/* ETF List */}
                  {/* <div className="bg-gray-50 p-2 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected ETFs</h3>
                    {selectedStrategyDetails.tickers && selectedStrategyDetails.tickers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedStrategyDetails.tickers.map((ticker, index) => (
                          <span key={index} className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border">
                            {ticker}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No ETFs selected</p>
                    )}
                  </div> */}
                </div>

                {/* Client Information */}
                {(selectedStrategyDetails.deploymentDetails ||
                  selectedStrategyDetails.client_information_json) && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Client Information
                      </h3>
                      <button
                        type="button"
                        onClick={openBulkDeleteConfirm}
                        disabled={!hasSelectedClients || bulkDeleteLoading}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                          hasSelectedClients && !bulkDeleteLoading
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {bulkDeleteLoading
                          ? "Deleting..."
                          : `Delete Selected${
                              hasSelectedClients
                                ? ` (${selectedClientIds.length})`
                                : ""
                            }`}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[80px]">
                              S.NO.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">
                              CLIENT ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">
                              CAPITAL PER WEEK
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <span>Delete</span>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  checked={areAllClientsSelected}
                                  onChange={(e) =>
                                    handleSelectAllClients(e.target.checked)
                                  }
                                />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(() => {
                            const clientInfo = getCurrentClientInformation();
                            const clientEntries = Object.entries(clientInfo);

                            if (clientEntries.length > 0) {
                              return clientEntries.map(
                                ([clientId, capital], index) => (
                                  <tr
                                    key={clientId}
                                    className="hover:bg-gray-50"
                                  >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {index + 1}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {clientId}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {capital}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        checked={!!clientSelectionMap[clientId]}
                                        onChange={(e) =>
                                          handleClientSelectionChange(
                                            clientId,
                                            e.target.checked
                                          )
                                        }
                                      />
                                  </td>
                                </tr>
                                )
                              );
                            }

                              return (
                                <tr>
                                <td
                                  colSpan="4"
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                >
                                    No clients selected for this strategy.
                                  </td>
                                </tr>
                              );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Best Combinations Modal */}

      {/* <BestEtfCombinationModal
        isOpen={isBestCombinationsModalOpen}
        onClose={() => setIsBestCombinationsModalOpen(false)}
        onSelectCombination={(etfOptions) => {
          // Set the selected ETFs from the combination
          setSelectedEtfs(etfOptions);
          // Update active step to 2 (ETF Selection complete)
          setActiveSetupStep(2);
          // Show success message
          message.success('Best combination applied successfully!');
          setIsBestCombinationsModalOpen(false);
        }}
      /> */}

        {isBulkDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeBulkDeleteConfirm}
            ></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Clients
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedClientIds.length > 1 ? (
                      <>
                        Are you sure you want to remove{" "}
                        <span className="font-semibold">
                          {selectedClientIds.length} clients
                        </span>
                        ?
                      </>
                    ) : selectedClientIds.length === 1 ? (
                      <>
                        Are you sure you want to remove client{" "}
                        <span className="font-semibold">
                          {selectedClientIds[0]}
                        </span>
                        ?
                      </>
                    ) : (
                      "No clients selected."
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeBulkDeleteConfirm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeBulkDeleteConfirm}
                  className="px-4 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={bulkDeleteLoading}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={confirmBulkDelete}
                  className="px-4 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={bulkDeleteLoading}
                >
                  {bulkDeleteLoading ? "Deleting..." : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ETF Strategy Info Modal */}
      {isStrategyInfoModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsStrategyInfoModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
            {/* Teal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{strategyType}</h2>
              <button
                onClick={() => setIsStrategyInfoModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Close modal"
              >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
              </button>
            </div>

            {/* Content Area - White background with scrollable iframe */}
            <div className="flex-1 bg-white overflow-hidden rounded-b-[20px]">
              <iframe
                src="/templates/etf_rotation_strategy.html"
                className="w-full h-full border-0"
                title="ETF Rotation Strategy Information"
                  style={{ minHeight: "calc(90vh - 80px)" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Strategy Name Popup */}
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
                      setCustomStrategyName("");
                    setSaveFromUniverseSelection(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                  <label
                    htmlFor="strategyName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
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
                  Choose a descriptive name for your ETF rotation strategy.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCustomNamePopupOpen(false);
                      setCustomStrategyName("");
                    setSaveFromUniverseSelection(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    if (!customStrategyName.trim()) {
                        message.error("Please enter a strategy name");
                      return;
                    }

                    await saveStrategyParameters(customStrategyName.trim());
                    if (!saveFromUniverseSelection) {
                      setIsCustomNamePopupOpen(false);
                        setCustomStrategyName("");
                    }
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
                      "Save Strategy"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Save Deployment Popup */}
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
                      setSavedStrategyName("");
                    setRecentlySavedStrategy(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Your strategy Configuration has been saved:
                  </p>
                <p className="text-lg font-semibold text-gray-900">
                  {recentlySavedStrategy?.strategy_name || savedStrategyName}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsPostSaveDeploymentPopupOpen(false);
                      setSavedStrategyName("");
                    setRecentlySavedStrategy(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (recentlySavedStrategy) {
                        setWebHookStrategyType("ETF Rotation Strategy");
                      setSelectedStrategy(recentlySavedStrategy);
                      setIsPostSaveDeploymentPopupOpen(false);
                      setIsWebHookModalOpen(true);
                        setSavedStrategyName("");
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
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            style={{ zIndex: 99999 }}
          >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[350px] max-h-[90vh] overflow-hidden px-[10px] py-[10px]">
            <WebHook
              onClose={() => {
                setIsWebHookModalOpen(false);
                setSelectedStrategy(null);
                
              }}
              strategyType={webHookStrategyType}
                userEmail={user?.email || "test@test.com"}
                selectedEtfs={
                  selectedStrategy ? selectedStrategy.tickers : selectedEtfs
                }
              selectedStrategy={selectedStrategy}
                strategyParams={
                  selectedStrategy
                    ? {
                capitalPerWeek: selectedStrategy.capital_per_week,
                accumulationWeeks: selectedStrategy.accumulation_weeks,
                brokeragePercent: selectedStrategy.brokerage_percent,
                riskFreeRate: selectedStrategy.risk_free_rate,
                        compoundingEnabled:
                          selectedStrategy.compounding_enabled,
                      }
                    : {
                capitalPerWeek,
                accumulationWeeks,
                brokeragePercent,
                riskFreeRate,
                        compoundingEnabled,
                      }
                }
              onDeploymentSuccess={() => {
                fetchSavedStrategies();
                  message.success("Strategy deployed successfully!");
              }}
            />
          </div>
        </div>
      )}
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
                <h1 className="text-2xl font-bold text-gray-900">
                  📊 Backtest Results
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  ETF Rotation Strategy Analysis
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    if (selectedEtfs.length === 0) {
                      message.error("Please select ETFs first");
                      return;
                    }
                    const timestamp = new Date()
                      .toISOString()
                      .replace(/T/, " ")
                      .replace(/\..+/, "")
                      .replace(/:/g, "-");
                    setCustomStrategyName(
                      `ETFs Rotation Strategy - ${selectedEtfs.length} ETFs - ${timestamp}`
                    );
                    setIsCustomNamePopupOpen(true);
                  }}
                  disabled={saveLoading || selectedEtfs.length === 0}
                  className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saveLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 mb-[2px] "
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save Strategy
                    </>
                  )}
                </button>
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
        {renderPerformanceChart()}

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
                📊 Show ETF Rotation Strategy
              </label>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {backtestResult &&
          (() => {
            const etf_metrics =
              backtestResult.etf_metrics ||
              backtestResult.etf_metrics_data ||
              {};
          if (etf_metrics && Object.keys(etf_metrics).length > 0) {
            return (
                <div
                  className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 overflow-visible relative"
                  style={{ overflow: "visible" }}
                >
                  {renderMetricsCard(
                    "Total Return",
                    etf_metrics["Total Return"] ||
                      etf_metrics["total_return"] ||
                      "N/A"
                  )}
                  {renderMetricsCard(
                    "CAGR",
                    etf_metrics["CAGR"] || etf_metrics["cagr"] || "N/A"
                  )}
                  {renderMetricsCard(
                    "XIRR",
                    etf_metrics["XIRR"] || etf_metrics["xirr"] || "N/A"
                  )}
                  {renderMetricsCard(
                    "Sharpe Ratio",
                    etf_metrics["Sharpe Ratio"] ||
                      etf_metrics["sharpe_ratio"] ||
                      "N/A"
                  )}
                  {renderMetricsCard(
                    "Treynor Ratio",
                    etf_metrics["Treynor Ratio"] ||
                      etf_metrics["treynor_ratio"] ||
                      "N/A"
                  )}
                  {renderMetricsCard(
                    "Calmar Ratio",
                    etf_metrics["Calmar Ratio"] ||
                      etf_metrics["calmar_ratio"] ||
                      "N/A"
                  )}
                  {renderMetricsCard(
                    "Max Drawdown",
                    etf_metrics["Max Drawdown"] ||
                      etf_metrics["max_drawdown"] ||
                      "N/A"
                  )}
                {/* {renderMetricsCard('Win Rate', etf_metrics['Win Rate'] || etf_metrics['win_rate'] || 'N/A')} */}
              </div>
            );
          }
          return null;
        })()}

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "metrics", label: "📊 Metrics" },
                { id: "trades", label: "📋 Trades" },
                { id: "costs", label: "💰 Costs" },
                { id: "execution", label: "⚡ Skipped Trades" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === "metrics" && renderMetricsTable()}
            {activeTab === "trades" && renderTransactionLog()}
            {activeTab === "costs" && <CostsDashboard />}
            {activeTab === "execution" && <TradeExecutionTracker />}
          </div>
        </div>

        {/* Export Buttons */}
        {showResults && (
          <div className="mt-8 mb-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Export Data
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportETFPerformanceCSV}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                ETF Performance CSV
              </button>

              <button
                onClick={exportNifty50DataCSV}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Nifty50 Data CSV
              </button>

              <button
                onClick={exportTransactionCostsCSV}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
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
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Documentation
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Support
                </a>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  API
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Saved Strategies Popup */}
      {isSavedStrategiesPopupOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Saved Strategy Instances
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchSavedStrategies}
                    className="text-sm text-teal-600 hover:text-teal-800 transition-colors duration-150 flex items-center gap-1"
                    title="Refresh strategies"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      setIsSavedStrategiesPopupOpen(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Strategies List */}
              {savedStrategiesLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center text-sm text-gray-500">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-teal-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading strategies...
                  </div>
                </div>
              ) : !Array.isArray(savedStrategies) ||
                savedStrategies.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-500">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No saved strategies found
                    </h3>
                    <p className="text-gray-400">
                      Save a strategy first to see it here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(savedStrategies) &&
                    savedStrategies.map((strategy, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
                    >
                      {/* Strategy Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {strategy.strategy_name ||
                                strategy.name ||
                                `ETF Strategy ${index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                              Created:{" "}
                              {strategy.created_at
                                ? formatDate(strategy.created_at)
                                : "N/A"}
                          </p>
                        </div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              strategy.status === "running" ||
                              strategy.deploymentStatus === "running"
                                ? "bg-green-100 text-green-800"
                                : strategy.status === "stopped" ||
                                  strategy.deploymentStatus === "stopped"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {strategy.status === "running" ||
                            strategy.deploymentStatus === "running"
                              ? "Running"
                              : strategy.status === "stopped" ||
                                strategy.deploymentStatus === "stopped"
                              ? "Stopped"
                              : "Stopped"}
                        </span>
                      </div>

                      {/* Strategy Details */}
                      <div className="space-y-3 mb-4">
                        <div>
                            <span className="text-sm font-medium text-gray-600">
                              ETFs Count:
                            </span>
                          <p className="text-sm text-gray-900">
                              {strategy.tickers ? strategy.tickers.length : 0}{" "}
                              ETFs
                          </p>
                        </div>

                        {strategy.tickers && strategy.tickers.length > 0 && (
                          <div>
                              <span className="text-sm font-medium text-gray-600">
                                Selected ETFs:
                              </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {strategy.tickers
                                  .slice(0, 3)
                                  .map((ticker, tickerIndex) => (
                                    <span
                                      key={tickerIndex}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                  {ticker}
                                </span>
                              ))}
                              {strategy.tickers.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                  +{strategy.tickers.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Deployment Details */}
                          {strategy.deploymentStatus === "running" && (
                          <div className="bg-green-50 p-3 rounded-md">
                              <span className="text-sm font-medium text-green-800">
                                Deployment Details:
                              </span>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-green-700">
                                  <span className="font-medium">Status:</span>{" "}
                                  Running
                              </p>
                              <p className="text-xs text-green-700">
                                  <span className="font-medium">
                                    Click "View Details" for more info
                                  </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <div className="relative group flex-1">
                          <button
                            onClick={() => {
                              if (!isBacktestRunning) {
                                openStrategyDetails(strategy);
                              }
                            }}
                            disabled={isBacktestRunning}
                            className={`flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm ${
                                isBacktestRunning
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            View Details
                          </button>
                          {!isBacktestRunning && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              View Details
                            </div>
                          )}
                          {isBacktestRunning && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              Backtest is running. Please wait...
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            loadSavedStrategy(strategy);
                            setIsSavedStrategiesPopupOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                        >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                          </svg>
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                <div className="text-sm text-gray-500">
                  {Array.isArray(savedStrategies) &&
                    savedStrategies.length > 0 && (
                      <span>
                        Showing {savedStrategies.length} saved strateg
                        {savedStrategies.length === 1 ? "y" : "ies"}
                      </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsSavedStrategiesPopupOpen(false);
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

      {/* Strategy Details Popup */}
      {isStrategyDetailsOpen && selectedStrategyDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Strategy Details
                </h2>
                <button
                  onClick={() => {
                    setIsStrategyDetailsOpen(false);
                    setSelectedStrategyDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Strategy Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Strategy Name:
                      </span>
                      <p className="text-sm text-gray-900">
                        {selectedStrategyDetails.strategy_name ||
                          selectedStrategyDetails.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Created:
                      </span>
                      <p className="text-sm text-gray-900">
                        {selectedStrategyDetails.created_at
                          ? formatDateTime(selectedStrategyDetails.created_at)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        ETFs Count:
                      </span>
                      <p className="text-sm text-gray-900">
                        {selectedStrategyDetails.tickers
                          ? selectedStrategyDetails.tickers.length
                          : 0}{" "}
                        ETFs
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          selectedStrategyDetails.deploymentStatus === "running"
                            ? "bg-green-100 text-green-800"
                            : selectedStrategyDetails.deploymentStatus ===
                                "stopped" ||
                              selectedStrategyDetails.deploymentStatus ===
                                "stop"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedStrategyDetails.deploymentStatus === "running"
                          ? "Running"
                          : selectedStrategyDetails.deploymentStatus ===
                              "stopped" ||
                            selectedStrategyDetails.deploymentStatus === "stop"
                          ? "Stopped"
                          : "Not Deployed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ETF List */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Selected ETFs
                  </h3>
                  {selectedStrategyDetails.tickers &&
                  selectedStrategyDetails.tickers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStrategyDetails.tickers.map((ticker, index) => (
                        <span
                          key={index}
                          className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border"
                        >
                          {ticker}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No ETFs selected</p>
                  )}
                </div>
              </div>

              {/* Client Information */}
              {selectedStrategyDetails.deploymentDetails && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Client Information
                    </h3>
                    <button
                      type="button"
                      onClick={openBulkDeleteConfirm}
                      disabled={!hasSelectedClients || bulkDeleteLoading}
                      className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                        hasSelectedClients && !bulkDeleteLoading
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {bulkDeleteLoading
                        ? "Deleting..."
                        : `Delete Selected${
                            hasSelectedClients
                              ? ` (${selectedClientIds.length})`
                              : ""
                          }`}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[80px]">
                            NO.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">
                            CLIENT ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">
                            CAPITAL PER WEEK
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <span>Delete</span>
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                checked={areAllClientsSelected}
                                onChange={(e) =>
                                  handleSelectAllClients(e.target.checked)
                                }
                              />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          const clientInfo = getCurrentClientInformation();
                          const clientEntries = Object.entries(clientInfo);

                          if (clientEntries.length > 0) {
                            return clientEntries.map(
                              ([clientId, capital], index) => (
                                <tr key={clientId} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {index + 1}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {clientId}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {capital}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                      checked={!!clientSelectionMap[clientId]}
                                      onChange={(e) =>
                                        handleClientSelectionChange(
                                          clientId,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              )
                            );
                          }

                          return (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                              >
                                No clients selected for this strategy.
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      loadSavedStrategy(selectedStrategyDetails);
                      setIsStrategyDetailsOpen(false);
                      setSelectedStrategyDetails(null);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Load Strategy
                  </button>

                  {selectedStrategyDetails.deploymentStatus !== "running" && (
                    <button
                      onClick={() => {
                        setWebHookStrategyType("ETF Strategy");
                        setSelectedStrategy(selectedStrategyDetails);
                        setIsWebHookModalOpen(true);
                        setIsStrategyDetailsOpen(false);
                        setSelectedStrategyDetails(null);
                      }}
                      className="flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                    >
                      <FaCloudUploadAlt />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Strategy Name Popup */}
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
                    setCustomStrategyName("");
                    setSaveFromUniverseSelection(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label
                  htmlFor="strategyName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                  Choose a descriptive name for your ETF rotation strategy.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCustomNamePopupOpen(false);
                    setCustomStrategyName("");
                    setSaveFromUniverseSelection(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    if (!customStrategyName.trim()) {
                      message.error("Please enter a strategy name");
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
                    "Save Strategy"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best Combinations Modal */}
      <BestEtfCombinationModal
        isOpen={isBestCombinationsModalOpen}
        onClose={() => setIsBestCombinationsModalOpen(false)}
        onSelectCombination={(etfOptions) => {
          // Set the selected ETFs from the combination
          setSelectedEtfs(etfOptions);
          // Update active step to 2 (ETF Selection complete)
          setActiveSetupStep(2);
          // Show success message
          message.success("Best combination applied successfully!");
          setIsBestCombinationsModalOpen(false);
        }}
      />

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
                    setSavedStrategyName("");
                    setRecentlySavedStrategy(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Your strategy Configuration has been saved:
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {savedStrategyName}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsPostSaveDeploymentPopupOpen(false);
                    setSavedStrategyName("");
                    setRecentlySavedStrategy(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (recentlySavedStrategy) {
                      setWebHookStrategyType("ETF Strategy");
                      setSelectedStrategy(recentlySavedStrategy);
                      setIsPostSaveDeploymentPopupOpen(false);
                      setIsWebHookModalOpen(true);
                      setSavedStrategyName("");
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
              setShowResults={setShowResults}
              onClose={() => {
                setIsWebHookModalOpen(false);
                setSelectedStrategy(null);
              }}
              strategyType={webHookStrategyType}
              userEmail={user?.email || "test@test.com"}
              selectedEtfs={
                selectedStrategy ? selectedStrategy.tickers : selectedEtfs
              }
              selectedStrategy={selectedStrategy}
              strategyParams={
                selectedStrategy
                  ? {
                capitalPerWeek: selectedStrategy.capital_per_week,
                accumulationWeeks: selectedStrategy.accumulation_weeks,
                brokeragePercent: selectedStrategy.brokerage_percent,
                riskFreeRate: selectedStrategy.risk_free_rate,
                      compoundingEnabled: selectedStrategy.compounding_enabled,
                    }
                  : {
                capitalPerWeek,
                accumulationWeeks,
                brokeragePercent,
                riskFreeRate,
                      compoundingEnabled,
                    }
              }
              onDeploymentSuccess={() => {
                fetchSavedStrategies();
                message.success("Strategy deployed successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ETFStrategy;
