import React, { useState } from 'react';
import Subscription from './subscription';

const ZohoWidgetTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check if script is loaded
    const script = document.querySelector('script[src="https://js.zohostatic.com/books/zfwidgets/assets/js/zf-widget.js"]');
    addTestResult(
      'Script Loading',
      script ? 'PASS' : 'FAIL',
      script ? 'Zoho script found in DOM' : 'Zoho script not found'
    );

    // Test 2: Check if ZohoWidgets is available
    const zohoWidgets = window.ZohoWidgets;
    addTestResult(
      'ZohoWidgets Availability',
      zohoWidgets ? 'PASS' : 'FAIL',
      zohoWidgets ? 'ZohoWidgets object available' : 'ZohoWidgets object not available'
    );

    // Test 3: Check widget elements
    const widgetElements = document.querySelectorAll('[id^="zf-widget-root-"]');
    addTestResult(
      'Widget Elements',
      widgetElements.length > 0 ? 'PASS' : 'FAIL',
      `Found ${widgetElements.length} widget elements`
    );

    // Test 4: Check for errors in console
    const originalError = console.error;
    const errors = [];
    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };

    // Wait a bit to catch any errors
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.error = originalError;

    addTestResult(
      'Console Errors',
      errors.length === 0 ? 'PASS' : 'WARN',
      errors.length === 0 ? 'No errors detected' : `Found ${errors.length} errors: ${errors.join(', ')}`
    );

    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Zoho Widget Test Suite</h1>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600">{result.details}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    result.result === 'PASS' ? 'bg-green-100 text-green-800' :
                    result.result === 'FAIL' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.result}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Widget Preview</h2>
            <div className="border-2 border-dashed border-gray-300 rounded p-4">
              <Subscription />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Click "Run Tests" to check widget status</li>
            <li>Switch between tabs (Payment → History → Payment)</li>
            <li>Run tests again to verify widget re-initialization</li>
            <li>Check browser console for any errors</li>
            <li>Verify widget loads properly after tab switching</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ZohoWidgetTest;
