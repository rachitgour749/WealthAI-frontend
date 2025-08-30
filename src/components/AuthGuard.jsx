import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const AuthGuard = ({ children, fallback = null, showLoginModal = true, setCurrentPage = null }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    
    if (showLoginModal) {
      return <Login setCurrentPage={setCurrentPage} />;
    }
    
    return null;
  }

  return children;
};

export default AuthGuard;
