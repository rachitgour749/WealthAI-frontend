import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Logo1 from '../Assets/Logo1.png';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

const Login = ({ onClose, redirectTo = null, setCurrentPage = null }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);


  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
  // Call backend for Google login with subscription integration
  // Prefer REACT_APP_API_URL from environment, otherwise use production API host

      
      // Use axios for better CORS handling and consistency with rest of app
      console.log('Making request to:', `${API_BASE_URL}/api/auth/google-login`);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/google-login`,
        { 
          token: credentialResponse.credential 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true // Include credentials for CORS
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      const result = response.data;

      if (result.success) {
        const { user_info, subscription_status, is_new_user, trial_created, message } = result.data;
        
        // Create user object with Google data and backend response
        const userData = {
          id: decoded.sub,
          email: user_info.email,
          name: user_info.name,
          picture: decoded.picture,
          token: credentialResponse.credential,
          loginTime: new Date().toISOString(),
          provider: 'google'
        };

        // Store user data with subscription info
        login(userData, subscription_status);
        
        // Show welcome message
        if (message) {
          console.log('Welcome message:', message);
          // You could show a toast notification here
        }
        
        // Close modal and redirect if needed
        if (onClose) {
          onClose();
        }
        
        // Redirect to specified page or dashboard
        // if (setCurrentPage) {
        //   // Use setCurrentPage for navigation within the app
        //   if (redirectTo) {
        //     // Extract the page name from redirectTo if it's a path
        //     const pageName = redirectTo.replace('/', '');
        //     setCurrentPage(pageName);
        //   } else {
        //     // Default redirect to MarketsAI1App after successful login
            
        //   }
        // } else if (redirectTo) {
        //   // Fallback to window.location if setCurrentPage is not available
        //   window.location.href = redirectTo;
        // } else {
        //   // Default redirect to MarketsAI1App after successful login
        //   window.location.href = '/marketsai1-app';
        // }
      } else {
        throw new Error('Backend authentication failed');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const statusText = error.response.statusText || 'Unknown Error';
        const data = error.response.data;
        
        // Check if response is HTML (error page)
        const contentType = error.response.headers['content-type'] || '';
        if (contentType.includes('text/html') || (typeof data === 'string' && (data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<!doctype') || data.trim().startsWith('<html')))) {
          setError(`Server error: ${status} ${statusText}. The server returned an HTML error page. Please check if the API endpoint "${API_BASE_URL}/api/auth/google-login" is correct and the backend server is running.`);
        } else if (data && typeof data === 'object') {
          setError(data.detail || data.message || `Server error: ${status} ${statusText}`);
        } else {
          setError(`Server error: ${status} ${statusText}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError('No response from server. Please check if the backend server is running at ' + API_BASE_URL);
        console.error('No response received:', error.request);
      } else {
        // Error setting up the request
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleMicrosoftLogin = () => {
    // Microsoft login implementation would go here
    setError('Microsoft login not implemented yet.');
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Email login implementation would go here
    setTimeout(() => {
      setError('Email login not implemented yet.');
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    // Forgot password implementation would go here
    setError('Forgot password not implemented yet.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative transform transition-all duration-300 ease-out">
        {/* Close Button */}
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

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={Logo1} 
              alt="WealthAI Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to WealthAI</h1>
          <p className="text-gray-600 text-sm">Sign in to access your AI-powered trading strategies</p>
        </div>

        {/* Google Sign In */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width="280"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              <span className="ml-2 text-gray-600 text-sm">Signing you in...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
