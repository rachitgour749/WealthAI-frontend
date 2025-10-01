import React, { useState, useEffect, useRef } from 'react';
import { FaCreditCard, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

/**
 * Simple Zoho Payment Widget Component
 * Direct integration without overcomplicating
 */
const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const widgetRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Simple approach - script is already loaded in HTML head
    // Just wait a bit for it to initialize
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Simple retry function
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Debug Info */}
      <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm">
        <strong>Debug:</strong> Loading: {loading.toString()}, Error: {error || 'none'}
      </div>
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <FaCreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect subscription plan for your needs. All plans include secure payment processing and instant activation.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg mb-6">
          <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading payment options...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200 mb-6">
          <FaExclamationTriangle className="w-8 h-8 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Widget Error</h3>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Zoho Widget Container */}
      <div className="mb-6">
        <div 
          id="zf-widget-root-id-3ci321w2g"
          data-pricing-table="true"
          data-digest="2-f6d7d76394615324512bf09531b89abe02c90b7e6e2f25881839d40ce063bf28c7964d874c3812d3b737c2b253195bdf0d92a6b786b94127b193a337fe627a18"
          data-product_url="https://billing.zoho.in"
          ref={widgetRef}
          className="w-full min-h-[400px] bg-white rounded-lg shadow-lg border-2 border-gray-200"
          style={{ minHeight: '400px' }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Loading payment widget...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <FaShieldAlt className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
          <p className="text-gray-600 text-sm">
            All transactions are encrypted and processed securely through Zoho's trusted payment system.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Instant Activation</h3>
          <p className="text-gray-600 text-sm">
            Your subscription will be activated immediately after successful payment confirmation.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <FaCreditCard className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Flexible Billing</h3>
          <p className="text-gray-600 text-sm">
            Choose from multiple payment methods and billing cycles that work best for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
