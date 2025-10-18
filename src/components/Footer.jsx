import React, { useState } from 'react';
import { FaTwitter, FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';

const Footer = ({ setCurrentPage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const termsAndConditions = `Terms and Conditions

These Terms and Conditions ("Terms") constitute a binding agreement between Wealthwisers Financial Services ("we," "us," or "our") and you ("you" or "your"), governing your use of our website and/or purchase of goods/services from us (collectively, "Services").

By using our website and/or making a purchase from us, you expressly agree to the following Terms.

1. Use of Services
• You shall not use our website and/or Services for any purpose that is unlawful, illegal, or prohibited under Indian laws, or any other local laws that might apply to you.
• It is your responsibility to ensure that any goods, services, or information available through our website meet your specific requirements.

2. Orders & Availability
• You agree to provide accurate and complete information for order fulfillment and service delivery. We shall not be liable for issues resulting from incorrect or incomplete information you provide to us.
• All purchases/orders are subject to availability.
• We reserve the right to cancel orders at our discretion, including but not limited to cases of non-availability of goods you wish to purchase from us or if the order is suspected of fraud.

3. Payments
• Payments must be made in full at the time of purchase unless otherwise agreed by us.
• You must ensure that the payment details provided are valid and belong to you.

4. Liability
• We shall not be liable for any loss or damage arising from the use of our Services, whether direct, indirect, or consequential.
• We shall not be liable for any loss or damage arising directly or indirectly from the decline of authorization for any transaction due to the Cardholder exceeding the preset limit mutually agreed with our acquiring bank.

5. Governing Law & Disputes
• Any dispute arising out of the use of our website, purchase from us, or any engagement with us shall be subject to the laws of India.

6. Contact Information
If you have any questions regarding these Terms, please contact us at connect@wealthai1.in`;

  const refundPolicy = `Return and Refund Policy

In case Merchant wishes to provide cancellation of orders 

Order cancellations may be accepted before processing/shipping, subject to our discretion.  
Certain products/services may not be eligible for cancellation once the order has been confirmed. 
Any request for cancellation must be raised within 8 hours of placing the order. 

In case Merchant wishes to provide only replacement: 

We do not deliver goods. Purchases made from us cannot be returned after the performance of services is complete.  We process the replacement orders after we perform required checks.  

In case Merchant wishes to provide refunds: 

Any request for refund must be submitted within 8 hours of delivery and are applicable only for (i) prepaid but undelivered items, (ii) for non performing items.  
Refunds will be processed after we validate the damage and perform quality checks.  

Contact Information  For any cancellation, refund, or return requests, please contact us at connect@wealthai1.in`;

  return (
    <>
      <footer className="bg-gradient-to-r from-blue-900 via-teal-700 to-blue-900 text-white h-12 sm:h-16 flex-shrink-0 border-t border-teal-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left Side - Company Info */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <h3 className="text-xs sm:text-sm font-bold">WealthAI1</h3>
              <div className="hidden md:flex items-center space-x-3">
                <a href="https://twitter.com/wealthai1" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-teal-300 transition-colors">
                  <FaTwitter className="text-md" />
                </a>
                <a href="https://linkedin.com/company/wealthai1" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-teal-300 transition-colors">
                  <FaLinkedin className="text-md" />
                </a>
                <a href="https://instagram.com/wealthai1" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-teal-300 transition-colors">
                  <FaInstagram className="text-sm" />
                </a>
                <a href="https://facebook.com/wealthai1" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-teal-300 transition-colors">
                  <FaFacebook className="text-md" />
                </a>
              </div>
            </div>
            
            {/* Center - Company Links & Contact */}
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
              <button onClick={() => setCurrentPage('founders')} className="text-xs sm:text-sm text-blue-200 hover:text-teal-300 transition-colors">
                About
              </button>
              <button onClick={() => setCurrentPage('contact')} className="text-xs sm:text-sm text-blue-200 hover:text-teal-300 transition-colors">
                Contact
              </button>
              <div className="text-xs sm:text-sm text-blue-300">
                © 2025 WealthAI1
              </div>
            </div>
            
            {/* Right Side - Terms & Conditions / Refund Policy */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => openModal(termsAndConditions)} 
                className="text-xs sm:text-sm text-blue-200 hover:text-teal-300 transition-colors"
              >
                Terms & Conditions
              </button>
              <button 
                onClick={() => openModal(refundPolicy)} 
                className="text-xs sm:text-sm text-blue-200 hover:text-teal-300 transition-colors"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalContent === termsAndConditions ? 'TERMS AND CONDITIONS' : 'REFUND POLICY'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Link to Full Page */}
            <div className="px-6 pt-4 pb-2">
              <button
                onClick={() => window.open(
                  modalContent === termsAndConditions ? '/terms_of_service' : '/refund_policy', 
                  '_blank'
                )}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                {modalContent === termsAndConditions ? 'https://www.wealthai1.in/terms_of_service' : 'https://www.wealthai1.in/refund_policy'}
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {modalContent}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;