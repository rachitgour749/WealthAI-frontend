import React from 'react';

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Terms and Conditions
                    </h1>
                    <p className="text-lg text-gray-600">
                        Please review our terms of service
                    </p>
                </div>

                {/* Terms and Conditions Content */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 mb-4">
                            These Terms and Conditions ("Terms") constitute a binding agreement between Wealthwisers Financial Services ("we," "us," or "our") and you ("you" or "your"), governing your use of our website and/or purchase of goods/services from us (collectively, "Services").
                        </p>
                        <p className="text-gray-700 mb-4">
                            By using our website and/or making a purchase from us, you expressly agree to the following Terms.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Use of Services</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>You shall not use our website and/or Services for any purpose that is unlawful, illegal, or prohibited under Indian laws, or any other local laws that might apply to you.</li>
                            <li>It is your responsibility to ensure that any goods, services, or information available through our website meet your specific requirements.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Orders & Availability</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>You agree to provide accurate and complete information for order fulfillment and service delivery. We shall not be liable for issues resulting from incorrect or incomplete information you provide to us.</li>
                            <li>All purchases/orders are subject to availability.</li>
                            <li>We reserve the right to cancel orders at our discretion, including but not limited to cases of non-availability of goods you wish to purchase from us or if the order is suspected of fraud.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Payments</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>Payments must be made in full at the time of purchase unless otherwise agreed by us.</li>
                            <li>You must ensure that the payment details provided are valid and belong to you.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Liability</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>We shall not be liable for any loss or damage arising from the use of our Services, whether direct, indirect, or consequential.</li>
                            <li>We shall not be liable for any loss or damage arising directly or indirectly from the decline of authorization for any transaction due to the Cardholder exceeding the preset limit mutually agreed with our acquiring bank.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Governing Law & Disputes</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>Any dispute arising out of the use of our website, purchase from us, or any engagement with us shall be subject to the laws of India.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Contact Information</h3>
                        <p className="text-gray-700 mb-4">
                            If you have any questions regarding these Terms, please contact us at <a href="mailto:connect@wealthai1.in" className="text-blue-600 hover:text-blue-800">connect@wealthai1.in</a>
                        </p>
                    </div>
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <button
                        onClick={() => window.close()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center mx-auto"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Close Tab
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;
