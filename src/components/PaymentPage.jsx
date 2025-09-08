import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import PaymentHistory from './PaymentHistory';
import PaymentAnalytics from './PaymentAnalytics';
import Subscription from './subscription';

const PaymentPage = ({ setCurrentPage, currentPage }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('payment');






  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />
      
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payment & Billing</h1>
            <p className="text-gray-600 mt-2">Manage your subscription and payment methods</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subscription Plans
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>

            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'payment' && (
            <Subscription key="subscription-component" />
          )}

          {activeTab === 'history' && (
            <PaymentHistory />
          )}

          {activeTab === 'analytics' && (
            <PaymentAnalytics />
          )}






        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
