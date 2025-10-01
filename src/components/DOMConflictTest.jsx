import React, { useState, useEffect } from 'react';

const DOMConflictTest = () => {
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

  const runDOMTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check for DOM manipulation conflicts
    const originalError = console.error;
    const errors = [];
    console.error = (...args) => {
      const errorMsg = args.join(' ');
      if (errorMsg.includes('removeChild') || errorMsg.includes('NotFoundError')) {
        errors.push(errorMsg);
      }
      originalError.apply(console, args);
    };

    // Test 2: Check React DOM integrity
    const reactRoot = document.getElementById('root');
    if (reactRoot) {
      addTestResult(
        'React Root Integrity',
        'PASS',
        'React root element found and accessible'
      );
    } else {
      addTestResult(
        'React Root Integrity',
        'FAIL',
        'React root element not found'
      );
    }

    // Test 3: Check for orphaned DOM nodes
    const orphanedNodes = document.querySelectorAll('[id^="zf-widget-root-"]');
    addTestResult(
      'Orphaned Widget Nodes',
      orphanedNodes.length <= 1 ? 'PASS' : 'WARN',
      `Found ${orphanedNodes.length} widget nodes (should be 0-1)`
    );

    // Test 4: Check for memory leaks
    const allElements = document.querySelectorAll('*');
    const widgetElements = document.querySelectorAll('[class*="zoho"], [class*="zf-widget"]');
    addTestResult(
      'Memory Leak Check',
      widgetElements.length < 10 ? 'PASS' : 'WARN',
      `Found ${widgetElements.length} widget-related elements out of ${allElements.length} total`
    );

    // Wait to catch any errors
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.error = originalError;

    addTestResult(
      'DOM Conflict Detection',
      errors.length === 0 ? 'PASS' : 'FAIL',
      errors.length === 0 ? 'No DOM conflicts detected' : `Found ${errors.length} DOM conflicts: ${errors.join(', ')}`
    );

    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">DOM Conflict Test Suite</h1>
        
        <div className="mb-6">
          <button
            onClick={runDOMTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run DOM Tests'}
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

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Testing Instructions</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Click "Run DOM Tests" to check for conflicts</li>
              <li>Switch between tabs multiple times</li>
              <li>Run tests again to verify no conflicts</li>
              <li>Check browser console for any errors</li>
              <li>Verify no "removeChild" or "NotFoundError" messages</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h3 className="font-medium text-blue-800">What to Look For:</h3>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• No "removeChild" errors in console</li>
                <li>• No "NotFoundError" messages</li>
                <li>• Clean DOM structure after tab switches</li>
                <li>• No memory leaks from widget elements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DOMConflictTest;
