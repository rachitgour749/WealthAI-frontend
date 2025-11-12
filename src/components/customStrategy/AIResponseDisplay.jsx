import React, { useState } from "react";

const AIResponseDisplay = ({ analysis, onSave, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState(analysis);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedAnalysis(analysis);
  };

  const handleSave = () => {
    onSave();
  };

  const handleFieldChange = (field, value) => {
    setEditedAnalysis((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRatingColor = (strategy_levels) => {
    switch (strategy_levels) {
      case 1:
        return "text-green-600 bg-green-100";
      case 2:
        return "text-yellow-600 bg-yellow-100";
      case 3:
        return "text-orange-600 bg-orange-100";
      case 4:
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRatingText = (strategy_levels) => {
    switch (strategy_levels) {
      case 1:
        return "Simple";
      case 2:
        return "Medium";
      case 3:
        return "Complex";
      case 4:
        return "Very Complex";
      default:
        return "Unknown";
    }
  };

  const getRatingDetails = (strategy_levels) => {
    switch (strategy_levels) {
      case 1:
        return {
          level: "Simple",
          price: "₹10,000 - ₹15,000",
          developmentTime: "3-5 working days",
        };
      case 2:
        return {
          level: "Medium",
          price: "₹15,000 - ₹20,000",
          developmentTime: "5-10 working days",
        };
      case 3:
        return {
          level: "Complex",
          price: "₹20,000 - ₹30,000",
          developmentTime: "10-15 working days",
        };
      // case 4: return {
      //   level: 'Very Complex',
      //   price: '₹30,000+',
      //   developmentTime: '15+ working days'
      // };
      default:
        return {
          level: "Unknown",
          price: "depends on the complexity",
          developmentTime: "depends on the complexity",
        };
    }
  };

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No analysis available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        {/* <svg className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg> */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Strategy Analysis
        </h2>
        <p className="text-gray-600">
          Review and edit the AI-generated analysis of your strategy
        </p>
      </div>

      {/* Strategy Rating */}
      <div className="bg-gray-50 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Strategy Complexity Rating
          </h3>
          <div
            className={`px-2 py-1 rounded-full text-sm font-medium ${getRatingColor(
              analysis.strategy_rating
            )}`}
          >
            {getRatingText(analysis.strategy_rating)}
          </div>
        </div>

        {/* Pricing and Development Time */}
        <div className="flex flex-col mb-2">
          <div className="flex  items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Estimated Price Range:
            </span>
            <span className="text-sm font-semibold text-blue-600 ">
              {getRatingDetails(analysis.strategy_rating).price}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 ">
              Estimated Development Time:
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {getRatingDetails(analysis.strategy_rating).developmentTime}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-800">
          Price and timeline mentioned above are indicative. Actuals will be
          finalized after discussions and clarifications of our team with you.
        </p>
      </div>

      {/* Analysis Fields */}
      <div className="space-y-4">
        {/* Trading Instruments */}
        <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Trading Instruments
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedAnalysis.trading_instruments}
              onChange={(e) =>
                handleFieldChange("trading_instruments", e.target.value)
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{analysis.trading_instruments}</p>
          )}
        </div>

        {/* Time Frame */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Time Frame
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedAnalysis.time_frame}
              onChange={(e) => handleFieldChange("time_frame", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{analysis.time_frame}</p>
          )}
        </div>

        {/* Trading Rules */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Trading Rules
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {editedAnalysis.trading_rules.map((rule, index) => (
                <input
                  key={index}
                  type="text"
                  value={rule}
                  onChange={(e) => {
                    const newRules = [...editedAnalysis.trading_rules];
                    newRules[index] = e.target.value;
                    handleFieldChange("trading_rules", newRules);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {analysis.trading_rules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-900">{rule}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Position Sizing */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Position Sizing
          </label>
          {isEditing ? (
            <textarea
              rows={3}
              value={editedAnalysis.position_sizing}
              onChange={(e) =>
                handleFieldChange("position_sizing", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{analysis.position_sizing}</p>
          )}
        </div>

        {/* Risk Management */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Risk Management
          </label>
          {isEditing ? (
            <textarea
              rows={3}
              value={editedAnalysis.risk_management}
              onChange={(e) =>
                handleFieldChange("risk_management", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{analysis.risk_management}</p>
          )}
        </div>

        {/* Strategy Logic */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Strategy Logic
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={editedAnalysis.strategy_logic}
              onChange={(e) =>
                handleFieldChange("strategy_logic", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-line">
              {analysis.strategy_logic}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Description
        </button>

        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Analysis
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel Edit
            </button>
          )}

          <button
            onClick={handleSave}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIResponseDisplay;
