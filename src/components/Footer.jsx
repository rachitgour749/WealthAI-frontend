import React from 'react';

const Footer = ({ setCurrentPage }) => (
  <footer className="bg-gradient-to-r from-blue-900 via-teal-800 to-blue-900 text-white h-12 sm:h-16 flex-shrink-0 border-t border-teal-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div className="flex items-center justify-between h-full">
        {/* Left Side - Company Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <h3 className="text-xs sm:text-sm font-bold">WealthAI1</h3>
          <div className="hidden md:flex items-center space-x-2 text-xs text-blue-200">
            <span>AI-first technology for smarter markets</span>
          </div>
        </div>
        
        {/* Center - Products */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          <button onClick={() => setCurrentPage('marketsai1')} className="text-xs text-blue-200 hover:text-teal-300 transition-colors">
            MarketsAI1
          </button>
          <button onClick={() => setCurrentPage('chatai1')} className="text-xs text-blue-200 hover:text-teal-300 transition-colors">
            ChatAI1
          </button>
          <button onClick={() => setCurrentPage('papertraderai1')} className="text-xs text-blue-200 hover:text-teal-300 transition-colors">
            PaperTraderAI1
          </button>
          <button onClick={() => setCurrentPage('scanai1')} className="text-xs text-blue-200 hover:text-teal-300 transition-colors">
            ScanAI1
          </button>
        </div>
        
        {/* Right Side - Company Links & Contact */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          <div className="hidden lg:flex items-center space-x-3">
            <button onClick={() => setCurrentPage('founders')} className="text-xs text-blue-200 hover:text-teal-300 transition-colors">
              About
            </button>
            <button onClick={() => setCurrentPage('contact')} className="text-xs text-blue-200 hover:text-teal-300 transition-colors">
              Contact
            </button>
          </div>
          <div className="text-xs text-blue-300">
            © 2024 WealthAI1
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;