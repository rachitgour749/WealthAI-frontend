import React, { useState, useEffect } from 'react';

const Navigation = ({ isMarketsAI1 = false, setCurrentPage, transparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
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
    
  const textColor = 'text-gray-700';
  const logoColor = isMarketsAI1 ? 'text-teal-600' : 'text-blue-900';
  
  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`text-2xl font-bold ${logoColor} hover:opacity-80 transition-opacity`}
          >
            {isMarketsAI1 ? 'MarketsAI1' : 'WealthAI1'}
          </button>
          
          <div className="hidden lg:flex items-center space-x-8">
            <button onClick={() => setCurrentPage('home')} className={`${textColor} hover:text-blue-600 transition-colors font-medium`}>
              Home
            </button>
            <button onClick={() => setCurrentPage('products')} className={`${textColor} hover:text-blue-600 transition-colors font-medium`}>
              Products
            </button>
            <button onClick={() => setCurrentPage('services')} className={`${textColor} hover:text-blue-600 transition-colors font-medium`}>
              Services
            </button>
            <button onClick={() => setCurrentPage('founders')} className={`${textColor} hover:text-blue-600 transition-colors font-medium`}>
              About Us
            </button>
            <button onClick={() => setCurrentPage('insights')} className={`${textColor} hover:text-blue-600 transition-colors font-medium`}>
              Insights
            </button>
            <button onClick={() => setCurrentPage('contact')} className={`${textColor} hover:text-blue-600 transition-colors font-medium`}>
              Contact
            </button>
            <a 
              href="https://wealthwisers.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${textColor} hover:text-green-600 transition-colors font-medium`}
            >
              TradeAI1 →
            </a>
            <button 
              onClick={() => setCurrentPage('marketsai1')}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Access MarketsAI1
            </button>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden ${textColor}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {isOpen && (
          <div className="lg:hidden pb-4 bg-white border-t">
            <div className="flex flex-col space-y-3 pt-4">
              <button onClick={() => {setCurrentPage('home'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium">Home</button>
              <button onClick={() => {setCurrentPage('products'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium">Products</button>
              <button onClick={() => {setCurrentPage('services'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium">Services</button>
              <button onClick={() => {setCurrentPage('founders'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium">About Us</button>
              <button onClick={() => {setCurrentPage('insights'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium">Insights</button>
              <button onClick={() => {setCurrentPage('contact'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium">Contact</button>
              <a href="https://wealthwisers.in" className="text-gray-700 hover:text-green-600 text-left font-medium">TradeAI1 →</a>
              <button 
                onClick={() => {setCurrentPage('marketsai1'); setIsOpen(false);}}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-center"
              >
                Access MarketsAI1
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;