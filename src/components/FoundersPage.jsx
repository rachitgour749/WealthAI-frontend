import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const FoundersPage = ({ setCurrentPage, currentPage }) => (
  <div>
    <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">Meet Our Founders</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The unique partnership behind WealthAI1's success story
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
            <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-6 mx-auto">
              A
            </div>
            <h3 className="text-2xl font-bold text-blue-900 text-center mb-4">Capital Markets Expertise</h3>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                With decades of experience in capital markets, our founding partner brings deep domain expertise in trading systems, market microstructure, and regulatory compliance.
              </p>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key Expertise:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Institutional trading systems design</li>
                  <li>• Regulatory compliance frameworks</li>
                  <li>• Market microstructure analysis</li>
                  <li>• Risk management protocols</li>
                  <li>• Broker-dealer operations</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-6 mx-auto">
              V
            </div>
            <h3 className="text-2xl font-bold text-green-600 text-center mb-4">AI & Technology Innovation</h3>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Our technology founding partner leads the AI innovation with expertise in machine learning, software architecture, and building scalable systems that transform complex research into production-ready solutions.
              </p>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-green-600 mb-2">Key Expertise:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Machine learning & AI systems</li>
                  <li>• Scalable software architecture</li>
                  <li>• Cloud infrastructure & DevOps</li>
                  <li>• Product development lifecycle</li>
                  <li>• Technical team leadership</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900 to-green-600 p-12 rounded-2xl text-white text-center">
          <h2 className="text-3xl font-bold mb-8">The Power of Partnership</h2>
          <p className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed">
            This unique combination of deep capital markets knowledge and cutting-edge AI expertise enables WealthAI1 to build solutions that truly understand both the technical complexity of financial markets and the transformative potential of artificial intelligence.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Domain-Driven Innovation</h3>
              <p className="text-blue-100">AI solutions that solve real market problems, not theoretical challenges</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Production-Ready Technology</h3>
              <p className="text-blue-100">Scalable platforms that handle real money and risk in live markets</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Compliance-First Approach</h3>
              <p className="text-blue-100">Every solution built with regulatory requirements embedded from day one</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer setCurrentPage={setCurrentPage} />
  </div>
);

export default FoundersPage;