import { API_BASE_URL } from '../config/api';

class SubscriptionService {
  // Get subscription status for a user
  async getSubscriptionStatus(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/status-simple/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }

  // Create a new subscription for first-time user
  async createSubscription(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/create-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Get all products status for a user
  async getAllProductsStatus(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/product/status-simple/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products status:', error);
      throw error;
    }
  }

  // Enable trial for a specific product
  async enableProductTrial(email, productCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/product/enable-trial-simple/${email}/${productCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Some backends return 200 with empty body
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return {};
      }
    } catch (error) {
      console.error('Error enabling product trial:', error);
      throw error;
    }
  }

  // Activate product trial for all products (plan_code 8)
  async activateProductTrial(userEmail, userName) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/activate-product-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName,
          plan_code: 8
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return {};
      }
    } catch (error) {
      console.error('Error activating product trial:', error);
      throw error;
    }
  }

  // Check if user has access to a specific product
  async checkProductAccess(email, productCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/product/access-simple/${email}/${productCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Normalize keys for consumers
      return {
        raw: data,
        hasAccess: !!data.has_access,
        accessType: data.access_type || 'none',
        daysRemaining: data.days_remaining ?? 0,
        status: data.status || 'none',
        plan: data.plan || null,
        productCode: data.product_code
      };
    } catch (error) {
      console.error('Error checking product access:', error);
      throw error;
    }
  }

  // Check if user is in trial period
  isTrialActive(subscription) {
    if (!subscription) {
      return false;
    }
    
    // Check is_trial_active flag first
    if (subscription.is_trial_active === true) {
      return true;
    }
    
    // Check status field
    if (subscription.status === 'trial' && subscription.trial_end_date) {
      const trialEndDate = new Date(subscription.trial_end_date);
      const currentDate = new Date();
      return currentDate < trialEndDate;
    }
    
    // Fallback to checking trial_end_date
    if (subscription.trial_end_date) {
      const trialEndDate = new Date(subscription.trial_end_date);
      const currentDate = new Date();
      return currentDate < trialEndDate;
    }
    
    return false;
  }

  // Check if trial has ended
  isTrialExpired(subscription) {
    if (!subscription) {
      return true; // No subscription means expired
    }
    
    // If is_trial_active is explicitly false, trial is expired
    if (subscription.is_trial_active === false) {
      return true;
    }
    
    // Check if status indicates trial has ended
    if (subscription.status && subscription.status !== 'trial' && subscription.status !== 'active') {
      return true;
    }
    
    // Check trial_end_date
    if (subscription.trial_end_date) {
      const trialEndDate = new Date(subscription.trial_end_date);
      const currentDate = new Date();
      return currentDate >= trialEndDate;
    }
    
    // If no trial_end_date and no active trial flag, assume expired
    return !subscription.is_trial_active;
  }

  // Get days remaining in trial
  getTrialDaysRemaining(subscription) {
    if (!subscription) {
      return 0;
    }
    
    // Use days_remaining from response if available
    if (subscription.days_remaining !== undefined && subscription.days_remaining !== null) {
      return Math.max(0, subscription.days_remaining);
    }
    
    // Calculate from trial_end_date
    if (subscription.trial_end_date) {
      const trialEndDate = new Date(subscription.trial_end_date);
      const currentDate = new Date();
      const diffTime = trialEndDate - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    
    // Fallback to subscription_end_date if trial_end_date not available
    if (subscription.subscription_end_date) {
      const endDate = new Date(subscription.subscription_end_date);
      const currentDate = new Date();
      const diffTime = endDate - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }
    
    return 0;
  }
}

export default new SubscriptionService();
