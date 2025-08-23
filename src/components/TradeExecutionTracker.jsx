import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.wealthai1.in';

const TradeExecutionTracker = () => {
  const [tradeStatus, setTradeStatus] = useState(null);
  const [skippedTrades, setSkippedTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTradeExecutionData();
  }, []);

  const loadTradeExecutionData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load trade execution status
      const statusResponse = await axios.get(`${API_BASE_URL}/api/trade-execution-status`);
      console.log('Trade status response:', statusResponse.data);
      
      // Ensure we have valid data
      const statusData = statusResponse.data?.trade_execution_status || {};
      setTradeStatus(statusData);

      // Load skipped trades
      const skippedResponse = await axios.get(`${API_BASE_URL}/api/skipped-trades`);
      console.log('Skipped trades response:', skippedResponse.data);
      
      // Ensure we have a valid array
      const skippedData = skippedResponse.data?.skipped_trades || [];
      if (Array.isArray(skippedData)) {
        // Filter out any invalid items
        const validSkippedTrades = skippedData.filter(item => 
          item && typeof item === 'object' && 
          (item.week !== undefined || item.date !== undefined || item.reason !== undefined)
        );
        setSkippedTrades(validSkippedTrades);
      } else {
        console.warn('Skipped trades is not an array:', skippedData);
        setSkippedTrades([]);
      }
    } catch (err) {
      console.error('Error loading trade execution data:', err);
      setError('Failed to load trade execution data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    try {
      if (typeof value === 'string' && value.includes('₹')) {
        return value;
      }
      return `₹${parseFloat(value || 0).toLocaleString('en-IN')}`;
    } catch (error) {
      return '₹0';
    }
  };

  const getActionColor = (action) => {
    if (!action || typeof action !== 'string') return 'bg-gray-100 text-gray-800';
    
    switch (action.toUpperCase()) {
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

  const getReasonColor = (reason) => {
    if (!reason || typeof reason !== 'string') return 'text-gray-600';
    
    if (reason.includes('No trade signal')) return 'text-blue-600';
    if (reason.includes('No valid execution')) return 'text-orange-600';
    if (reason.includes('No valid signal')) return 'text-red-600';
    return 'text-gray-600';
  };

  const safeString = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') return 'Object';
    return String(value);
  };

  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading trade execution data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Debug Information</h3>
        <p className="text-blue-700">Trade Status: {tradeStatus ? 'Loaded' : 'Not loaded'}</p>
        <p className="text-blue-700">Skipped Trades Count: {skippedTrades.length}</p>
        <p className="text-sm text-blue-600">Skipped Trades Type: {Array.isArray(skippedTrades) ? 'Array' : typeof skippedTrades}</p>
        {skippedTrades.length > 0 && (
          <pre className="text-xs text-blue-600 overflow-auto mt-2">
            {JSON.stringify(skippedTrades.slice(0, 2), null, 2)}
          </pre>
        )}
      </div> */}

      {/* Trade Execution Status */}
      {tradeStatus && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Trade Execution Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{safeNumber(tradeStatus.total_weeks_processed)}</div>
              <div className="text-sm text-gray-500">Weeks Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{safeNumber(tradeStatus.successful_signals)}</div>
              <div className="text-sm text-gray-500">Successful Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{safeNumber(tradeStatus.successful_executions)}</div>
              <div className="text-sm text-gray-500">Successful Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{safeNumber(tradeStatus.skipped_trades_count)}</div>
              <div className="text-sm text-gray-500">Skipped Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{formatCurrency(tradeStatus.current_cash)}</div>
              <div className="text-sm text-gray-500">Current Cash</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {tradeStatus.current_holdings && typeof tradeStatus.current_holdings === 'object' 
                  ? Object.keys(tradeStatus.current_holdings).length 
                  : 0}
              </div>
              <div className="text-sm text-gray-500">Current Holdings</div>
            </div>
          </div>

          {/* Last Trade Information */}
          {tradeStatus.last_trade_date && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Last Trade</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">{safeString(tradeStatus.last_trade_date)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Action:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(tradeStatus.last_trade_action)}`}>
                    {safeString(tradeStatus.last_trade_action)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Ticker:</span>
                  <span className="ml-2 font-medium">{safeString(tradeStatus.last_trade_ticker)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skipped Trades */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">⏭️ Skipped Trades Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">
            Trades that were skipped during execution and their reasons
          </p>
        </div>
        
        {!Array.isArray(skippedTrades) || skippedTrades.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No skipped trades found. All trades executed successfully.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signal Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skippedTrades.map((skip, index) => {
                  // Ensure skip is an object with the expected properties
                  if (!skip || typeof skip !== 'object') {
                    console.warn('Invalid skip data:', skip);
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                        <td className="px-6 py-4 text-sm text-red-600">Invalid data</td>
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {safeString(skip.week)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {safeString(skip.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {safeString(skip.signal_date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={getReasonColor(skip.reason)}>
                          {safeString(skip.reason)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Execution Summary */}
      {Array.isArray(skippedTrades) && skippedTrades.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Trade Execution Summary</h3>
          
          {/* Reason Analysis */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Skip Reasons Analysis</h4>
            <div className="space-y-2">
              {(() => {
                const reasonCounts = {};
                skippedTrades.forEach(skip => {
                  // Ensure skip is a valid object
                  if (skip && typeof skip === 'object' && skip.reason) {
                    const reason = safeString(skip.reason);
                    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
                  }
                });
                
                return Object.entries(reasonCounts).map(([reason, count]) => (
                  <div key={reason} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className={`text-sm ${getReasonColor(reason)}`}>{reason}</span>
                    <span className="text-sm font-medium text-gray-900">{count} times</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Recommendations
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-blue-800 mb-2">💡 Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {skippedTrades.some(skip => skip && skip.reason && safeString(skip.reason).includes('No trade signal')) && (
                <li>• Consider adjusting momentum thresholds if too many signals are being skipped</li>
              )}
              {skippedTrades.some(skip => skip && skip.reason && safeString(skip.reason).includes('No valid execution')) && (
                <li>• Check data availability and market holidays for execution dates</li>
              )}
              {skippedTrades.some(skip => skip && skip.reason && safeString(skip.reason).includes('No valid signal')) && (
                <li>• Verify ETF data quality and ensure sufficient historical data</li>
              )}
              {skippedTrades.length > safeNumber(tradeStatus?.total_weeks_processed) * 0.3 && (
                <li>• High skip rate detected - consider reviewing strategy parameters</li>
              )}
            </ul>
            
          </div> */}
        </div>
      )}
    </div>
  );
};

export default TradeExecutionTracker;
