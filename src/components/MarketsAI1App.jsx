import React, { useState } from 'react';
import ETFStrategy from '../pages/ETFStrategy';


const MarketsAI1App = ({ setCurrentPage }) => {
  const [activeSection, setActiveSection] = useState('default');

  const handleLogout = () => {
    setCurrentPage('marketsai1');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <div className="bg-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">MarketsAI1</h1>
            <span className="bg-teal-700 px-3 py-1 rounded-full text-sm">Strategy Lab</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-teal-100">Welcome back!</span>
            <button 
              onClick={handleLogout}
              className="bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              // { id: 'dashboard', name: 'Dashboard' },
              { id: 'strategy', name: 'Strategys' },
              // { id: 'backtest', name: 'Backtest' },
              // { id: 'paper-trade', name: 'Paper Trade' }
              // { id: 'marketplace', name: 'Marketplace' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Strategy List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection == "default"? 
        <div className="flex space-x-8">
        {[
          { id: 'etf-strategy', name: 'ETF Strategy'},
          { id: 'button2', name: 'RS Strategy Coming Soon'},
          { id: 'button3', name: 'RS Strategy Coming Soon'},
          { id: 'button4', name: 'RS Strategy Coming Soon'},
          { id: 'button5', name: 'RS Strategy Coming Soon'}
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`py-[20px] px-[20px] rounded-[8px] font-semibold text-[15px] ${
              activeSection === section.id
                ? 'bg-teal-600 text-white'
                : 'bg-teal-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>
       : 
      <div>
        <button className='border px-4 py-2 rounded-[8px] ml-[31px] font-semibold text-[15px] bg-blue-900 text-white mb-4' onClick={() => setActiveSection("default")}>Back</button>
         <ETFStrategy/>
      </div>}
        
      </div>
      
      {/* Main Content */}
      {/* <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Trading Dashboard</h2>
            
            <div className="grid lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-teal-600 mb-2">Active Strategies</h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">3</div>
                <p className="text-sm text-gray-600">Currently running</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-blue-600 mb-2">Total Return</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">+15.2%</div>
                <p className="text-sm text-gray-600">Year to date</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-purple-600 mb-2">Sharpe Ratio</h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">1.34</div>
                <p className="text-sm text-gray-600">Risk-adjusted returns</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-orange-600 mb-2">Max Drawdown</h3>
                <div className="text-3xl font-bold text-red-600 mb-2">-5.8%</div>
                <p className="text-sm text-gray-600">Historical worst</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => setActiveSection('strategies')}
                    className="w-full bg-teal-600 text-white p-4 rounded-lg hover:bg-teal-700 transition-colors text-left flex items-center space-x-3"
                  >
                    <span>🔧</span>
                    <span>Build New Strategy</span>
                  </button>
                  <button 
                    onClick={() => setActiveSection('backtest')}
                    className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-left flex items-center space-x-3"
                  >
                    <span>📊</span>
                    <span>Run Backtest</span>
                  </button>
                  <button 
                    onClick={() => setActiveSection('marketplace')}
                    className="w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left flex items-center space-x-3"
                  >
                    <span>🏪</span>
                    <span>Browse Marketplace</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Portfolio Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Momentum Strategy v2.1</div>
                      <div className="text-sm text-gray-600">+18.3% return • Running live</div>
                    </div>
                    <div className="text-green-600 font-bold">+$12,450</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Mean Reversion Bot</div>
                      <div className="text-sm text-gray-600">+8.7% return • Paper trading</div>
                    </div>
                    <div className="text-blue-600 font-bold">+$5,230</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Factor Rotation</div>
                      <div className="text-sm text-gray-600">+12.1% return • Backtesting</div>
                    </div>
                    <div className="text-purple-600 font-bold">+$7,890</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection !== 'dashboard' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Module
              </h3>
              <p className="text-gray-600 mb-8">
                This section is under development. Full functionality coming soon.
              </p>
              <button 
                onClick={() => setActiveSection('dashboard')}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default MarketsAI1App;