import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const ProductsPage = ({ setCurrentPage }) => (
  <div>
    <Navigation setCurrentPage={setCurrentPage} />
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">Our Product Ecosystem</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive AI-powered solutions for modern trading and investment management
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-8">Detailed product catalog coming soon...</p>
          <button 
            onClick={() => setCurrentPage('marketsai1')}
            className="bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Try MarketsAI1 Now
          </button>
        </div>
      </div>
    </div>
    <Footer setCurrentPage={setCurrentPage} />
  </div>
);

export default ProductsPage;