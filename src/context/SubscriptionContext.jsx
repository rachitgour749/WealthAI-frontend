import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import subscriptionService from '../services/subscriptionService';
import { hasProductAccess, getProductsForPlan, getPlanInfo, isTrialPlan } from '../utils/planMapping';

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
  const [subscription, setSubscription] = useState(null);
  const [productsStatus, setProductsStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load subscription data when user changes
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadSubscriptionData();
    } else {
      // Reset data when user logs out
      setSubscription(null);
      setProductsStatus({});
    }
  }, [isAuthenticated, user?.email]);

  const loadSubscriptionData = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load subscription status
      const subscriptionData = await subscriptionService.getSubscriptionStatus(user.email);
      setSubscription(subscriptionData);

      // Load products status
      const productsData = await subscriptionService.getAllProductsStatus(user.email);
      // Store only the products map for easy lookup by code
      setProductsStatus(productsData?.products || {});

    } catch (error) {
      console.error('Error loading subscription data:', error);
      setError('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };


  console.log('subscription', subscription);
  console.log('productsStatus', productsStatus);

  const createSubscription = async (userData) => {
    if (!user?.email) return;

    try {
      const subscriptionData = await subscriptionService.createSubscription({
        email: user.email,
        ...userData
      });
      setSubscription(subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  const enableProductTrial = async (productCode) => {
    if (!user?.email) return;

    try {
      await subscriptionService.enableProductTrial(user.email, productCode);
      // Treat HTTP 200 as success regardless of response body
      await loadSubscriptionData();
      return { success: true };
    } catch (error) {
      console.error('Error enabling product trial:', error);
      throw error;
    }
  };

  const activateProductTrial = async () => {
    if (!user?.email || !user?.name) {
      throw new Error('User email and name are required');
    }

    try {
      await subscriptionService.activateProductTrial(user.email, user.name);
      // Refresh subscription data after activation
      await loadSubscriptionData();
      return { success: true };
    } catch (error) {
      console.error('Error activating product trial:', error);
      throw error;
    }
  };

  const checkProductAccess = async (productCode) => {
    if (!user?.email) return false;

    try {
      const result = await subscriptionService.checkProductAccess(user.email, productCode);
      return result; // normalized result with hasAccess, accessType, etc.
    } catch (error) {
      console.error('Error checking product access:', error);
      return { hasAccess: false, accessType: 'none', daysRemaining: 0 };
    }
  };

  const isTrialActive = () => {
    // Check subscription status first
    if (subscription?.is_trial_active) {
      return true;
    }
    
    // Check if plan_code indicates trial and trial_end_date is valid
    if (subscription?.plan_code) {
      const planInfo = getPlanInfo(subscription.plan_code);
      if (planInfo?.isTrial && subscription.trial_end_date) {
        return subscriptionService.isTrialActive(subscription);
      }
    }
    
    return subscriptionService.isTrialActive(subscription);
  };

  const isTrialExpired = () => {
    // Check subscription status first
    if (subscription?.status && subscription.status !== 'trial' && subscription.status !== 'active') {
      // If status is not trial/active and no is_trial_active flag, likely expired
      if (!subscription.is_trial_active) {
        return true;
      }
    }
    
    // Check if plan_code indicates trial and check trial_end_date
    if (subscription?.plan_code) {
      const planInfo = getPlanInfo(subscription.plan_code);
      if (planInfo?.isTrial) {
        return subscriptionService.isTrialExpired(subscription);
      }
    }
    
    return subscriptionService.isTrialExpired(subscription);
  };

  const getTrialDaysRemaining = () => {
    return subscriptionService.getTrialDaysRemaining(subscription);
  };

  const isProductActive = (productCode) => {
    // First check plan_code based access if subscription exists
    if (subscription?.plan_code) {
      const planCode = subscription.plan_code;
      const hasPlanAccess = hasProductAccess(planCode, productCode);
      
      if (hasPlanAccess) {
        // For plan_code 8 (trial bundle), always grant access if plan includes product
        if (planCode === 8 || planCode === '8') {
          // Check if status is not explicitly expired/cancelled
          if (subscription.status !== 'expired' && subscription.status !== 'cancelled') {
            return true;
          }
        }
        
        // Check if it's a trial plan
        const planInfo = getPlanInfo(planCode);
        const isTrialPlan = planInfo?.isTrial === true;
        const isTrialStatus = subscription.status === 'trial' || subscription.is_trial_active === true;
        const isTrial = isTrialPlan || isTrialStatus;
        
        // For trial plans, be more lenient
        if (isTrialPlan || isTrialStatus) {
          // If status is active or trial, grant access
          if (subscription.status === 'active' || subscription.status === 'trial') {
            return true;
          }
          
          // If trial is explicitly active, grant access immediately
          if (subscription.is_trial_active === true) {
            return true;
          }
          
          // For trial plans, check trial_end_date first, then subscription_end_date
          const endDateToCheck = subscription.trial_end_date || subscription.subscription_end_date;
          
          if (endDateToCheck) {
            const endDate = new Date(endDateToCheck);
            const currentDate = new Date();
            // Add 1 day buffer to account for timezone issues
            const oneDayInMs = 24 * 60 * 60 * 1000;
            if (currentDate <= new Date(endDate.getTime() + oneDayInMs)) {
              return true;
            }
          } else {
            // If no end date but has plan_code access for trial, grant access
            return true;
          }
        } else {
          // For paid plans, check subscription_end_date
          if (subscription.subscription_end_date) {
            const endDate = new Date(subscription.subscription_end_date);
            const currentDate = new Date();
            if (currentDate <= endDate) {
              return true;
            }
          } else {
            // If no end date but has plan_code access, grant access
            return true;
          }
        }
      }
    }
    
    // Fallback to productsStatus check for backward compatibility
    return productsStatus[productCode]?.has_access || false;
  };

  const isProductInTrial = (productCode) => {
    // Check if plan_code indicates trial
    if (subscription?.plan_code) {
      const planInfo = getPlanInfo(subscription.plan_code);
      if (planInfo && planInfo.isTrial && hasProductAccess(subscription.plan_code, productCode)) {
        // Also check if trial is still active based on subscription status
        if (subscription.is_trial_active || subscription.status === 'trial') {
          return true;
        }
      }
    }
    
    // Fallback to productsStatus check for backward compatibility
    return productsStatus[productCode]?.access_type === 'trial';
  };

  const getProductAccessType = (productCode) => {
    // Check plan_code based access first
    if (subscription?.plan_code) {
      const planInfo = getPlanInfo(subscription.plan_code);
      if (planInfo && hasProductAccess(subscription.plan_code, productCode)) {
        // Check if it's a trial plan
        if (planInfo.isTrial || subscription.status === 'trial') {
          return 'trial';
        }
        // Check subscription status
        if (subscription.status === 'active') {
          return 'active';
        }
        if (subscription.status === 'trial' || subscription.is_trial_active) {
          return 'trial';
        }
        // Default to active if plan_code grants access
        return 'active';
      }
    }
    
    // Fallback to productsStatus check for backward compatibility
    return productsStatus[productCode]?.access_type || 'none';
  };

  const getProductDaysRemaining = (productCode) => {
    // Use days_remaining from subscription if available and product is accessible via plan_code
    if (subscription?.plan_code && hasProductAccess(subscription.plan_code, productCode)) {
      if (subscription.days_remaining !== undefined && subscription.days_remaining !== null) {
        return subscription.days_remaining;
      }
      
      // Calculate days remaining from subscription_end_date if available
      if (subscription.subscription_end_date) {
        const endDate = new Date(subscription.subscription_end_date);
        const currentDate = new Date();
        const diffTime = endDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      }
    }
    
    // Fallback to productsStatus check for backward compatibility
    return productsStatus[productCode]?.days_remaining || 0;
  };

  const refreshSubscriptionData = () => {
    if (user?.email) {
      loadSubscriptionData();
    }
  };

  // Helper to get accessible products based on plan_code
  const getAccessibleProducts = () => {
    if (subscription?.plan_code) {
      return getProductsForPlan(subscription.plan_code);
    }
    return [];
  };

  const value = {
    subscription,
    productsStatus,
    isLoading,
    error,
    createSubscription,
    enableProductTrial,
    activateProductTrial,
    checkProductAccess,
    isTrialActive,
    isTrialExpired,
    getTrialDaysRemaining,
    isProductActive,
    isProductInTrial,
    getProductAccessType,
    getProductDaysRemaining,
    refreshSubscriptionData,
    getAccessibleProducts, // New helper to get products from plan_code
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};