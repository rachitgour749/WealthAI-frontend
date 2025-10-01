import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import UserAvatar from './UserAvatar';
import Login from './Login';

const Navigation = ({ setCurrentPage, currentPage, transparent = false, showLoginModal, setShowLoginModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const { subscriptionInfo, hasAccess, daysRemaining, needsUpgrade } = useSubscription();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navBg = transparent 
    ? scrolled 
      ? 'bg-white shadow-lg' 
      : 'bg-white bg-opacity-95 backdrop-blur-sm' 
    : 'bg-white shadow-lg';

  // Compact navigation buttons with tooltips
  const compactNavItems = [
    { id: 'marketsai1', name: 'MarketsAI1', icon: '📊', color: 'teal', page: 'marketsai1-app' },
    { id: 'chatai1', name: 'ChatAI1', icon: '🤖', color: 'green', page: 'chatai1' },
    { id: 'scanai1', name: 'ScanAI1', icon: '🔍', color: 'orange', page: 'scanai1' },
    { id: 'papertraderai1', name: 'PaperTraderAI1', icon: '📈', color: 'purple', page: 'papertraderai1' }
  ];

  // Product definitions with their page mappings
  const products = [
    { id: 'marketsai1', name: 'MarketsAI1', icon: '📊', color: 'teal', page: 'marketsai1-app' },
    { id: 'chatai1', name: 'ChatAI1', icon: '🤖', color: 'green', page: 'chatai1' },
    { id: 'scanai1', name: 'ScanAI1', icon: '🔍', color: 'orange', page: 'scanai1' },
    { id: 'papertraderai1', name: 'PaperTraderAI1', icon: '📈', color: 'purple', page: 'papertraderai1' }
  ];

  // Get current product based on currentPage
  const getCurrentProduct = () => {
    return products.find(p => p.page === currentPage) || products[0];
  };

  // Get page title based on currentPage
  const getPageTitle = () => {
    const product = getCurrentProduct();
    if (currentPage === 'home') return 'WealthAI1';
    if (currentPage === 'marketsai1-app') return 'MarketsAI1 Strategy Lab';
    if (currentPage === 'chatai1') return 'ChatAI1 Assistant';
    if (currentPage === 'scanai1') return 'ScanAI1 Scanner';
    if (currentPage === 'papertraderai1') return 'PaperTraderAI1';
    if (currentPage === 'products') return 'Products';
    if (currentPage === 'services') return 'Services';
    if (currentPage === 'founders') return 'About Us';
    if (currentPage === 'insights') return 'Insights';
    if (currentPage === 'contact') return 'Contact';
    if (currentPage === 'profile') return 'Profile';
    if (currentPage === 'payment') return 'Payment';
    return product.name;
  };

  // Handle navigation with authentication check
  const handleNavigation = (page) => {
    const protectedPages = ['products', 'marketsai1-app', 'chatai1', 'papertraderai1', 'scanai1', 'profile', 'payment'];
    
    if (loading) {
      console.log('Authentication still loading...');
      return;
    }
    
    if (protectedPages.includes(page) && (!isAuthenticated || !user)) {
      console.log('User not authenticated, showing login modal for:', page);
      if (setShowLoginModal) {
        setShowLoginModal(true);
      }
      return;
    }
    
    console.log('User authenticated, navigating to:', page);
    setCurrentPage(page);
    setIsOpen(false);
  };

  const currentProduct = getCurrentProduct();
  const pageTitle = getPageTitle();
  console.log('pageTitle', pageTitle);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${navBg} border-b border-gray-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Left Side - Brand and Title */}
          <div className="flex items-center space-x-4">
            {/* Mobile Brand */}
            <div className="lg:hidden">
              <h1 className="font-bold text-lg text-blue-900 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => handleNavigation('home')}
              >
                WealthAI1
              </h1>
            </div>
            
            {/* Desktop Page Title */}
            <div className="hidden lg:block">
              <h1 className="font-bold text-xl lg:text-2xl text-blue-900 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => handleNavigation('home')}
              >
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right Side - Navigation and User Controls */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              <button 
                onClick={() => handleNavigation('home')} 
                className="text-gray-600 hover:text-blue-900 transition-colors font-medium text-sm"
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('products')} 
                className="text-gray-600 hover:text-blue-900 transition-colors font-medium text-sm"
              >
                Products
              </button>
              <button 
                onClick={() => handleNavigation('services')} 
                className="text-gray-600 hover:text-blue-900 transition-colors font-medium text-sm"
              >
                Services
              </button>
              <button 
                onClick={() => handleNavigation('contact')} 
                className="text-gray-600 hover:text-blue-900 transition-colors font-medium text-sm"
              >
                Contact
              </button>
            </div>

            {/* Desktop Compact Navigation Bar */}
            <div className="hidden lg:flex items-center bg-gradient-to-r from-slate-100 via-gray-50 to-slate-100 rounded-xl p-1 space-x-1 shadow-lg border border-gray-200/50 backdrop-blur-sm">
              {compactNavItems.map((item) => {
                const isActive = currentPage === item.page;
                
                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => handleNavigation(item.page)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ${
                        isActive 
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/50 ring-1 ring-teal-300/50' 
                          : 'bg-gradient-to-br from-white to-gray-50 text-gray-600 hover:from-teal-50 hover:to-teal-100 shadow-sm hover:shadow-md border border-gray-200/50'
                      }`}
                    >
                      <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </div>
                    </button>
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-lg border border-gray-700/50 backdrop-blur-sm">
                      <span className="font-semibold">{item.name}</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-gray-800"></div>
                    </div>
                    
                    {/* Glow effect for active state */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-lg bg-blue-400/20 blur-md animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Subscription Status */}
            {isAuthenticated && subscriptionInfo && (
              <div className="hidden lg:flex items-center space-x-2">
                {subscriptionInfo.isTrialActive && daysRemaining > 0 && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-blue-700">
                      {daysRemaining} days left
                    </span>
                  </div>
                )}
                {subscriptionInfo.canAccessPremium && subscriptionInfo.status === 'active' && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-green-700">
                      Premium
                    </span>
                  </div>
                )}
                {needsUpgrade && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1 rounded-full border border-orange-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-orange-700">
                      Upgrade
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile/Tablet Subscription Status */}
            {isAuthenticated && subscriptionInfo && (
              <div className="lg:hidden flex items-center">
                {subscriptionInfo.isTrialActive && daysRemaining > 0 && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1 rounded-full border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-blue-700">
                      {daysRemaining}d
                    </span>
                  </div>
                )}
                {subscriptionInfo.canAccessPremium && subscriptionInfo.status === 'active' && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-green-700">
                      Pro
                    </span>
                  </div>
                )}
                {needsUpgrade && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-50 to-red-50 px-2 py-1 rounded-full border border-orange-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-orange-700">
                      Exp
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* User Avatar */}
            {isAuthenticated ? (
              <div className="flex items-center">
                <UserAvatar setCurrentPage={setCurrentPage} />
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal && setShowLoginModal(true)}
                className="bg-blue-900 text-white px-3 py-2 lg:px-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 absolute top-full left-0 right-0 shadow-xl max-h-screen overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-blue-900">WealthAI1</h2>
                  <p className="text-sm text-gray-600">{pageTitle}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* AI Products Section */}
            <div className="px-4 py-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">🚀</span>
                AI Products
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {compactNavItems.map((item) => {
                  const isActive = currentPage === item.page;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {handleNavigation(item.page); setIsOpen(false);}}
                      className={`flex flex-col items-center space-y-2 px-3 py-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
                          : 'bg-gradient-to-br from-gray-50 to-white text-gray-600 hover:from-blue-50 hover:to-blue-100 shadow-md border border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold text-center">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Navigation Links */}
            <div className="px-4 py-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <span className="mr-2">📱</span>
                Main Menu
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {handleNavigation('home'); setIsOpen(false);}} 
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${
                    currentPage === 'home' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>🏠</span>
                  <span className="font-medium text-sm">Home</span>
                </button>
                <button 
                  onClick={() => {handleNavigation('products'); setIsOpen(false);}} 
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${
                    currentPage === 'products' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>📦</span>
                  <span className="font-medium text-sm">Products</span>
                </button>
                <button 
                  onClick={() => {handleNavigation('services'); setIsOpen(false);}} 
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${
                    currentPage === 'services' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>⚙️</span>
                  <span className="font-medium text-sm">Services</span>
                </button>
                <button 
                  onClick={() => {handleNavigation('contact'); setIsOpen(false);}} 
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${
                    currentPage === 'contact' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>📞</span>
                  <span className="font-medium text-sm">Contact</span>
                </button>
              </div>
            </div>

            {/* User Section for Mobile */}
            <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
              {isAuthenticated ? (
                <div className="flex items-center justify-center py-2">
                  <UserAvatar setCurrentPage={setCurrentPage} />
                </div>
              ) : (
                <button 
                  onClick={() => {setShowLoginModal && setShowLoginModal(true); setIsOpen(false);}}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center text-sm shadow-lg"
                >
                  🔐 Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;