import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import Login from './Login';

const Navigation = ({ setCurrentPage, currentPage, transparent = false, showLoginModal, setShowLoginModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  
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
          {/* Left Side - Logo and Page Title */}
          <div className="flex items-center space-x-4">    
            {/* Page Title */}
            <div className="hidden md:block">
              <h1 className="font-bold text-xl lg:text-2xl text-blue-900 hover:opacity-80 transition-opacity"
              onClick={() => handleNavigation('home')}
              >
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Center - Product Selection (Desktop)
          

          {/* Right Side - Compact Nav Bar and User Menu */}
          <div className="flex items-center space-x-4">
            

            {/* Additional Navigation Links (Desktop) */}
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

            {/* Compact Navigation Bar */}
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
                    
                    {/* Enhanced Tooltip - Positioned below */}
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

            {/* User Avatar or Sign In */}
            {isAuthenticated ? (
              <UserAvatar setCurrentPage={setCurrentPage} />
            ) : (
              <button 
                onClick={() => setShowLoginModal && setShowLoginModal(true)}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm"
              >
                Sign In
              </button>
            )}
          </div>

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
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-6 bg-white border-t border-gray-200 absolute top-full left-0 right-0 shadow-lg">
            {/* Page Title for Mobile */}
            <div className="px-4 py-3 border-b border-gray-100">
              <h1 className="text-lg font-semibold text-gray-800">
                {pageTitle}
              </h1>
            </div>

            {/* Compact Navigation for Mobile */}
            <div className="px-4 py-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Navigation</h3>
              <div className="flex space-x-2">
                {compactNavItems.map((item) => {
                  const isActive = currentPage === item.page;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.page)}
                      className={`flex-1 flex flex-col items-center space-y-2 px-3 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'bg-gradient-to-br from-gray-50 to-white text-gray-600 hover:from-gray-100 hover:to-gray-50 shadow-md border border-gray-200/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Selection for Mobile */}
            <div className="px-4 py-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">All Products</h3>
              <div className="space-y-2">
                {products.map((product) => {
                  const isActive = currentPage === product.page;
                  const isHome = product.id === 'home';
                  
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleNavigation(product.page)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {product.icon}
                      </div>
                      <span className="font-medium text-sm">
                        {isHome ? 'Home' : product.name}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Links for Mobile */}
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="space-y-2">
                <button 
                  onClick={() => {handleNavigation('products'); setIsOpen(false);}} 
                  className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                >
                  Products
                </button>
                <button 
                  onClick={() => {handleNavigation('services'); setIsOpen(false);}} 
                  className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                >
                  Services
                </button>
                <button 
                  onClick={() => {handleNavigation('contact'); setIsOpen(false);}} 
                  className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
                >
                  Contact
                </button>
              </div>
            </div>

            {/* User Section for Mobile */}
            <div className="px-4 py-4 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="flex items-center justify-center">
                  <UserAvatar setCurrentPage={setCurrentPage} />
                </div>
              ) : (
                <button 
                  onClick={() => {setShowLoginModal && setShowLoginModal(true); setIsOpen(false);}}
                  className="w-full bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-center text-sm"
                >
                  Sign In
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