import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const ServicesPage = ({ setCurrentPage }) => (
  <div>
    <Navigation setCurrentPage={setCurrentPage} />
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">Custom Development & Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bespoke AI and fintech solutions tailored to your specific requirements
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-8">Comprehensive services portfolio coming soon...</p>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Discuss Your Project
          </button>
        </div>
      </div>
    </div>
    <Footer setCurrentPage={setCurrentPage} />
  </div>
);

export default ServicesPage;