import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import StrategyConfig from '../components/rs_strategycomponents/StrategyConfig';    
import Backtest from '../components/rs_strategycomponents/Backtest';                 
import Results from '../components/rs_strategycomponents/Results';
import ResultDetail from '../components/rs_strategycomponents/ResultDetail';
import { AppProvider } from '../context/RScontext';

function RSStrategy() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0ea5e9',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        },
      }}
    >
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-white">
            {/* Clean Navigation Bar */}
            <nav className="relative z-50 bg-white border-b border-gray-200 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center space-x-2 py-3">
                  <NavLink 
                    to="/strategy-config" 
                    className={({ isActive }) => 
                      `relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                        isActive 
                          ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400' 
                          : 'bg-white text-gray-700 shadow-md shadow-gray-200/50 border border-gray-200 hover:shadow-lg hover:shadow-gray-300/50 hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className="flex items-center gap-1.5">
                      🤖 Strategy Config
                    </span>
                  </NavLink>
                  
                  <NavLink 
                    to="/backtest" 
                    className={({ isActive }) => 
                      `relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                        isActive 
                          ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400' 
                          : 'bg-white text-gray-700 shadow-md shadow-gray-200/50 border border-gray-200 hover:shadow-lg hover:shadow-gray-300/50 hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className="flex items-center gap-1.5">
                      🚀 Backtest
                    </span>
                  </NavLink>
                  
                  <NavLink 
                    to="/results" 
                    className={({ isActive }) => 
                      `relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                        isActive 
                          ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400' 
                          : 'bg-white text-gray-700 shadow-md shadow-gray-200/50 border border-gray-200 hover:shadow-lg hover:shadow-gray-300/50 hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className="flex items-center gap-1.5">
                      📊 Results
                    </span>
                  </NavLink>
                </div>
              </div>
            </nav>

            {/* Page Content */}
            <div className="relative min-h-[calc(100vh-80px)] bg-gray-50">
              {/* Routes Content */}
              <div className="relative z-10">
                <Routes>
                  <Route path="/" element={<Navigate to="/strategy-config" replace />} />
                  <Route path="/strategy-config" element={<StrategyConfig />} />
                  <Route path="/backtest" element={<Backtest />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/results/:id" element={<ResultDetail />} />
                  <Route path="*" element={<Navigate to="/strategy-config" replace />} />
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </AppProvider>
    </ConfigProvider>
  );
}

export default RSStrategy;




