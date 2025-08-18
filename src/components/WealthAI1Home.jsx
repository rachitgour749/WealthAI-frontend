import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import ContactSection from './ContactSection';

const WealthAI1Home = ({ setCurrentPage }) => {
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Navigation setCurrentPage={setCurrentPage} transparent={true} />
      
      {/* Hero Section with Light Background */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 overflow-hidden flex items-center">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-blue-100 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-green-100 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-100 rounded-full"></div>
          
          {/* Static AI Network Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 1000">
            <g stroke="#1F497D" strokeWidth="1" fill="none">
              <path d="M100,100 Q300,200 500,100 T900,200" />
              <path d="M100,300 Q400,400 700,300 T900,400" />
              <path d="M100,600 Q350,500 600,600 T900,700" />
            </g>
            <g fill="#1F497D">
              <circle cx="100" cy="100" r="3" />
              <circle cx="500" cy="100" r="3" />
              <circle cx="900" cy="200" r="3" />
              <circle cx="300" cy="400" r="3" />
              <circle cx="700" cy="600" r="3" />
            </g>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-blue-900">
              AI-Powered Technology
              <span className="block text-emerald-600">for Smarter Markets</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-700 leading-relaxed">
              From EOD strategy platforms to bespoke fintech AI solutions — empowering market participants to trade smarter, scale faster, and operate safely.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button
                onClick={() => setCurrentPage('marketsai1')}
                className="bg-emerald-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Access MarketsAI1 Platform
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className="bg-white border-2 border-blue-900 text-blue-900 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg"
              >
                Schedule a Demo
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-white bg-opacity-70 p-4 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600">AI-First</div>
                <div className="text-sm text-gray-600">Technology Stack</div>
              </div>
              <div className="text-center bg-white bg-opacity-70 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">Compliance</div>
                <div className="text-sm text-gray-600">By Design</div>
              </div>
              <div className="text-center bg-white bg-opacity-70 p-4 rounded-lg">
                <div className="text-3xl font-bold text-teal-600">Multi-Broker</div>
                <div className="text-sm text-gray-600">Integration</div>
              </div>
              <div className="text-center bg-white bg-opacity-70 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">Professional</div>
                <div className="text-sm text-gray-600">Grade Platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Powering the Future of Trading</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-driven platform serves professionals across the financial ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-teal-600 mb-2">50+</div>
              <div className="text-gray-600">Strategy Templates</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-blue-900 mb-2">99.9%</div>
              <div className="text-gray-600">Platform Uptime</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-emerald-600 mb-2">10+</div>
              <div className="text-gray-600">Broker Integrations</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-yellow-600 mb-2">24/7</div>
              <div className="text-gray-600">Market Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Ecosystem */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Complete AI-Powered Ecosystem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive suite of tools for modern trading and investment management
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* MarketsAI1 */}
            <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-teal-600 mb-4">MarketsAI1</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                AI-enhanced strategy lab for positional & swing trading with EOD data, backtesting, and live deployment.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">No-code strategy builder</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Institutional-grade backtesting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Multi-broker execution</span>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('marketsai1')}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Access Platform
              </button>
            </div>

            {/* Custom Development */}
            <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Custom Development</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Bespoke trading platforms, AI solutions, and fintech software tailored to your specific requirements.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                  <span className="text-sm text-gray-600">Intraday/F&O platforms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                  <span className="text-sm text-gray-600">AI chatbots & agents</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                  <span className="text-sm text-gray-600">Custom fintech solutions</span>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('contact')}
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                Discuss Project
              </button>
            </div>

            {/* Future Products */}
            <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-emerald-600 mb-4">AI Product Suite</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Expanding ecosystem of AI-powered SaaS tools for comprehensive financial market operations.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">AdvisorAI1 - Wealth management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">AgentAI1 - Workflow automation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">RiskAI1 - Risk modeling</span>
                </div>
              </div>
              <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed">
                Coming 2025
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">How WealthAI1 Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From strategy creation to live deployment - our platform guides you through every step
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Build Strategy",
                desc: "Use our no-code builder with AI assistance to create sophisticated trading strategies",
                color: "bg-blue-600"
              },
              {
                step: 2,
                title: "Backtest & Optimize",
                desc: "Test against historical data with realistic costs, slippage, and risk controls",
                color: "bg-teal-600"
              },
              {
                step: 3,
                title: "Paper Trade",
                desc: "Validate your strategy in real-time simulation before committing capital",
                color: "bg-emerald-600"
              },
              {
                step: 4,
                title: "Deploy Live",
                desc: "Execute strategies across multiple brokers with automated risk management",
                color: "bg-yellow-600"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl text-white ${item.color} transform transition-all duration-300 hover:scale-105`}
              >
                <div className="text-4xl font-bold mb-4 opacity-80">{item.step}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{item.desc}</p>
                
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose WealthAI1 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Why Leading Professionals Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The perfect combination of domain expertise and cutting-edge technology
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: "🛡️",
                  title: "Compliance by Design",
                  desc: "Every solution built with regulatory compliance and risk management embedded from day one."
                },
                {
                  icon: "🧠",
                  title: "Capital Markets DNA",
                  desc: "Deep domain expertise in trading systems, market microstructure, and institutional requirements."
                },
                {
                  icon: "⚡",
                  title: "AI-First Architecture",
                  desc: "Next-generation platforms designed for intelligent trading and automated decision making."
                },
                {
                  icon: "🔧",
                  title: "Build + Buy Flexibility",
                  desc: "Choose from ready-to-use SaaS platforms or commission fully custom solutions."
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Trusted By</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Brokers & Sub-brokers</div>
                    <div className="text-2xl font-bold text-blue-900">50+</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">RIAs & Advisors</div>
                    <div className="text-2xl font-bold text-teal-600">25+</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Family Offices</div>
                    <div className="text-2xl font-bold text-emerald-600">10+</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Fund Managers</div>
                    <div className="text-2xl font-bold text-purple-600">15+</div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm italic text-gray-700">
                    "WealthAI1's combination of deep market knowledge and AI innovation has transformed our trading operations."
                  </p>
                  <div className="text-xs mt-2 text-gray-600">- Leading RIA Firm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join the next generation of traders and investment professionals using AI-powered tools to build, test, and deploy sophisticated strategies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => setCurrentPage('marketsai1')}
              className="bg-emerald-500 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-200 shadow-xl"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
      
      <ContactSection setCurrentPage={setCurrentPage} />
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default WealthAI1Home;