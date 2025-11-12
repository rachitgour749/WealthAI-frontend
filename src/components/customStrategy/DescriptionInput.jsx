import React, { useState } from 'react';

const DescriptionInput = ({ onSubmit, loading }) => {
  const [description, setDescription] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setIsValid(value.trim().length >= 50);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !loading) {
      onSubmit(description);
    }
  };

  const examples = [
    "I want to trade Nifty 50 stocks using RSI and MACD indicators. When RSI is below 30 and MACD shows bullish crossover, I'll buy. I'll use 2% position sizing and 5% stop loss.",
    "I want to create a momentum strategy for small-cap stocks. Buy when price breaks above 20-day high with volume confirmation. Hold for 10 days or until 15% profit target.",
    "I want to trade Bank Nifty options based on support and resistance levels. Buy calls when price bounces from support, buy puts when price rejects from resistance."
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Describe Your Trading Strategy
        </h2>
        <p className="text-gray-600 font-semibold">
          Tell us about your trading approach, indicators, timeframes, and risk management rules.
          Be as detailed as possible for better analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
            Strategy Description *
          </label>
          <textarea
            id="description"
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300"
            placeholder="Describe your trading strategy in detail. Include:
- Trading instruments (stocks, options, futures, etc.)
- Timeframes (intraday, daily, weekly)
- Technical indicators or rules
- Entry and exit conditions
- Position sizing approach
- Risk management rules
- Any specific requirements or constraints"
            value={description}
            onChange={handleDescriptionChange}
            disabled={loading}
          />
          <div className="mt-2 flex justify-between text-sm">
            <span className={`${isValid ? 'text-green-600' : 'text-gray-600'}`}>
              {Math.min(description.length, 50)}/50 characters minimum
            </span>
            <span className="text-gray-600">
              {description.length} characters
            </span>
          </div>
        </div>

        {/* Example Strategies */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Example strategies</h3>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200 transition-colors"
                onClick={() => setDescription(example)}
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Language Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-800">
                Language Support
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>You can describe your strategy in English, Hindi, or Hinglish. Our AI will understand and analyze it properly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isValid || loading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isValid && !loading
                ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Strategy...
              </>
            ) : (
              <>
                Analyze Strategy
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DescriptionInput;
