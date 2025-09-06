import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';

const PaymentForm = () => {
  const { processPayment, loading, error, clearError } = usePayment();
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Subscription plans with predefined details
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 999, // ₹9.99
      description: 'Essential features for beginners',
      features: ['Basic AI Analysis', 'Market Updates', 'Email Support'],
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 1999, // ₹19.99
      description: 'Advanced features for active traders',
      features: ['Advanced AI Analysis', 'Real-time Alerts', 'Priority Support', 'Portfolio Tracking'],
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      hoverColor: 'hover:bg-purple-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 4999, // ₹49.99
      description: 'Complete solution for professionals',
      features: ['Full AI Suite', 'Custom Strategies', '24/7 Support', 'API Access', 'White Label'],
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      hoverColor: 'hover:bg-green-600'
    }
  ];

  const handlePlanSelection = async (plan) => {
    try {
      setSelectedPlan(plan.id);
      clearError();

      // Auto-generate customer details (you can customize this)
      const customerDetails = {
        name: 'WealthAI1 User',
        email: 'user@wealthai1.com',
        contact: '+91-9876543210'
      };

      // Auto-generate payment data
      const paymentData = {
        amount: plan.price * 100, // Convert to paise (Razorpay expects amount in paise)
        currency: 'INR',
        receipt: `receipt_${plan.id}_${Date.now()}`,
        notes: {
          description: `${plan.name} Subscription`,
          plan_id: plan.id,
          plan_name: plan.name,
          customer_email: customerDetails.email,
          customer_name: customerDetails.name
        },
        customer: customerDetails
      };

      // Process payment automatically
      await processPayment(
        paymentData,
        (response) => {
          // Payment success
          console.log('Payment successful:', response);
          alert(`🎉 ${plan.name} subscription activated successfully!`);
          setSelectedPlan(null);
        },
        (error) => {
          // Payment failed
          console.error('Payment failed:', error);
          alert(`❌ Payment failed: ${error.description || error.message || 'Unknown error'}`);
          setSelectedPlan(null);
        }
      );

    } catch (error) {
      console.error('Error processing payment:', error);
      alert(`❌ Error: ${error.message || 'Failed to process payment'}`);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Subscription Plan
        </h2>
        <p className="text-lg text-gray-600">
          Select a plan and get started with WealthAI1 instantly
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Subscription Plan Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-lg border-2 ${plan.borderColor} bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${
              selectedPlan === plan.id ? 'ring-4 ring-opacity-50 ring-blue-400' : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">₹</span>
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            {/* Features List */}
            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Subscribe Button */}
            <button
              onClick={() => handlePlanSelection(plan)}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `${plan.color} ${plan.hoverColor} transform hover:scale-105`
              }`}
            >
              {loading && selectedPlan === plan.id ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center text-gray-600">
        <p className="mb-2">
          <strong>Note:</strong> All plans include a 7-day free trial. Cancel anytime.
        </p>
        <p>
          By subscribing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;
