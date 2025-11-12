import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, message } from 'antd';
import Backtest from '../components/rs_strategycomponents/Backtest';                 
import Results from '../components/rs_strategycomponents/Results';
import ResultDetail from '../components/rs_strategycomponents/ResultDetail';
import WebHook from '../components/WebHook';
import BestStockCombinationModal from '../components/Combinations/BestStockCombinationModal';
import { formatDate } from '../utils/dateFormatter';
import { AppProvider, useApp } from '../context/RScontext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { HiOutlinePauseCircle } from "react-icons/hi2";
import { FaRegEye } from "react-icons/fa";
import { FaRegPlayCircle } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineSaveAlt } from "react-icons/md";

function RSStrategyContent({ onBack, strategyType = "RS Strategy", onSubPageChange }) {
  const [activeTab, setActiveTab] = useState('backtest');
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [backtestResult, setBacktestResult] = useState(null);  // Store full result (in-memory like ETF Strategy)
  const [savedBacktestConfig, setSavedBacktestConfig] = useState(null); // Store config to restore when going back to setup
  const [isBacktestRunning, setIsBacktestRunning] = useState(false); // Track if backtest is running
  const { user } = useAuth();
  const { backtests, loadBacktests } = useApp();
  
  // Saved Strategies State
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [isSavedStrategiesPopupOpen, setIsSavedStrategiesPopupOpen] = useState(false);
  const [savedStrategiesLoading, setSavedStrategiesLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [webHookStrategyType, setWebHookStrategyType] = useState('');
  const [isWebHookModalOpen, setIsWebHookModalOpen] = useState(false);
  const [isStrategyDetailsOpen, setIsStrategyDetailsOpen] = useState(false);
  const [selectedStrategyDetails, setSelectedStrategyDetails] = useState(null);
  const [isBestCombinationsModalOpen, setIsBestCombinationsModalOpen] = useState(false);
  const [clientCheckboxes, setClientCheckboxes] = useState({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [saveFromUniverseSelection, setSaveFromUniverseSelection] = useState(false);
  const [isSaveStrategyPopupOpen, setIsSaveStrategyPopupOpen] = useState(false);
  const [customStrategyName, setCustomStrategyName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentBacktestConfig, setCurrentBacktestConfig] = useState(null);
  const [clientSelectionMap, setClientSelectionMap] = useState({});
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  
  // Post-Save Deployment Popup State (after saving from backtest results or universe selection)
  const [isPostSaveDeploymentPopupOpen, setIsPostSaveDeploymentPopupOpen] = useState(false);
  const [savedStrategyName, setSavedStrategyName] = useState('');
  const [recentlySavedStrategy, setRecentlySavedStrategy] = useState(null);

  // Fetch saved strategies
  const fetchSavedStrategies = async () => {
    try {
      setSavedStrategiesLoading(true);
      const apiUrl = `/api/get-saved-rs-strategies/${user.email}`;
      console.log('🔍 RS Strategy API URL being called:', apiUrl); // Debug log
      
      const response = await axios.get(apiUrl, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔍 RS Strategy API Response:', response.data); // Debug log
      
      if (response.data.success) {
        setSavedStrategies(response.data.strategies);
      }
    } catch (error) {
      console.error('Failed to fetch saved strategies:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        timeout: error.code === 'ECONNABORTED' ? 'Request timeout' : 'Other error'
      });
      message.error(`Failed to load saved strategies: ${error.message}`);
    } finally {
      setSavedStrategiesLoading(false);
    }
  };

  // Load saved strategy
  const loadSavedStrategy = (strategy) => {
    message.success('Strategy loaded successfully!');
    setIsSavedStrategiesPopupOpen(false);
  };

  // Open strategy details
  const openStrategyDetails = (strategy) => {
    setSelectedStrategyDetails(strategy);
    setIsStrategyDetailsOpen(true);
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

  // Function to handle client removal (delete client from strategy)
  const handleClientRemove = async (clientId) => {
    try {
      // Safety check for selectedStrategyDetails
      if (!selectedStrategyDetails) {
        message.error('No strategy details available');
        return;
      }

      // Get current client information with proper structure handling
      let currentClientInfo = {};
      const clientInfoSource = selectedStrategyDetails.client_information_json || 
                               selectedStrategyDetails.config?.client_information_json;
         

      if (clientInfoSource) {
        try {
          const rawData = typeof clientInfoSource === 'string'
            ? JSON.parse(clientInfoSource)
            : clientInfoSource;

          // Handle both possible JSON structures
          if (rawData.clients) {
            // Nested structure: {clients: {clientId: capital}}
            currentClientInfo = rawData.clients;
          } else {
            // Direct structure: {clientId: capital}
            currentClientInfo = rawData;
          }
        } catch (parseError) {
          console.error('Error parsing client information:', parseError);
          currentClientInfo = {};
        }
      }

      // Remove client
      if (currentClientInfo[clientId]) {
        delete currentClientInfo[clientId];
        console.log('🔍 Removed client:', clientId);
      } else {
        message.warning('Client not found in strategy');
        return;
      }

      // Update the strategy in database
      if (!selectedStrategyDetails.id) {
        message.error('Strategy ID not found');
        return;
      }

      const requestBody = {
        strategy_id: selectedStrategyDetails.id,
        user_id: user.email,
        client_information_json: JSON.stringify(currentClientInfo)
      };

      console.log('🔍 Updating RS Strategy client information:', requestBody);

      // Update RS strategy client information
      const response = await axios.post('/api/update-rs-client-information', requestBody);

      if (response.data.success) {
        // Update local state
        setSelectedStrategyDetails(prev => ({
          ...prev,
          client_information_json: JSON.stringify(currentClientInfo)
        }));

        message.success(`Client ${clientId} removed successfully`);
        
        // Refresh strategy details
        fetchSavedStrategies();
      } else {
        message.error(response.data.message || 'Failed to update client information');
      }
    } catch (error) {
      console.error('Error updating client information:', error);
      message.error('Error updating client information: ' + (error.response?.data?.message || error.message));
    }
  };

const getCurrentClientInformation = () => {
  if (!selectedStrategyDetails) return {};

  const source =
    selectedStrategyDetails.client_information_json ||
    selectedStrategyDetails.config?.client_information_json;

  if (!source) return {};

  try {
    const parsed = typeof source === 'string' ? JSON.parse(source) : source;
    return parsed?.clients ? parsed.clients : parsed || {};
  } catch (error) {
    console.error('Error parsing client information JSON:', error);
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
  const info = getCurrentClientInformation();
  const updated = {};
  Object.keys(info).forEach((id) => {
    updated[id] = isSelected;
  });
  setClientSelectionMap(updated);
};

const openBulkDeleteConfirm = () => {
  setIsBulkDeleteConfirmOpen(true);
};

const closeBulkDeleteConfirm = () => {
  if (bulkDeleteLoading) return;
  setIsBulkDeleteConfirmOpen(false);
};

const confirmBulkDelete = async () => {
  const selectedIds = Object.keys(clientSelectionMap).filter((id) => clientSelectionMap[id]);

  if (!selectedIds.length) {
    setIsBulkDeleteConfirmOpen(false);
    return;
  }

  if (!selectedStrategyDetails || !selectedStrategyDetails.id) {
    message.error('Strategy ID not found');
    return;
  }

  const currentInfo = { ...getCurrentClientInformation() };
  let modified = false;
  selectedIds.forEach((id) => {
    if (currentInfo.hasOwnProperty(id)) {
      delete currentInfo[id];
      modified = true;
    }
  });

  if (!modified) {
    setIsBulkDeleteConfirmOpen(false);
    return;
  }

  try {
    setBulkDeleteLoading(true);

    const requestBody = {
      strategy_id: selectedStrategyDetails.id,
      user_id: user.email,
      client_information_json: JSON.stringify(currentInfo),
    };

    const response = await axios.post('/api/update-rs-client-information', requestBody);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to update client information');
    }

    setSelectedStrategyDetails((prev) => ({
      ...prev,
      client_information_json: JSON.stringify(currentInfo),
    }));

    setClientSelectionMap(() => {
      const updated = {};
      Object.keys(currentInfo).forEach((id) => {
        updated[id] = false;
      });
      return updated;
    });

    setClientCheckboxes((prev) => {
      const updated = { ...prev };
      selectedIds.forEach((id) => {
        delete updated[id];
      });
      return updated;
    });

    message.success(
      selectedIds.length > 1
        ? `${selectedIds.length} clients removed successfully`
        : 'Client removed successfully'
    );

    fetchSavedStrategies();
  } catch (error) {
    console.error('Error removing clients:', error);
    message.error(error.message || 'Failed to remove selected clients. Please try again.');
  } finally {
    setBulkDeleteLoading(false);
    setIsBulkDeleteConfirmOpen(false);
  }
};

useEffect(() => {
  const info = getCurrentClientInformation();
  const initial = {};
  Object.keys(info).forEach((id) => {
    initial[id] = false;
  });
  setClientSelectionMap(initial);
}, [selectedStrategyDetails?.client_information_json, selectedStrategyDetails?.config?.client_information_json]);

const selectionKeys = Object.keys(clientSelectionMap);
const selectedIds = selectionKeys.filter((id) => clientSelectionMap[id]);
const totalClients = selectionKeys.length;
const areAllClientsSelected = totalClients > 0 && selectedIds.length === totalClients;
const hasSelectedClients = selectedIds.length > 0;

  // Handle successful backtest completion (like ETF Strategy - in-memory only)
  const handleBacktestSuccess = async (result) => {
    // Store full result in state (no database fetch)
    setBacktestResult(result);
    // Save the config from the result so we can restore it when going back to setup
    if (result.config) {
      setSavedBacktestConfig(result.config);
    }
    setShowResults(true);
  };

  // Handle save strategy from universe selection
  const handleSaveStrategyFromUniverse = (config) => {
    if (!config || !config.selectedStocks || config.selectedStocks.length === 0) {
      message.error('Please select stocks first');
      return;
    }
    setCurrentBacktestConfig(config);
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/:/g, '-');
    setCustomStrategyName(`RS Strategy - ${config.selectedStocks.length} stocks - ${timestamp}`);
    setIsSaveStrategyPopupOpen(true);
    setSaveFromUniverseSelection(true);
  };

  // Save RS strategy parameters
  const saveRsStrategyParameters = async (customName) => {
    if (!currentBacktestConfig) {
      message.error('No configuration available to save');
      return;
    }

    try {
      setSaveLoading(true);

      const startDate = currentBacktestConfig.useCustomDates 
        ? currentBacktestConfig.customStartDate 
        : currentBacktestConfig.dateRange.start || '2020-01-01';
      const endDate = currentBacktestConfig.useCustomDates 
        ? currentBacktestConfig.customEndDate 
        : currentBacktestConfig.dateRange.end || '2023-12-31';

      const strategyParams = {
        strategy_name: customName,
        strategy_type: "rs_strategy",
        user_id: user.email,
        config_id: null,
        backtest_id: null,
        start_date: startDate,
        end_date: endDate,
        stock_universe: currentBacktestConfig.stockUniverse || "NIFTY500",
        backtest_results: {
          total_return: 0,
          cagr: 0,
          sharpe_ratio: 0,
          max_drawdown: 0,
          win_rate: 0
        },
        strategy_config: {
          config_name: customName,
          main_index: currentBacktestConfig.mainIndex || "^NSEI",
          max_positions: currentBacktestConfig.maxPositions || 20,
          position_size_pct: currentBacktestConfig.positionSizePct || 5.0,
          stop_loss_pct: currentBacktestConfig.stopLossPct || 15.0,
          total_capital: currentBacktestConfig.totalCapital || 1000000.0,
          stock_universe: currentBacktestConfig.stockUniverse || "NIFTY500",
          buffer_capital_pct: currentBacktestConfig.bufferCapitalPct || 10.0,
          capital_reset_threshold_pct: currentBacktestConfig.capitalResetThresholdPct || 25.0,
          transaction_cost_pct: currentBacktestConfig.transactionCostPct || 0.1,
          risk_free_rate: currentBacktestConfig.riskFreeRate || 6.0
        },
        tickers: currentBacktestConfig.selectedStocks.map(stock => stock.value),
        created_at: new Date().toISOString()
      };

      const response = await axios.post('/api/save-rs-strategy', strategyParams);
      
      if (response.data.success) {
        message.success('RS Strategy saved successfully!');
        setSavedStrategyName(customName);
        
        // Fetch the saved strategy to get its ID and details
        const strategiesResponse = await axios.get(`/api/get-saved-rs-strategies/${user.email}`);
        
        if (strategiesResponse.data && strategiesResponse.data.strategies) {
          // Find the just-saved strategy by name
          const savedStrategy = strategiesResponse.data.strategies.find(
            s => s.strategy_name === customName
          );
          
          if (savedStrategy) {
            setRecentlySavedStrategy(savedStrategy);
            setIsSaveStrategyPopupOpen(false);
            setIsPostSaveDeploymentPopupOpen(true);
            setCustomStrategyName('');
            setCurrentBacktestConfig(null);
            setSaveFromUniverseSelection(false);
            fetchSavedStrategies();
            return;
          }
        }
        
        setIsSaveStrategyPopupOpen(false);
        setCustomStrategyName('');
        setCurrentBacktestConfig(null);
        fetchSavedStrategies();
      } else {
        message.error(response.data.message || 'Failed to save strategy');
      }
    } catch (error) {
      console.error('Save strategy error:', error);
      message.error('Failed to save strategy');
    } finally {
      setSaveLoading(false);
      setSaveFromUniverseSelection(false);
    }
  };

  const renderContent = () => {
    // Conditional rendering based on showResults (like ETF Strategy)
    if (showResults && backtestResult) {
      // Show results view when backtest completes (pass full data, not just ID)
      return (
        <ResultDetail 
          backtestResult={backtestResult}
          onBackToSetup={() => {
            setShowResults(false);
            // Don't clear backtestResult or savedBacktestConfig - keep them to restore values
            setActiveTab('backtest');
          }}
          onNewBacktest={() => {
            setShowResults(false);
            setBacktestResult(null);
            setSavedBacktestConfig(null); // Clear config to start fresh
            setActiveTab('backtest');
          }}
          onBack={onBack}
        />
      );
    }
    
    // Default: Show backtest configuration or results list based on activeTab
    switch (activeTab) {
      case 'backtest':
        return <Backtest 
          onBacktestSuccess={handleBacktestSuccess} 
          initialConfig={savedBacktestConfig}
          onRunningStateChange={setIsBacktestRunning}
          onSaveStrategy={handleSaveStrategyFromUniverse}
        />;
      case 'results':
        return (
          <Results
            onSelectResult={(id) => {
              setSelectedResultId(id);
              setShowResults(true);
            }}
            onBackToSetup={() => {
              setSelectedResultId(null);
              setShowResults(false);
              setActiveTab('backtest');
            }}
            isBacktestRunning={isBacktestRunning}
          />
        );
      default:
        return <Backtest 
          onBacktestSuccess={handleBacktestSuccess} 
          initialConfig={savedBacktestConfig}
          onRunningStateChange={setIsBacktestRunning}
          onSaveStrategy={handleSaveStrategyFromUniverse}
        />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0ea5e9',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        },
      }}
    >
        <div className="min-h-screen bg-gray-50 mt-2">
          {/* Strategy Header Section - Only show when NOT viewing results */}
          {!showResults && (
            <div className='w-full flex justify-center'>
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[10px] mx-4 mb-6 mt-4 px-5 py-3 shadow-lg w-[1250px]">
                <div className="flex relative items-center justify-between">
                  {/* Back Button */}
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="px-2 py-[7px] rounded-[8px] flex shadow-md bg-white/20 backdrop-blur-sm font-semibold items-center justify-center text-white text-[13px] transition-all duration-300 transform hover:scale-105 hover:bg-white/30"
                    >
                      <svg className="w-4 h-4 mr-2 mt-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Strategies
                    </button>
                  )}
                  
                  {/* Strategy Title - Centered */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <h1 className="text-[20px] font-bold text-white mb-[-1px]">{strategyType}</h1>
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          if (!isBacktestRunning) {
                            setIsInfoModalOpen(true);
                          }
                        }}
                        disabled={isBacktestRunning}
                        className={`w-5 h-5 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer ${
                          isBacktestRunning ? 'opacity-50 cursor-not-allowed' : ''
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
                  
                  {/* Saved Strategies Button */}
                  <button
                    onClick={() => {
                      if (!isBacktestRunning) {
                        fetchSavedStrategies();
                        setIsSavedStrategiesPopupOpen(true);
                      }
                    }}
                    disabled={isBacktestRunning}
                    className={`px-2 py-[7px] rounded-[8px] flex shadow-md bg-white/20 backdrop-blur-sm font-semibold items-center justify-center text-white text-[13px] transition-all duration-300 transform hover:scale-105 hover:bg-white/30 ${
                      isBacktestRunning ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={isBacktestRunning ? 'Backtest is running. Please wait...' : 'View Saved Strategy Instances'}
                  >
                    {/* <svg className="w-4 h-4 mr-2 mt-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg> */}
                    <MdOutlineSaveAlt className="w-4 h-4 mr-2 mt-[-1px]" />
                    Strategy Instances
                    {savedStrategies.length > 0 && (
                      <span className="ml-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {savedStrategies.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Backtest and Results Content */}

          {/* Page Content */}
          <div className="relative min-h-[calc(100vh-160px)] bg-gray-50">
            <div className="relative z-10">
              {renderContent()}
            </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Strategy Instances</h2>
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Universe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Last Execution Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Next Execution Date</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                            {strategy.created_at ? formatDate(strategy.created_at) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          -
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          -
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
                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              {/* View Button */}
                              <button
                                data-tooltip="Client Information"
                                onClick={() => openStrategyDetails(strategy)}
                             className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                              >
                                <FaRegEye />
                              </button>
                              
                              {/* Deploy Button - Only show if status is deploy */}
                              {strategy.status === 'deploy' && (
                                <button
                                  onClick={() => {
                                    setWebHookStrategyType('RS Strategy');
                                    setSelectedStrategy(strategy);
                                    setIsWebHookModalOpen(true);
                                  }}
                                  data-tooltip="Deploy"
                                  className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                                >
                                  <FaCloudUploadAlt />
                                </button>
                              )}
                              
                              {/* Stop Button - Only show if status is running */}
                              {strategy.status === 'running' && (
                                <button
                                  onClick={() => handleStopStrategy(strategy)}
                                  data-tooltip="Stop"
                                  className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                                >
                                  <HiOutlinePauseCircle />
                                </button>
                              )}
                              
                              {/* Restart Button - Only show if status is stop */}
                              {strategy.status === 'stop' && (
                                <button
                                  data-tooltip="Restart"
                                  onClick={() => handleRestartStrategy(strategy)}
                                  className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                                >
                                  <FaRegPlayCircle />
                                </button>
                              )}
                              
                              {/* Delete Button - Always visible */}
                              <button
                                data-tooltip="Delete"
                                onClick={() => handleDeleteStrategy(strategy)}
                                className="custom-tooltip flex items-center text-black hover:scale-125 transition-duration-0.5 text-2xl px-2"
                              >
                                <RiDeleteBinLine />
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

       {/* WebHook Modal for Deployment */}
       {isWebHookModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[350px] max-h-[90vh] overflow-hidden px-[10px] py-[10px]">
             <WebHook
              setShowResults={setShowResults}
               onClose={() => {
                 setIsWebHookModalOpen(false);
                 setSelectedStrategy(null);
                 setIsSavedStrategiesPopupOpen(true);
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
                 fetchSavedStrategies();
                 message.success('RS Strategy deployed successfully!');
               }}
             />
           </div>
         </div>
       )}

       {/* Strategy Details Popup */}
       {isStrategyDetailsOpen && selectedStrategyDetails && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10002] p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               {/* Header */}
               <div className="mb-6 space-y-2">
  {/* Row 1: Webhook URL (left) + Close (right) */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-sm font-medium text-gray-600 shrink-0">Web Hook URL:</span>
      <span
        className="text-sm text-gray-900 truncate"
        // title={selectedStrategyDetails.deploymentDetails.webhook_url}
      >
        {selectedStrategyDetails?.webhook_url}
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
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  {/* Row 2: Heading */}
  <h2 className="text-2xl font-bold text-gray-900">Client Information</h2>
</div>

              {/* Client Information Table */}
              {selectedStrategyDetails?.client_information_json && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Client Information</h3>
                    <button
                      type="button"
                      onClick={openBulkDeleteConfirm}
                      disabled={!hasSelectedClients || bulkDeleteLoading}
                      className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                        hasSelectedClients && !bulkDeleteLoading
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {bulkDeleteLoading
                        ? 'Deleting...'
                        : `Delete Selected${hasSelectedClients ? ` (${selectedIds.length})` : ''}`}
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
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">
                            DELETE
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          const getClientInfo = () => {
                            if (!selectedStrategyDetails.client_information_json) {
                              return {};
                            }

                            try {
                              // If it's already an object (parsed), use it directly
                              // If it's a string, parse it
                              const rawData = typeof selectedStrategyDetails.client_information_json === 'string'
                                ? JSON.parse(selectedStrategyDetails.client_information_json)
                                : selectedStrategyDetails.client_information_json;

                              // Handle both possible JSON structures
                              let clientInfo = {};
                              if (rawData.clients) {
                                // Nested structure: {clients: {clientId: capital}}
                                clientInfo = rawData.clients;
                              } else {
                                // Direct structure: {clientId: capital}
                                clientInfo = rawData;
                              }
                              return clientInfo;
                            } catch (error) {
                              console.error('Error parsing client information JSON:', error);
                              return {};
                            }
                          };

                          const clientInfo = getClientInfo();
                          const clientEntries = Object.entries(clientInfo);

                          if (clientEntries.length > 0) {
                            return clientEntries.map(([clientId, capital], index) => (
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
                                    onChange={(e) => handleClientSelectionChange(clientId, e.target.checked)}
                                  />
                                </td>
                              </tr>
                            ));
                          } else {
                            return (
                              <tr>
                                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                  No clients selected for this strategy.
                                </td>
                              </tr>
                            );
                          }
                        })()}
                      </tbody>
                    </table>
                   </div>
                 </div>
              )}

              {/* Show message if no client information */}
              {!selectedStrategyDetails?.client_information_json && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">No client information available for this strategy.</p>
                </div>
              )}
             </div>
           </div>
         </div>
       )}

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
                    setCurrentBacktestConfig(null);
                    setSaveFromUniverseSelection(false);
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
                    setCurrentBacktestConfig(null);
                    setSaveFromUniverseSelection(false);
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

                    await saveRsStrategyParameters(customStrategyName.trim());
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

      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBulkDeleteConfirm}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Clients</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedIds.length > 1 ? (
                    <>
                      Are you sure you want to remove{' '}
                      <span className="font-semibold">{selectedIds.length} clients</span>?
                    </>
                  ) : selectedIds.length === 1 ? (
                    <>
                      Are you sure you want to remove client{' '}
                      <span className="font-semibold">{selectedIds[0]}</span>?
                    </>
                  ) : (
                    'No clients selected.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBulkDeleteConfirm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                disabled={bulkDeleteLoading || selectedIds.length === 0}
              >
                {bulkDeleteLoading ? 'Deleting...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Best Combinations Modal */}
      <BestStockCombinationModal
        isOpen={isBestCombinationsModalOpen}
        onClose={() => setIsBestCombinationsModalOpen(false)}
        onSelectCombination={(stockOptions) => {
          // For RS Strategy, show the selected stocks to the user
          const stockNames = stockOptions.map(s => s.label || s.value).join(', ');
          message.success(`Best combination selected: ${stockNames}. Use these stocks when creating your RS strategy.`, 5);
          setIsBestCombinationsModalOpen(false);
        }}
      />

      {/* Information Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-emerald-500">
              <h2 className="text-xl font-bold text-white">RS Strategy</h2>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <iframe
                src="/templates/rs_strategy.html"
                className="w-full h-full min-h-[600px] border-0"
                title="RS Strategy Information"
              />
            </div>
          </div>
        </div>
      )}

      {/* Post-Save Deployment Popup (after saving from backtest results or universe selection) */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" style={{ zIndex: 99999 }}>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[350px] max-h-[90vh] overflow-hidden px-[10px] py-[10px]">
            <WebHook
              onClose={() => {
                setIsWebHookModalOpen(false);
                setSelectedStrategy(null);
              }}
              strategyType={webHookStrategyType || "RS Strategy"}
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
                fetchSavedStrategies();
                message.success('RS Strategy deployed successfully!');
              }}
            />
          </div>
        </div>
      )}
        </div>
    </ConfigProvider>
  );
}

function RSStrategy({ onBack, strategyType = "RS Strategy", onSubPageChange }) {
  return (
    <AppProvider>
      <RSStrategyContent onBack={onBack} strategyType={strategyType} onSubPageChange={onSubPageChange} />
    </AppProvider>
  );
}

export default RSStrategy;
 

