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
        <div className="flex justify-between items-center h-12 sm:h-16">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`text-lg sm:text-xl lg:text-2xl font-bold ${logoColor} hover:opacity-80 transition-opacity`}
          >
            {isMarketsAI1 ? 'MarketsAI1' : 'WealthAI1'}
          </button>
          
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            <button onClick={() => setCurrentPage('home')} className={`${textColor} hover:text-blue-600 transition-colors font-medium text-sm xl:text-base`}>
              Home
            </button>
            
            <button 
              onClick={() => setCurrentPage('products')} 
              className={`${textColor} hover:text-blue-600 transition-colors font-medium text-sm xl:text-base`}
            >
              Products
            </button>
            
            <button onClick={() => setCurrentPage('services')} className={`${textColor} hover:text-blue-600 transition-colors font-medium text-sm xl:text-base`}>
              Services
            </button>
            <button onClick={() => setCurrentPage('founders')} className={`${textColor} hover:text-blue-600 transition-colors font-medium text-sm xl:text-base`}>
              About Us
            </button>
            <button onClick={() => setCurrentPage('insights')} className={`${textColor} hover:text-blue-600 transition-colors font-medium text-sm xl:text-base`}>
              Insights
            </button>
            <button onClick={() => setCurrentPage('contact')} className={`${textColor} hover:text-blue-600 transition-colors font-medium text-sm xl:text-base`}>
              Contact
            </button>
            <button 
              onClick={() => setCurrentPage('contact')}
              className="bg-blue-900 text-white px-3 sm:px-4 lg:px-6 py-1 sm:py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-xs sm:text-sm lg:text-base"
            >
              Schedule a Demo
            </button>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden ${textColor} p-2`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {isOpen && (
          <div className="lg:hidden pb-4 bg-white border-t">
            <div className="flex flex-col space-y-3 pt-4">
              <button onClick={() => {setCurrentPage('home'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium text-sm">Home</button>
              <button onClick={() => {setCurrentPage('products'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium text-sm">Products</button>
              <button onClick={() => {setCurrentPage('services'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium text-sm">Services</button>
              <button onClick={() => {setCurrentPage('founders'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium text-sm">About Us</button>
              <button onClick={() => {setCurrentPage('insights'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium text-sm">Insights</button>
              <button onClick={() => {setCurrentPage('contact'); setIsOpen(false);}} className="text-gray-700 hover:text-blue-600 text-left font-medium text-sm">Contact</button>
              <button 
                onClick={() => {setCurrentPage('contact'); setIsOpen(false);}}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-center text-sm"
              >
                Schedule a Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;