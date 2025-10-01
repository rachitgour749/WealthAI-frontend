import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

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
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential 
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Login failed');
      }

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
        if (setCurrentPage) {
          // Use setCurrentPage for navigation within the app
          if (redirectTo) {
            // Extract the page name from redirectTo if it's a path
            const pageName = redirectTo.replace('/', '');
            setCurrentPage(pageName);
          } else {
            // Default redirect to MarketsAI1App after successful login
            setCurrentPage('marketsai1-app');
          }
        } else if (redirectTo) {
          // Fallback to window.location if setCurrentPage is not available
          window.location.href = redirectTo;
        } else {
          // Default redirect to MarketsAI1App after successful login
          window.location.href = '/marketsai1-app';
        }
      } else {
        throw new Error('Backend authentication failed');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-4 sm:p-6 lg:p-8 relative transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Social Login */}
          <div className="flex-1 pr-0 lg:pr-8 mb-6 lg:mb-0">
            <div className="space-y-4">
              {/* Google Login */}
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="100%"
                />
              </div>

              {/* Microsoft Login */}
              <button
                onClick={handleMicrosoftLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                Sign in with Microsoft
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex flex-row lg:flex-col items-center justify-center px-0 lg:px-4 py-4 lg:py-0">
            <div className="w-full lg:w-px h-px lg:h-full bg-gray-300 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500 text-sm font-medium">
                OR
              </div>
            </div>
          </div>

          {/* Right Column - Email Login */}
          <div className="flex-1 pl-0 lg:pl-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Sign in with your Email</h2>
            
            <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              {/* reCAPTCHA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="checkbox"
                  id="recaptcha"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="recaptcha" className="text-xs sm:text-sm text-gray-700">
                  I'm not a robot
                </label>
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>reCAPTCHA</div>
                    <div className="flex space-x-1">
                      <span className="text-blue-600">Privacy</span>
                      <span>-</span>
                      <span className="text-blue-600">Terms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Sign Up Option */}
              <div className="text-center">
                <span className="text-xs sm:text-sm text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:underline text-xs sm:text-sm"
                >
                  Sign up now
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

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

export default Login;
