import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const ServicesPage = ({ setCurrentPage, currentPage }) => {
  const [formData, setFormData] = useState({
    requirement: '',
    email: '',
    phone: '',
    name: '',
    company: ''
  });

  const services = [
    {
      icon: '🔧',
      title: 'Custom Trading Strategies',
      description: 'Development of custom trading and investing strategies tailored to your risk profile and market objectives.',
      color: 'blue'
    },
    {
      icon: '💻',
      title: 'Custom Trading Platforms',
      description: 'Development of bespoke trading platforms with advanced features and seamless broker integrations.',
      color: 'teal'
    },
    {
      icon: '🤖',
      title: 'AI Trading Consulting',
      description: 'Consulting on how AI can improve your personal trading and investing decision-making processes.',
      color: 'green'
    },
    {
      icon: '⚡',
      title: 'Business Workflow Automation',
      description: 'AI powered automation of business workflows for Sub-Brokers, Mutual Fund Distributors and other financial services.',
      color: 'purple'
    },
    {
      icon: '☁️',
      title: 'Cloud Infrastructure Hosting',
      description: 'Secure, scalable cloud hosting solutions for your trading and investing infrastructure with 99.9% uptime.',
      color: 'indigo'
    },
    {
      icon: '📊',
      title: 'Portfolio Management Solutions',
      description: 'Custom AI driven portfolio assessment, monitoring, reporting and management solutions for high net worth portfolios.',
      color: 'emerald'
    },
    {
      icon: '🏷️',
      title: 'White-label Solutions',
      description: 'White-labelling our products for your customers with your branding and custom features.',
      color: 'orange'
    },
    {
      icon: '🛠️',
      title: 'Custom Fintech Development',
      description: 'Any other custom development including websites, tools, and utilities specifically for the Fintech domain.',
      color: 'red'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      teal: 'bg-teal-50 border-teal-200 text-teal-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
      red: 'bg-red-50 border-red-200 text-red-600'
    };
    return colors[color];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, nothing happens on clicking
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />
      
      {/* Main Content - Scrollable with padding for header and footer */}
      <div className="flex-1 bg-gray-50 pt-16 pb-12 sm:pb-16 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4 sm:mb-6">Custom Development & Services</h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Bespoke AI and fintech solutions tailored to your specific requirements
            </p>
          </div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {services.map((service, index) => (
              <div key={index} className={`${getColorClasses(service.color)} p-4 sm:p-6 rounded-xl border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">{service.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center text-gray-800">{service.title}</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-center">{service.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-3 sm:mb-4">Ready to Get Started?</h2>
                <p className="text-gray-600">Tell us about your project and we'll get back to you within 24 hours</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Explain your requirement */}
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">
                    Explain your requirement *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.requirement}
                    onChange={(e) => setFormData({...formData, requirement: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                    placeholder="Describe your project requirements, timeline, and any specific needs..."
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="your.email@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4 sm:pt-6">
                  <button
                    type="submit"
                    className="bg-blue-900 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-800 transition-colors transform hover:scale-105 duration-200 shadow-lg"
                  >
                    Discuss Your Project
                  </button>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                    We'll review your requirements and get back to you within 24 hours
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default ServicesPage;