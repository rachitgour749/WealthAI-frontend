import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.wealthai1.in';

const CostsDashboard = () => {
  const [costsSummary, setCostsSummary] = useState(null);
  const [costsAnalysis, setCostsAnalysis] = useState([]);
  const [costsBreakdown, setCostsBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('CostsDashboard: Component mounted');
    loadCostsData();
  }, []);

  const loadCostsData = async () => {
    try {
      console.log('CostsDashboard: Loading costs data...');
      setLoading(true);
      setError('');

      // Load costs summary
      const summaryResponse = await axios.get(`${API_BASE_URL}/api/costs/summary`);
      console.log('CostsDashboard: Summary response:', summaryResponse.data);
      setCostsSummary(summaryResponse.data);

      // Load costs analysis for chart
      const analysisResponse = await axios.get(`${API_BASE_URL}/api/costs/analysis`);
      console.log('CostsDashboard: Analysis response:', analysisResponse.data);
      setCostsAnalysis(analysisResponse.data.costs_data || []);

      // Load costs breakdown
      const breakdownResponse = await axios.get(`${API_BASE_URL}/api/costs/breakdown`);
      console.log('CostsDashboard: Breakdown response:', breakdownResponse.data);
      setCostsBreakdown(breakdownResponse.data.breakdown || {});

    } catch (err) {
      console.error('CostsDashboard: Error loading costs data:', err);
      setError(`Failed to load costs data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === 'string' && value.includes('₹')) {
      return value;
    }
    return `₹${parseFloat(value || 0).toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value) => {
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    return `${parseFloat(value || 0).toFixed(3)}%`;
  };

  const formatNumber = (value) => {
    return parseFloat(value || 0).toLocaleString('en-IN');
  };

  console.log('CostsDashboard: Rendering with loading=', loading, 'error=', error, 'summary=', costsSummary);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading costs data...</span>
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
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Costs Dashboard</h3>
        <p className="text-blue-700">Component is working! Data loaded successfully.</p>
        <p className="text-sm text-blue-600">Summary: {costsSummary ? 'Loaded' : 'Not loaded'} | Analysis: {costsAnalysis.length} points | Breakdown: {Object.keys(costsBreakdown).length} years</p>
      </div> */}

      {/* Costs Summary Cards */}
      {costsSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Total All Costs</h4>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(costsSummary.total_all_costs)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Capital Gains Tax</h4>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(costsSummary.capital_gains_tax)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Cost as % of Volume</h4>
            <p className="text-2xl font-bold text-orange-600">{formatPercentage(costsSummary.cost_as_percent_of_volume)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Total Transactions</h4>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(costsSummary.total_transactions)}</p>
          </div>
        </div>
      )}

      {/* Transaction Costs Analysis Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Costs Analysis Over Time</h3>
        
        {costsAnalysis.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No costs data available. Run a backtest first.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={costsAnalysis}>
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
                formatter={(value, name) => [
                  formatCurrency(value), 
                  name === 'cumulative_transaction_costs' ? 'Cumulative Transaction Costs' :
                  name === 'cumulative_capital_gains_tax' ? 'Cumulative Capital Gains Tax' :
                  'Total Cumulative Costs'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulative_transaction_costs" 
                stroke="#ff7f0e" 
                strokeWidth={2}
                dot={false}
                name="Cumulative Transaction Costs"
              />
              <Line 
                type="monotone" 
                dataKey="cumulative_capital_gains_tax" 
                stroke="#d62728" 
                strokeWidth={2}
                dot={false}
                name="Cumulative Capital Gains Tax"
              />
              <Line 
                type="monotone" 
                dataKey="total_cumulative_costs" 
                stroke="#1f77b4" 
                strokeWidth={3}
                dot={false}
                name="Total Cumulative Costs"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Costs Breakdown Table */}
      {Object.keys(costsBreakdown).length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Costs Breakdown by Year</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Costs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capital Gains Tax
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Costs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(costsBreakdown)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([year, data]) => (
                    <tr key={year}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(data.transaction_costs)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(data.capital_gains_tax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(data.total_costs)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(data.transactions)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Cost Insights */}
      {costsSummary && costsSummary.total_volume > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(costsSummary.total_volume)}
              </div>
              <div className="text-sm text-gray-500">Total Trading Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(costsSummary.transaction_costs)}
              </div>
              <div className="text-sm text-gray-500">Total Transaction Costs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(costsSummary.total_all_costs / costsSummary.total_transactions)}
              </div>
              <div className="text-sm text-gray-500">Average Cost per Transaction</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Information</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify({ costsSummary, costsAnalysisLength: costsAnalysis.length, costsBreakdownKeys: Object.keys(costsBreakdown) }, null, 2)}
        </pre>
      </div> */}
    </div>
  );
};

export default CostsDashboard;
