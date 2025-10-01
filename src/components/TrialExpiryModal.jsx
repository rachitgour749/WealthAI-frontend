import React from 'react';

const TrialExpiryModal = ({ 
  isOpen, 
  onClose, 
  subscriptionInfo, 
  onUpgrade, 
  onContinueTrial 
}) => {
  if (!isOpen) return null;

  const daysRemaining = subscriptionInfo?.daysRemaining || 0;
  const isExpired = daysRemaining <= 0;
  const isNearExpiry = daysRemaining <= 3 && daysRemaining > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative transform transition-all duration-300 ease-out">
        <div className="text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isExpired ? 'bg-red-100' : 'bg-orange-100'
          }`}>
            {isExpired ? (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Title and Message */}
          <h2 className={`text-2xl font-bold mb-2 ${
            isExpired ? 'text-red-900' : 'text-orange-900'
          }`}>
            {isExpired ? 'Trial Expired' : 'Trial Ending Soon'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isExpired ? (
              "Your free trial has ended. Upgrade to continue accessing premium features."
            ) : isNearExpiry ? (
              `Your trial expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Don't miss out on premium features!`
            ) : (
              "Your trial is ending soon. Upgrade now to continue enjoying all premium features."
            )}
          </p>

          {/* Features Highlight */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Premium Features Include:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced AI Trading Strategies
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time Market Analysis
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Portfolio Backtesting Tools
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority Customer Support
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {isExpired ? 'Subscribe Now' : 'Upgrade to Premium'}
            </button>
            
            {!isExpired && onContinueTrial && (
              <button
                onClick={onContinueTrial}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Continue Trial
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
              >
                {isExpired ? 'Maybe Later' : 'Remind Me Later'}
              </button>
            )}
          </div>

          {/* Subscription Info */}
          {subscriptionInfo && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <p>Status: <span className="font-medium capitalize">{subscriptionInfo.status}</span></p>
                <p>Plan: <span className="font-medium capitalize">{subscriptionInfo.plan}</span></p>
                {subscriptionInfo.message && (
                  <p className="text-gray-600">{subscriptionInfo.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TrialExpiryModal;
