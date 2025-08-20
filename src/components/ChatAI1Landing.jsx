import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const ChatAI1Landing = ({ setCurrentPage }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation setCurrentPage={setCurrentPage} transparent={true} />
      
      <section className="relative flex-1 bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 pt-16 pb-12 sm:pb-16 overflow-y-auto">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-green-100 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/6 w-24 h-24 sm:w-48 sm:h-48 lg:w-80 lg:h-80 bg-blue-100 rounded-full"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 min-h-full flex items-center">
          <div className="text-center w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-green-600">
              ChatAI1
              <span className="block text-blue-900">Smart Market Assistant</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl mb-4 sm:mb-6 text-gray-700 leading-relaxed max-w-4xl mx-auto px-4">
              Much more than ChatGPT! Talk to our Smart AI Assistant specially trained for Indian stock markets and mutual funds in natural language, discuss your strategies and investments, seek clarifications, discuss alternatives.
            </p>
            
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg mb-4 sm:mb-6 max-w-4xl mx-auto">
              <p className="text-xs sm:text-sm lg:text-base">
                <strong>Disclaimer:</strong> Any strategies and investment options suggested by our Smart AI Assistant should not be taken as advice or guarantees for returns.
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-sm sm:max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Coming Soon!</h3>
              <div className="text-center py-4 sm:py-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                  <span className="text-green-600 text-lg sm:text-xl lg:text-2xl">🤖</span>
                </div>
                <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">ChatAI1 is currently under development. Be the first to know when it launches!</p>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="w-full bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
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

export default ChatAI1Landing;