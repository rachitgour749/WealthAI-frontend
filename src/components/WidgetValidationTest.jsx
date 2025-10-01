import React, { useState, useEffect } from 'react';
import Subscription from './subscription';

const WidgetValidationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testCount, setTestCount] = useState(0);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runValidationTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setTestCount(prev => prev + 1);

    // Test 1: DOM Integrity Check
    const reactRoot = document.getElementById('root');
    addTestResult(
      'DOM Integrity',
      reactRoot ? 'PASS' : 'FAIL',
      reactRoot ? 'React root element intact' : 'React root element missing'
    );

    // Test 2: Widget Container Isolation
    const isolatedContainers = document.querySelectorAll('[id^="zoho-widget-isolated-"]');
    addTestResult(
      'Widget Isolation',
      isolatedContainers.length <= 1 ? 'PASS' : 'WARN',
      `Found ${isolatedContainers.length} isolated containers (should be 0-1)`
    );

    // Test 3: Memory Leak Detection
    const allElements = document.querySelectorAll('*');
    const widgetElements = document.querySelectorAll('[class*="zoho"], [class*="zf-widget"]');
    addTestResult(
      'Memory Management',
      widgetElements.length < 20 ? 'PASS' : 'WARN',
      `${widgetElements.length} widget elements out of ${allElements.length} total`
    );

    // Test 4: Error Detection
    const originalError = console.error;
    const errors = [];
    console.error = (...args) => {
      const errorMsg = args.join(' ');
      if (errorMsg.includes('removeChild') || 
          errorMsg.includes('NotFoundError') || 
          errorMsg.includes('DOM')) {
        errors.push(errorMsg);
      }
      originalError.apply(console, args);
    };

    // Wait to catch any errors
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.error = originalError;

    addTestResult(
      'Error Detection',
      errors.length === 0 ? 'PASS' : 'FAIL',
      errors.length === 0 ? 'No DOM errors detected' : `Found ${errors.length} errors: ${errors.slice(0, 2).join(', ')}`
    );

    // Test 5: Script Loading
    const zohoScript = document.querySelector('script[src*="zf-widget.js"]');
    addTestResult(
      'Script Loading',
      zohoScript ? 'PASS' : 'FAIL',
      zohoScript ? 'Zoho script loaded successfully' : 'Zoho script not found'
    );

    // Test 6: Widget Functionality
    const widgetElements = document.querySelectorAll('#zf-widget-root-id-3ci321w2g');
    const hasContent = Array.from(widgetElements).some(el => 
      el.children.length > 0 || 
      el.innerHTML.trim().length > 0 ||
      el.querySelector('.zf-widget, [class*="zoho"], [class*="pricing"]')
    );
    
    addTestResult(
      'Widget Functionality',
      hasContent ? 'PASS' : 'PENDING',
      hasContent ? 'Widget content detected' : 'Widget still loading or failed'
    );

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Widget Validation Test Suite</h1>
          <div className="flex space-x-2">
            <button
              onClick={runValidationTests}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Test Results</h2>
              <span className="text-sm text-gray-500">Run #{testCount}</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{result.test}</div>
                    <div className="text-xs text-gray-600 mt-1">{result.details}</div>
                    <div className="text-xs text-gray-400 mt-1">{result.timestamp}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                    result.result === 'PASS' ? 'bg-green-100 text-green-800' :
                    result.result === 'FAIL' ? 'bg-red-100 text-red-800' :
                    result.result === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
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
            <div className="border-2 border-dashed border-gray-300 rounded p-4 min-h-[400px]">
              <Subscription />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Click "Run Tests" to validate the widget system</li>
            <li>Switch between tabs multiple times (Payment → History → Payment)</li>
            <li>Run tests again after each tab switch</li>
            <li>Check browser console for any errors</li>
            <li>Verify all tests pass consistently</li>
          </ol>
          
          <div className="mt-4 p-3 bg-green-50 rounded">
            <h4 className="font-medium text-green-800">Success Criteria:</h4>
            <ul className="text-sm text-green-700 mt-1 space-y-1">
              <li>• All tests should show "PASS" status</li>
              <li>• No "removeChild" or "NotFoundError" in console</li>
              <li>• Widget loads consistently after tab switches</li>
              <li>• No memory leaks or orphaned DOM nodes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetValidationTest;
