import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import TrialEnableModal from './TrialEnableModal';
import ActivateTrialModal from './ActivateTrialModal';
import PaymentPopup from './Payments/PaymentPopup';
import UserAvatar from './UserAvatar';
import MarketAILogo from '../Assets/MarketsAI.png';
import ChatAILogo from '../Assets/ChatAI.png';
import AutomationAILogo from '../Assets/AutomationAI.png';
import logo1 from '../Assets/Logo1.png';
import heading from '../Assets/Heading.png'

const Navigation = ({ setCurrentPage, currentPage, transparent = false, showLoginModal, setShowLoginModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [trialModal, setTrialModal] = useState({ open: false, name: '', code: '' });
  const [activateTrialModal, setActivateTrialModal] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const { subscription } = useSubscription();
  const productAccess = require('../hooks/useProductAccess').default();

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
    { id: 'automationai1', name: 'AutomationAI', icon: '🔍', color: 'orange', page: 'automationai' },
    { id: 'tradeai1', name: 'TradeAI1', icon: '📈', color: 'purple', page: 'tradeai1' }
  ];



  const renderLogo = (currentPage) => {
    switch (currentPage) {
      case 'marketsai1-app':
        return (
          <div className='flex justify-center flex-col h-[30px] mt-[50px] items-center justify-center'>
            <h1 className="text-2xl sm:text-3xl lg:text-[15px] font-bold text-teal-700 mb-3 sm:mb-4 mt-[-35px]">
              <img src={MarketAILogo} alt="AutomationAI" className="w-[250px] h-[35px] mt-[40px]" />
              <p className='text-sm text-teal-600 flex justify-center items-center'>Powered by Wealth<span style={{ color: '#ca8a04', fontFamily: 'Noto Sans Arabic', marginLeft: '3px', marginTop: '3px' }} >AI1</span></p>
            </h1>
          </div>
        );
      case 'chatai1':
        return (
          <div className='flex justify-center flex-col h-[30px] mt-[50px] items-center justify-center'>
            <h1 className="text-2xl sm:text-3xl lg:text-[15px] font-bold text-teal-700 mb-3 sm:mb-4 mt-[-35px]">
              <img src={ChatAILogo} alt="AutomationAI" className="w-[170px]  h-[33px] mt-[40px]" />
              <p className='text-sm text-teal-600 flex justify-center items-center'>Powered by Wealth<span style={{ color: '#ca8a04', fontFamily: 'Noto Sans Arabic', marginLeft: '3px', marginTop: '3px' }} >AI1</span></p>
            </h1>
          </div>
        );
      case 'automationai':
        return (
          <div className='flex justify-center flex-col h-[30px] mt-[50px] items-center justify-center'>
            <h1 className="text-2xl sm:text-3xl lg:text-[15px] font-bold text-teal-700 mb-3 sm:mb-4 mt-[-35px]">
              <img src={AutomationAILogo} alt="AutomationAI" className="w-[250px] h-[33px] mt-[40px]" />
              <p className='text-sm text-teal-600 flex justify-center items-center'>Powered by Wealth<span style={{ color: '#ca8a04', fontFamily: 'Noto Sans Arabic', marginLeft: '3px', marginTop: '3px' }} >AI1</span></p>
            </h1>
          </div>
        );
      default:
        return (
          <div className='flex justify-center flex-col h-[30px] mt-[55px] items-center justify-center'>
            <h1 className="text-2xl sm:text-3xl lg:text-[15px] font-bold text-teal-700 mb-3 sm:mb-4 mt-[-35px]">
              <img src={heading} alt="AutomationAI" className="w-[240px] ml-[20px] h-[40px] mt-[30px]" />
              <p className='text-sm text-teal-600 flex justify-center items-center'>Intelligent&nbsp;Finance.&nbsp; Automated&nbsp;Growth.</p>
            </h1>
          </div>
        );
    }
  }

  // Product definitions with their page mappings
  const products = [
    { id: 'marketsai1', name: 'MarketsAI1', icon: '📊', color: 'teal', page: 'marketsai1-app' },
    { id: 'chatai1', name: 'ChatAI1', icon: '🤖', color: 'green', page: 'chatai1' },
    { id: 'scanai1', name: 'ScanAI1', icon: '🔍', color: 'orange', page: 'scanai1' },
    { id: 'tradeai1', name: 'TradeAI1', icon: '📈', color: 'purple', page: 'tradeai1' }
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
    if (currentPage === 'tradeai1') return 'TradeAI1';
    if (currentPage === 'automationai') return 'AutomationAI';
    if (currentPage === 'products') return 'Products';
    if (currentPage === 'services') return 'Services';
    if (currentPage === 'founders') return 'About Us';
    if (currentPage === 'insights') return 'Insights';
    if (currentPage === 'contact') return 'Contact';
    if (currentPage === 'profile') return 'Profile';
    return product.name;
  };

  // Centralized guarded navigation for product pages
  const productPageToCode = {
    'marketsai1-app': { code: 'MARKETAI', name: 'Market AI' },
    'marketsai1': { code: 'MARKETAI', name: 'Market AI' },
    'chatai1': { code: 'CHATAI', name: 'Chat AI' },
    'tradeai1': { code: 'TRADAI', name: 'Trade AI' },
    'automationai': { code: 'AUTOMATIONAI', name: 'Automation AI' },
    'automationai1': { code: 'AUTOMATIONAI', name: 'Automation AI' },
  };

  const handleNavigation = async (page) => {
    // Disable ChatAI - coming soon
    if (page === 'chatai1') {
      return;
    }
    // Bypass access checks for AutomationAI: it's free-to-access
    if (page === 'automationai') {
      setCurrentPage(page);
      setIsOpen(false);
      return;
    }
    // If it's a product page, enforce access gating
    if (productPageToCode[page]) {
      if (loading) {
        console.log('Authentication still loading...');
        return;
      }

      if (!isAuthenticated || !user) {
        console.log('User not authenticated, showing login modal for product:', page);
        if (setShowLoginModal) setShowLoginModal(true);
        return;
      }

      // Check if trial is not activated - show activate trial modal instead
      // Same logic as home page
      if (!subscription?.is_trial_active) {
        setActivateTrialModal(true);
        setIsOpen(false);
        return;
      }

      const { code, name } = productPageToCode[page];
      
      // Map page names to product codes (same as home page)
      const codeMap = {
        'marketsai1-app': 'MARKETAI',
        'marketsai1': 'MARKETAI',
        'chatai1': 'CHATAI',
        'tradeai1': 'TRADAI',
        'automationai1': 'AUTOMATIONAI',
        'automationai': 'AUTOMATIONAI'
      };
      
      // Use the mapped code or fallback to the code from productPageToCode
      const productCode = codeMap[page] || code;
      const productName = (page === 'marketsai1-app' || page === 'marketsai1') ? 'Market AI' : 
                         page === 'tradeai1' ? 'Trade AI' : 
                         page === 'automationai' || page === 'automationai1' ? 'Automation AI' :
                         page === 'chatai1' ? 'Chat AI' :
                         name;

      const result = await productAccess.handleProductClick(
        productCode,
        productName,
        () => setIsPaymentOpen(true),
        (pCode, pName) => setTrialModal({ open: true, code: pCode, name: pName })
      );

      if (result.success) {
        // Same navigation logic as home page
        if (page === 'marketsai1' || page === 'marketsai1-app') {
          setCurrentPage('marketsai1-app');
        } else if (page === 'tradeai1') {
          // TradAI opens in a new tab, don't change current page
          window.open('https://trade.wealthwisers.in/', '_blank');
        } else {
          setCurrentPage(page);
        }
        setIsOpen(false);
      }
      return;
    }

    // Non-product pages: keep existing auth gating for protected pages
    const protectedPages = ['products', 'papertraderai1', 'scanai1', 'profile'];

    if (loading) {
      console.log('Authentication still loading...');
      return;
    }

    if (protectedPages.includes(page) && (!isAuthenticated || !user)) {
      console.log('User not authenticated, showing login modal for:', page);
      if (setShowLoginModal) setShowLoginModal(true);
      return;
    }

    setCurrentPage(page);
    setIsOpen(false);
  };

  const currentProduct = getCurrentProduct();
  const pageTitle = getPageTitle();
  console.log('pageTitle', pageTitle);

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${navBg} border-b-2 border-gray-300 shadow-lg`}>
      {/* Centered site headline (pointer-events-none so it doesn't block nav clicks) */}
      <div className="absolute inset-x-0 top-0 h-16 lg:h-20 flex items-center justify-center pointer-events-none">
        <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-blue-900 text-center">
          {/* <p className='text-5xl font-[800] text-blue-900 mt-[10px] mb-[-8px]'>WEALTH <span className='text-[#ca8a04] ml-[-10px]'>AI1</span></p> */}
          {renderLogo(currentPage)}

        </h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Left Side - Brand and Title */}
          <div className="flex items-center  space-x-4">
            {/* Mobile Brand */}
            <div className="lg:hidden">
              <div className="flex items-center space-x-2 cursor-pointer"
                onClick={() => handleNavigation('home')}
              >
                <img src={logo1} alt="WealthAI1" className="w-7 h-7 border-1 border-black object-contain" />
                <h1 className="font-bold text-lg text-blue-900 hover:opacity-80 transition-opacity">
                  WealthAI1
                </h1>
              </div>
            </div>

            {/* Desktop Page Title */}
            <div className="hidden lg:block border-1 border-gray-200">
              <div className="flex items-center cursor-pointer "
                onClick={() => handleNavigation('home')}
              >
                <img src={logo1} alt="WealthAI1" className="w-[90px] h-[60px]" />
                {/* <h1 className="font-bold text-xl ml-[-40px] lg:text-2xl text-blue-900 hover:opacity-80 transition-opacity mt-9 border-1 ">
                  {pageTitle}
                </h1> */}
              </div>
            </div>
          </div>

          {/* Right Side - Navigation and User Controls */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Desktop Navigation Links */}
            {/* <div className="hidden lg:flex items-center space-x-6">
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
            </div> */}

            {/* Desktop Compact Navigation Bar */}
            <div className="hidden lg:flex items-center bg-gradient-to-r from-slate-100 via-gray-50 to-slate-100 rounded-xl p-1 space-x-1 shadow-lg border border-gray-200/50 backdrop-blur-sm">
              {compactNavItems.map((item) => {
                const isActive = currentPage === item.page;
                const isChatAI = item.id === 'chatai1';

                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => !isChatAI && handleNavigation(item.page)}
                      disabled={isChatAI}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
                        isChatAI 
                          ? 'cursor-not-allowed opacity-50 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400'
                          : `transform hover:scale-110 hover:-translate-y-1 ${isActive
                            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/50 ring-1 ring-teal-300/50'
                            : 'bg-gradient-to-br from-white to-gray-50 text-gray-600 hover:from-teal-50 hover:to-teal-100 shadow-sm hover:shadow-md border border-gray-200/50'
                          }`
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


            {/* User Avatar - Only show when authenticated */}
            {isAuthenticated && (
              <div className="flex items-center">
                <UserAvatar setCurrentPage={setCurrentPage} />
              </div>
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
                  const isChatAI = item.id === 'chatai1';

                  return (
                    <button
                      key={item.id}
                      onClick={() => { !isChatAI && handleNavigation(item.page); setIsOpen(false); }}
                      disabled={isChatAI}
                      className={`flex flex-col items-center space-y-2 px-3 py-4 rounded-xl transition-all duration-300 ${
                        isChatAI
                          ? 'cursor-not-allowed opacity-50 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400'
                          : isActive
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-gray-50 to-white text-gray-600 hover:from-blue-50 hover:to-blue-100 shadow-md border border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${isActive
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
                  onClick={() => { handleNavigation('home'); setIsOpen(false); }}
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${currentPage === 'home' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span>🏠</span>
                  <span className="font-medium text-sm">Home</span>
                </button>
                <button
                  onClick={() => { handleNavigation('products'); setIsOpen(false); }}
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${currentPage === 'products' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span>📦</span>
                  <span className="font-medium text-sm">Products</span>
                </button>
                <button
                  onClick={() => { handleNavigation('services'); setIsOpen(false); }}
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${currentPage === 'services' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span>⚙️</span>
                  <span className="font-medium text-sm">Services</span>
                </button>
                <button
                  onClick={() => { handleNavigation('contact'); setIsOpen(false); }}
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-lg transition-colors ${currentPage === 'contact' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span>📞</span>
                  <span className="font-medium text-sm">Contact</span>
                </button>
              </div>
            </div>

            {/* User Section for Mobile - Only show when authenticated */}
            {isAuthenticated && (
              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-center py-2">
                  <UserAvatar setCurrentPage={setCurrentPage} />
                </div>
              </div>
            )}
          </div>
        )}
        {/* Trial Enable Modal */}
        <TrialEnableModal 
          isOpen={trialModal.open}
          onClose={() => setTrialModal({ open: false, name: '', code: '' })}
          productName={trialModal.name}
          productCode={trialModal.code}
          userEmail={user?.email}
          onTrialEnabled={() => setTrialModal({ open: false, name: '', code: '' })}
        />
        {/* Activate Trial Modal */}
        <ActivateTrialModal
          isOpen={activateTrialModal}
          onClose={() => setActivateTrialModal(false)}
        />
        {/* Payment Popup */}
        <PaymentPopup isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
      </div>
    </nav>
  );
};

export default Navigation;