import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const MarketsAI1Landing = ({ setCurrentPage, setIsAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setCurrentPage('marketsai1-app');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div>
      <Navigation isMarketsAI1={true} setCurrentPage={setCurrentPage} transparent={true} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-100 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/6 w-80 h-80 bg-blue-100 rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-8 text-teal-600">
                MarketsAI1
                <span className="block text-blue-900">Strategy Lab</span>
              </h1>
              <p className="text-xl mb-8 text-gray-700 leading-relaxed">
                AI-enhanced, compliance-conscious platform for positional & swing trading strategies using EOD data for equities and ETFs.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-emerald-600">50+</div>
                  <div className="text-sm text-gray-600">Built-in Strategies</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-emerald-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-emerald-600">10+</div>
                  <div className="text-sm text-gray-600">Broker APIs</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-emerald-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Access MarketsAI1 Platform</h3>
              
              {!isLoading ? (
                <div>
                  <button
                    onClick={handleGoogleAuth}
                    className="w-full bg-teal-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center space-x-3 mb-6"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  
                  <div className="border-t pt-6">
                    <div className="bg-teal-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-teal-800 mb-2">Who Can Access:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-teal-700">
                        <div>• RIAs & Advisors</div>
                        <div>• Fund Managers</div>
                        <div>• Brokers & Sub-brokers</div>
                        <div>• Family Offices</div>
                        <div>• Serious Traders</div>
                        <div>• Financial Educators</div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 text-center">
                      Secure OAuth2 authentication • No credit card required for trial
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Authenticating with Google...</p>
                  <p className="text-sm text-gray-500 mt-2">Redirecting to your MarketsAI1 workspace</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Professional-Grade Trading Tools</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, test, and deploy sophisticated trading strategies
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold text-teal-600 mb-8">Strategy Development</h3>
              <div className="space-y-6">
                {[
                  {
                    title: "No-Code Strategy Builder",
                    desc: "Drag-and-drop interface with AI-powered suggestions and optimization"
                  },
                  {
                    title: "50+ Pre-built Templates",
                    desc: "Professional strategies covering momentum, mean reversion, and factor models"
                  },
                  {
                    title: "AI Strategy Assistant",
                    desc: "Get intelligent recommendations for parameter optimization and risk management"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-800">Momentum Strategy v2.1</h4>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">+18.3%</div>
                    <div className="text-xs text-gray-600">Annual Return</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">0.85</div>
                    <div className="text-xs text-gray-600">Sharpe Ratio</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">-8.2%</div>
                    <div className="text-xs text-gray-600">Max Drawdown</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Advanced Backtesting",
                desc: "Institutional-grade backtesting with realistic costs, slippage, and market impact modeling",
                color: "bg-blue-50"
              },
              {
                icon: "🔄",
                title: "Paper Trading",
                desc: "Risk-free testing environment with real-time market simulation and performance tracking",
                color: "bg-green-50"
              },
              {
                icon: "🚀",
                title: "Live Deployment",
                desc: "Seamless execution across multiple brokers with automated risk management and monitoring",
                color: "bg-purple-50"
              }
            ].map((feature, index) => (
              <div key={index} className={`${feature.color} p-8 rounded-2xl text-center border border-gray-200`}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default MarketsAI1Landing;