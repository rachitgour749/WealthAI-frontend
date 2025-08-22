import React, { useState } from 'react';

const ContactSection = ({ setCurrentPage, standalone = false, compact = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    interest: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', phone: '', interest: '', message: '' });
    }, 3000);
  };

  const sectionClass = compact ? "py-6 sm:py-8 bg-gray-50" : "py-12 sm:py-16 lg:py-20 bg-gray-50";
  const containerClass = compact ? "mb-6 sm:mb-8" : "mb-12 sm:mb-16";

  return (
    <section className={sectionClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className={`text-center ${containerClass}`}>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-3 sm:mb-4 lg:mb-6">Get In Touch</h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Ready to transform your trading operations with AI-powered technology? Let's discuss your needs.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 h-full">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-4 sm:mb-6">Connect With WealthAI1</h3>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {[
                { icon: "📧", title: "General Inquiries", email: "contact@wealthai1.in", desc: "For general questions and information" },
                { icon: "🤝", title: "Partnerships", email: "partnerships@wealthai1.in", desc: "Strategic partnerships and collaborations" },
                { icon: "🛠️", title: "Technical Support", email: "support@marketsai1.in", desc: "MarketsAI1 platform support" },
                { icon: "⚙️", title: "Custom Projects", email: "projects@wealthai1.in", desc: "Bespoke development requests" }
              ].map((contact, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                    {contact.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm">{contact.title}</h4>
                    <p className="text-blue-600 mb-1 text-xs sm:text-sm break-all">{contact.email}</p>
                    <p className="text-xs text-gray-600">{contact.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl">
            {!submitted ? (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Send Us a Message</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                        placeholder="Your phone"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      placeholder="your.email@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Company/Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                      placeholder="Your company"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Interest</label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({...formData, interest: e.target.value})}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                    >
                      <option value="">Select your interest</option>
                      <option value="marketsai1">MarketsAI1 Platform</option>
                      <option value="custom-development">Custom Development</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="demo">Schedule a Demo</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Message *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-900 text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors transform hover:scale-105 duration-200 text-sm sm:text-base"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-green-600 mb-2">Message Sent!</h3>
                <p className="text-gray-600 text-xs sm:text-sm">We'll get back to you within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;