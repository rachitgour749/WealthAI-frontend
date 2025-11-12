import React, { useState } from 'react';

const BestStockCombinationModal = ({ isOpen, onClose, onSelectCombination }) => {
  const [selectedCombination, setSelectedCombination] = useState(null);

  // Best stock combination data
  const bestCombinations = [
    {
      id: 1,
      stockCombination: ['RELIANCE', 'BHARTIARTL', 'TCS', 'ICICIBANK', 'HINDUNILVR', 'BRITANNIA', 'BAJFINANCE', 'CIPLA'],
      cagr: 34.30,
      brokerage: 0.1,
      timeFrame: '20-08-2007 - 20-08-2025',
      duration: '18 years'
    },
    // You can add more combinations here in the future
  ];

  const handleSelectCombination = (combination) => {
    setSelectedCombination(combination);
  };

  const handleApplyCombination = () => {
    if (selectedCombination) {
      // Convert stock names to the format expected by the Select component
      const stockOptions = selectedCombination.stockCombination.map(stock => ({
        value: stock,
        label: stock
      }));
      onSelectCombination(stockOptions);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🏆 Best Stock Combinations
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Combinations Table */}
          <div className="space-y-4">
            {bestCombinations.map((combination) => (
              <div
                key={combination.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  selectedCombination?.id === combination.id
                    ? 'border-teal-500 bg-teal-50 shadow-lg'
                    : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                }`}
                onClick={() => handleSelectCombination(combination)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Stock Combination */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Stock Combination</h4>
                    <div className="flex flex-wrap gap-1">
                      {combination.stockCombination.map((stock, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {stock}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CAGR */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">CAGR</h4>
                    <p className="text-lg font-bold text-green-600">
                      {combination.cagr}%
                    </p>
                  </div>

                  {/* Brokerage */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Brokerage</h4>
                    <p className="text-lg font-bold text-orange-600">
                      {combination.brokerage}%
                    </p>
                  </div>

                  {/* Time Frame */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Time Frame</h4>
                    <p className="text-sm text-gray-900">
                      {combination.timeFrame}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({combination.duration})
                    </p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedCombination?.id === combination.id && (
                  <div className="mt-4 flex items-center text-teal-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCombination}
              disabled={!selectedCombination}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Selected Combination
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestStockCombinationModal;
