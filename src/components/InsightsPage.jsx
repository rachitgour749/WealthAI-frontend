import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const InsightsPage = ({ setCurrentPage, currentPage }) => (
  <div>
    <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">Insights & Research</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thought leadership and market insights from our team
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-lg text-gray-700">Research articles and insights coming soon...</p>
        </div>
      </div>
    </div>
    <Footer setCurrentPage={setCurrentPage} />
  </div>
);

export default InsightsPage;