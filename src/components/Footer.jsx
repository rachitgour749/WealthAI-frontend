import React from 'react';

const Footer = ({ setCurrentPage }) => (
  <footer className="bg-blue-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div>
          <h3 className="text-2xl font-bold mb-6">WealthAI1</h3>
          <p className="text-blue-200 mb-6 leading-relaxed">
            AI-first technology partner for smarter markets, combining deep capital markets expertise with cutting-edge artificial intelligence.
          </p>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
              <span className="text-sm">in</span>
            </div>
            <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
              <span className="text-sm">tw</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-6 text-lg">Products</h4>
          <ul className="space-y-3 text-blue-200">
            <li><button onClick={() => setCurrentPage('marketsai1')} className="hover:text-white transition-colors">MarketsAI1 Platform</button></li>
            <li><a href="https://wealthwisers.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TradeAI1 Execution</a></li>
            <li><span className="text-blue-400">AdvisorAI1 (2025)</span></li>
            <li><span className="text-blue-400">AgentAI1 (2025)</span></li>
            <li><span className="text-blue-400">RiskAI1 (2025)</span></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-6 text-lg">Company</h4>
          <ul className="space-y-3 text-blue-200">
            <li><button onClick={() => setCurrentPage('founders')} className="hover:text-white transition-colors">About Us</button></li>
            <li><button onClick={() => setCurrentPage('services')} className="hover:text-white transition-colors">Services</button></li>
            <li><button onClick={() => setCurrentPage('insights')} className="hover:text-white transition-colors">Insights</button></li>
            <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white transition-colors">Contact</button></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-6 text-lg">Contact</h4>
          <ul className="space-y-3 text-blue-200 text-sm">
            <li>contact@wealthai1.in</li>
            <li>support@marketsai1.in</li>
            <li>partnerships@wealthai1.in</li>
            <li>projects@wealthai1.in</li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-blue-800 pt-8">
        <div className="text-center text-blue-300">
          <p className="mb-4">
            <strong>Serving:</strong> Brokers • RIAs • Fund Managers • Family Offices • Fintech Founders • Serious Traders
          </p>
          <p className="text-sm">
            © 2024 WealthAI1. All rights reserved. | WealthAI1.in | MarketsAI1.in
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;