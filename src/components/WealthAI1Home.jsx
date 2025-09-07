import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatAI1Landing from './ChatAI1Landing';
import Login from './Login';

const WealthAI1Home = ({ setCurrentPage, currentPage }) => {
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();

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
      id: 'papertraderai1',
      name: 'PaperTraderAI1',
      description: 'Live market testing with broker API integration. Trade with paper money to validate strategy performance.',
      color: 'purple',
      enabled: false,
      icon: '📈'
    },
    {
      id: 'scanai1',
      name: 'ScanAI1',
      description: 'Advanced pre-built scanners with technical and fundamental indicators. Create custom scans with natural language.',
      color: 'orange',
      enabled: false,
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
    <div className="h-screen flex flex-col overflow-hidden">
      {showLoginModal && (
        <Login onClose={() => setShowLoginModal(false)} setCurrentPage={setCurrentPage} />
      )}
      <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={true} showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      
      {/* Main Content - Compact Cards */}
      <div className="flex-1 pt-20 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 h-full">
            
            {/* Left Card - Hero Section */}
            <div className="group bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/6 w-16 h-16 sm:w-24 sm:h-24 bg-teal-100 rounded-full"></div>
                <div className="absolute bottom-1/4 right-1/6 w-20 h-20 sm:w-32 sm:h-32 bg-blue-100 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-20 sm:h-20 bg-teal-200 rounded-full"></div>
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-center text-center">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 leading-tight text-blue-900">
                  AI-Powered Technology
                  <span className="block text-emerald-600">for Smarter Markets</span>
                </h1>
                <p className="text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 text-gray-700 leading-relaxed">
                  From EOD strategy platforms to bespoke fintech AI solutions — empowering market participants to trade smarter, scale faster, and operate safely.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-4 sm:mb-6">
                  <button
                    onClick={handleTryPlatformClick}
                    className="bg-emerald-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Try MarketsAI1 Platform
                  </button>
                  <button
                    onClick={() => setCurrentPage('contact')}
                    className="bg-white border-2 border-blue-900 text-blue-900 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg"
                  >
                    Schedule a Demo
                  </button>
                </div>
                
                {/* Trust Indicators */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto">
                  <div className="text-center bg-white bg-opacity-70 p-2 rounded-lg">
                    <div className="text-xs sm:text-sm lg:text-base font-bold text-emerald-600">AI-First</div>
                    <div className="text-xs text-gray-600">Technology Stack</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-70 p-2 rounded-lg">
                    <div className="text-xs sm:text-sm lg:text-base font-bold text-blue-600">Compliance</div>
                    <div className="text-xs text-gray-600">By Design</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-70 p-2 rounded-lg">
                    <div className="text-xs sm:text-sm lg:text-base font-bold text-teal-600">Multi-Broker</div>
                    <div className="text-xs text-gray-600">Integration</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-70 p-2 rounded-lg">
                    <div className="text-xs sm:text-sm lg:text-base font-bold text-purple-600">Professional</div>
                    <div className="text-xs text-gray-600">Grade Platform</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card - Products Section - Same styling as left card */}
            <div className="group bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 right-1/6 w-16 h-16 sm:w-24 sm:h-24 bg-teal-100 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/6 w-20 h-20 sm:w-32 sm:h-32 bg-blue-100 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-20 sm:h-20 bg-teal-200 rounded-full"></div>
              </div>
              
              <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-900 mb-2 sm:mb-3">Our Product Ecosystem</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Comprehensive AI-powered solutions for modern trading and investment management
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white bg-opacity-80 p-3 sm:p-4 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
                      {!product.enabled && (
                        <div className="absolute top-1 right-1">
                          <span className="text-xs italic text-gray-400">Coming soon!</span>
                        </div>
                      )}
                      
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                        <span className="text-sm sm:text-base">{product.icon}</span>
                      </div>
                      
                      <h3 className={`text-sm sm:text-base font-bold mb-1 sm:mb-2 text-${product.color}-600`}>
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-700 mb-3 text-xs leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
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
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white bg-opacity-40 hover:bg-opacity-60 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default WealthAI1Home;