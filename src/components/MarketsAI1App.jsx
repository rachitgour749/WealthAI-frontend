import React, { useState } from 'react';
import ETFStrategy from '../pages/ETFStrategy';
import StockStrategy from '../pages/StockStrategy';
import Navigation from './Navigation';
import RSStrategy from '../pages/RSStrategy';
import RSETFStrategy from '../pages/RSETFStrategy';
import MarketsAI1Logo from '../Assets/MarketAI1Logo.png';
import MarketsAI from '../Assets/MarketsAI.png';
import WealthAIAutomations from './AutomationAI/WealthAIAutomations';
import Heading from '../Assets/Heading.png';
import CustomStrategyBuilder from './customStrategy/CustomStrategyBuilder';
import SuperTrend from '../pages/SuperTrend';


const MarketsAI1App = ({ setCurrentPage, currentPage, hideHeaderFooter = false, onSubPageChange }) => {
  const [activeSection, setActiveSection] = useState('default');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showMode, setShowMode] = useState('live'); // 'live' or 'all'
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);

  const handleLogout = () => {
    setCurrentPage('marketsai1');
  };

  const handleFilterToggle = (filter) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle section change with breadcrumb updates
  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (onSubPageChange && section !== 'default') {
      onSubPageChange(section);
    }
  };

  // Handle back navigation
  const handleBackToStrategies = () => {
    setActiveSection('default');
    if (onSubPageChange) {
      // Remove the last sub-page from breadcrumb
      onSubPageChange('default');
    }
  };

  return (
    <div className={hideHeaderFooter ? "h-[calc(100vh-80px)] bg-teal-50 flex flex-col" : "h-[calc(100vh-80px)] bg-teal-50 flex flex-col overflow-hidden"}>
      {/* Navigation */}
      {!hideHeaderFooter && <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />}

      {/* Main Content Area - Now properly sized and scrollable */}
      <div className={hideHeaderFooter ? "flex-1 overflow-auto" : "flex-1 overflow-auto pt-12 lg:pt-20 justify-center items-center"}>

        {/* MarketsAI Header - Always visible
        <div className='flex justify-center items-center h-[100px] mt-[10px] w-full'>
         
          <div className="flex justify-center flex-col items-center w-full">
            <img src={MarketsAI} alt="" className="w-[240px] h-[30px] mb-[30px] mt-[25px]" />
            <h1 className="text-2xl sm:text-3xl lg:text-[15px] font-bold text-teal-700 mb-3 sm:mb-4 mt-[-35px]">
              Powered by Wealth<span style={{ color: '#ca8a04', fontFamily: 'Noto Sans Arabic', marginLeft: '3px', marginTop: '3px' }} >AI1</span>
            </h1>
          </div>
        </div> */}

        {activeSection === "default" ? (
          <div className="py-10 bg-teal-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header Section */}




              {/* Filter Section */}
              <div className="mb-2 p-1">
                <div className="flex relative flex-col lg:flex-row lg:items-center justify-between gap-3 mb-[20px]">
                  {/* Filter Options */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-3">
                      {['Mean Reversion', 'Low Volatility', 'Trend Following', 'Momentum-based'].map(filter => (
                        <button
                          key={filter}
                          onClick={() => handleFilterToggle(filter)}
                          className={`px-[5px] py-[2px] rounded-md font-medium border-gray-200 text-xs transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm border bg-gray-100
                            ${selectedFilters.includes(filter)
                              ? 'bg-teal-500/90 text-white shadow-lg shadow-teal-500/30 border-teal-400/50 scale-105'
                              : 'bg-white text-gray-700 shadow-lg shadow-gray-200 hover:bg-white/80 hover:shadow-lg hover:shadow-gray-300'
                            }`}
                        >
                          <span className="text-[11px] leading-tight text-center font-medium">
                            {filter}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setIsVisionModalOpen(true)} className='text-teal-700 absolute left-[600px] text-[15px] border-teal-700 px-2 py-1 font-bold rounded-[10px] bg-teal-400/20 text-teal-800'>MarketsAI1 Vision</button>

                  {/* Toggle Button */}
                  <div className="flex flex-col items-center lg:items-end">
                    <div className="relative inline-flex items-center bg-gray-200 rounded-full p-0.5 shadow-inner">
                      <button
                        onClick={() => setShowMode('live')}
                        className={`px-3 py-[3px] rounded-full font-medium text-[14px] transition-all duration-400 transform
                          ${showMode === 'live'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_3px_0_0_rgba(22,163,74,0.4)] translate-y-[-1px]'
                            : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        Live
                      </button>
                      <button
                        onClick={() => setShowMode('all')}
                        className={`px-3 py-[3px] rounded-full font-medium text-[14px] transition-all duration-400 transform
                          ${showMode === 'all'
                            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-[0_3px_0_0_rgba(13,148,136,0.4)] translate-y-[-1px]'
                            : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                  
                  

                </div>
              </div>

              {/* Strategy Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                {[
                  {
                    id: 'etf-strategy',
                    name: 'ETF Rotation Strategy',
                    description: 'Mean Reversion and Low Volatility ETFs rotation with comprehensive analysis',
                    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
                    borderColor: 'border-emerald-400',
                    available: true,
                    category: 'Active',
                    tags: ['Mean Reversion', 'Low Volatility']
                  },
                  {
                    id: 'stock-strategy',
                    name: 'Stock Rotation Strategy',
                    description: 'Mean Reversion and Low Volatility Stocks rotation with comprehensive analysis',
                    gradient: 'from-orange-200 to-orange-300',
                    borderColor: 'border-orange-200',
                    available: true,
                    category: 'Active',
                    tags: ['Mean Reversion', 'Low Volatility']
                  },
                  {
                    id: 'RS-strategy',
                    name: 'RS Momentum Strategy',
                    description: 'Momentum-based Trend Following System for RS',
                    gradient: 'from-blue-200 to-blue-300',
                    borderColor: 'border-blue-200',
                    available: true,
                    category: 'Active',
                    tags: ['Momentum-based', 'Trend Following']
                  },
                  {
                    id: 'RS-ETF-strategy',
                    name: 'RS ETF Strategy',
                    description: 'Momentum-based RS Strategy for ETFs',
                    gradient: 'from-purple-200 to-purple-300',
                    borderColor: 'border-purple-200',
                    available: true,
                    category: 'Active',
                    tags: ['Momentum-based', 'Trend Following']
                  },
                  {
                    id: 'SuperTrend',
                    name: 'SuperTrend Strategy',
                    description: 'Momentum-based Trend Following System using SuperTrend indicator',
                    gradient: 'from-rose-200 to-rose-300',
                    borderColor: 'border-rose-200',
                    available: true,
                    category: 'Active',
                    tags: ['Momentum-based', 'Trend Following']
                  },
                  // { 
                  //   id: 'neural-swing', 
                  //   name: 'Neural Swing Trader',
                  //   description: 'Deep learning network for swing trading signals',
                  //   icon: '🧠',
                  //   gradient: 'from-orange-200 to-orange-300',
                  //   borderColor: 'border-orange-200',
                  //   available: false,
                  //   category: 'AI-Driven'
                  // },
                  {
                    id: 'quantum-mean',
                    name: 'Quantum Mean Reversion',
                    description: 'Advanced statistical arbitrage using quantum algorithms',
                    gradient: 'from-cyan-200 to-cyan-300',
                    borderColor: 'border-cyan-200',
                    available: false,
                    tags: ['Mean Reversion']
                  },
                  {
                    id: 'adaptive-trend',
                    name: 'Adaptive Trend Following',
                    description: 'Self-adjusting trend identification with ML optimization',
                    gradient: 'from-emerald-200 to-emerald-300',
                    borderColor: 'border-emerald-200',
                    available: false,
                    tags: ['Trend Following', 'Momentum-based']
                  },
                  {
                    id: 'ml-breakouts',
                    name: 'ML Breakout Detection',
                    description: 'Machine learning powered breakout pattern recognition',
                    gradient: 'from-amber-200 to-amber-300',
                    borderColor: 'border-amber-200',
                    available: false,
                    tags: ['Momentum-based']
                  },
                  {
                    id: 'dynamic-risk',
                    name: 'Dynamic Risk Parity',
                    description: 'Real-time risk allocation using volatility forecasting',
                    gradient: 'from-indigo-200 to-indigo-300',
                    borderColor: 'border-indigo-200',
                    available: false,
                    tags: ['Low Volatility']
                  },
                  {
                    id: 'algo-pairs',
                    name: 'Algorithmic Pairs Trading',
                    description: 'Statistical arbitrage with cointegration analysis',
                    gradient: 'from-rose-200 to-rose-300',
                    borderColor: 'border-rose-200',
                    available: false,
                    tags: ['Mean Reversion']
                  },
                  {
                    id: 'dl-volatility',
                    name: 'Deep Learning Volatility',
                    description: 'Neural networks for volatility trading and hedging',
                    gradient: 'from-violet-200 to-violet-300',
                    borderColor: 'border-violet-200',
                    available: false,
                    tags: ['Low Volatility', 'Mean Reversion']
                  }
                ].filter(strategy => {
                  // Filter by showMode (Live/All)
                  if (showMode === 'live' && !strategy.available) {
                    return false;
                  }

                  // Filter by selected tags
                  if (selectedFilters.length > 0) {
                    return selectedFilters.some(filter => strategy.tags.includes(filter));
                  }

                  return true;
                }).map((strategy) => (
                  <div
                    key={strategy.id}
                    className={`group relative ${strategy.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => strategy.available && handleSectionChange(strategy.id)}
                  >
                    {/* Card */}
                    <div className={`
                      relative rounded-xl shadow-md border-2 overflow-hidden h-32
                      transition-all duration-300 ease-out
                      ${strategy.available
                        ? 'bg-white hover:shadow-xl hover:-translate-y-1 hover:scale-105 ring-2 ring-emerald-200 ring-opacity-50 shadow-emerald-100 ' + strategy.borderColor
                        : showMode === 'all'
                          ? 'bg-gray-100 border-gray-300 opacity-60'
                          : 'bg-white opacity-80 ' + strategy.borderColor
                      }
                      transform-gpu
                    `}>

                      {/* Coming Soon Badge */}
                      {!strategy.available && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className={`text-xs font-medium italic bg-white bg-opacity-90 px-2 py-1 rounded-md shadow-sm ${showMode === 'all' ? 'text-gray-500' : 'text-blue-600'
                            }`}>
                            Coming Soon!
                          </span>
                        </div>
                      )}

                      {/* Live indicator for available strategy */}
                      {strategy.available && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="flex items-center">
                            <span className="text-[10px] font-medium text-green-600 bg-white bg-opacity-90 px-2 py-0.5 rounded-[5px] shadow-sm">
                              LIVE
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Category Badge - only for non-available strategies */}
                      {!strategy.available && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 border ${showMode === 'all' ? 'text-gray-500 border-gray-400' : 'text-gray-700 border-gray-300'
                            }`}>
                            {strategy.category}
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div className={`h-10 relative overflow-hidden ${strategy.available
                        ? `bg-gradient-to-br ${strategy.gradient} shadow-lg`
                        : showMode === 'all'
                          ? 'bg-gradient-to-br from-gray-200 to-gray-300'
                          : `bg-gradient-to-br ${strategy.gradient}`
                        }`}>
                      </div>




                      {/* Content */}
                      <div className="p-4 text-center">
                        <p className={`text-[12px] leading-relaxed mb-4 line-clamp-3 text-center ${strategy.available
                          ? 'text-gray-600'
                          : showMode === 'all'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                          }`}>
                          <h1 className='text-[12px] font-bold text-center leading-tight'>{strategy.name}</h1>
                          {strategy.description}
                        </p>
                      </div>

                      {/* Subtle Hover Effect */}
                      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none ${strategy.available
                        ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600'
                        : showMode === 'all'
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                          : `bg-gradient-to-br ${strategy.gradient}`
                        }`}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Strategy Button */
              }
              <div className="mt-16 text-center">
                <button
                  onClick={() => handleSectionChange('custom-strategy')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-[15px] font-medium rounded-[30px] text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
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
          <div className="h-full mt-[-20px]">
            {activeSection === 'etf-strategy' && (
              <ETFStrategy 
                onBack={handleBackToStrategies} 
                strategyType="ETF Rotation Strategy" 
                onSubPageChange={onSubPageChange}
              />
            )}
            {activeSection === 'stock-strategy' && (
              <StockStrategy 
                onBack={handleBackToStrategies} 
                strategyType="Stock Rotation Strategy" 
                onSubPageChange={onSubPageChange}
              />
            )}
            {activeSection === 'RS-strategy' && (
              <RSStrategy 
                onBack={handleBackToStrategies} 
                strategyType="RS Strategy" 
                onSubPageChange={onSubPageChange}
              />
            )}
            {activeSection === 'RS-ETF-strategy' && (
              <RSETFStrategy 
                onBack={handleBackToStrategies} 
                strategyType="RS ETF Strategy" 
                onSubPageChange={onSubPageChange}
              />
            )}
            {activeSection === 'Custom-Strategy' && (
              <div className="h-full">
                <CustomStrategyBuilder setCurrentPage={setCurrentPage} />
              </div>
            )}
            {activeSection === 'SuperTrend' && (
              <SuperTrend 
                onBack={handleBackToStrategies} 
                strategyType="SuperTrend" 
                onSubPageChange={onSubPageChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Automation AI Modal */}
      {console.log('Modal state:', isAutomationModalOpen)}
      {isAutomationModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsAutomationModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsAutomationModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white bg-opacity-40 hover:bg-opacity-60 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* WealthAI Automations Component */}
            <div className="w-full h-full overflow-y-auto">
              <WealthAIAutomations setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
            </div>
          </div>
        </div>
      )}

      {/* MarketsAI1 Vision Modal */}
      {isVisionModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsVisionModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
            {/* Teal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">MarketsAI1 Vision</h2>
              <button
                onClick={() => setIsVisionModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Area - White background with scrollable iframe */}
            <div className="flex-1 bg-white overflow-hidden rounded-b-[20px]">
              <iframe
                src="/templates/ai_strategies.html"
                className="w-full h-full border-0"
                title="MarketsAI1 Vision"
                style={{ minHeight: 'calc(90vh - 80px)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsAI1App;