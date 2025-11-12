import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { hasProductAccess } from '../utils/planMapping';

const useProductAccess = () => {
  const { user } = useAuth();
  const { 
    subscription, 
    isTrialActive, 
    isTrialExpired, 
    isProductActive, 
    isProductInTrial,
    enableProductTrial,
    refreshSubscriptionData 
  } = useSubscription();

  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const checkProductAccess = async (productCode, productName) => {
    if (!user?.email) {
      return { hasAccess: false, requiresLogin: true };
    }

    setIsCheckingAccess(true);

    try {
      // Use local subscription data only - no server-side API call
      // Check if user has active subscription
      if (!subscription) {
        return { 
          hasAccess: false, 
          requiresSubscription: true,
          message: 'No subscription found' 
        };
      }

      // Check if trial is expired
      if (isTrialExpired()) {
        return { 
          hasAccess: false, 
          requiresPayment: true,
          message: 'Trial period has ended. Please subscribe to continue.' 
        };
      }

      // Check if product is already active
      if (isProductActive(productCode)) {
        return { 
          hasAccess: true, 
          isTrial: isProductInTrial(productCode),
          message: 'Product is already active' 
        };
      }

      // Check if product is in trial
      if (isProductInTrial(productCode)) {
        return { 
          hasAccess: true, 
          isTrial: true,
          message: 'Product is in trial period' 
        };
      }

      // If trial is active, check if product is included in the active trial bundle
      if (isTrialActive() && subscription?.plan_code) {
        // Check if the product is included in the active trial bundle
        if (hasProductAccess(subscription.plan_code, productCode)) {
          // Product is included in active trial bundle, grant access
          return { 
            hasAccess: true, 
            isTrial: true,
            message: 'Product is included in your active trial bundle' 
          };
        }
        
        // Trial is active but product is not in the bundle - this shouldn't happen for plan_code 8
        // But if it does, require payment instead of showing trial modal
        return { 
          hasAccess: false, 
          requiresPayment: true,
          message: 'This product is not included in your trial bundle. Please subscribe to access.' 
        };
      }

      // If trial is active but no plan_code (legacy check), offer to enable trial
      if (isTrialActive()) {
        return { 
          hasAccess: false, 
          canEnableTrial: true,
          productCode,
          productName,
          message: `Would you like to enable your free trial for ${productName}?` 
        };
      }

      // No trial available, require payment
      return { 
        hasAccess: false, 
        requiresPayment: true,
        message: 'Please subscribe to access this product' 
      };

    } catch (error) {
      console.error('Error checking product access:', error);
      return { 
        hasAccess: false, 
        error: 'Failed to check product access' 
      };
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const handleProductClick = async (productCode, productName, onShowPayment, onShowTrialModal) => {
    const accessResult = await checkProductAccess(productCode, productName);

    if (accessResult.hasAccess) {
      // User has access, proceed to product
      return { success: true, accessResult };
    }

    if (accessResult.requiresLogin) {
      // Redirect to login
      return { success: false, action: 'login' };
    }

    if (accessResult.requiresSubscription) {
      // Show subscription creation message
      return { success: false, action: 'subscription', message: accessResult.message };
    }

    if (accessResult.requiresPayment) {
      // Show payment popup
      onShowPayment();
      return { success: false, action: 'payment', message: accessResult.message };
    }

    if (accessResult.canEnableTrial) {
      // Show trial enablement modal
      onShowTrialModal(productCode, productName);
      return { success: false, action: 'trial', message: accessResult.message };
    }

    return { success: false, action: 'error', message: accessResult.message || 'Unknown error' };
  };

  const enableTrialForProduct = async (productCode) => {
    try {
      await enableProductTrial(productCode);
      await refreshSubscriptionData();
      return { success: true };
    } catch (error) {
      console.error('Error enabling trial:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    checkProductAccess,
    handleProductClick,
    enableTrialForProduct,
    isCheckingAccess,
    isTrialActive: isTrialActive(),
    isTrialExpired: isTrialExpired(),
    subscription
  };
};

export default useProductAccess;
