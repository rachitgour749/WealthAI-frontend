import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  // Helper function to make API calls with auth header
  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!user?.token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}`);
    }

    return data;
  };

  // Fetch subscription status from backend
  const fetchSubscriptionStatus = async () => {
    if (!isAuthenticated || !user?.token) {
      setSubscriptionStatus(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await makeAuthenticatedRequest('/api/auth/subscription-status');
      
      if (response.success) {
        setSubscriptionStatus(response.data.subscription_status);
      } else {
        throw new Error('Failed to fetch subscription status');
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err.message);
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has access to specific features
  const checkAccess = async (feature = 'premium') => {
    if (!isAuthenticated || !user?.token) {
      return false;
    }

    try {
      const response = await makeAuthenticatedRequest('/api/auth/check-access', {
        method: 'POST',
        body: JSON.stringify({ feature })
      });

      return response.success ? response.data.has_access : false;
    } catch (err) {
      console.error('Error checking access:', err);
      return false;
    }
  };

  // Handle Google login with backend subscription integration
  const handleGoogleLoginWithSubscription = async (googleToken) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: googleToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      if (data.success) {
        const { user_info, subscription_status, is_new_user, trial_created, message } = data.data;
        
        // Update subscription status
        setSubscriptionStatus(subscription_status);
        
        return {
          success: true,
          userInfo: user_info,
          subscriptionStatus: subscription_status,
          isNewUser: is_new_user,
          trialCreated: trial_created,
          message
        };
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      console.error('Error in Google login with subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get subscription info for display
  const getSubscriptionInfo = () => {
    if (!subscriptionStatus) {
      return {
        hasAccess: false,
        daysRemaining: 0,
        status: 'unknown',
        plan: 'none',
        isTrialActive: false,
        message: 'Please login to access premium features'
      };
    }

    const {
      status,
      plan,
      is_trial_active,
      days_remaining,
      can_access_premium
    } = subscriptionStatus;

    let message = '';
    if (status === 'trial' && is_trial_active) {
      message = `${days_remaining} days remaining in trial`;
    } else if (status === 'active') {
      message = 'Premium subscription active';
    } else if (status === 'expired' || status === 'cancelled') {
      message = 'Subscription expired - Please upgrade';
    }

    return {
      hasAccess: can_access_premium || is_trial_active,
      daysRemaining: days_remaining || 0,
      status,
      plan,
      isTrialActive: is_trial_active,
      canAccessPremium: can_access_premium,
      message
    };
  };

  // Check if user needs to upgrade
  const needsUpgrade = () => {
    if (!subscriptionStatus) return false;
    
    const { status, is_trial_active, can_access_premium } = subscriptionStatus;
    return status === 'expired' || status === 'cancelled' || 
           (!is_trial_active && !can_access_premium);
  };

  // Refresh subscription status
  const refreshSubscriptionStatus = () => {
    fetchSubscriptionStatus();
  };

  // Effect to fetch subscription status when user changes
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      fetchSubscriptionStatus();
    } else {
      setSubscriptionStatus(null);
    }
  }, [isAuthenticated, user?.token]);

  // Effect to periodically refresh subscription status (every 5 minutes)
  // useEffect(() => {
  //   if (!isAuthenticated || !user?.token) return;

  //   const interval = setInterval(() => {
  //     fetchSubscriptionStatus();
  //   }, 60 * 60 * 1000); // 5 minutes

  //   return () => clearInterval(interval);
  // }, [isAuthenticated, user?.token]);

  const value = {
    // State
    subscriptionStatus,
    loading,
    error,
    
    // Methods
    fetchSubscriptionStatus,
    checkAccess,
    handleGoogleLoginWithSubscription,
    refreshSubscriptionStatus,
    
    // Computed values
    subscriptionInfo: getSubscriptionInfo(),
    needsUpgrade: needsUpgrade(),
    
    // Shortcuts for common checks
    hasAccess: getSubscriptionInfo().hasAccess,
    daysRemaining: getSubscriptionInfo().daysRemaining,
    isTrialActive: getSubscriptionInfo().isTrialActive,
    canAccessPremium: getSubscriptionInfo().canAccessPremium
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
