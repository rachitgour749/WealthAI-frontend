import React from 'react';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Return and Refund Policy
                    </h1>
                    <p className="text-lg text-gray-600">
                        Please review our refund and return policy
                    </p>
                </div>

                {/* Refund Policy Content */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="prose prose-gray max-w-none">
                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">In case Merchant wishes to provide cancellation of orders</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>Order cancellations may be accepted before processing/shipping, subject to our discretion.</li>
                            <li>Certain products/services may not be eligible for cancellation once the order has been confirmed.</li>
                            <li>Any request for cancellation must be raised within 8 hours of placing the order.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">In case Merchant wishes to provide only replacement</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>We do not deliver goods. Purchases made from us cannot be returned after the performance of services is complete.</li>
                            <li>We process the replacement orders after we perform required checks.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">In case Merchant wishes to provide refunds</h3>
                        <ul className="list-disc pl-6 text-gray-700 mb-4">
                            <li>Any request for refund must be submitted within 8 hours of delivery and are applicable only for (i) prepaid but undelivered items, (ii) for non performing items.</li>
                            <li>Refunds will be processed after we validate the damage and perform quality checks.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contact Information</h3>
                        <p className="text-gray-700 mb-4">
                            For any cancellation, refund, or return requests, please contact us at <a href="mailto:connect@wealthai1.in" className="text-blue-600 hover:text-blue-800">connect@wealthai1.in</a>
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

export default RefundPolicy;
