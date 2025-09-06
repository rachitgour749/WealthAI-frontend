import React from 'react';
import { usePayment } from '../context/PaymentContext';

const PaymentAnalytics = () => {
  const { paymentAnalytics, loading, error, loadPaymentAnalytics } = usePayment();

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const calculateSuccessRate = () => {
    if (!paymentAnalytics.total_transactions || paymentAnalytics.total_transactions === 0) {
      return 0;
    }
    return ((paymentAnalytics.successful_transactions / paymentAnalytics.total_transactions) * 100).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadPaymentAnalytics}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Transactions',
      value: paymentAnalytics.total_transactions || 0,
      change: '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Total Amount',
      value: formatAmount(paymentAnalytics.total_amount || 0),
      change: '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      name: 'Success Rate',
      value: `${calculateSuccessRate()}%`,
      change: '+0%',
      changeType: 'success',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Avg Transaction',
      value: formatAmount(paymentAnalytics.average_transaction_amount || 0),
      change: '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  const transactionBreakdown = [
    {
      name: 'Successful',
      value: paymentAnalytics.successful_transactions || 0,
      color: 'bg-green-500',
      percentage: paymentAnalytics.total_transactions ? 
        ((paymentAnalytics.successful_transactions / paymentAnalytics.total_transactions) * 100).toFixed(1) : 0
    },
    {
      name: 'Failed',
      value: paymentAnalytics.failed_transactions || 0,
      color: 'bg-red-500',
      percentage: paymentAnalytics.total_transactions ? 
        ((paymentAnalytics.failed_transactions / paymentAnalytics.total_transactions) * 100).toFixed(1) : 0
    },
    {
      name: 'Pending',
      value: paymentAnalytics.pending_transactions || 0,
      color: 'bg-yellow-500',
      percentage: paymentAnalytics.total_transactions ? 
        ((paymentAnalytics.pending_transactions / paymentAnalytics.total_transactions) * 100).toFixed(1) : 0
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Payment Analytics</h2>
          <button
            onClick={loadPaymentAnalytics}
            className="text-blue-900 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Placeholder */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Status Breakdown</h3>
            <div className="space-y-4">
              {transactionBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Period:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {paymentAnalytics.period || 'Monthly'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-sm font-medium text-gray-900">
                  {paymentAnalytics.currency || 'INR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Volume:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(paymentAnalytics.total_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate:</span>
                <span className="text-sm font-medium text-green-600">
                  {calculateSuccessRate()}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* No Data State */}
        {(!paymentAnalytics.total_transactions || paymentAnalytics.total_transactions === 0) && (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">No payment data available</p>
            <p className="text-sm">Analytics will appear here once you have payment transactions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentAnalytics;
