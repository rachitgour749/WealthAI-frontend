import React, { useState } from 'react';
import ETFStrategy from '../pages/ETFStrategy';
import AIAssistant from '../pages/AIAssistant/AIAssistant';

const MarketsAI1App = ({ setCurrentPage }) => {
  const [activeSection, setActiveSection] = useState('default');

  const handleLogout = () => {
    setCurrentPage('marketsai1');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* App Header */}
      <div className="bg-teal-600 text-white shadow-lg flex-shrink-0">
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



      {/* Main Content Area - Now properly sized and scrollable */}
      <div className="flex-1 overflow-auto">
        {activeSection === "default" ? (
          <div className="min-h-full bg-gradient-to-br from-slate-50 to-teal-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  AI-Powered Trading Strategies
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Choose from our suite of advanced algorithmic trading strategies designed for modern markets
                </p>
              </div>

              {/* Strategy Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[
                  { 
                    id: 'etf-strategy', 
                    name: 'ETF Rotation Strategy',
                    description: 'Momentum-based ETF rotation with comprehensive analysis',
                    icon: '📊',
                    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
                    borderColor: 'border-emerald-400',
                    available: true,
                    category: 'Active'
                  },
                  { 
                    id: 'ai-momentum', 
                    name: 'AI Momentum Alpha',
                    description: 'Machine learning powered momentum detection system',
                    icon: '🤖',
                    gradient: 'from-blue-200 to-blue-300',
                    borderColor: 'border-blue-200',
                    available: true,
                    category: 'AI-Driven'
                  },
                  { 
                    id: 'smart-sector', 
                    name: 'Smart Sector Rotation',
                    description: 'Intelligent sector allocation using economic indicators',
                    icon: '🔄',
                    gradient: 'from-purple-200 to-purple-300',
                    borderColor: 'border-purple-200',
                    available: false,
                    category: 'Rotation'
                  },
                  { 
                    id: 'neural-swing', 
                    name: 'Neural Swing Trader',
                    description: 'Deep learning network for swing trading signals',
                    icon: '🧠',
                    gradient: 'from-orange-200 to-orange-300',
                    borderColor: 'border-orange-200',
                    available: false,
                    category: 'AI-Driven'
                  },
                  { 
                    id: 'quantum-mean', 
                    name: 'Quantum Mean Reversion',
                    description: 'Advanced statistical arbitrage using quantum algorithms',
                    icon: '⚛️',
                    gradient: 'from-cyan-200 to-cyan-300',
                    borderColor: 'border-cyan-200',
                    available: false,
                    category: 'Quantitative'
                  },
                  { 
                    id: 'adaptive-trend', 
                    name: 'Adaptive Trend Following',
                    description: 'Self-adjusting trend identification with ML optimization',
                    icon: '📈',
                    gradient: 'from-emerald-200 to-emerald-300',
                    borderColor: 'border-emerald-200',
                    available: false,
                    category: 'Trend'
                  },
                  { 
                    id: 'ml-breakouts', 
                    name: 'ML Breakout Detection',
                    description: 'Machine learning powered breakout pattern recognition',
                    icon: '🚀',
                    gradient: 'from-amber-200 to-amber-300',
                    borderColor: 'border-amber-200',
                    available: false,
                    category: 'Pattern'
                  },
                  { 
                    id: 'dynamic-risk', 
                    name: 'Dynamic Risk Parity',
                    description: 'Real-time risk allocation using volatility forecasting',
                    icon: '⚖️',
                    gradient: 'from-indigo-200 to-indigo-300',
                    borderColor: 'border-indigo-200',
                    available: false,
                    category: 'Risk'
                  },
                  { 
                    id: 'algo-pairs', 
                    name: 'Algorithmic Pairs Trading',
                    description: 'Statistical arbitrage with cointegration analysis',
                    icon: '🔗',
                    gradient: 'from-rose-200 to-rose-300',
                    borderColor: 'border-rose-200',
                    available: false,
                    category: 'Arbitrage'
                  },
                  { 
                    id: 'dl-volatility', 
                    name: 'Deep Learning Volatility',
                    description: 'Neural networks for volatility trading and hedging',
                    icon: '⚡',
                    gradient: 'from-violet-200 to-violet-300',
                    borderColor: 'border-violet-200',
                    available: false,
                    category: 'Volatility'
                  }
                ].map((strategy) => (
                  <div
                    key={strategy.id}
                    className={`group relative ${strategy.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => strategy.available && setActiveSection(strategy.id)}
                  >
                    {/* Card */}
                    <div className={`
                      relative bg-white rounded-xl shadow-md border-2 ${strategy.borderColor} overflow-hidden h-64
                      transition-all duration-300 ease-out
                      ${strategy.available 
                        ? 'hover:shadow-xl hover:-translate-y-1 hover:scale-105 ring-2 ring-emerald-200 ring-opacity-50 shadow-emerald-100' 
                        : 'opacity-80'
                      }
                      transform-gpu
                    `}>
                      
                      {/* Coming Soon Badge */}
                      {!strategy.available && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="text-xs font-medium text-blue-600 italic bg-white bg-opacity-90 px-2 py-1 rounded-md shadow-sm">
                            Coming Soon!
                          </span>
                        </div>
                      )}

                      {/* Live indicator for available strategy */}
                      {strategy.available && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                            <span className="text-xs font-medium text-green-600 bg-white bg-opacity-90 px-2 py-1 rounded-md shadow-sm">
                              LIVE
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Category Badge - only for non-available strategies */}
                      {!strategy.available && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-700 border">
                            {strategy.category}
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div className={`h-20 bg-gradient-to-br ${strategy.gradient} relative overflow-hidden ${
                        strategy.available ? 'shadow-lg' : ''
                      }`}>
                        {/* Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-12 h-12 bg-white bg-opacity-90 rounded-lg flex items-center justify-center text-2xl backdrop-blur-sm border border-white border-opacity-50 shadow-lg ${
                            strategy.available ? 'transform group-hover:scale-110 transition-transform duration-300' : ''
                          }`}>
                            {strategy.icon}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 text-center">
                        <h3 className={`text-base font-bold mb-2 transition-colors leading-tight text-center ${
                          strategy.available 
                            ? 'text-emerald-700 group-hover:text-emerald-800' 
                            : 'text-gray-700 group-hover:text-gray-800'
                        }`}>
                          {strategy.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3 text-center">
                          {strategy.description}
                        </p>

                        {/* Status Indicator */}
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            strategy.available ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                          }`}></div>
                          <span className={`text-xs ${
                            strategy.available ? 'text-emerald-600 font-semibold' : 'text-gray-600'
                          }`}>
                            {strategy.available ? 'Available' : 'In Development'}
                          </span>
                          
                          {strategy.available && (
                            <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subtle Hover Effect */}
                      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none ${
                        strategy.available 
                          ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600' 
                          : `bg-gradient-to-br ${strategy.gradient}`
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Strategy Button */}
              <div className="mt-12 text-center">
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <span className="mr-2">🛠️</span>
                  Build Your Custom Strategy
                </button>
                <p className="mt-3 text-sm text-gray-600">
                  Need a tailored solution? Our team can develop custom strategies for your specific requirements.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {activeSection === 'etf-strategy' && (
              <ETFStrategy onBack={() => setActiveSection("default")} />
            )}
            {activeSection === 'ai-momentum' && (
              <AIAssistant onBack={() => setActiveSection("default")} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketsAI1App;