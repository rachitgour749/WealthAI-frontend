import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const MarketsAI1Landing = ({ setCurrentPage, currentPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage('marketsai1-app');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={true} />
      
      {/* Hero Section with padding for header and footer */}
      <section className="relative flex-1 bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 pt-16 pb-12 sm:pb-16 overflow-y-auto">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-teal-200 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/6 w-24 h-24 sm:w-48 sm:h-48 lg:w-80 lg:h-80 bg-teal-100 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 sm:w-40 sm:h-40 lg:w-60 lg:h-60 bg-blue-100 rounded-full"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center min-h-full">
            <div className="order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-teal-600">
                MarketsAI1
                <span className="block text-blue-900">Strategy Lab</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl mb-4 sm:mb-6 text-gray-700 leading-relaxed">
                AI-enhanced, compliance-conscious platform for positional & swing trading strategies using EOD data for equities and ETFs.
              </p>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600">50+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Built-in Strategies</div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600">99.9%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Uptime SLA</div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600">10+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Broker APIs</div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 bg-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Access MarketsAI1 Platform</h3>
              
              {!isLoading ? (
                <div>
                  <button
                    onClick={handleGoogleAuth}
                    className="w-full bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="bg-teal-50 p-2 sm:p-3 rounded-lg mb-2 sm:mb-3">
                      <h4 className="font-semibold text-teal-800 mb-1 sm:mb-2 text-xs sm:text-sm">Who Can Access:</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs text-teal-700">
                        <div>• RIAs & Advisors</div>
                        <div>• Fund Managers</div>
                        <div>• Brokers & Sub-brokers</div>
                        <div>• Family Offices</div>
                        <div>• Serious Traders</div>
                        <div>• Financial Educators</div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 text-center">
                      Secure OAuth2 authentication • No credit card required for trial
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-teal-600 mx-auto mb-2 sm:mb-3"></div>
                  <p className="text-gray-600 text-xs sm:text-sm">Authenticating with Google...</p>
                  <p className="text-xs text-gray-500 mt-1 sm:mt-2">Redirecting to your MarketsAI1 workspace</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default MarketsAI1Landing;