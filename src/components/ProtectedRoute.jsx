import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import Login from './Login';

const ProtectedRoute = ({ children, redirectTo = null, setCurrentPage = null, requireSubscription = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const {
    isLoading: subscriptionLoading,
    subscription,
    productsStatus,
    isTrialExpired,
  } = useSubscription();

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600">
                This feature requires authentication. Please sign in to continue.
              </p>
            </div>
            <Login redirectTo={redirectTo} setCurrentPage={setCurrentPage} />
          </div>
        </div>
      </div>
    );
  }

  // Determine access using current subscription context API
  // Access is granted if: any product has access OR global trial is not expired
  const hasAnyProductAccess = Object.values(productsStatus || {}).some(p => p?.has_access);
  const trialExpired = isTrialExpired();
  const hasGlobalAccess = hasAnyProductAccess || (!trialExpired && !!subscription);

  // Check subscription access for premium features
  if (requireSubscription && !hasGlobalAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
              <p className="text-gray-600 mb-4">
                {trialExpired
                  ? 'Your trial has expired. Please upgrade to continue using premium features.'
                  : 'This feature requires an active subscription or trial. Please start your free trial or upgrade your plan.'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentPage && setCurrentPage('profile')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {trialExpired ? 'Upgrade Now' : 'Start Free Trial'}
                </button>
                
                <button
                  onClick={() => setCurrentPage && setCurrentPage('home')}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Go Back Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
