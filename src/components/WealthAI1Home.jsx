import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatAI1Landing from './ChatAI1Landing';
import Login from './Login';
import TrialExpiryModal from './TrialExpiryModal';
import PaymentPopup from './Payments/PaymentPopup';
import TrialEnableModal from './TrialEnableModal';
import ActivateTrialModal from './ActivateTrialModal';
import { formatDate } from '../utils/dateFormatter';
import logo1 from '../Assets/Logo1.png';
import heading from '../Assets/Heading.png';

const WealthAI1Home = ({ setCurrentPage, currentPage, hideHeaderFooter = false }) => {
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [leftCardView, setLeftCardView] = useState('dashboard'); // 'dashboard', 'profile', 'subscription'
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [trialModal, setTrialModal] = useState({ open: false, name: '', code: '' });
  const [activateTrialModal, setActivateTrialModal] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const { 
    subscription, 
    productsStatus, 
    isProductActive, 
    isProductInTrial, 
    getProductDaysRemaining,
    getProductAccessType,
    refreshSubscriptionData
  } = useSubscription();
  const productAccess = require('../hooks/useProductAccess').default();
  
  // Word limit calculation (example: 600,000 words used out of 1,000,000)
  const wordsUsed = 600000; // This would come from user data
  const totalWords = 1000000;
  const wordsRemaining = totalWords - wordsUsed;
  const wordPercentage = wordsRemaining / totalWords;

  // Show trial expiry modal when needed
  useEffect(() => {
    if (isAuthenticated && subscription) {
      // Check if any product has trial expiring soon
      const hasExpiringTrial = Object.keys(productsStatus).some(productCode => {
        const product = productsStatus[productCode];
        return product?.access_type === 'trial' && product?.days_remaining <= 3 && product?.days_remaining > 0;
      });
      
      if (hasExpiringTrial) {
        // Show modal after a short delay to avoid interrupting the user experience
        const timer = setTimeout(() => {
          setShowTrialModal(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, subscription, productsStatus]);

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
      description: 'Live trading with multi-broker API integration. Manage trades and monitor performance in real time.',
      color: 'purple',
      enabled: true,
      icon: '📈'
    },
    {
      id: 'automationai',
      name: 'AutomationAI1',
      description: 'Smart social media assistant for automated posting, engagement, and content scheduling across multiple platforms.',
      color: 'orange',
      enabled: true,
      icon: '🔍'
    }
  ];

  const handleProductClick = async (productId) => {
    // Wait for authentication to load and check if user is authenticated
    if (loading) {
      console.log('Authentication still loading...');
      return;
    }

    console.log('Auth check:', { isAuthenticated, user, loading });

    // Define public products that don't require authentication
    const publicProducts = ['automationai'];

    // Check if user is authenticated for protected features (skip check for public products)
    if (!publicProducts.includes(productId) && (!isAuthenticated || !user)) {
      console.log('User not authenticated, showing login modal');
      setShowLoginModal(true);
      return;
    }

    console.log('User authenticated or accessing public product, proceeding to product:', productId);

    if (productId === 'chatai1') {
      await guardedNavigate(productId, 'Chat AI');
    } else if (productId === 'marketsai1') {
      await guardedNavigate(productId, 'Market AI');
    } else if (productId === 'tradeai1') {
      await guardedNavigate(productId, 'Trade AI');
    } else if (productId === 'automationai1') {
      await guardedNavigate(productId, 'Automation AI');
    } else {
      await guardedNavigate(productId, productId);
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

  // Centralized click with access control
  const guardedNavigate = async (productId, productName) => {
    // Disable ChatAI - coming soon
    if (productId === 'chatai1') {
      return;
    }

    // Check if trial is not activated - show activate trial modal instead
    if (!subscription?.is_trial_active) {
      setActivateTrialModal(true);
      return;
    }

    const codeMap = {
      'marketsai1': 'MARKETAI',
      'chatai1': 'CHATAI',
      'tradeai1': 'TRADAI',
      'automationai1': 'AUTOMATIONAI'
    };
    const productCode = codeMap[productId];
    if (!productCode) {
      // Fallback navigate
      setCurrentPage(productId);
      return;
    }

    const result = await productAccess.handleProductClick(
      productCode,
      productName,
      () => setIsPaymentOpen(true),
      (code, name) => setTrialModal({ open: true, code, name })
    );

    if (result.success) {
      // grant access → navigate
      if (productId === 'marketsai1') {
        setCurrentPage('marketsai1-app');
      } else if (productId === 'tradeai1') {
        // TradAI opens in a new tab, don't change current page
        window.open('https://trade.wealthwisers.in/', '_blank');
      } else {
        setCurrentPage(productId);
      }
    }
  };

  return (
    <div className={hideHeaderFooter ? "h-[calc(100vh-170px)] flex flex-col" : "h-[calc(100vh-170px)] flex flex-col overflow-hidden"}>
      {!hideHeaderFooter && showLoginModal && (
        <Login onClose={() => setShowLoginModal(false)} setCurrentPage={setCurrentPage} />
      )}
      {!hideHeaderFooter && (
        <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={true} showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      )}


      {/* Trial Modal */}
      <TrialEnableModal 
        isOpen={trialModal.open}
        onClose={() => setTrialModal({ open: false, name: '', code: '' })}
        productName={trialModal.name}
        productCode={trialModal.code}
        userEmail={user?.email}
        onTrialEnabled={() => {
          setTrialModal({ open: false, name: '', code: '' });
        }}
      />

      {/* Activate Trial Modal */}
      <ActivateTrialModal
        isOpen={activateTrialModal}
        onClose={() => setActivateTrialModal(false)}
        onTrialActivated={() => {
          // Refresh subscription data after activation
          refreshSubscriptionData();
          // Switch to subscription view to show active trial status
          setLeftCardView('subscription');
        }}
      />

      {/* Payment Popup */}
      <PaymentPopup isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />

      {/* Main Content - Compact Cards */}
      <div className={hideHeaderFooter ? "flex-1 px-4 sm:px-6 lg:px-8 py-5" : "flex-1 pt-20 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"}>
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
                        <p className="text-[18px] mb-4 sm:mb-6 text-center text-gray-700 leading-relaxed max-w-2xl mx-auto">
                          Welcome back, <span className="font-bold">{user?.name || user?.email || 'User'}</span>
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                          {(() => {
                            // Show "Active Trial" button if trial is not activated
                            // Check if trial is active - show "Active Trial" button if is_trial_active is false or null
                            const isTrialActivated = subscription?.is_trial_active === true;

                            if (!isTrialActivated) {
                              // Show "Active Trial" button
                              return (
                                <button
                                  onClick={() => setActivateTrialModal(true)}
                                  className="group relative bg-gradient-to-r from-green-600 to-green-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[40px] text-sm sm:text-base font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-green-500/20 overflow-hidden"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                  <div className="relative flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Activate Trial
                                  </div>
                                </button>
                              );
                            } else {
                              // Show "My Subscriptions" and "Payments" buttons when trial is activated
                              return (
                                <>
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
                                  <button
                                    onClick={() => setIsPaymentOpen(true)}
                                    className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[40px] text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-500/20 overflow-hidden"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <div className="relative flex items-center justify-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                      </svg>
                                      Payments
                                    </div>
                                  </button>
                                </>
                              );
                            }
                          })()}
                        </div>
                      </>
                    )}


                    {leftCardView === 'subscription' && (
                      <>
                        {/* Subscription Header - Centered and aligned with right card */}
                        <div className="text-center mb-2 flex flex-col justify-center mt-[-60px]">
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-left text-blue-900 mb-2">
                            My Subscriptions
                          </h2>
                          <button
                            onClick={() => setLeftCardView('dashboard')}
                            className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 text-3xl font-bold transition-colors"
                          >
                            ×
                          </button>
                        </div>

                        {/* Vertical Subscription Layout */}
                        <div className="flex flex-col space-y-4 mb-6">
                          {/* MarketAI1 Box */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                                 
                                  <span className="text-xl">📊</span>
                                </div>
                                <span className="font-semibold text-gray-800">MarketAI1</span>
                              </div>
                              {(() => {
                                const active = isProductActive('MARKETAI');
                                const trial = isProductInTrial('MARKETAI');
                                if (active) {
                                  return (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${trial ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {trial ? 'Trial Active' : 'Active'}
                                    </span>
                                  );
                                }
                                return (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>
                                );
                              })()}
                            </div>
                            {(() => {
                              const active = isProductActive('MARKETAI');
                              if (active) {
                                const product = productsStatus['MARKETAI'] || {};
                                const trial = isProductInTrial('MARKETAI');
                                const daysRemaining = getProductDaysRemaining('MARKETAI');
                                const endDateRaw = trial ? product?.trial_end_date : (product?.paid_end_date || subscription?.subscription_end_date);
                                const endDate = endDateRaw ? new Date(endDateRaw) : null;
                                const formatted = endDate ? formatDate(endDate) : null;
                                
                                return (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600"></span>
                                    <span className="text-sm font-medium text-gray-800">
                                      {formatted || (daysRemaining > 0 ? `${daysRemaining} days left` : '-')}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            {(() => {
                              const active = isProductActive('MARKETAI');
                              if (!active) {
                                return (
                                  <div className="mt-3 flex justify-end">
                                    <button onClick={() => setIsPaymentOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-md text-xs">
                                      Subscribe Now
                                    </button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* ChatAI Box */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                            
                                  <span className="text-xl">🤖</span>
                                </div>
                                <span className="font-semibold text-gray-800">ChatAI</span>
                              </div>
                              {(() => {
                                const isChatAIActive = isProductActive('CHATAI');
                                const isChatAITrial = isProductInTrial('CHATAI');
                                if (isChatAIActive) {
                                  return (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {isChatAITrial ? 'Trial Active' : 'Active'}
                                    </span>
                                  );
                                }
                                return (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 italic">
                                    Coming Soon!
                                  </span>
                                );
                              })()}
                            </div>
                            {(() => {
                              const isChatAIActive = isProductActive('CHATAI');
                              if (isChatAIActive) {
                                const product = productsStatus['CHATAI'] || {};
                                const isChatAITrial = isProductInTrial('CHATAI');
                                const chatAIDaysRemaining = getProductDaysRemaining('CHATAI');
                                const endDateRaw = isChatAITrial ? product?.trial_end_date : (product?.paid_end_date || subscription?.subscription_end_date);
                                const endDate = endDateRaw ? new Date(endDateRaw) : null;
                                const formatted = endDate ? formatDate(endDate) : null;
                                
                                return (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600"></span>
                                    <span className="text-sm font-medium text-gray-800">
                                      {formatted || (chatAIDaysRemaining > 0 ? `${chatAIDaysRemaining} days left` : '-')}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* TradeAI1 Box */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                                  <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center relative">
                                    
                                  
                                    <span className="text-xl">📈</span>
                                  </div>
                                </div>
                                <span className="font-semibold text-gray-800">TradeAI1</span>
                              </div>
                              {(() => {
                                const isTradeAIActive = isProductActive('TRADAI');
                                const isTradeAITrial = isProductInTrial('TRADAI');
                                if (isTradeAIActive) {
                                  return (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {isTradeAITrial ? 'Trial Active' : 'Active'}
                                    </span>
                                  );
                                }
                                return (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>
                                );
                              })()}
                            </div>
                            {(() => {
                              const isTradeAIActive = isProductActive('TRADAI');
                              if (isTradeAIActive) {
                                const product = productsStatus['TRADAI'] || {};
                                const isTradeAITrial = isProductInTrial('TRADAI');
                                const tradeAIDaysRemaining = getProductDaysRemaining('TRADAI');
                                const endDateRaw = isTradeAITrial ? product?.trial_end_date : (product?.paid_end_date || subscription?.subscription_end_date);
                                const endDate = endDateRaw ? new Date(endDateRaw) : null;
                                const formatted = endDate ? formatDate(endDate) : null;
                                
                                return (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600"></span>
                                    <span className="text-sm font-medium text-gray-800">
                                      {formatted || (tradeAIDaysRemaining > 0 ? `${tradeAIDaysRemaining} days left` : '-')}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            {(() => {
                              const isTradeAIActive = isProductActive('TRADAI');
                              if (!isTradeAIActive) {
                                return (
                                  <div className="mt-3 flex justify-end">
                                    <button onClick={() => setIsPaymentOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-md text-xs">
                                      Subscribe Now
                                    </button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* AutomationAI Box */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg relative">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                                  <span className="text-xl">🔍</span>
                                </div>
                                <span className="font-semibold text-gray-800">AutomationAI</span>
                              </div>
                              {/* {(() => {
                                const isAutomationAIActive = isProductActive('AUTOMATIONAI');
                                const isAutomationAITrial = isProductInTrial('AUTOMATIONAI');
                                if (isAutomationAIActive) {
                                  return (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAutomationAITrial ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                      
                                    </span>
                                  );
                                }
                                return (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>
                                );
                              })()} */}
                            </div>
                            {(() => {
                              const isAutomationAIActive = isProductActive('AUTOMATIONAI');
                              if (isAutomationAIActive) {
                                const product = productsStatus['AUTOMATIONAI'] || {};
                                const isAutomationAITrial = isProductInTrial('AUTOMATIONAI');
                                const automationAIDaysRemaining = getProductDaysRemaining('AUTOMATIONAI');
                                const endDateRaw = isAutomationAITrial ? product?.trial_end_date : (product?.paid_end_date || subscription?.subscription_end_date);
                                const endDate = endDateRaw ? new Date(endDateRaw) : null;
                                const formatted = endDate ? formatDate(endDate) : null;
                                
                                return (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600"></span>
                                    <span className="text-sm font-medium text-gray-800">
                                      {formatted || (automationAIDaysRemaining > 0 ? `${automationAIDaysRemaining} days left` : '-')}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            {(() => {
                              const isAutomationAIActive = isProductActive('AUTOMATIONAI');
                              if (!isAutomationAIActive) {
                                return (
                                  <div className="mt-3 flex justify-end">
                                    {/* <button onClick={() => setIsPaymentOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-md text-xs">
                                      Subscribe Now
                                    </button> */}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                          {(() => {
                            // Check if any product needs upgrade (trial expiring soon or expired)
                            const hasExpiringTrial = Object.keys(productsStatus).some(productCode => {
                              const product = productsStatus[productCode];
                              return product?.access_type === 'trial' && product?.days_remaining <= 3;
                            });
                            return hasExpiringTrial;
                          })() ? (
                            <button
                              onClick={() => setCurrentPage('profile')}
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
                  <h2 className="text-xl sm:text-2xl flex w-[380px] items-center lg:text-3xl font-semibold text-blue-900 mb-2 ml-[-5px]"><img src={heading} alt="WealthAI1" className="w-[160px] h-[30px] mx-auto mb-0 mr-0 mr-[5px]" />Product Suite</h2>
                  <p className="text-sm text-gray-600">
                    AI-powered trading and investment solutions
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                  {products.map((product) => {
                    // Determine subscription status for each product
                    const getSubscriptionStatus = () => {
                      if (!isAuthenticated || !subscription) {
                        return 'subscribe';
                      }
                      
                      // Map product IDs to API product codes
                      const productCodeMap = {
                        'marketsai1': 'MARKETAI',
                        'chatai1': 'CHATAI',
                        'tradeai1': 'TRADAI',
                        'automationai1': 'AUTOMATIONAI'
                      };
                      
                      const productCode = productCodeMap[product.id];
                      if (!productCode) {
                        return 'subscribe';
                      }
                      
                      // Check if product is active
                      if (isProductActive(productCode)) {
                        if (isProductInTrial(productCode)) {
                          return 'trial';
                        } else {
                          return 'subscribed';
                        }
                      }
                      
                      return 'subscribe';
                    };

                    const subscriptionStatus = getSubscriptionStatus();

                    const isChatAI = product.id === 'chatai1';
                    return (
                      <div key={product.id} className={`bg-white bg-opacity-90 p-4 rounded-xl transition-all duration-300 relative overflow-hidden min-h-[130px] max-h-[170px] flex flex-col ${
                        isChatAI 
                          ? 'cursor-not-allowed opacity-75' 
                          : 'hover:shadow-lg transform hover:-translate-y-1 cursor-pointer'
                      }`}
                        onClick={() => !isChatAI && handleProductClick(product.id)}
                      >
                        {!product.enabled && (
                          <div className="absolute top-4 right-2 z-10">
                            <span className="text-xs italic text-gray-400 bg-white/80 px-2 py-1 rounded-full">Coming soon!</span>
                          </div>
                        )}

                        {/* Subscription Status Indicator */}
                        {product.enabled && subscriptionStatus !== 'subscribed' && product.id !== 'automationai' && (
                          <div className="absolute top-4 right-3 z-10">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full pointer-events-none ${
                              subscriptionStatus === 'trial' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : product.id === 'chatai1'
                                ? 'bg-gray-100 text-gray-600 border border-gray-200 italic'
                                : 'bg-orange-100 text-orange-700 border border-orange-200'
                            }`}>
                              {subscriptionStatus === 'trial' 
                                ? 'Active Trial' 
                                : product.id === 'chatai1' 
                                ? 'Coming Soon!' 
                                : 'Subscribe Now'}
                            </span>
                          </div>
                        )}
                        
                        {/* Show days remaining for trial users */}
                        {product.enabled && subscriptionStatus === 'trial' && (() => {
                          const productCodeMap = {
                            'marketsai1': 'MARKETAI',
                            'chatai1': 'CHATAI',
                            'tradeai1': 'TRADAI',
                            'automationai1': 'AUTOMATIONAI'
                          };
                          const productCode = productCodeMap[product.id];
                          const daysRemaining = productCode ? getProductDaysRemaining(productCode) : 0;
              
                        })()}

                        {/* Clickable Arrow - Only for TradeAI1 */}
                        {product.id === 'tradeai1' && (
                          <div className="absolute top-4 right-[140px] z-20">
                            <div 
                              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                              onClick={async (e) => {
                                e.stopPropagation();
                                // Only redirect if user has access to TRADAI
                                const result = await productAccess.checkProductAccess('TRADAI', 'Trade AI');
                                if (result.hasAccess) {
                                  window.open('https://trade.wealthwisers.in/', '_blank');
                                } else if (result.canEnableTrial) {
                                  setTrialModal({ open: true, code: 'TRADAI', name: 'Trade AI' });
                                } else {
                                  setIsPaymentOpen(true);
                                }
                              }}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        )}


                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-lg">{product.icon}</span>
                          </div>
                          <h3 className="text-sm font-bold text-teal-700 pr-8">
                            {product.name}
                          </h3>
                        </div>

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
                    );
                  })}
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
        subscriptionInfo={subscription}
        onUpgrade={() => {
          setShowTrialModal(false);
          setCurrentPage('profile');
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