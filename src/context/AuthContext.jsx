import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    // Check for existing user data in localStorage on app load
    const savedUser = localStorage.getItem('wealthai1_user');
    const savedSubscription = localStorage.getItem('wealthai1_subscription');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Check if token is still valid
        if (userData.token) {
          const decoded = jwtDecode(userData.token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp > currentTime) {
            setUser(userData);
            
            // Load subscription data if available
            if (savedSubscription) {
              try {
                const subscriptionData = JSON.parse(savedSubscription);
                setSubscriptionData(subscriptionData);
              } catch (error) {
                console.error('Error parsing saved subscription data:', error);
                localStorage.removeItem('wealthai1_subscription');
              }
            }
          } else {
            // Token expired, clear storage
            localStorage.removeItem('wealthai1_user');
            localStorage.removeItem('wealthai1_subscription');
          }
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('wealthai1_user');
        localStorage.removeItem('wealthai1_subscription');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, subscriptionInfo = null) => {
    setUser(userData);
    localStorage.setItem('wealthai1_user', JSON.stringify(userData));
    
    if (subscriptionInfo) {
      setSubscriptionData(subscriptionInfo);
      localStorage.setItem('wealthai1_subscription', JSON.stringify(subscriptionInfo));
    }
  };

  const logout = () => {
    setUser(null);
    setSubscriptionData(null);
    localStorage.removeItem('wealthai1_user');
    localStorage.removeItem('wealthai1_subscription');
  };

  const updateUserProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('wealthai1_user', JSON.stringify(updatedUser));
  };

  const updateSubscriptionData = (subscriptionInfo) => {
    setSubscriptionData(subscriptionInfo);
    localStorage.setItem('wealthai1_subscription', JSON.stringify(subscriptionInfo));
  };

  const value = {
    user,
    login,
    logout,
    updateUserProfile,
    updateSubscriptionData,
    subscriptionData,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
