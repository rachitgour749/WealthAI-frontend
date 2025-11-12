import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DescriptionInput from './DescriptionInput';
import AIResponseDisplay from './AIResponseDisplay';
import UserDetailsForm from './UserDetailsForm';

const CustomStrategyBuilder = ({ setCurrentPage }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [strategyData, setStrategyData] = useState({
    description: '',
    analysis: null,
    userPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to create custom strategies.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: 'Strategy Description', description: 'Describe your trading strategy' },
    { id: 2, name: 'AI Analysis', description: 'Review AI-generated analysis' },
    { id: 3, name: 'User Details', description: 'Provide contact information' }
  ];

  const handleDescriptionSubmit = async (description) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.wealthai1.in/api/custom-strategy/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email, // Use authenticated user email
          strategy_description: description
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStrategyData(prev => ({
          ...prev,
          description,
          analysis: data.analysis
        }));
        setCurrentStep(2);
      } else {
        setError(data.message || 'Failed to analyze strategy');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisSave = () => {
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (userDetails) => {
    setLoading(true);
    setError('');

    // Ensure userDetails.phone is a string
    const phoneNumber = userDetails?.phone || '';

    try {
      const response = await fetch('https://api.wealthai1.in/api/custom-strategy/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_email: user.email, // Use authenticated user email
          user_phone: phoneNumber,
          strategy_description: strategyData.description,
          analysis: strategyData.analysis
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Strategy saved successfully! You and our team will receive email notifications.');
        // Reset form
        setCurrentStep(1);
        setStrategyData({
          description: '',
          analysis: null,
          userPhone: ''
        });
        // Redirect to home page after successful submission if handler provided
        if (typeof setCurrentPage === 'function') {
          setCurrentPage('home');
        }
      } else {
        setError(data.message || 'Failed to save strategy');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndicator = (stepId) => {
    const baseClasses = 'flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold';
    if (stepId < currentStep) {
      return <div className={`${baseClasses} bg-green-100 text-green-700 border border-green-200`}>✓</div>;
    }
    if (stepId === currentStep) {
      return <div className={`${baseClasses} bg-blue-600 text-white shadow`}>{stepId}</div>;
    }
    return <div className={`${baseClasses} bg-white text-gray-500 border border-gray-300`}>{stepId}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl flex justify-center items-center font-bold tracking-tight text-gray-900 mb-2">
            <svg className="h-8 w-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            AI Strategy Copilot
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Create a personalized trading strategy tailored to your needs
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-start sm:items-center">
                  {getStepIndicator(step.id)}
                  <div className="ml-3">
                    <p className={`text-sm font-bold ${step.id <= currentStep ? 'text-gray-900' : 'text-gray-600'}`}>{step.name}</p>
                    <p className="hidden sm:block text-xs font-semibold text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-gray-200 ml-4 mt-4" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">

              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
          {currentStep === 1 && (
            <DescriptionInput
              onSubmit={handleDescriptionSubmit}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <AIResponseDisplay
              analysis={strategyData.analysis}
              onSave={handleAnalysisSave}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <UserDetailsForm
              onSubmit={handleFinalSubmit}
              loading={loading}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Contact our team at{' '}
            <a href="mailto:support@wealthai.com" className="text-blue-600 hover:text-blue-500">
              support@wealthai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomStrategyBuilder;
