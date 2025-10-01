import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import PaymentHistory from './PaymentHistory';
import PaymentAnalytics from './PaymentAnalytics';
import Subscription from './SimpleSubscription';
import ZohoWidgetDebugger from './ZohoWidgetDebugger';
// import './PaymentPage.css'; // Temporarily disabled to test
import { 
  FaCreditCard, 
  FaHistory, 
  FaChartLine, 
  FaCrown, 
  FaShieldAlt,
  FaRocket,
  FaGem,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';

const PaymentPage = ({ setCurrentPage, currentPage }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('payment');
  const [tabKey, setTabKey] = useState(0);

  if (!user) {
    return null;
  }

  const tabs = [
    {
      id: 'payment',
      name: 'Subscription Plans',
      icon: FaCrown,
      description: 'Choose your perfect plan',
      gradient: 'from-purple-500 to-pink-500',
      color: 'purple'
    },
    {
      id: 'history',
      name: 'Payment History',
      icon: FaHistory,
      description: 'View transaction details',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'blue'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: FaChartLine,
      description: 'Track your spending',
      gradient: 'from-green-500 to-emerald-500',
      color: 'green'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        
        {/* Compact Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-300 rounded-full float"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-300 rounded-full float-delayed"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-green-300 rounded-full float"></div>
        <div className="absolute bottom-20 right-1/3 w-2.5 h-2.5 bg-pink-300 rounded-full float-delayed"></div>
        
        {/* Subtle Particle System */}
        <div className="particles">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 4 + 6}s`
              }}
            />
          ))}
        </div>
      </div>

      <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />
      
      <div className="relative pt-16 pb-4 px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="max-w-6xl mx-auto mt-[25px]">
          {/* Compact Hero Section */}
          <div className="text-center mb-4">
            <div className="relative inline-block mb-2">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-sm opacity-30 scale-105 pulse-glow"></div>
              <div className="relative inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg transform rotate-2 hover:rotate-0 transition-all duration-300 hover:scale-105">
                <FaGem className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
            </div>
            
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-1 leading-tight">
              Payment & Billing
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-2 px-4">
              Manage your subscription and track payments
            </p>
            
            {/* Compact Status Cards */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm border border-white/20 hover:neon-green transition-all duration-300">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Active</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm border border-white/20 hover:neon-blue transition-all duration-300">
                <FaShieldAlt className="w-2.5 h-2.5 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">Secure</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm border border-white/20 hover:neon-purple transition-all duration-300">
                <FaRocket className="w-2.5 h-2.5 text-purple-500" />
                <span className="text-xs font-medium text-gray-700">Premium</span>
              </div>
            </div>
          </div>

          {/* Compact 3D Tabs */}
          <div className="mb-4">
            <div className="relative perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-white/30 rounded-xl blur-sm"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-xl p-1.5 shadow-lg border border-white/20 glass">
                <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          // Force component re-mount when switching to payment tab
                          if (tab.id === 'payment') {
                            setTabKey(prev => prev + 1);
                          }
                        }}
                        className={`group relative flex-1 flex flex-row sm:flex-col items-center p-1.5 rounded-lg tab-transition focus-ring ${
                          isActive
                            ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {/* Glow Effect for Active Tab */}
                        {isActive && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg blur-sm opacity-50 -z-10`}></div>
                        )}
                        
                        <div className={`mb-1 p-1.5 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-white/20 shadow-md transform rotate-6' 
                            : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md group-hover:rotate-3'
                        }`}>
                          <Icon className={`w-3.5 h-3.5 transition-all duration-300 ${
                            isActive ? 'text-white drop-shadow-sm' : 'text-gray-500 group-hover:text-gray-700'
                          }`} />
                        </div>
                        
                        <div className="text-center sm:text-center">
                          <div className={`font-semibold text-xs mb-0.5 transition-all duration-300 ${
                            isActive ? 'text-white' : 'text-gray-900 group-hover:text-gray-900'
                          }`}>
                            {tab.name}
                          </div>
                          <div className={`text-xs transition-all duration-300 hidden sm:block ${
                            isActive ? 'text-white/90' : 'text-gray-500 group-hover:text-gray-600'
                          }`}>
                            {tab.description}
                          </div>
                        </div>
                        
                        {/* Active indicator with animation */}
                        {isActive && (
                          <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-white rounded-full shadow-sm animate-pulse"></div>
                        )}
                        
                        {/* Hover effect overlay */}
                        <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-white/10 to-white/5' 
                            : 'bg-gradient-to-r from-transparent to-transparent group-hover:from-white/10 group-hover:to-white/5'
                        }`}></div>
              </button>
                    );
                  })}
            </nav>
              </div>
            </div>
          </div>

          {/* Compact Tab Content */}
          <div className="relative">
            <div className="relative group">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              {/* Main Content Container */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-3d-xl border border-white/30 p-3 sm:p-4 transform transition-all duration-700 hover:shadow-3d-xl hover:-translate-y-1 glass">

                {/* Content with Smooth Transitions */}
                <div className="relative">
                  <div className="transform transition-all duration-700 ease-in-out">
                    {activeTab === 'payment' && (
                      <div>
                        <Subscription key={`subscription-${tabKey}`} />
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div className="animate-fadeIn">
                        <PaymentHistory />
                      </div>
                    )}

                    {activeTab === 'analytics' && (
                      <div className="animate-fadeIn">
                        <PaymentAnalytics />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>

      {/* Debug component - only show in development */}
      <ZohoWidgetDebugger enabled={process.env.NODE_ENV === 'development'} />
    </div>
  );
};

export default PaymentPage;