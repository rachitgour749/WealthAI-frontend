import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatAI1Landing from './ChatAI1Landing';
import Login from './Login';
import TrialExpiryModal from './TrialExpiryModal';
import logo1 from '../Assets/Logo1.png';
import heading from '../Assets/Heading.png';

const WealthAI1Home = ({ setCurrentPage, currentPage, hideHeaderFooter = false }) => {
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [leftCardView, setLeftCardView] = useState('dashboard'); // 'dashboard', 'profile', 'subscription'
  const { isAuthenticated, loading, user } = useAuth();
  const { subscriptionInfo, needsUpgrade, daysRemaining, hasAccess } = useSubscription();

  // Show trial expiry modal when needed
  useEffect(() => {
    if (isAuthenticated && subscriptionInfo) {
      const shouldShowModal = needsUpgrade || (daysRemaining <= 3 && daysRemaining > 0);
      if (shouldShowModal) {
        // Show modal after a short delay to avoid interrupting the user experience
        const timer = setTimeout(() => {
          setShowTrialModal(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, subscriptionInfo, needsUpgrade, daysRemaining]);

  const products = [
    {
      id: 'marketsai1',
      name: 'MarketsAI1',
      description: 'Build, backtest and optimize your own trading and investing strategies in stocks and ETFs based on EOD data.',
      color: 'teal',
      enabled: true,
      icon: '📊'
    },
    {
      id: 'chatai1',
      name: 'ChatAI1',
      description: 'Smart AI Assistant specially trained for Indian stock markets and mutual funds with natural language interaction.',
      color: 'green',
      enabled: true,
      icon: '🤖'
    },
    {
      id: 'tradeai1',
      name: 'TradeAI1',
      description: 'Live market testing with broker API integration. Trade with paper money to validate strategy performance.',
      color: 'purple',
      enabled: true,
      icon: '📈'
    },
    {
      id: 'automationai',
      name: 'AutomationAI',
      description: 'Advanced pre-built scanners with technical and fundamental indicators. Create custom scans with natural language.',
      color: 'orange',
      enabled: true,
      icon: '🔍'
    }
  ];

  const handleProductClick = (productId) => {
    // Wait for authentication to load and check if user is authenticated
    if (loading) {
      console.log('Authentication still loading...');
      return;
    }

    console.log('Auth check:', { isAuthenticated, user, loading });
    
    // Check if user is authenticated for protected features
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, showing login modal');
      setShowLoginModal(true);
      return;
    }

    console.log('User authenticated, proceeding to product:', productId);

    if (productId === 'chatai1') {
      setIsAIPopupOpen(true);
    } else if (productId === 'marketsai1') {
      setCurrentPage('marketsai1-app');
    } else {
      setCurrentPage(productId);
    }
  };

  const handleTryPlatformClick = () => {
    // Wait for authentication to load and check if user is authenticated
    if (loading) {
      console.log('Authentication still loading...');
      return;
    }

    console.log('Try platform auth check:', { isAuthenticated, user, loading });
    
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, showing login modal');
      setShowLoginModal(true);
      return;
    }

    console.log('User authenticated, proceeding to MarketsAI1 app');
    setCurrentPage('marketsai1-app');
  };

  return (
    <div className={hideHeaderFooter ? "h-full flex flex-col" : "h-screen flex flex-col overflow-hidden"}>
      {!hideHeaderFooter && showLoginModal && (
        <Login onClose={() => setShowLoginModal(false)} setCurrentPage={setCurrentPage} />
      )}
      {!hideHeaderFooter && (
      <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={true} showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      )}
      
      {/* Main Content - Compact Cards */}
      <div className={hideHeaderFooter ? "flex-1 px-4 sm:px-6 lg:px-8 py-6" : "flex-1 pt-20 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"}>
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 h-full">
            
            {/* Left Card - Hero Section */}
            <div className="group bg-gradient-to-br h-[490px] from-teal-50 via-blue-50 to-gray-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/6 w-16 h-16 sm:w-24 sm:h-24 bg-teal-100 rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/6 w-20 h-20 sm:w-32 sm:h-32 bg-blue-100 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-20 sm:h-20 bg-teal-200 rounded-full"></div>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-start text-center pt-8 sm:pt-12 lg:pt-16">
                {isAuthenticated ? (
                  <>
                    {leftCardView === 'dashboard' && (
                      <>
                        {/* Welcome message for signed-in users */}
                        {/* <img src={logo1} alt="WealthAI1" className="w-[100px] h-[70px] mx-auto mb-4" /> */}
                        <div className='flex justify-center items-center'>
                        <h2 className="text-xl flex justify-center items-center w-[350px] sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-2 sm:mb-4 ml-[10px]">
                          <span className='mr-[-15px] text-[45px] mt-[-10px]'>My</span><img src={heading} alt="WealthAI1" className="w-[245px] h-[45px] mx-auto mb-2" />
                        </h2>
                        </div>
                <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 text-center text-gray-700 leading-relaxed max-w-2xl mx-auto">
                          Welcome back, <span className="font-bold">{user?.name || user?.email || 'User'}</span>! Access your personalized dashboard and AI-powered trading tools.
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                          <button
                            onClick={() => setLeftCardView('profile')}
                            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[40px] text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-500/20 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <div className="relative flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              My Profile
                            </div>
                          </button>
                          <button
                            onClick={() => setLeftCardView('subscription')}
                            className="group relative bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[40px] text-sm sm:text-base font-semibold hover:from-teal-700 hover:to-teal-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-teal-500/20 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <div className="relative flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              My Subscriptions
                            </div>
                          </button>
                        </div>
                      </>
                    )}

                    {leftCardView === 'profile' && (
                      <>
                        {/* Profile Header with Gradient */}
                        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-xl p-6 mb-6 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform -skew-x-12"></div>
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <span className="text-2xl font-bold text-white">
                                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-white">
                                  {user?.name || user?.email || 'User'}
                                </h2>
                                <p className="text-white/80 text-sm">Member since {new Date().toLocaleDateString()}</p>
                                <div className="flex items-center mt-2">
                                  <div className="bg-white/20 px-3 py-1 rounded-full flex items-center space-x-2">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-white text-xs">Google</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit Profile</span>
                              </button>
                              <button
                                onClick={() => setLeftCardView('dashboard')}
                                className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Profile Details */}
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-5">
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                                    {user?.name || 'Not provided'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                                    Not provided
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Role/Position</label>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                                    Not provided
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-5">
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                                    {user?.email || 'Not provided'}
                                    {user?.email && (
                                      <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-xs text-green-600 font-medium">Verified</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                                    Not provided
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                                    Google Account
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {leftCardView === 'subscription' && (
                      <>
                        {/* Subscription Header */}
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">
                            My Subscription
                          </h2>
                          <button
                            onClick={() => setLeftCardView('dashboard')}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
                          >
                            ×
                  </button>
                </div>
                
                        {/* Subscription Status Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800">Subscription Status</h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              <span className="font-medium">Trial Active</span>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-blue-600">{daysRemaining || '30'}</div>
                              <div className="text-sm text-gray-600">days remaining</div>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((daysRemaining || 30) / 30) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Quick Stats Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Quick Stats</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-medium text-gray-700">Account Age</span>
                              <span className="text-sm font-semibold text-blue-600">0 days</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-medium text-gray-700">Login Method</span>
                              <span className="text-sm font-semibold text-green-600">Google</span>
                  </div>
                            
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-medium text-gray-700">Profile Status</span>
                              <span className="text-sm font-semibold text-purple-600">Incomplete</span>
                  </div>
                            
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm font-medium text-gray-700">Access Level</span>
                              <span className="text-sm font-semibold text-orange-600">
                                {hasAccess ? 'Full Access' : 'Limited Access'}
                              </span>
                  </div>
                  </div>
                </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                          {needsUpgrade ? (
                            <button
                              onClick={() => setCurrentPage('payment')}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                              Upgrade to Premium
                            </button>
                          ) : (
                            <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg">
                              Premium Active
                            </button>
                          )}
                          <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200">
                            View Billing History
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Logo */}
                    <div className="flex justify-center sm:mb-3">
                      <img src={logo1} alt="WealthAI1" className="w-[380px] mt-[-60px] mb-[30px]" />
                    </div>
                    
                    {/* <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 text-center text-gray-700 leading-relaxed max-w-2xl mx-auto">
                      From EOD strategy platforms to bespoke fintech AI solutions — empowering market participants to trade smarter, scale faster, and operate safely.
                    </p> */}
                    
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="bg-blue-800 text-white px-8 sm:px-9 py-3 sm:py-4 rounded-[30px] text-sm sm:text-base font-medium hover:bg-blue-900 transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        Sign In
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Card - Products Section - Compact styling */}
            <div className="group bg-gradient-to-br h-[490px] from-teal-50 via-blue-50 to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-3 sm:p-4 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 right-1/6 w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/6 w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-teal-200 rounded-full"></div>
              </div>
              
              <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
                <div className="text-center mb-5 flex flex-col items-center justify-center">
                  <h2 className="text-xl sm:text-2xl flex w-[380px] items-center lg:text-3xl font-semibold text-blue-900 mb-2 ml-[-10px]"><img src={heading} alt="WealthAI1" className="w-[160px] h-[30px] mx-auto mb-0 mr-0"/>Product Suite</h2>
                  <p className="text-sm text-gray-600">
                    AI-powered trading and investment solutions
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white bg-opacity-90 p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden min-h-[130px] max-h-[170px] flex flex-col"
                    onClick={() => handleProductClick(product.id)}
                    >
                      {!product.enabled && (
                        <div className="absolute top-4 right-2 z-10">
                          <span className="text-xs italic text-gray-400 bg-white/80 px-2 py-1 rounded-full">Coming soon!</span>
                        </div>
                      )}
                      
                      {/* Hover Arrow with Tooltip - Only for TradeAI1 */}
                      {product.id === 'tradeai1' && (
                        <div className="absolute top-2 right-2 group z-10">
                          <div className="text-gray-400 hover:text-gray-600 mt-2 mr-2 transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                          {/* Tooltip */}
                          <div className="absolute top-2 right-7 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                            open in new tab
                          </div>
                        </div>
                      )}
                      
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-lg">{product.icon}</span>
                      </div>
                      
                      <h3 className={`text-sm font-bold mb-2 text-${product.color}-600 pr-8`}>
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-700 text-xs leading-relaxed pr-8 flex-1">
                        {product.description}
                      </p>
                      
                      {/* <button
                        onClick={() => handleProductClick(product.id)}
                        className={`w-full py-1.5 sm:py-2 rounded-lg font-semibold transition-colors text-xs ${
                          product.enabled 
                            ? `bg-${product.color}-600 hover:bg-${product.color}-700 text-white` 
                            : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                        disabled={!product.enabled}
                      >
                        {product.enabled ? 'Access Platform' : 'Coming Soon'}
                      </button> */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Assistant Popup Modal */}
      {isAIPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-8">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsAIPopupOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full h-full max-w-5xl bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsAIPopupOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white bg-opacity-40 hover:bg-opacity-60 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* AI Assistant Component */}
            <div className="w-full h-full overflow-y-auto scrollbar-hide bg-gray-200">
              <ChatAI1Landing setCurrentPage={setCurrentPage} currentPage={currentPage} />
            </div>
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      {showLoginModal && (
        <Login onClose={() => setShowLoginModal(false)} setCurrentPage={setCurrentPage} />
      )}

      {/* Trial Expiry Modal */}
      <TrialExpiryModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        subscriptionInfo={subscriptionInfo}
        onUpgrade={() => {
          setShowTrialModal(false);
          setCurrentPage('payment');
        }}
        onContinueTrial={() => {
          setShowTrialModal(false);
          // Could implement trial extension logic here
        }}
      />
      
      {!hideHeaderFooter && <Footer setCurrentPage={setCurrentPage} />}
    </div>
  );
};

export default WealthAI1Home;