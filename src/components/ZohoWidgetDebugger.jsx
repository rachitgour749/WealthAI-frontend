import React, { useState, useEffect } from 'react';

const ZohoWidgetDebugger = ({ enabled = false }) => {
  const [debugInfo, setDebugInfo] = useState({
    scriptLoaded: false,
    zohoWidgetsAvailable: false,
    widgetInstances: 0,
    errors: []
  });

  useEffect(() => {
    if (!enabled) return;

    const updateDebugInfo = () => {
      const script = document.querySelector('script[src="https://js.zohostatic.com/books/zfwidgets/assets/js/zf-widget.js"]');
      const zohoWidgets = window.ZohoWidgets;
      
      setDebugInfo({
        scriptLoaded: !!script,
        zohoWidgetsAvailable: !!zohoWidgets,
        widgetInstances: document.querySelectorAll('[id^="zf-widget-root-"]').length,
        errors: []
      });
    };

    // Update debug info every second
    const interval = setInterval(updateDebugInfo, 1000);
    updateDebugInfo(); // Initial update

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">Zoho Widget Debug</div>
      <div className="space-y-1">
        <div className={`flex justify-between ${debugInfo.scriptLoaded ? 'text-green-400' : 'text-red-400'}`}>
          <span>Script Loaded:</span>
          <span>{debugInfo.scriptLoaded ? '✓' : '✗'}</span>
        </div>
        <div className={`flex justify-between ${debugInfo.zohoWidgetsAvailable ? 'text-green-400' : 'text-red-400'}`}>
          <span>ZohoWidgets:</span>
          <span>{debugInfo.zohoWidgetsAvailable ? '✓' : '✗'}</span>
        </div>
        <div className="flex justify-between text-blue-400">
          <span>Instances:</span>
          <span>{debugInfo.widgetInstances}</span>
        </div>
        <div className="flex justify-between text-yellow-400">
          <span>Time:</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ZohoWidgetDebugger;
