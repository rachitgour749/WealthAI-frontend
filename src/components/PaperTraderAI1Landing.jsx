import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const PaperTraderAI1Landing = ({ setCurrentPage, currentPage }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={true} />
      
      <section className="relative flex-1 bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 pt-16 pb-12 sm:pb-16 overflow-y-auto">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-purple-100 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/6 w-24 h-24 sm:w-48 sm:h-48 lg:w-80 lg:h-80 bg-blue-100 rounded-full"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 min-h-full flex items-center">
          <div className="text-center w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-purple-600">
              PaperTraderAI1
              <span className="block text-blue-900">Live Market Testing</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl mb-4 sm:mb-6 text-gray-700 leading-relaxed max-w-4xl mx-auto px-4">
              Use your broker's market data API keys to connect to live market data and deploy your strategies in live environment. Trade with paper money for free to understand real performance of your strategy.
            </p>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
              <div className="bg-white p-2 sm:p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-purple-600">Real Data</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600">Live Market Feed</div>
              </div>
              <div className="bg-white p-2 sm:p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-purple-600">Zero Risk</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600">Paper Money Only</div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-sm sm:max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Coming Soon!</h3>
              <div className="text-center py-4 sm:py-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-purple-600 text-lg sm:text-xl lg:text-2xl">📈</span>
                </div>
                <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">PaperTraderAI1 is currently under development. Be the first to know when it launches!</p>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="w-full bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base"
                >
                  Get Notified
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default PaperTraderAI1Landing;