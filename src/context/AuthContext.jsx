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

  useEffect(() => {
    // Check for existing user data in localStorage on app load
    const savedUser = localStorage.getItem('wealthai1_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Check if token is still valid
        if (userData.token) {
          const decoded = jwtDecode(userData.token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp > currentTime) {
            setUser(userData);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('wealthai1_user');
          }
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('wealthai1_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('wealthai1_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wealthai1_user');
  };

  const updateUserProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('wealthai1_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateUserProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
