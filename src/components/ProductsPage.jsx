import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const ProductsPage = ({ setCurrentPage, setIsAuthenticated }) => {
  const products = [
    {
      id: 'marketsai1',
      name: 'MarketsAI1',
      description: 'Build, backtest and optimize your own trading and investing strategies in stocks and ETFs based on EOD data. A few of the strategies we use are shared for reference. Feel free to customize them as per your needs. We do not offer any advisory or guaranteed returns from any strategy.',
      color: 'teal',
      enabled: true,
      icon: '📊'
    },
    {
      id: 'chatai1',
      name: 'ChatAI1',
      description: 'Much more than ChatGPT! Talk to our Smart AI Assistant (specially trained for Indian stock markets and mutual funds) in natural language, discuss your strategies and investments, seek clarifications, discuss alternatives. Any strategies and investment options suggested by our Smart AI Assistant should not be taken as advice or guarantees for returns.',
      color: 'green',
      enabled: false,
      icon: '🤖'
    },
    {
      id: 'papertraderai1',
      name: 'PaperTraderAI1',
      description: 'Use your broker\'s market data API keys to connect to live market data and deploy your strategies in live environment. Trade with paper money for free to understand real performance of your strategy.',
      color: 'purple',
      enabled: false,
      icon: '📈'
    },
    {
      id: 'scanai1',
      name: 'ScanAI1',
      description: 'Check out our advanced pre-built scanners based on various technical and fundamental indicators. Create your own scanners by interacting in natural language with our smart assistant.',
      color: 'orange',
      enabled: false,
      icon: '🔍'
    }
  ];

  const handleGoogleAuth = (productId) => {
    if (productId === 'marketsai1') {
      setIsAuthenticated(true);
      setCurrentPage('marketsai1-app');
    }
  };

  const getColorClasses = (color, enabled) => {
    const colors = {
      teal: enabled ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-400',
      green: enabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400',
      purple: enabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400',
      orange: enabled ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400'
    };
    return colors[color];
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation setCurrentPage={setCurrentPage} />
      
      {/* Main Content - Scrollable with padding for header and footer */}
      <div className="flex-1 bg-gray-50 pt-16 pb-12 sm:pb-16 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2 sm:mb-3">Our Product Ecosystem</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto px-4">
              Comprehensive AI-powered solutions for modern trading and investment management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative">
                {!product.enabled && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <span className="text-xs italic text-gray-400">Coming soon!</span>
                  </div>
                )}
                
                <div className="flex items-start space-x-3 mb-3">
                  <div className="text-2xl sm:text-3xl">{product.icon}</div>
                  <div className="flex-1">
                    <h3 className={`text-lg sm:text-xl font-bold mb-2 text-${product.color}-600`}>
                      {product.name}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed text-xs sm:text-sm">
                  {product.description}
                </p>
                
                <div className="mt-auto">
                  {product.enabled ? (
                    <button
                      onClick={() => handleGoogleAuth(product.id)}
                      className={`w-full ${getColorClasses(product.color, product.enabled)} text-white px-4 py-2 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Login with Google</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentPage('contact')}
                      className={`w-full ${getColorClasses(product.color, product.enabled)} text-white px-4 py-2 sm:py-3 rounded-lg font-semibold cursor-not-allowed text-sm`}
                      disabled
                    >
                      Coming Soon - Get Notified
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default ProductsPage;